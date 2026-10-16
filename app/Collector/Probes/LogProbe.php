<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\LogParser;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\ServerFiles;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\FailureStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog;

class LogProbe implements Probe
{
    private const LOG = '/logs/latest.log';

    public function __construct(
        private ServerFiles $files,
        private LogParser $parser,
        private CursorStore $cursors,
        private PlayerStore $players,
        private FailureStore $failures,
    ) {
    }

    public function handle(Context $c): void
    {
        if (!$c->running && !$c->wentDown) {
            return;
        }
        if (!($c->tpsRequested || $c->wentDown || $c->due('log', (int) $c->settings['logSeconds']))) {
            return;
        }
        $c->mark('log');

        $lines = $this->files->lines($c->server, self::LOG, (int) $c->settings['logMaxKiB'] * 1024);
        if ($lines === null) {
            DebugLog::write($c->settings, 'Server log could not be read; check the file size limit and file access.', [
                'server_id' => $c->server->id,
                'path' => self::LOG,
                'max_bytes' => (int) $c->settings['logMaxKiB'] * 1024,
            ]);

            return;
        }

        $id = $c->server->id;
        $cursor = $this->cursors->find($id);
        $head = md5(implode("\n", array_slice($lines, 0, 3)));
        $start = $cursor && $cursor->log_head === $head && $cursor->log_lines <= count($lines) ? (int) $cursor->log_lines : 0;

        $events = $this->parser->events(array_slice($lines, $start));
        $loginEvents = array_values(array_filter($events, fn ($event) => $event['type'] === 'login'));
        $loginLines = array_filter(
            array_slice($lines, $start),
            fn ($line) => preg_match('/logged in with entity id/i', $line) === 1,
        );
        DebugLog::write($c->settings, 'Server log scanned.', [
            'server_id' => $id,
            'line_count' => count($lines),
            'cursor_start' => $start,
            'lines_processed' => count($lines) - $start,
            'event_count' => count($events),
            'parsed_login_events' => count($loginEvents),
            'login_lines_seen' => count($loginLines),
            'ip_recording_enabled' => (int) $c->settings['ipRetentionDays'] > 0,
            'tps_events' => array_values(array_filter($events, fn ($event) => $event['type'] === 'tps')),
            'tps_log_lines' => array_values(array_filter(
                array_slice($lines, $start),
                fn ($line) => preg_match('/tps|tick time|time per tick/i', $line) === 1,
            )),
        ]);
        $this->apply($c, $events);
        $this->cursors->save($id, ['log_lines' => count($lines), 'log_head' => $head]);

        if ($start === 0) {
            foreach ($this->parser->meta($lines) as $key => $value) {
                $c->remember($key, $value);
            }
        }
        if ($c->wentDown) {
            $tail = $this->parser->events(array_slice($lines, -200));
            $c->gracefulStop = count(array_filter($tail, fn ($e) => $e['type'] === 'stopping')) > 0;
            DebugLog::write($c->settings, 'Shutdown log evidence checked.', [
                'server_id' => $id,
                'graceful_stop_found' => $c->gracefulStop,
            ]);
        }
    }

    private function apply(Context $c, array $events): void
    {
        $id = $c->server->id;
        $storeIps = (int) $c->settings['ipRetentionDays'] > 0;
        $loginCount = 0;
        if (!$storeIps && array_filter($events, fn ($event) => $event['type'] === 'login') !== []) {
            DebugLog::write($c->settings, 'IP history login events were found but IP retention is set to zero.', ['server_id' => $id]);
        }

        foreach ($events as $e) {
            $ts = $c->logTimestamp($e['time']);
            if ($e['type'] === 'login') {
                $loginCount++;
            }
            match ($e['type']) {
                'login' => $this->players->login($id, $e['name'], $e['ip'], $ts, $storeIps),
                'join' => $this->players->join($id, $e['name'], $ts),
                'leave' => $this->players->leave($id, $e['name'], $ts),
                'uuid' => $this->players->setUuid($id, $e['name'], $e['uuid']),
                'failure' => $this->failures->add($id, $ts, $e['reason'], $e['name'], $storeIps ? $e['ip'] : null),
                'tps' => $this->applyTps($c, $e),
                default => null,
            };
        }
        if ($loginCount > 0) {
            DebugLog::write($c->settings, 'Parsed player login events processed.', [
                'server_id' => $id,
                'login_count' => $loginCount,
                'ip_history_stored' => $storeIps,
            ]);
        }
    }

    private function applyTps(Context $c, array $event): void
    {
        if ($event['value'] !== null) {
            $c->sample['tps'] = $event['value'];
        }
        if (isset($event['mspt'])) {
            $c->sample['mspt'] = $event['mspt'];
        }
    }
}
