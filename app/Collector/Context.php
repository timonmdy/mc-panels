<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Collector;

use Pterodactyl\Models\Server;

final class Context
{
    public array $sample = [];
    public bool $running = false;
    public bool $wentDown = false;
    public bool $cameUp = false;
    public bool $tpsRequested = false;
    public bool $tpsParsed = false;
    public bool $sampleUpdated = false;
    public ?bool $gracefulStop = null;

    public function __construct(
        public Server $server,
        public array $settings,
        public array $data,
        public int $now,
        public ?object $previous,
        public ?string $lastState,
    ) {
    }

    public function due(string $key, int $seconds): bool
    {
        return ($this->data['last'][$key] ?? 0) + $seconds - 2 <= $this->now;
    }

    public function mark(string $key): void
    {
        $this->data['last'][$key] = $this->now;
    }

    public function remember(string $key, mixed $value): void
    {
        $this->data['meta'][$key] = $value;
    }

    public function meta(string $key, mixed $default = null): mixed
    {
        return $this->data['meta'][$key] ?? $default;
    }

    public function logTimestamp(string $time): int
    {
        $stamp = strtotime(date('Y-m-d', $this->now) . ' ' . $time) ?: $this->now;

        return $stamp > $this->now + 120 ? $stamp - 86400 : $stamp;
    }
}
