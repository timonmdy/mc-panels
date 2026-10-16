<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class ResourceProbe implements Probe
{
    public function __construct(private DaemonServerRepository $daemon)
    {
    }

    public function handle(Context $c): void
    {
        $details = $this->daemon->setServer($c->server)->getDetails();
        $u = $details['utilization'] ?? [];
        $state = (string) ($details['state'] ?? $u['state'] ?? 'offline');
        $rx = $u['network']['rx_bytes'] ?? null;
        $tx = $u['network']['tx_bytes'] ?? null;

        $c->running = $state === 'running';
        $c->sample = [
            'state' => $state,
            'cpu' => isset($u['cpu_absolute']) ? round((float) $u['cpu_absolute'], 2) : null,
            'mem_bytes' => $u['memory_bytes'] ?? null,
            'mem_limit' => ($u['memory_limit_bytes'] ?? 0) ?: null,
            'disk_bytes' => $u['disk_bytes'] ?? null,
            'disk_limit' => $c->server->disk > 0 ? $c->server->disk * 1024 * 1024 : null,
            'net_rx_bytes' => $rx,
            'net_tx_bytes' => $tx,
            'net_up' => $this->rate($c, $tx, 'net_tx_bytes'),
            'net_down' => $this->rate($c, $rx, 'net_rx_bytes'),
            'uptime_ms' => $u['uptime'] ?? null,
        ];
    }

    private function rate(Context $c, ?int $current, string $column): ?float
    {
        $previous = $c->previous;
        if ($current === null || !$previous || $previous->{$column} === null) {
            return null;
        }

        $elapsed = $c->now - (int) $previous->ts;
        $delta = $current - (int) $previous->{$column};

        return $elapsed > 0 && $delta >= 0 ? round($delta / $elapsed, 2) : null;
    }
}
