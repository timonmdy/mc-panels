<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class Settings
{
    private const KEY = 'mcpanels::config';

    private ?array $cache = null;

    public function __construct(private SettingsRepositoryInterface $store)
    {
    }

    public function all(): array
    {
        if ($this->cache === null) {
            $stored = json_decode((string) $this->store->get(self::KEY, '{}'), true);
            $this->cache = array_merge(SettingsSchema::defaults(), is_array($stored) ? $stored : []);
        }

        return $this->cache;
    }

    public function get(string $key): mixed
    {
        return $this->all()[$key] ?? null;
    }

    public function save(array $input): void
    {
        $fields = SettingsSchema::fields();
        $clean = [];
        foreach ($fields as $key => $field) {
            $clean[$key] = $this->coerce($field, $input[$key] ?? null);
        }

        if (Duration::parseList($clean['timeSpans']) === []) {
            $clean['timeSpans'] = $fields['timeSpans']['default'];
        }

        $this->store->set(self::KEY, json_encode($clean));
        $this->cache = null;
    }

    public function timeSpans(): array
    {
        return Duration::parseList((string) $this->get('timeSpans'));
    }

    public function defaultTimeSpan(): string
    {
        $keys = array_column($this->timeSpans(), 'key');
        $wanted = (string) $this->get('defaultTimeSpan');

        return in_array($wanted, $keys, true) ? $wanted : ($keys[0] ?? '1h');
    }

    public function publicConfig(): array
    {
        return [
            'timeSpans' => $this->timeSpans(),
            'defaultTimeSpan' => $this->defaultTimeSpan(),
            'maxPoints' => (int) $this->get('maxPoints'),
            'avatarApiUrl' => (string) $this->get('avatarApiUrl'),
            'debugLogging' => (bool) $this->get('debugLogging'),
            'animationsEnabled' => (bool) $this->get('animationsEnabled'),
            'polling' => [
                'liveSeconds' => (int) $this->get('liveSeconds'),
                'seriesSeconds' => (int) $this->get('seriesSeconds'),
                'listSeconds' => (int) $this->get('listSeconds'),
            ],
            'features' => [
                'tps' => $this->get('tpsMode') !== 'off',
                'bridge' => (string) $this->get('bridgeApiUrl') !== '',
                'geo' => (bool) $this->get('geoEnabled'),
            ],
        ];
    }

    private function coerce(array $field, mixed $value): mixed
    {
        return match ($field['type']) {
            'int' => max($field['min'], min($field['max'], (int) ($value ?? $field['default']))),
            'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'select' => array_key_exists((string) $value, $field['options']) ? (string) $value : $field['default'],
            default => trim((string) ($value ?? $field['default'])),
        };
    }
}
