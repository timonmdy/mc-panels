<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Illuminate\Support\Facades\Http;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\ServerListPing;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\Targets;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\JsonPath;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Placeholders;

class PingProbe implements Probe
{
    public function __construct(private ServerListPing $ping)
    {
    }

    public function handle(Context $c): void
    {
        if (!$c->running || !$c->due('ping', (int) $c->settings['statusSeconds'])) {
            return;
        }
        $c->mark('ping');

        $vars = Targets::vars($c->server);
        $status = $c->settings['statusMode'] === 'external' ? $this->external($c, $vars) : $this->builtin($vars);
        if ($status === null) {
            return;
        }

        $c->sample['players_online'] = $status['online'];
        $c->sample['players_max'] = $status['max'];
        $c->sampleUpdated = true;
        $c->remember('status', $status);
    }

    private function builtin(array $vars): ?array
    {
        $data = $this->ping->query((string) $vars['ip'], (int) $vars['port']);
        if ($data === null) {
            return null;
        }

        $name = (string) ($data['version']['name'] ?? '');
        $parsed = preg_match('/^(?<software>[A-Za-z][A-Za-z ]*?)\s+(?<version>\d+(?:\.\d+)+)/', $name, $m);

        return [
            'online' => $data['players']['online'] ?? null,
            'max' => $data['players']['max'] ?? null,
            'version' => $parsed ? $m['version'] : $name,
            'software' => $parsed ? strtolower(trim($m['software'])) : null,
        ];
    }

    private function external(Context $c, array $vars): ?array
    {
        $s = $c->settings;
        try {
            $json = Http::timeout(5)->acceptJson()->get(Placeholders::fill((string) $s['statusApiUrl'], $vars))->json();
        } catch (\Throwable) {
            return null;
        }

        $online = JsonPath::get($json, (string) $s['statusOnlinePath']);
        if ($online === null) {
            return null;
        }

        return [
            'online' => (int) $online,
            'max' => ($max = JsonPath::get($json, (string) $s['statusMaxPath'])) !== null ? (int) $max : null,
            'version' => JsonPath::get($json, (string) $s['statusVersionPath']),
            'software' => ($sw = JsonPath::get($json, (string) $s['statusSoftwarePath'])) ? strtolower((string) $sw) : null,
        ];
    }
}
