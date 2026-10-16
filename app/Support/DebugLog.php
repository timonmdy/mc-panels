<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

use Illuminate\Support\Facades\Log;

final class DebugLog
{
    public static function write(array $settings, string $event, array $context = []): void
    {
        if (!($settings['debugLogging'] ?? false)) {
            return;
        }

        Log::debug('MC Panels: ' . $event, $context);
    }
}
