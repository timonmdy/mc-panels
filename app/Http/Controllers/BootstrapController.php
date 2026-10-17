<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\ProfileStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\ServerPermissions;
use Pterodactyl\Models\Server;

class BootstrapController extends McController
{
    public function __construct(Settings $settings, private ProfileStore $profiles, private CursorStore $cursors)
    {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $canView = $this->canViewDashboard($request, $server);
        if ($canView) {
            $this->cursors->touch($server->id);
        }

        return response()->json([
            'config' => $this->settings->publicConfig(),
            'permissions' => [
                'viewDashboard' => $canView,
                'editLayouts' => $this->canEditLayouts($request, $server),
                'editProfiles' => $this->canEditProfiles($request, $server),
                'viewData' => $this->canViewData($request, $server),
                'manageData' => $this->canManageData($request, $server),
                'managePermissions' => $this->canManagePermissions($request, $server),
                'seeIps' => $this->canSeeIps($request, $server),
                'accessRequestStatus' => app(ServerPermissions::class)->requestStatus($server, (int) $request->user()->id),
            ],
            'profiles' => $canView ? $this->profiles->list($server->id, 'profile') : [],
            'templates' => $canView ? $this->profiles->list($server->id, 'template') : [],
        ]);
    }
}
