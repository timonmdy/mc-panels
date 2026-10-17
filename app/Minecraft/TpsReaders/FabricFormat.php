<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class FabricFormat implements TpsReader
{
    public function key(): string
    {
        return 'fabric';
    }

    public function label(): string
    {
        return 'Fabric / vanilla';
    }

    public function command(): string
    {
        return 'tick query';
    }

    public function parse(string $message, array &$state, array $settings): ?array
    {
        if (!preg_match('/^Average time per tick:\s*(?<mspt>[\d.]+)\s*ms\b/i', $message, $matches)) {
            return null;
        }

        return TpsReading::fromMspt((float) $matches['mspt']);
    }
}
