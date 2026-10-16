<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;

class EventStore
{
    private const TABLE = 'mcpanels_events';

    public function add(int $serverId, string $type, int $ts): void
    {
        DB::table(self::TABLE)->insert(['server_id' => $serverId, 'type' => $type, 'ts' => $ts]);
    }

    public function count(int $serverId, string $type, int $since): int
    {
        return DB::table(self::TABLE)->where('server_id', $serverId)->where('type', $type)->where('ts', '>=', $since)->count();
    }

    public function prune(int $before): int
    {
        return DB::table(self::TABLE)->where('ts', '<', $before)->delete();
    }
}
