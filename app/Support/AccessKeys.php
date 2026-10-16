<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\ServerFiles;
use Pterodactyl\Models\Server;

final class AccessKeys
{
    public const FILE = '/mcpanels.credentials';
    public const GRANTS = ['view', 'edit', 'data.view', 'data.manage', 'ips.view', '*'];

    public function __construct(private ServerFiles $files)
    {
    }

    public function allows(Request $request, Server $server, string $ability): bool
    {
        $token = trim((string) $request->header('X-MCPanels-Key', ''));
        if ($token === '') {
            return false;
        }

        $digest = hash('sha256', $token);
        foreach ($this->records($server) as $record) {
            if (!isset($record['hash']) || !hash_equals($record['hash'], $digest)) {
                continue;
            }
            $grants = $record['permissions'] ?? [];

            return in_array('*', $grants, true) || in_array($this->grantFor($ability), $grants, true);
        }

        return false;
    }

    public function list(Server $server): array
    {
        return array_map(fn (array $record): array => [
            'id' => $record['id'],
            'name' => $record['name'],
            'permissions' => $record['permissions'],
            'createdAt' => $record['createdAt'],
        ], $this->records($server));
    }

    public function create(Server $server, string $name, array $permissions): array
    {
        if (!in_array('*', $permissions, true) && array_intersect(['edit', 'data.view', 'data.manage', 'ips.view'], $permissions) !== []) {
            $permissions[] = 'view';
        }
        $key = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $record = [
            'id' => bin2hex(random_bytes(8)),
            'name' => mb_substr(trim(strip_tags($name)), 0, 64),
            'hash' => hash('sha256', $key),
            'permissions' => array_values(array_unique($permissions)),
            'createdAt' => now()->toIso8601String(),
        ];
        $records = $this->records($server);
        $records[] = $record;
        $this->save($server, $records);

        return ['key' => $key] + $this->publicRecord($record);
    }

    public function delete(Server $server, string $id): bool
    {
        $records = $this->records($server);
        $remaining = array_values(array_filter($records, fn (array $record): bool => $record['id'] !== $id));
        if (count($remaining) === count($records)) {
            return false;
        }
        $this->save($server, $remaining);

        return true;
    }

    private function records(Server $server): array
    {
        return Cache::remember($this->cacheKey($server), 30, function () use ($server): array {
            $raw = $this->files->read($server, self::FILE, 65536);
            $decoded = $raw === null ? [] : json_decode($raw, true);
            if (!is_array($decoded) || !is_array($decoded['keys'] ?? null)) {
                return [];
            }

            return array_values(array_filter($decoded['keys'], fn ($record): bool =>
                is_array($record)
                && is_string($record['id'] ?? null)
                && is_string($record['name'] ?? null)
                && is_string($record['hash'] ?? null)
                && preg_match('/^[a-f0-9]{64}$/', $record['hash']) === 1
                && is_array($record['permissions'] ?? null)
                && is_string($record['createdAt'] ?? null)
            ));
        });
    }

    private function save(Server $server, array $records): void
    {
        $this->files->write($server, self::FILE, json_encode([
            'version' => 1,
            'keys' => array_values($records),
        ], JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR));
        Cache::forget($this->cacheKey($server));
    }

    private function cacheKey(Server $server): string
    {
        return 'mcpanels:access-keys:' . $server->id;
    }

    private function grantFor(string $ability): string
    {
        return match ($ability) {
            Permissions::READ => 'view',
            Permissions::EDIT_LAYOUTS, Permissions::EDIT_PROFILES => 'edit',
            Permissions::VIEW_DATA => 'data.view',
            Permissions::MANAGE_DATA => 'data.manage',
            Permissions::VIEW_IPS => 'ips.view',
            default => '',
        };
    }

    private function publicRecord(array $record): array
    {
        return [
            'id' => $record['id'],
            'name' => $record['name'],
            'permissions' => $record['permissions'],
            'createdAt' => $record['createdAt'],
        ];
    }
}
