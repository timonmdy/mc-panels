<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class CustomFormat implements TpsReader
{
    public function key(): string
    {
        return 'custom';
    }

    public function label(): string
    {
        return 'Custom regular expression';
    }

    public function command(): string
    {
        return '';
    }

    public function parse(string $message, array &$state, array $settings): ?array
    {
        $pattern = (string) ($settings['tpsCustomPattern'] ?? '');
        if ($pattern === '' || @preg_match($pattern, $message, $matches) !== 1 || !isset($matches['tps'])) {
            return null;
        }

        $reading = ['type' => 'tps', 'value' => TpsReading::firstNumber((string) $matches['tps'])];
        if (isset($matches['mspt']) && is_numeric($matches['mspt'])) {
            $reading['mspt'] = (float) $matches['mspt'];
        }

        return $reading;
    }
}
