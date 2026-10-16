<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services;

use Illuminate\Support\Facades\Cache;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\CursorStore;
use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonConfigurationRepository;

class InfoService
{
    private const CACHE_SECONDS = 30;
    private const NODE_CACHE_SECONDS = 3600;

    public function __construct(
        private CursorStore $cursors,
        private GeoService $geo,
        private DaemonConfigurationRepository $nodes,
    ) {
    }

    public function get(Server $server, array $settings): array
    {
        return Cache::remember("mcpanels:info:{$server->id}", self::CACHE_SECONDS, function () use ($server, $settings) {
            $meta = $this->cursors->data($server->id)['meta'] ?? [];
            $vars = Targets::vars($server);

            return [
                'server' => $this->server($meta, $vars, $settings),
                'system' => $this->system($server, $meta),
                'world' => $this->world($meta),
            ];
        });
    }

    private function server(array $meta, array $vars, array $settings): array
    {
        $status = $meta['status'] ?? [];

        return [
            'software' => $status['software'] ?? $meta['software'] ?? null,
            'version' => $status['version'] ?? $meta['mcVersion'] ?? null,
            'ip' => $vars['ip'],
            'host' => $vars['host'],
            'port' => $vars['port'],
            'motd' => $meta['properties']['motd'] ?? null,
            'region' => $this->geo->lookup($vars['host'], $settings, $vars),
        ];
    }

    private function system(Server $server, array $meta): array
    {
        $node = Cache::remember("mcpanels:node:{$server->node_id}", self::NODE_CACHE_SECONDS, function () use ($server) {
            try {
                return $this->nodes->setNode($server->node)->getSystemInformation(2)['system'] ?? [];
            } catch (\Throwable) {
                return [];
            }
        });

        return [
            'javaVersion' => $meta['javaVersion'] ?? $this->javaFromImage((string) $server->image),
            'image' => $server->image,
            'os' => $node['os'] ?? null,
            'osType' => $node['os_type'] ?? ($meta['osType'] ?? null),
            'arch' => $node['architecture'] ?? ($meta['arch'] ?? null),
            'kernel' => $node['kernel_version'] ?? null,
            'cpuThreads' => $node['cpu_threads'] ?? null,
        ];
    }

    private function world(array $meta): array
    {
        $p = $meta['properties'] ?? [];
        $bool = fn (string $key) => isset($p[$key]) ? $p[$key] === 'true' : null;
        $int = fn (string $key) => isset($p[$key]) ? (int) $p[$key] : null;

        return [
            'worlds' => $meta['worlds'] ?? [],
            'levelName' => $p['level-name'] ?? null,
            'difficulty' => $p['difficulty'] ?? null,
            'gamemode' => $p['gamemode'] ?? null,
            'hardcore' => $bool('hardcore'),
            'pvp' => $bool('pvp'),
            'viewDistance' => $int('view-distance'),
            'simulationDistance' => $int('simulation-distance'),
            'maxPlayers' => $int('max-players'),
            'onlineMode' => $bool('online-mode'),
            'whitelist' => $bool('white-list'),
            'spawnProtection' => $int('spawn-protection'),
            'loadedChunks' => $meta['chunks'] ?? null,
            'entities' => $meta['entities'] ?? null,
        ];
    }

    private function javaFromImage(string $image): ?string
    {
        if (!preg_match('/(?:java|temurin|jdk)[_:-]?(\d+)/i', $image, $m)) {
            return null;
        }

        return $m[1];
    }
}
