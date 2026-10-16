<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probes;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Context;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Probe;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\Properties;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\ServerFiles;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;

class RegistryProbe implements Probe
{
    private const IGNORED_DIRS = ['logs', 'plugins', 'mods', 'config', 'libraries', 'versions', 'cache', 'crash-reports', 'backups', 'datapacks', 'resourcepacks', 'defaultconfigs', 'world_gen'];
    private const MAX_WORLD_CHECKS = 12;

    public function __construct(private ServerFiles $files, private PlayerStore $players)
    {
    }

    public function handle(Context $c): void
    {
        if (!$c->due('registry', (int) $c->settings['registrySeconds'])) {
            return;
        }
        $c->mark('registry');

        $server = $c->server;
        $id = $server->id;
        $props = Properties::parse($this->files->read($server, '/server.properties', 65536));
        $level = $props['level-name'] ?? 'world';

        $this->players->seed($id, $this->files->json($server, '/usercache.json'));
        $this->players->applyBans($id, $this->files->json($server, '/banned-players.json'));

        $c->remember('properties', array_intersect_key($props, array_flip([
            'difficulty', 'gamemode', 'hardcore', 'pvp', 'level-name', 'view-distance', 'simulation-distance',
            'max-players', 'online-mode', 'white-list', 'spawn-protection', 'motd',
        ])));
        $c->remember('ipBans', array_values(array_filter(array_column($this->files->json($server, '/banned-ips.json'), 'ip'))));
        $c->remember('registeredFiles', $this->countPlayerData($server, $level));
        $c->remember('worlds', $this->worlds($server, $level));
    }

    private function countPlayerData($server, string $level): int
    {
        $entries = $this->files->directory($server, "/{$level}/playerdata");

        return count(array_filter($entries, fn ($e) => ($e['is_file'] ?? false) && preg_match('/^[0-9a-f-]{36}\.dat$/i', $e['name'] ?? '')));
    }

    private function worlds($server, string $level): array
    {
        $dirs = array_filter($this->files->directory($server, '/'), fn ($e) => !($e['is_file'] ?? true)
            && !in_array($e['name'], self::IGNORED_DIRS, true) && !str_starts_with($e['name'], '.'));

        $names = array_slice(array_column($dirs, 'name'), 0, self::MAX_WORLD_CHECKS);
        $worlds = [];
        foreach ($names as $name) {
            $inside = array_column($this->files->directory($server, "/{$name}"), 'name');
            if (in_array('level.dat', $inside, true)) {
                $worlds[] = ['name' => $name, 'dimensions' => 1 + (int) in_array('DIM-1', $inside, true) + (int) in_array('DIM1', $inside, true)];
            }
        }

        return $worlds ?: [['name' => $level, 'dimensions' => 1]];
    }
}
