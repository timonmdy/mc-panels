<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class SparkFormat implements TpsReader
{
    public function key(): string
    {
        return 'spark';
    }

    public function label(): string
    {
        return 'Spark';
    }

    public function command(): string
    {
        return 'spark tps';
    }

    public function parse(string $message, array &$state, array $settings): ?array
    {
        if (preg_match('/TPS from last\b/i', $message)) {
            $state['readingTps'] = true;
            return null;
        }

        if (empty($state['readingTps'])) {
            return null;
        }

        $message = preg_replace('/^\[[^\]]+\]\s*/u', '', $message);
        if (trim($message) === '') {
            return null;
        }
        $state['readingTps'] = false;

        if (preg_match('/^\s*(?<values>\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?){4})\s*$/u', $message, $matches)) {
            return [
                'type' => 'tps',
                'value' => TpsReading::firstNumber($matches['values']),
            ];
        }

        return null;
    }
}
