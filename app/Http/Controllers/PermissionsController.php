<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\ServerPermissions;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class PermissionsController extends McController
{
    public function __construct(Settings $settings, private ServerPermissions $permissions)
    {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeManage($request, $server);

        return response()->json([
            'guestPermissions' => $this->permissions->defaults($server),
            'users' => $this->permissions->users($server),
            'requests' => $this->permissions->requests($server),
        ]);
    }

    public function requests(Request $request, Server $server): JsonResponse
    {
        $this->authorizeManage($request, $server);

        return response()->json(['requests' => $this->permissions->requests($server)]);
    }

    public function saveGuests(Request $request, Server $server): JsonResponse
    {
        $this->authorizeManage($request, $server);
        $validated = $request->validate([
            'permissions' => 'present|array',
            'permissions.*' => 'required|string|in:' . implode(',', ServerPermissions::GRANTS),
        ]);
        $permissions = $this->permissions->saveDefaults(
            $server,
            (int) $request->user()->id,
            $validated['permissions'],
        );
        Log::notice('MC Panels guest permissions updated.', [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
            'permissions' => $permissions,
        ]);

        return response()->json(['permissions' => $permissions]);
    }

    public function grantUser(Request $request, Server $server): JsonResponse
    {
        $this->authorizeManage($request, $server);
        $validated = $request->validate([
            'email' => 'required|email:rfc|max:191',
            'permissions' => 'present|array|min:1',
            'permissions.*' => 'required|string|in:' . implode(',', ServerPermissions::GRANTS),
        ]);
        $user = $this->permissions->grantByEmail(
            $server,
            (int) $request->user()->id,
            $validated['email'],
            $validated['permissions'],
        );
        Log::notice('MC Panels user permissions updated.', [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
            'target_user_id' => $user['id'],
            'permissions' => $user['permissions'],
        ]);

        return response()->json($user);
    }

    public function revokeUser(Request $request, Server $server, int $userId): JsonResponse
    {
        $this->authorizeManage($request, $server);
        if (!$this->permissions->revoke($server, $userId)) {
            abort(404, 'No individual permission grant exists for that user.');
        }
        Log::notice('MC Panels user permissions revoked.', [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
            'target_user_id' => $userId,
        ]);

        return response()->json(['success' => true]);
    }

    public function requestAccess(Request $request, Server $server): JsonResponse
    {
        abort_if($this->canViewDashboard($request, $server), 409, 'You already have MC Panels access.');
        $status = $this->permissions->requestAccess($server, (int) $request->user()->id);

        return response()->json(['status' => $status], 202);
    }

    public function approveRequest(Request $request, Server $server, int $requestId): JsonResponse
    {
        $this->authorizeManage($request, $server);
        $result = $this->permissions->reviewRequest($server, $requestId, (int) $request->user()->id, true);
        Log::notice('MC Panels access request approved.', [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
            'request_id' => $requestId,
            'target_user_id' => $result['userId'],
        ]);

        return response()->json($result);
    }

    public function denyRequest(Request $request, Server $server, int $requestId): JsonResponse
    {
        $this->authorizeManage($request, $server);
        $result = $this->permissions->reviewRequest($server, $requestId, (int) $request->user()->id, false);
        Log::notice('MC Panels access request denied.', [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
            'request_id' => $requestId,
            'target_user_id' => $result['userId'],
        ]);

        return response()->json($result);
    }

    private function authorizeManage(Request $request, Server $server): void
    {
        abort_unless($this->canManagePermissions($request, $server), 403, 'Only the server owner or a root administrator can manage MC Panels permissions.');
    }
}
