<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Illuminate\Support\Facades\Http;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\Targets;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\JsonPath;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Placeholders;

class BridgeProbe implements Probe
{
    public function handle(Context $c): void
    {
        $s = $c->settings;
        $url = trim((string) $s['bridgeApiUrl']);
        if ($url === '' || !$c->running || !$c->due('bridge', (int) $s['tpsSeconds'])) {
            return;
        }
        $c->mark('bridge');

        try {
            $response = Http::timeout(5)->acceptJson()->get(Placeholders::fill($url, Targets::vars($c->server)));
        } catch (\Throwable $e) {
            DebugLog::write($s, 'Bridge API request failed.', [
                'server_id' => $c->server->id,
                'exception' => get_class($e),
                'message' => $e->getMessage(),
            ]);

            return;
        }
        if (!$response->successful()) {
            DebugLog::write($s, 'Bridge API returned an unsuccessful status.', [
                'server_id' => $c->server->id,
                'status' => $response->status(),
            ]);

            return;
        }
        $json = $response->json();
        if (!is_array($json)) {
            DebugLog::write($s, 'Bridge API response was not a JSON object.', ['server_id' => $c->server->id]);

            return;
        }

        if ($s['tpsMode'] === 'bridge') {
            $tps = JsonPath::get($json, (string) $s['bridgeTpsPath']);
            $mspt = JsonPath::get($json, (string) $s['bridgeMsptPath']);
            $c->sample['tps'] = is_numeric($tps) ? min(20.0, round((float) $tps, 2)) : null;
            $c->sample['mspt'] = is_numeric($mspt) ? round((float) $mspt, 2) : null;
            DebugLog::write($s, is_numeric($tps) ? 'Bridge TPS values parsed.' : 'Bridge TPS value missing or non-numeric.', [
                'server_id' => $c->server->id,
                'tps_path' => (string) $s['bridgeTpsPath'],
                'mspt_path' => (string) $s['bridgeMsptPath'],
                'tps' => $c->sample['tps'],
                'mspt' => $c->sample['mspt'],
            ]);
        }

        foreach (['chunks' => 'bridgeChunksPath', 'entities' => 'bridgeEntitiesPath'] as $key => $setting) {
            $value = JsonPath::get($json, (string) $s[$setting]);
            $c->remember($key, is_numeric($value) ? (int) $value : null);
        }
    }
}
