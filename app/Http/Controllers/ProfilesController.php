<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\ProfileStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class ProfilesController extends McController
{
    public function __construct(Settings $settings, private ProfileStore $profiles)
    {
        parent::__construct($settings);
    }

    public function store(Request $request, Server $server): JsonResponse
    {
        $this->authorizeProfileEdit($request, $server);

        $profile = $this->profiles->create(
            $server->id,
            (string) $request->input('kind', 'profile'),
            (string) $request->input('name', ''),
            $request->input('layout'),
        );

        return response()->json($profile, 201);
    }

    public function update(Request $request, Server $server, int $profile): JsonResponse
    {
        if ($request->exists('layout')) {
            $this->authorizeWrite($request, $server);
        }
        if ($request->exists('name')) {
            $this->authorizeProfileEdit($request, $server);
        }

        $updated = $this->profiles->update($server->id, $profile, $request->only(['name', 'layout']));

        return $updated ? response()->json($updated) : response()->json(['error' => 'Profile not found.'], 404);
    }

    public function destroy(Request $request, Server $server, int $profile): JsonResponse
    {
        $this->authorizeProfileEdit($request, $server);

        return $this->profiles->delete($server->id, $profile)
            ? response()->json(null, 204)
            : response()->json(['error' => 'Profile not found.'], 404);
    }
}
