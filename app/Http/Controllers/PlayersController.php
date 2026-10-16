<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class PlayersController extends McController
{
    private const MAX_PER_PAGE = 50;

    public function __construct(Settings $settings, private PlayerStore $players, private CursorStore $cursors)
    {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);

        $kind = $request->query('kind') === 'online' ? 'online' : 'registered';
        $filter = in_array($request->query('filter'), ['online', 'banned'], true) ? $request->query('filter') : 'all';
        $perPage = max(1, min(self::MAX_PER_PAGE, (int) $request->query('perPage', 10)));
        $ipBans = $this->cursors->data($server->id)['meta']['ipBans'] ?? [];

        $result = $this->players->paginate(
            $server->id, $kind, $request->query('q') ? (string) $request->query('q') : null, $filter,
            (int) $request->query('page', 1), $perPage, $ipBans, $this->canSeeIps($request, $server),
        );

        return response()->json($result + ['page' => max(1, (int) $request->query('page', 1)), 'perPage' => $perPage]);
    }
}
