<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;

class PlayerStore
{
    private const PLAYERS = 'mcpanels_players';
    private const IPS = 'mcpanels_player_ips';

    public function join(int $serverId, string $name, int $ts): void
    {
        $id = $this->ensure($serverId, $name, $ts);
        DB::table(self::PLAYERS)->where('id', $id)->update(['online' => true, 'last_seen' => $ts]);
    }

    public function leave(int $serverId, string $name, int $ts): void
    {
        DB::table(self::PLAYERS)->where('server_id', $serverId)->where('name', $name)
            ->update(['online' => false, 'last_seen' => $ts]);
    }

    public function login(int $serverId, string $name, string $ip, int $ts, bool $storeIp): void
    {
        $id = $this->ensure($serverId, $name, $ts);
        DB::table(self::PLAYERS)->where('id', $id)->update(['online' => true, 'last_seen' => $ts, 'last_ip' => $storeIp ? $ip : null]);
        if ($storeIp) {
            $this->recordIp($id, $ip, $ts);
        }
    }

    public function setUuid(int $serverId, string $name, string $uuid): void
    {
        $id = $this->ensure($serverId, $name, null);
        DB::table(self::PLAYERS)->where('id', $id)->update(['uuid' => $uuid]);
    }

    public function resetOnline(int $serverId): void
    {
        DB::table(self::PLAYERS)->where('server_id', $serverId)->where('online', true)->update(['online' => false]);
    }

    public function seed(int $serverId, array $known): void
    {
        foreach ($known as $row) {
            if (!is_string($row['name'] ?? null)) {
                continue;
            }
            $id = $this->ensure($serverId, $row['name'], null);
            if (!empty($row['uuid'])) {
                DB::table(self::PLAYERS)->where('id', $id)->where(fn ($q) => $q->whereNull('uuid'))->update(['uuid' => $row['uuid']]);
            }
        }
    }

    public function applyBans(int $serverId, array $bans): void
    {
        DB::table(self::PLAYERS)->where('server_id', $serverId)->where('banned', true)->update(['banned' => false, 'ban_reason' => null]);
        foreach ($bans as $ban) {
            if (!is_string($ban['name'] ?? null)) {
                continue;
            }
            $id = $this->ensure($serverId, $ban['name'], null);
            DB::table(self::PLAYERS)->where('id', $id)->update([
                'banned' => true,
                'ban_reason' => isset($ban['reason']) ? mb_substr(strip_tags((string) $ban['reason']), 0, 255) : null,
            ]);
            if (!empty($ban['uuid'])) {
                DB::table(self::PLAYERS)->where('id', $id)->whereNull('uuid')->update(['uuid' => $ban['uuid']]);
            }
        }
    }

    public function counts(int $serverId): array
    {
        $row = DB::table(self::PLAYERS)->where('server_id', $serverId)
            ->selectRaw('COUNT(*) AS registered, SUM(online) AS online, SUM(banned) AS banned')->first();

        return ['registered' => (int) $row->registered, 'online' => (int) $row->online, 'banned' => (int) $row->banned];
    }

    public function paginate(int $serverId, string $kind, ?string $query, string $filter, int $page, int $perPage, array $ipBans, bool $withIps): array
    {
        $q = DB::table(self::PLAYERS)->where('server_id', $serverId);
        if ($kind === 'online' || $filter === 'online') {
            $q->where('online', true);
        }
        if ($filter === 'banned') {
            $q->where('banned', true);
        }
        if ($query) {
            $q->where('name', 'like', '%' . addcslashes($query, '%_\\') . '%');
        }

        $total = (clone $q)->count();
        $rows = $q->orderByDesc('online')->orderByDesc('last_seen')->orderBy('name')
            ->forPage(max(1, $page), $perPage)->get();

        $ips = $withIps && $rows->isNotEmpty()
            ? DB::table(self::IPS)->whereIn('player_id', $rows->pluck('id'))->orderByDesc('last_seen')->get()->groupBy('player_id')
            : collect();

        return [
            'total' => $total,
            'data' => $rows->map(fn ($p) => [
                'id' => (int) $p->id, 'name' => $p->name, 'uuid' => $p->uuid,
                'online' => (bool) $p->online, 'banned' => (bool) $p->banned, 'banReason' => $p->ban_reason,
                'ipBanned' => $withIps && $p->last_ip !== null && in_array($p->last_ip, $ipBans, true),
                'firstSeen' => $p->first_seen, 'lastSeen' => $p->last_seen,
                'lastIp' => $withIps ? $p->last_ip : null,
                'ips' => $withIps ? ($ips->get($p->id, collect()))->map(fn ($i) => [
                    'ip' => $i->ip, 'firstSeen' => (int) $i->first_seen, 'lastSeen' => (int) $i->last_seen, 'hits' => (int) $i->hits,
                ])->values()->all() : [],
            ])->all(),
        ];
    }

    public function pruneIps(int $before): int
    {
        return DB::table(self::IPS)->where('last_seen', '<', $before)->delete();
    }

    private function ensure(int $serverId, string $name, ?int $ts): int
    {
        $name = substr($name, 0, 32);
        $row = DB::table(self::PLAYERS)->where('server_id', $serverId)->where('name', $name)->first();
        if ($row) {
            return (int) $row->id;
        }

        return (int) DB::table(self::PLAYERS)->insertGetId([
            'server_id' => $serverId, 'name' => $name, 'first_seen' => $ts, 'last_seen' => $ts,
        ]);
    }

    private function recordIp(int $playerId, string $ip, int $ts): void
    {
        $row = DB::table(self::IPS)->where('player_id', $playerId)->where('ip', $ip)->first();
        $row
            ? DB::table(self::IPS)->where('id', $row->id)->update(['last_seen' => $ts, 'hits' => $row->hits + 1])
            : DB::table(self::IPS)->insert(['player_id' => $playerId, 'ip' => $ip, 'first_seen' => $ts, 'last_seen' => $ts, 'hits' => 1]);
    }
}
