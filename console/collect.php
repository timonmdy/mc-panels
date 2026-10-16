<?php

app(\Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector\Collector::class)->run(fn (string $line) => $this->line($line));
