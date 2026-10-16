<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\EventStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\SampleStore;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class LiveService
{
    private const STABILITY_DAYS = 7;

    public function __construct(
        private SampleStore $samples,
        private EventStore $events,
        private PlayerStore $players,
        private CursorStore $cursors,
        private DaemonServerRepository $daemon,
    ) {
    }

    public function snapshot(Server $server, array $settings): array
    {
        $sample = $this->samples->latest($server->id);
        $now = time();
        $stale = !$sample || $now - (int) $sample->ts > max(120, 3 * (int) $settings['pollSeconds']);
        $values = $stale ? $this->direct($server) : $this->fromSample($sample);
        $counts = $this->players->counts($server->id);
        $meta = $this->cursors->data($server->id)['meta'] ?? [];

        return $values + [
            'cpuLimit' => (float) $server->cpu > 0 ? (float) $server->cpu : null,
            'ts' => $stale ? $now : (int) $sample->ts,
            'stale' => $stale,
            'playersRegistered' => max($counts['registered'], (int) ($meta['registeredFiles'] ?? 0)) ?: null,
            'playersBanned' => $counts['banned'],
            'stability' => [
                'crashes' => $this->events->count($server->id, 'crash', $now - self::STABILITY_DAYS * 86400),
                'windowDays' => self::STABILITY_DAYS,
            ],
        ];
    }

    private function fromSample(object $s): array
    {
        return [
            'state' => $s->state,
            'cpu' => $s->cpu, 'memory' => $s->mem_bytes, 'memoryLimit' => $s->mem_limit,
            'memoryPercent' => $s->mem_limit ? round($s->mem_bytes / $s->mem_limit * 100, 2) : null,
            'disk' => $s->disk_bytes, 'diskLimit' => $s->disk_limit,
            'netUp' => $s->net_up, 'netDown' => $s->net_down, 'uptimeMs' => $s->uptime_ms,
            'playersOnline' => $s->players_online, 'playersMax' => $s->players_max,
            'tps' => $s->tps, 'mspt' => $s->mspt,
        ];
    }

    private function direct(Server $server): array
    {
        $empty = array_fill_keys(['cpu', 'memory', 'memoryLimit', 'memoryPercent', 'disk', 'diskLimit', 'netUp', 'netDown', 'uptimeMs', 'playersOnline', 'playersMax', 'tps', 'mspt'], null);
        try {
            $details = $this->daemon->setServer($server)->getDetails();
        } catch (\Throwable) {
            return ['state' => 'unknown'] + $empty;
        }

        $u = $details['utilization'] ?? [];
        $limit = ($u['memory_limit_bytes'] ?? 0) ?: null;

        return [
            'state' => $details['state'] ?? 'offline',
            'cpu' => $u['cpu_absolute'] ?? null, 'memory' => $u['memory_bytes'] ?? null, 'memoryLimit' => $limit,
            'memoryPercent' => $limit ? round(($u['memory_bytes'] ?? 0) / $limit * 100, 2) : null,
            'disk' => $u['disk_bytes'] ?? null, 'diskLimit' => $server->disk > 0 ? $server->disk * 1024 * 1024 : null,
            'uptimeMs' => $u['uptime'] ?? null,
        ] + $empty;
    }
}
