<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\InfoService;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class InfoController extends McController
{
    public function __construct(Settings $settings, private InfoService $info)
    {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);

        return response()->json($this->info->get($server, $this->settings->all()));
    }
}
