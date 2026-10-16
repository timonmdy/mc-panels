<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\JsonPath;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Placeholders;

class GeoService
{
    private const TTL_SECONDS = 86400;

    public function lookup(?string $host, array $settings, array $vars): ?array
    {
        if (!$settings['geoEnabled'] || !$host) {
            return null;
        }

        $ip = filter_var($host, FILTER_VALIDATE_IP) ? $host : gethostbyname($host);
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }

        return Cache::remember('mcpanels:geo:' . md5($ip), self::TTL_SECONDS, function () use ($ip, $settings, $vars) {
            try {
                $json = Http::timeout(5)->acceptJson()->get(Placeholders::fill((string) $settings['geoApiUrl'], ['host' => $ip, 'ip' => $ip] + $vars))->json();
            } catch (\Throwable) {
                return null;
            }

            $geo = [
                'country' => JsonPath::get($json, (string) $settings['geoCountryPath']),
                'region' => JsonPath::get($json, (string) $settings['geoRegionPath']),
                'city' => JsonPath::get($json, (string) $settings['geoCityPath']),
            ];

            return array_filter($geo) ? $geo : null;
        });
    }
}
