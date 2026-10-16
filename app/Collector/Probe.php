<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector;

interface Probe
{
    public function handle(Context $c): void;
}
