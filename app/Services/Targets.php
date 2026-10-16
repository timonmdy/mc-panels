<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services;

use Pterodactyl\Models\Server;

final class Targets
{
    public static function vars(Server $server): array
    {
        $allocation = $server->allocation;

        return [
            'uuid' => $server->uuid,
            'uuidShort' => $server->uuidShort,
            'ip' => $allocation?->ip,
            'host' => $allocation?->ip_alias ?: $allocation?->ip,
            'port' => $allocation?->port,
            'serverName' => $server->name,
        ];
    }
}
