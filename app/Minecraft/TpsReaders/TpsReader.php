<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders;

interface TpsReader
{
    public function key(): string;

    public function label(): string;

    public function command(): string;

    public function parse(string $message, array &$state, array $settings): ?array;
}
