<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class ForgeFormat implements TpsReader
{
    public function key(): string
    {
        return 'forge';
    }

    public function label(): string
    {
        return 'Forge';
    }

    public function command(): string
    {
        return 'forge tps';
    }

    public function parse(string $message, array &$state, array $settings): ?array
    {
        if (!preg_match('/Mean tick time:\s*(?<mspt>[\d.]+)\s*ms\.\s*Mean TPS:\s*(?<tps>[\d.]+)/i', $message, $matches)) {
            return null;
        }

        return [
            'type' => 'tps',
            'value' => min(20.0, (float) $matches['tps']),
            'mspt' => (float) $matches['mspt'],
        ];
    }
}
