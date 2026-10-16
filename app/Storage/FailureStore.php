<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;

class FailureStore
{
    private const TABLE = 'mcpanels_failures';

    public function add(int $serverId, int $ts, string $reason, ?string $name, ?string $ip): void
    {
        DB::table(self::TABLE)->insert([
            'server_id' => $serverId, 'ts' => $ts, 'reason' => $reason,
            'name' => $name ? substr($name, 0, 32) : null, 'ip' => $ip,
        ]);
    }

    public function summary(int $serverId, int $since, bool $withIps, int $limit = 30): array
    {
        $base = DB::table(self::TABLE)->where('server_id', $serverId)->where('ts', '>=', $since);

        $byReason = (clone $base)->selectRaw('reason, COUNT(*) AS count')->groupBy('reason')->orderByDesc('count')->get();
        $recent = (clone $base)->orderByDesc('ts')->limit($limit)->get();

        return [
            'total' => (int) $byReason->sum('count'),
            'byReason' => $byReason->map(fn ($r) => ['reason' => $r->reason, 'count' => (int) $r->count])->all(),
            'recent' => $recent->map(fn ($r) => [
                'id' => (int) $r->id, 'ts' => (int) $r->ts, 'reason' => $r->reason,
                'name' => $r->name, 'ip' => $withIps ? $r->ip : null,
            ])->all(),
        ];
    }

    public function prune(int $before): int
    {
        return DB::table(self::TABLE)->where('ts', '<', $before)->delete();
    }
}
