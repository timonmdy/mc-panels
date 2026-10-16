<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class Metrics
{
    public const EXPRESSIONS = [
        'cpu' => 'cpu',
        'memory' => 'mem_bytes',
        'memoryPercent' => '(mem_bytes / NULLIF(mem_limit, 0)) * 100',
        'netUp' => 'net_up',
        'netDown' => 'net_down',
        'playersOnline' => 'players_online',
        'playersRegistered' => 'players_registered',
        'tps' => 'tps',
    ];

    public static function sanitize(array $keys): array
    {
        return array_values(array_intersect(array_unique($keys), array_keys(self::EXPRESSIONS)));
    }
}
