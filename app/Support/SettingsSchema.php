<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class SettingsSchema
{
    public static function sections(): array
    {
        return [
            'General' => [
                'animationsEnabled' => ['type' => 'bool', 'default' => true, 'label' => 'Enable dashboard animations'],
                'debugLogging' => ['type' => 'bool', 'default' => false, 'label' => 'Enable detailed debug logging', 'help' => 'Browser request diagnostics appear in DevTools Console (filter for "MC Panels"). Server collector diagnostics are written to the panel Laravel log. Disable after troubleshooting.'],
            ],
            'Data collection' => [
                'collectMode' => ['type' => 'select', 'default' => 'visited', 'options' => ['visited' => 'Only servers that opened the MC Panels tab', 'all' => 'Every server'], 'label' => 'Servers to collect', 'help' => 'Collecting every server also polls non-Minecraft servers.'],
                'inactiveDays' => ['type' => 'int', 'default' => 30, 'min' => 1, 'max' => 365, 'label' => 'Stop collecting after (days without a visit)'],
                'pollSeconds' => ['type' => 'int', 'default' => 60, 'min' => 15, 'max' => 3600, 'label' => 'Resource poll interval (seconds)', 'help' => 'CPU, RAM, disk, network, uptime. Values below 60 make each scheduler run loop internally.'],
                'statusSeconds' => ['type' => 'int', 'default' => 60, 'min' => 15, 'max' => 3600, 'label' => 'Player status interval (seconds)'],
                'tpsSeconds' => ['type' => 'int', 'default' => 60, 'min' => 30, 'max' => 3600, 'label' => 'TPS interval (seconds)'],
                'logSeconds' => ['type' => 'int', 'default' => 30, 'min' => 15, 'max' => 3600, 'label' => 'Log scan interval (seconds)'],
                'registrySeconds' => ['type' => 'int', 'default' => 600, 'min' => 60, 'max' => 86400, 'label' => 'Player registry sync interval (seconds)'],
                'logMaxKiB' => ['type' => 'int', 'default' => 4096, 'min' => 256, 'max' => 65536, 'label' => 'Largest latest.log to scan (KiB)'],
            ],
            'Retention' => [
                'retentionDays' => ['type' => 'int', 'default' => 30, 'min' => 1, 'max' => 365, 'label' => 'Keep metric samples (days)', 'help' => 'Should be at least as long as your longest time span.'],
                'ipRetentionDays' => ['type' => 'int', 'default' => 90, 'min' => 0, 'max' => 3650, 'label' => 'Keep player IP history (days, 0 = never store)', 'help' => 'Set above 0 to collect login IPs from server logs. The collector scheduler must be running.'],
                'failureRetentionDays' => ['type' => 'int', 'default' => 30, 'min' => 1, 'max' => 365, 'label' => 'Keep failed connections (days)'],
            ],
            'Time spans' => [
                'timeSpans' => ['type' => 'text', 'default' => '15m,1h,6h,24h,3d,7d,30d', 'label' => 'Available time spans', 'help' => 'Comma separated, units m / h / d.'],
                'defaultTimeSpan' => ['type' => 'text', 'default' => '1h', 'label' => 'Default time span'],
                'maxPoints' => ['type' => 'int', 'default' => 180, 'min' => 30, 'max' => 1000, 'label' => 'Max points per chart'],
            ],
            'Frontend polling' => [
                'liveSeconds' => ['type' => 'int', 'default' => 5, 'min' => 2, 'max' => 120, 'label' => 'Live values refresh (seconds)'],
                'seriesSeconds' => ['type' => 'int', 'default' => 30, 'min' => 5, 'max' => 600, 'label' => 'Charts refresh (seconds)'],
                'listSeconds' => ['type' => 'int', 'default' => 15, 'min' => 5, 'max' => 600, 'label' => 'Lists and logs refresh (seconds)'],
            ],
            'External APIs' => [
                'statusMode' => ['type' => 'select', 'default' => 'builtin', 'options' => ['builtin' => 'Built-in server list ping', 'external' => 'External status API'], 'label' => 'Player status source'],
                'statusApiUrl' => ['type' => 'url', 'default' => 'https://api.mcsrvstat.us/3/{host}:{port}', 'label' => 'Status API URL', 'help' => 'Placeholders: {uuid} {uuidShort} {ip} {host} {port} {serverName}'],
                'statusOnlinePath' => ['type' => 'text', 'default' => 'players.online', 'label' => 'Status: online players path'],
                'statusMaxPath' => ['type' => 'text', 'default' => 'players.max', 'label' => 'Status: max players path'],
                'statusVersionPath' => ['type' => 'text', 'default' => 'version', 'label' => 'Status: version path'],
                'statusSoftwarePath' => ['type' => 'text', 'default' => 'software', 'label' => 'Status: software path'],
                'geoEnabled' => ['type' => 'bool', 'default' => true, 'label' => 'Resolve server region from its IP'],
                'geoApiUrl' => ['type' => 'url', 'default' => 'https://ipwho.is/{host}', 'label' => 'Geo API URL'],
                'geoCountryPath' => ['type' => 'text', 'default' => 'country', 'label' => 'Geo: country path'],
                'geoRegionPath' => ['type' => 'text', 'default' => 'region', 'label' => 'Geo: region path'],
                'geoCityPath' => ['type' => 'text', 'default' => 'city', 'label' => 'Geo: city path'],
                'avatarApiUrl' => ['type' => 'url', 'default' => 'https://mc-heads.net/avatar/{uuid}/48', 'label' => 'Player avatar URL', 'help' => 'Placeholders: {uuid} {name}. Loaded by the browser.'],
            ],
            'TPS and world data' => [
                'tpsMode' => ['type' => 'select', 'default' => 'off', 'options' => ['console' => 'Run a command through the panel console', 'bridge' => 'HTTP bridge (non-console)', 'off' => 'Disabled'], 'label' => 'TPS source'],
                'tpsCommand' => ['type' => 'text', 'default' => 'tps', 'label' => 'TPS console command', 'help' => 'Runs at the configured interval and its output is read from latest.log. This can add console/log noise. Fabric command availability and output vary by Minecraft version.'],
                'bridgeApiUrl' => ['type' => 'url', 'default' => '', 'label' => 'Bridge API URL (optional)', 'help' => 'Use a Minecraft plugin/mod HTTP endpoint that returns JSON; this is the recommended quiet option for Fabric. Placeholders: {uuid} {uuidShort} {ip} {host} {port} {serverName}.'],
                'bridgeTpsPath' => ['type' => 'text', 'default' => 'tps', 'label' => 'Bridge: TPS path'],
                'bridgeMsptPath' => ['type' => 'text', 'default' => 'mspt', 'label' => 'Bridge: MSPT path'],
                'bridgeChunksPath' => ['type' => 'text', 'default' => 'chunks', 'label' => 'Bridge: loaded chunks path'],
                'bridgeEntitiesPath' => ['type' => 'text', 'default' => 'entities', 'label' => 'Bridge: loaded entities path'],
            ],
        ];
    }

    public static function fields(): array
    {
        return array_merge(...array_values(self::sections()));
    }

    public static function defaults(): array
    {
        return array_map(fn (array $f) => $f['default'], self::fields());
    }
}
