<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class AutoFormat implements TpsReader
{
    public function key(): string
    {
        return 'auto';
    }

    public function label(): string
    {
        return 'Auto-detect common TPS output';
    }

    public function command(): string
    {
        return '';
    }

    public function parse(string $message, array &$state, array $settings): ?array
    {
        $message = preg_replace('/^\[[^\]]+\]\s*/u', '', $message);

        if (preg_match('/Mean tick time:\s*(?<mspt>[\d.]+)\s*ms\.\s*Mean TPS:\s*(?<tps>[\d.]+)/i', $message, $matches)) {
            return [
                'type' => 'tps',
                'value' => min(20.0, (float) $matches['tps']),
                'mspt' => (float) $matches['mspt'],
            ];
        }

        if (preg_match('/^Average time per tick:\s*(?<mspt>[\d.]+)\s*ms\b/i', $message, $matches)) {
            return TpsReading::fromMspt((float) $matches['mspt']);
        }

        if (preg_match('/^The game is running at\s+(?<tps>[\d.]+)\s+ticks per second\.?/i', $message, $matches)) {
            return ['type' => 'tps', 'value' => min(20.0, (float) $matches['tps'])];
        }

        if (preg_match('/(?:TPS from last [^:]+|(?:Current )?TPS(?:\s*\([^)]*\))?)\s*:\s*(?<values>.+)$/i', $message, $matches)) {
            return ['type' => 'tps', 'value' => TpsReading::firstNumber($matches['values'])];
        }

        if (preg_match('/(?:Average time per tick|Average tick time):\s*(?<mspt>[\d.]+)\s*ms/i', $message, $matches)) {
            return TpsReading::fromMspt((float) $matches['mspt']);
        }

        return null;
    }
}
