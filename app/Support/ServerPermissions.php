<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

use Illuminate\Support\Facades\DB;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\User;

final class ServerPermissions
{
    public const GRANTS = ['view', 'layouts.edit', 'profiles.manage', 'data.view', 'data.manage', 'ips.view'];

    public function defaults(Server $server): array
    {
        $record = DB::table('mcpanels_access_defaults')->where('server_id', $server->id)->first();

        return $this->decode($record->permissions ?? null);
    }

    public function allows(Server $server, int $userId, string $ability): bool
    {
        $grant = $this->grantFor($ability);
        if ($grant === null) {
            return false;
        }

        $permissions = $this->defaults($server);
        $userRecord = DB::table('mcpanels_user_permissions')
            ->where('server_id', $server->id)
            ->where('user_id', $userId)
            ->first();
        $permissions = array_values(array_unique(array_merge($permissions, $this->decode($userRecord->permissions ?? null))));
        if ($grant === 'data.view' && in_array('data.manage', $permissions, true)) {
            return true;
        }

        return in_array($grant, $permissions, true);
    }

    public function saveDefaults(Server $server, int $actorId, array $permissions): array
    {
        $permissions = $this->normalize($permissions);
        $now = now();
        DB::table('mcpanels_access_defaults')->updateOrInsert(
            ['server_id' => $server->id],
            ['permissions' => json_encode($permissions, JSON_THROW_ON_ERROR), 'updated_by' => $actorId, 'updated_at' => $now, 'created_at' => $now],
        );
        if (in_array('view', $permissions, true)) {
            $this->resolvePendingRequests($server, $actorId, $now);
        }

        return $permissions;
    }

