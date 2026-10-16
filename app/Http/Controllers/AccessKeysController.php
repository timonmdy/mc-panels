<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\AccessKeys;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class AccessKeysController extends McController
{
    public function __construct(
        Settings $settings,
        private AccessKeys $keys
    ) {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeAccessKeyManagement($request, $server);

        return response()->json(['keys' => $this->keys->list($server)]);
    }

    public function store(Request $request, Server $server): JsonResponse
    {
        $this->authorizeAccessKeyManagement($request, $server);
        $validated = $request->validate([
            'name' => 'required|string|min:1|max:64',
            'permissions' => 'required|array|min:1',
            'permissions.*' => 'required|string|in:' . implode(',', AccessKeys::GRANTS),
        ]);
        if (trim($validated['name']) === '') {
            abort(422, 'Give the access key a non-empty name.');
        }
        $permissions = array_values(array_unique($validated['permissions']));
        if (in_array('*', $permissions, true)) {
            $permissions = ['*'];
        }
        if (count($this->keys->list($server)) >= 50) {
            abort(422, 'A server can have at most 50 MC Panels access keys.');
        }

        $created = $this->keys->create($server, $validated['name'], $permissions);
        Log::notice('MC Panels access key created.', [
            'server_id' => $server->id, 'key_id' => $created['id'],
            'user_id' => $request->user()->id, 'permissions' => $created['permissions'],
        ]);

        return response()->json($created, 201);
    }

    public function destroy(Request $request, Server $server, string $id): JsonResponse
    {
        $this->authorizeAccessKeyManagement($request, $server);
        if (!$this->keys->delete($server, $id)) {
            abort(404, 'The MC Panels access key was not found.');
        }
        Log::notice('MC Panels access key deleted.', [
            'server_id' => $server->id, 'key_id' => $id, 'user_id' => $request->user()->id,
        ]);

        return response()->json(['success' => true]);
    }
}
