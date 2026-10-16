<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\EventStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\FailureStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\PlayerStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\SampleStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;

class Pruner
{
    public function __construct(
        private Settings $settings,
        private SampleStore $samples,
        private EventStore $events,
        private FailureStore $failures,
        private PlayerStore $players,
    ) {
    }

    public function run(): void
    {
        $now = time();
        $day = 86400;
        $s = $this->settings->all();

        $this->samples->prune($now - $s['retentionDays'] * $day);
        $this->events->prune($now - $s['retentionDays'] * $day);
        $this->failures->prune($now - $s['failureRetentionDays'] * $day);
        $this->players->pruneIps($s['ipRetentionDays'] > 0 ? $now - $s['ipRetentionDays'] * $day : $now + 1);
    }
}
