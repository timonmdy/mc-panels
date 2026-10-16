<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft;

final class Properties
{
    public static function parse(?string $content): array
    {
        $out = [];
        foreach (preg_split('/\r?\n/', (string) $content) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $out[trim($key)] = trim($value);
        }

        return $out;
    }
}
