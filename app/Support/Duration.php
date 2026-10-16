<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class Duration
{
    private const UNITS = ['m' => 60, 'h' => 3600, 'd' => 86400];

    public static function toSeconds(string $key): ?int
    {
        if (!preg_match('/^(\d{1,4})([mhd])$/', trim($key), $m)) {
            return null;
        }

        return (int) $m[1] * self::UNITS[$m[2]];
    }

    public static function parseList(string $list): array
    {
        $spans = [];
        foreach (explode(',', $list) as $raw) {
            $key = strtolower(trim($raw));
            $seconds = self::toSeconds($key);
            if ($seconds !== null && $seconds > 0) {
                $spans[$key] = ['key' => $key, 'label' => self::label($key), 'seconds' => $seconds];
            }
        }

        usort($spans, fn ($a, $b) => $a['seconds'] <=> $b['seconds']);

        return array_values($spans);
    }

    private static function label(string $key): string
    {
        $amount = (int) $key;
        $unit = ['m' => 'min', 'h' => 'hour', 'd' => 'day'][substr($key, -1)];

        return $unit === 'min' ? "{$amount} min" : "{$amount} {$unit}" . ($amount === 1 ? '' : 's');
    }
}
