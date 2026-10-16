<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class JsonPath
{
    public static function get(mixed $data, string $path): mixed
    {
        if ($path === '') {
            return null;
        }

        foreach (explode('.', $path) as $segment) {
            if (!is_array($data) || !array_key_exists($segment, $data)) {
                return null;
            }
            $data = $data[$segment];
        }

        return $data;
    }
}