    public function grantByEmail(Server $server, int $actorId, string $email, array $permissions): array
    {
        $user = User::query()->whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))])->first();
        if (!$user) {
            abort(422, 'No Pterodactyl account exists for that email address.');
        }
        if ((int) $user->id === (int) $server->owner_id) {
            abort(422, 'The server owner already has full MC Panels access.');
        }

        $permissions = $this->normalize($permissions);
        $now = now();
        DB::table('mcpanels_user_permissions')->updateOrInsert(
            ['server_id' => $server->id, 'user_id' => $user->id],
            ['permissions' => json_encode($permissions, JSON_THROW_ON_ERROR), 'granted_by' => $actorId, 'updated_at' => $now, 'created_at' => $now],
        );
        if (in_array('view', $permissions, true)) {
            $this->resolvePendingRequests($server, $actorId, $now, (int) $user->id);
        }

        return ['id' => (int) $user->id, 'email' => $user->email, 'permissions' => $permissions];
    }

    public function revoke(Server $server, int $userId): bool
    {
        return DB::table('mcpanels_user_permissions')
            ->where('server_id', $server->id)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function users(Server $server): array
    {
        return DB::table('mcpanels_user_permissions as grants')
            ->join('users', 'users.id', '=', 'grants.user_id')
            ->where('grants.server_id', $server->id)
            ->orderBy('users.email')
            ->get(['users.id', 'users.email', 'grants.permissions', 'grants.created_at', 'grants.updated_at'])
            ->map(fn ($record): array => [
                'id' => (int) $record->id,
                'email' => (string) $record->email,
                'permissions' => $this->decode($record->permissions),
                'updatedAt' => (string) $record->updated_at,
            ])->all();
    }

    public function requests(Server $server): array
    {
        return DB::table('mcpanels_access_requests as requests')
            ->join('users', 'users.id', '=', 'requests.user_id')
            ->where('requests.server_id', $server->id)
            ->where('requests.status', 'pending')
            ->orderBy('requests.created_at')
            ->get(['requests.id', 'requests.user_id', 'requests.status', 'requests.created_at', 'users.email'])
            ->map(fn ($record): array => [
                'id' => (int) $record->id,
                'userId' => (int) $record->user_id,
                'email' => (string) $record->email,
                'status' => (string) $record->status,
                'createdAt' => (string) $record->created_at,
                'permissions' => ['view'],
            ])->all();
    }

    public function requestStatus(Server $server, int $userId): ?string
    {
        $status = DB::table('mcpanels_access_requests')
            ->where('server_id', $server->id)
            ->where('user_id', $userId)
            ->value('status');

        return is_string($status) ? $status : null;
    }

    public function requestAccess(Server $server, int $userId): string
    {
        $now = now();
        DB::table('mcpanels_access_requests')->updateOrInsert(
            ['server_id' => $server->id, 'user_id' => $userId],
            ['status' => 'pending', 'reviewed_by' => null, 'reviewed_at' => null, 'updated_at' => $now, 'created_at' => $now],
        );

        return 'pending';
    }

    public function reviewRequest(Server $server, int $requestId, int $actorId, bool $approve): array
    {
        return DB::transaction(function () use ($server, $requestId, $actorId, $approve): array {
            $request = DB::table('mcpanels_access_requests')
                ->where('server_id', $server->id)
                ->where('id', $requestId)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->first();
            if (!$request) {
                abort(404, 'This access request no longer exists or has already been reviewed.');
            }

            if ($approve) {
                $this->grantByUserId($server, $actorId, (int) $request->user_id, ['view']);
            }
            DB::table('mcpanels_access_requests')->where('id', $requestId)->update([
                'status' => $approve ? 'approved' : 'denied',
                'reviewed_by' => $actorId,
                'reviewed_at' => now(),
                'updated_at' => now(),
            ]);

            return ['id' => (int) $requestId, 'userId' => (int) $request->user_id, 'status' => $approve ? 'approved' : 'denied'];
        });
    }

    private function grantByUserId(Server $server, int $actorId, int $userId, array $permissions): void
    {
        $now = now();
        DB::table('mcpanels_user_permissions')->updateOrInsert(
            ['server_id' => $server->id, 'user_id' => $userId],
            ['permissions' => json_encode($this->normalize($permissions), JSON_THROW_ON_ERROR), 'granted_by' => $actorId, 'updated_at' => $now, 'created_at' => $now],
        );
    }

    private function resolvePendingRequests(Server $server, int $actorId, \DateTimeInterface $reviewedAt, ?int $userId = null): void
    {
        $query = DB::table('mcpanels_access_requests')
            ->where('server_id', $server->id)
            ->where('status', 'pending');
        if ($userId !== null) {
            $query->where('user_id', $userId);
        }
        $query->update([
            'status' => 'approved',
            'reviewed_by' => $actorId,
            'reviewed_at' => $reviewedAt,
            'updated_at' => $reviewedAt,
        ]);
    }

    private function normalize(array $permissions): array
    {
        $permissions = array_values(array_intersect(
            self::GRANTS,
            array_unique(array_filter($permissions, 'is_string')),
        ));
        if (in_array('data.manage', $permissions, true) && !in_array('data.view', $permissions, true)) {
            $permissions[] = 'data.view';
        }
        if (array_intersect(['layouts.edit', 'profiles.manage', 'data.view', 'ips.view'], $permissions) !== []
            && !in_array('view', $permissions, true)) {
            $permissions[] = 'view';
        }

        return $permissions;
    }

    private function grantFor(string $ability): ?string
    {
        return match ($ability) {
            Permissions::READ, 'websocket.connect' => 'view',
            Permissions::EDIT_LAYOUTS, 'settings.rename' => 'layouts.edit',
            Permissions::EDIT_PROFILES => 'profiles.manage',
            Permissions::VIEW_DATA => 'data.view',
            Permissions::MANAGE_DATA => 'data.manage',
            Permissions::VIEW_IPS => 'ips.view',
            default => null,
        };
    }

    private function decode(?string $json): array
    {
        if ($json === null) {
            return [];
        }
        $decoded = json_decode($json, true);

        return is_array($decoded) ? $this->normalize($decoded) : [];
    }
}
