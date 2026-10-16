<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class Placeholders
{
    public static function fill(string $template, array $vars): string
    {
        return preg_replace_callback('/\{(\w+)\}/', function (array $m) use ($vars) {
            return array_key_exists($m[1], $vars) ? rawurlencode((string) $vars[$m[1]]) : $m[0];
        }, $template);
    }
}
