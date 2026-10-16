<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\BridgeProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\LogProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\PingProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\RegistryProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\ResourceProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes\TpsCommandProbe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\EventStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\SampleStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class Collector
{
    private const TPS_REPLY_WAIT_US = 1500000;
    private const RESTART_GRACE_SECONDS = 300;

    public function __construct(
        private Settings $settings,
        private CursorStore $cursors,
        private SampleStore $samples,
        private EventStore $events,
        private PlayerStore $players,
        private ResourceProbe $resource,
        private PingProbe $ping,
        private TpsCommandProbe $tps,
        private LogProbe $logs,
        private BridgeProbe $bridge,
        private RegistryProbe $registry,
    ) {
    }

    public function run(callable $log): void
    {
        $interval = max(15, (int) $this->settings->get('pollSeconds'));
        $loops = $interval < 60 ? intdiv(60, $interval) : 1;

        for ($i = 0; $i < $loops; $i++) {
            $started = time();
            $this->tick($log, $interval);
            if ($i < $loops - 1) {
                sleep(max(1, $interval - (time() - $started)));
            }
        }
    }

    private function tick(callable $log, int $interval): void
    {
        $settings = $this->settings->all();
        $ids = $this->cursors->enabledServerIds($settings['collectMode'], (int) $settings['inactiveDays']);
        DebugLog::write($settings, 'Collector tick started.', ['enabled_servers' => count($ids), 'interval_seconds' => $interval]);

        Server::query()->with('allocation')->whereNull('status')->whereIn('id', $ids)->get()
            ->each(function (Server $server) use ($settings, $interval, $log) {
                try {
                    $this->collect($server, $settings, $interval);
                } catch (\Throwable $e) {
                    DebugLog::write($settings, 'Collector failed for server.', [
                        'server_id' => $server->id,
                        'server_uuid_short' => $server->uuidShort,
                        'exception' => get_class($e),
                        'message' => $e->getMessage(),
                    ]);
                    $log("[mcpanels] {$server->uuidShort}: {$e->getMessage()}");
                }
            });
    }

    private function collect(Server $server, array $settings, int $interval): void
    {
        $id = $server->id;
        $cursor = $this->cursors->find($id);
        $c = new Context($server, $settings, $this->cursors->data($id), time(), $this->samples->latest($id), $cursor?->last_state);

        if (!$c->due('resource', $interval)) {
            return;
        }
        DebugLog::write($settings, 'Collecting server metrics.', ['server_id' => $id, 'state_before' => $c->lastState]);
        $c->mark('resource');

        $this->resource->handle($c);
        $state = $c->sample['state'];
        $c->wentDown = $c->lastState === 'running' && in_array($state, ['offline', 'starting'], true);
        $c->cameUp = $c->running && $c->lastState !== 'running';
        if ($c->wentDown) {
            $this->players->resetOnline($id);
        }

        $this->ping->handle($c);
        $this->tps->handle($c);
        if ($c->tpsRequested) {
            DebugLog::write($settings, 'TPS command sent; waiting for matching log output.', ['server_id' => $id]);
            usleep(self::TPS_REPLY_WAIT_US);
        }
        $this->logs->handle($c);
        $this->tps->verify($c);
        $this->bridge->handle($c);
        $this->registry->handle($c);

        $this->finish($c, $state);
        DebugLog::write($settings, 'Collection cycle completed.', [
            'server_id' => $id,
            'state' => $state,
            'cpu' => $c->sample['cpu'] ?? null,
            'memory_bytes' => $c->sample['mem_bytes'] ?? null,
            'tps' => $c->sample['tps'] ?? null,
            'tps_requested' => $c->tpsRequested,
            'went_down' => $c->wentDown,
            'came_up' => $c->cameUp,
        ]);
    }

    private function finish(Context $c, string $state): void
    {
        $id = $c->server->id;

        $pendingDownAt = (int) $c->meta('pendingDownAt', 0);
        if ($c->wentDown) {
            $pendingDownAt = $c->now;
            $c->remember('pendingDownAt', $pendingDownAt);
            $c->remember('pendingGracefulStop', $c->gracefulStop);
            DebugLog::write($c->settings, 'Server went down; deferring crash classification for restart grace period.', [
                'server_id' => $id,
                'graceful_stop' => $c->gracefulStop,
                'grace_seconds' => self::RESTART_GRACE_SECONDS,
            ]);
        }
        if ($c->cameUp) {
            if ($pendingDownAt > 0) {
                if ($c->meta('pendingGracefulStop') === true) {
                    $this->events->add($id, 'stop', $pendingDownAt);
                }
                $c->remember('pendingDownAt', 0);
                $c->remember('pendingGracefulStop', null);
            }
            $this->events->add($id, 'start', $c->now);
        }
        if (!$c->running && $pendingDownAt > 0 && $c->now - $pendingDownAt >= self::RESTART_GRACE_SECONDS) {
            $event = $c->meta('pendingGracefulStop') === true ? 'stop' : 'crash';
            $this->events->add($id, $event, $pendingDownAt);
            $c->remember('pendingDownAt', 0);
            $c->remember('pendingGracefulStop', null);
            DebugLog::write($c->settings, 'Deferred shutdown classified.', ['server_id' => $id, 'event' => $event]);
        }

        $counts = $this->players->counts($id);
        $sample = $c->sample;
        if (!$c->running) {
            $sample['players_online'] = 0;
        } elseif (!isset($sample['players_online'])) {
            $sample['players_online'] = $counts['online'];
        } elseif ($sample['players_online'] === 0 && $counts['online'] > 0) {
            $this->players->resetOnline($id);
        }

        $registered = max($counts['registered'], (int) $c->meta('registeredFiles', 0));
        $sample['players_registered'] = $registered > 0 ? $registered : null;

        $this->samples->insert($id, ['ts' => $c->now] + $sample);
        $this->cursors->save($id, ['last_state' => $state, 'data' => $c->data]);
    }
}
