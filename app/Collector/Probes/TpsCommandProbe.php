<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\Repositories\Wings\DaemonCommandRepository;

class TpsCommandProbe implements Probe
{
    private const MAX_MISSES = 3;
    private const BACKOFF_SECONDS = 3600;

    public function __construct(private DaemonCommandRepository $commands)
    {
    }

    public function handle(Context $c): void
    {
        $s = $c->settings;
        if ($s['tpsMode'] !== 'console' || !$c->running || trim((string) $s['tpsCommand']) === '') {
            return;
        }
        if ($c->meta('tpsPausedUntil', 0) > $c->now || !$c->due('tps', (int) $s['tpsSeconds'])) {
            return;
        }

        $c->mark('tps');
        try {
            $this->commands->setServer($c->server)->send((string) $s['tpsCommand']);
            $c->tpsRequested = true;
            DebugLog::write($s, 'TPS console command submitted.', [
                'server_id' => $c->server->id,
                'command' => (string) $s['tpsCommand'],
                'interval_seconds' => (int) $s['tpsSeconds'],
            ]);
        } catch (\Throwable $e) {
            $c->tpsRequested = false;
            DebugLog::write($s, 'TPS console command failed.', [
                'server_id' => $c->server->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function verify(Context $c): void
    {
        if (!$c->tpsRequested) {
            return;
        }

        if ($c->tpsParsed) {
            $c->remember('tpsMisses', 0);
            DebugLog::write($c->settings, 'TPS response parsed.', [
                'server_id' => $c->server->id,
                'tps' => $c->sample['tps'],
                'mspt' => $c->sample['mspt'] ?? null,
            ]);

            return;
        }

        $misses = (int) $c->meta('tpsMisses', 0) + 1;
        $c->remember('tpsMisses', $misses >= self::MAX_MISSES ? 0 : $misses);
        if ($misses >= self::MAX_MISSES) {
            $c->remember('tpsPausedUntil', $c->now + self::BACKOFF_SECONDS);
        }
        DebugLog::write($c->settings, 'TPS response was not parsed.', [
            'server_id' => $c->server->id,
            'misses' => $misses,
            'paused_until' => $misses >= self::MAX_MISSES ? $c->now + self::BACKOFF_SECONDS : null,
        ]);
    }
}
