<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

final class TpsReading
{
    public static function fromMspt(float $mspt): array
    {
        return [
            'type' => 'tps',
            'value' => min(20.0, round(1000 / max(0.01, $mspt), 2)),
            'mspt' => $mspt,
        ];
    }

    public static function firstNumber(string $text): ?float
    {
        return preg_match('/\d+(?:\.\d+)?/', $text, $matches)
            ? min(20.0, (float) $matches[0])
            : null;
    }
}
