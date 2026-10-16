<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;

class CursorStore
{
    private const TABLE = 'mcpanels_cursors';

    public function touch(int $serverId): void
    {
        $exists = DB::table(self::TABLE)->where('server_id', $serverId)->exists();
        $exists
            ? DB::table(self::TABLE)->where('server_id', $serverId)->update(['last_visit' => time()])
            : DB::table(self::TABLE)->insert(['server_id' => $serverId, 'last_visit' => time()]);
    }

    public function find(int $serverId): ?object
    {
        return DB::table(self::TABLE)->where('server_id', $serverId)->first();
    }

    public function data(int $serverId): array
    {
        $raw = $this->find($serverId)?->data;
        $decoded = $raw ? json_decode($raw, true) : null;

        return is_array($decoded) ? $decoded : [];
    }

    public function save(int $serverId, array $columns): void
    {
        if (!DB::table(self::TABLE)->where('server_id', $serverId)->exists()) {
            DB::table(self::TABLE)->insert(['server_id' => $serverId, 'last_visit' => 0]);
        }
        if (isset($columns['data']) && is_array($columns['data'])) {
            $columns['data'] = json_encode($columns['data']);
        }
        DB::table(self::TABLE)->where('server_id', $serverId)->update($columns);
    }

    public function enabledServerIds(string $mode, int $inactiveDays): array
    {
        if ($mode === 'all') {
            return DB::table('servers')->whereNull('status')->pluck('id')->all();
        }

        return DB::table(self::TABLE)
            ->where('last_visit', '>=', time() - $inactiveDays * 86400)
            ->pluck('server_id')
            ->all();
    }
}
