<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\LayoutSanitizer;

class ProfileStore
{
    private const TABLE = 'mcpanels_profiles';
    private const KINDS = ['profile', 'template'];

    public function list(int $serverId, string $kind): array
    {
        return DB::table(self::TABLE)
            ->where('server_id', $serverId)->where('kind', $kind)
            ->orderBy('position')->orderBy('id')->get()
            ->map(fn ($row) => $this->dto($row))->all();
    }

    public function create(int $serverId, string $kind, string $name, mixed $layout): array
    {
        $kind = in_array($kind, self::KINDS, true) ? $kind : 'profile';
        $position = (int) DB::table(self::TABLE)->where('server_id', $serverId)->where('kind', $kind)->max('position') + 1;

        $id = DB::table(self::TABLE)->insertGetId([
            'server_id' => $serverId, 'kind' => $kind, 'name' => $this->name($name),
            'layout' => json_encode(LayoutSanitizer::clean($layout)), 'position' => $position,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        return $this->dto(DB::table(self::TABLE)->find($id));
    }

    public function update(int $serverId, int $id, array $input): ?array
    {
        $row = DB::table(self::TABLE)->where('server_id', $serverId)->where('id', $id)->first();
        if (!$row) {
            return null;
        }

        $changes = ['updated_at' => now()];
        if (isset($input['name'])) {
            $changes['name'] = $this->name((string) $input['name']);
        }
        if (array_key_exists('layout', $input)) {
            $changes['layout'] = json_encode(LayoutSanitizer::clean($input['layout']));
        }
        DB::table(self::TABLE)->where('id', $id)->update($changes);

        return $this->dto(DB::table(self::TABLE)->find($id));
    }

    public function delete(int $serverId, int $id): bool
    {
        return DB::table(self::TABLE)->where('server_id', $serverId)->where('id', $id)->delete() > 0;
    }

    private function name(string $name): string
    {
        $name = trim(strip_tags($name));

        return $name === '' ? 'Untitled' : mb_substr($name, 0, 64);
    }

    private function dto(object $row): array
    {
        return [
            'id' => (int) $row->id,
            'kind' => $row->kind,
            'name' => $row->name,
            'layout' => json_decode($row->layout, true) ?: ['panels' => []],
            'position' => (int) $row->position,
        ];
    }
}
