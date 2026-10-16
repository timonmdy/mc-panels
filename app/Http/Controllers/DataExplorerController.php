<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\LayoutSanitizer;
use Pterodactyl\Models\Server;

class DataExplorerController extends McController
{
    private const TABLES = [
        'samples' => [
            'label' => 'Metric samples', 'table' => 'mcpanels_samples', 'primary' => 'id',
            'columns' => ['id', 'ts', 'state', 'cpu', 'mem_bytes', 'mem_limit', 'disk_bytes', 'disk_limit', 'net_rx_bytes', 'net_tx_bytes', 'net_up', 'net_down', 'uptime_ms', 'players_online', 'players_max', 'players_registered', 'tps', 'mspt'],
            'search' => ['state', 'cpu', 'mem_bytes', 'mem_limit', 'disk_bytes', 'disk_limit', 'net_up', 'net_down', 'uptime_ms', 'players_online', 'players_max', 'players_registered', 'tps', 'mspt'],
            'editable' => [
                'ts' => 'required|integer|min:0', 'state' => 'required|string|max:16',
                'cpu' => 'nullable|numeric|min:0', 'mem_bytes' => 'nullable|integer|min:0', 'mem_limit' => 'nullable|integer|min:0',
                'disk_bytes' => 'nullable|integer|min:0', 'disk_limit' => 'nullable|integer|min:0',
                'net_rx_bytes' => 'nullable|integer|min:0', 'net_tx_bytes' => 'nullable|integer|min:0',
                'net_up' => 'nullable|numeric|min:0', 'net_down' => 'nullable|numeric|min:0',
                'uptime_ms' => 'nullable|integer|min:0', 'players_online' => 'nullable|integer|min:0',
                'players_max' => 'nullable|integer|min:0', 'players_registered' => 'nullable|integer|min:0',
                'tps' => 'nullable|numeric|min:0|max:20', 'mspt' => 'nullable|numeric|min:0',
            ],
        ],
        'events' => [
            'label' => 'Server events', 'table' => 'mcpanels_events', 'primary' => 'id',
            'columns' => ['id', 'ts', 'type'], 'search' => ['ts', 'type'],
            'editable' => ['ts' => 'required|integer|min:0', 'type' => 'required|string|max:16'],
        ],
        'players' => [
            'label' => 'Players', 'table' => 'mcpanels_players', 'primary' => 'id',
            'columns' => ['id', 'name', 'uuid', 'first_seen', 'last_seen', 'last_ip', 'online', 'banned', 'ban_reason'],
            'search' => ['name', 'uuid', 'first_seen', 'last_seen', 'ban_reason', 'last_ip'],
            'editable' => [
                'name' => 'required|string|min:1|max:32', 'uuid' => 'nullable|string|max:36',
                'first_seen' => 'nullable|integer|min:0', 'last_seen' => 'nullable|integer|min:0',
                'last_ip' => 'nullable|ip', 'online' => 'required|boolean', 'banned' => 'required|boolean',
                'ban_reason' => 'nullable|string|max:255',
            ],
        ],
        'player_ips' => [
            'label' => 'Player IP history', 'table' => 'mcpanels_player_ips', 'primary' => 'id',
            'columns' => ['id', 'player_id', 'ip', 'first_seen', 'last_seen', 'hits'],
            'search' => ['ip', 'first_seen', 'last_seen', 'hits'],
            'editable' => [
                'ip' => 'required|ip', 'first_seen' => 'required|integer|min:0',
                'last_seen' => 'required|integer|min:0', 'hits' => 'required|integer|min:1',
            ],
        ],
        'failures' => [
            'label' => 'Failed connections', 'table' => 'mcpanels_failures', 'primary' => 'id',
            'columns' => ['id', 'ts', 'reason', 'name', 'ip'],
            'search' => ['ts', 'reason', 'name', 'ip'],
            'editable' => [
                'ts' => 'required|integer|min:0', 'reason' => 'required|string|max:32',
                'name' => 'nullable|string|max:32', 'ip' => 'nullable|ip',
            ],
        ],
        'profiles' => [
            'label' => 'Profiles and templates', 'table' => 'mcpanels_profiles', 'primary' => 'id',
            'columns' => ['id', 'kind', 'name', 'layout', 'position', 'created_at', 'updated_at'],
            'search' => ['kind', 'name'],
            'editable' => [
                'kind' => 'required|in:profile,template', 'name' => 'required|string|min:1|max:64',
                'layout' => 'required|array', 'position' => 'required|integer|min:0',
            ],
        ],
        'cursors' => [
            'label' => 'Collector state', 'table' => 'mcpanels_cursors', 'primary' => 'server_id',
            'columns' => ['server_id', 'last_visit', 'last_state', 'log_lines', 'log_head', 'data'],
            'search' => ['last_visit', 'last_state', 'log_lines', 'log_head'],
            'editable' => [
                'last_visit' => 'required|integer|min:0', 'last_state' => 'nullable|string|max:16',
                'log_lines' => 'required|integer|min:0', 'log_head' => 'nullable|string|max:64',
                'data' => 'nullable|array',
            ],
        ],
    ];

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeDataView($request, $server);
        $tableKey = (string) $request->query('table', 'samples');
        $spec = $this->spec($tableKey);
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(100, (int) $request->query('perPage', 50)));
        $search = mb_substr(trim((string) $request->query('search', '')), 0, 100);
        $columns = $this->visibleColumns($spec, $this->canSeeIps($request, $server));
        $query = $this->scopedQuery($spec, $server->id);

        if ($search !== '') {
            $searchable = array_values(array_intersect(
                $spec['search'],
                array_column($columns, 'key')
            ));
            if ($searchable !== []) {
                $query->where(function ($nested) use ($searchable, $search): void {
                    foreach ($searchable as $index => $column) {
                        $method = $index === 0 ? 'where' : 'orWhere';
                        $nested->{$method}($column, 'like', '%' . addcslashes($search, '%_\\') . '%');
                    }
                });
            }
        }

        $total = (clone $query)->count();
        $primary = $spec['primary'];
        $rows = $query->select(array_column($columns, 'key'))
            ->orderByDesc($primary)
            ->forPage($page, $perPage)
            ->get()
            ->map(function ($row) use ($columns): array {
                $data = (array) $row;
                foreach (['layout', 'data'] as $jsonKey) {
                    if (isset($data[$jsonKey]) && is_string($data[$jsonKey])) {
                        $decoded = json_decode($data[$jsonKey], true);
                        $data[$jsonKey] = json_last_error() === JSON_ERROR_NONE ? $decoded : $data[$jsonKey];
                    }
                }

                return $data;
            })->all();

        return response()->json([
            'tables' => array_map(fn (array $table): array => ['key' => $table['key'], 'label' => $table['label']], $this->tableList()),
            'table' => $tableKey,
            'columns' => $columns,
            'editableColumns' => $this->canManageData($request, $server)
                ? array_values(array_intersect(array_keys($spec['editable']), array_column($columns, 'key')))
                : [],
            'canManage' => $this->canManageData($request, $server),
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ]);
    }

    public function update(Request $request, Server $server, string $table, int $id): JsonResponse
    {
        $this->authorizeDataManage($request, $server);
        if (!$request->boolean('confirmed')) {
            abort(422, 'Confirm the warning before editing stored data.');
        }
        $spec = $this->spec($table);
        $input = $request->input('changes');
        if (!is_array($input) || $input === []) {
            abort(422, 'Provide at least one field to update.');
        }

        $allowed = array_intersect_key($input, $spec['editable']);
        if (count($allowed) !== count($input)) {
            abort(422, 'One or more fields cannot be edited.');
        }
        if (!$this->canSeeIps($request, $server) && array_intersect(['ip', 'last_ip'], array_keys($allowed)) !== []) {
            abort(403, 'Viewing player IP data requires the ips.view access-key grant.');
        }
        foreach (['layout', 'data'] as $jsonKey) {
            if (isset($allowed[$jsonKey]) && is_string($allowed[$jsonKey])) {
                $decoded = json_decode($allowed[$jsonKey], true);
                if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
                    abort(422, "The {$jsonKey} value must be valid JSON.");
                }
                $allowed[$jsonKey] = $decoded;
            }
        }

        $rules = array_intersect_key($spec['editable'], $allowed);
        $validated = Validator::make($allowed, $rules)->validate();
        if ($table === 'profiles') {
            $validated['layout'] = LayoutSanitizer::clean($validated['layout']);
        }
        foreach (['layout', 'data'] as $jsonKey) {
            if (array_key_exists($jsonKey, $validated)) {
                $validated[$jsonKey] = $validated[$jsonKey] === null ? null : json_encode($validated[$jsonKey], JSON_THROW_ON_ERROR);
            }
        }

        $query = $this->scopedQuery($spec, $server->id)->where($spec['primary'], $id);
        if (!$query->exists()) {
            abort(404, 'The requested data row was not found.');
        }
        $query->update($validated);

        Log::notice('MC Panels stored data was edited.', [
            'server_id' => $server->id, 'table' => $table, 'row_id' => $id,
            'user_id' => $request->user()->id, 'fields' => array_keys($validated),
        ]);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, Server $server, string $table, int $id): JsonResponse
    {
        $this->authorizeDataManage($request, $server);
        if (!$request->boolean('confirmed')) {
            abort(422, 'Confirm the warning before deleting stored data.');
        }
        $spec = $this->spec($table);
        $deleted = $this->scopedQuery($spec, $server->id)->where($spec['primary'], $id)->delete();
        if (!$deleted) {
            abort(404, 'The requested data row was not found.');
        }

        Log::notice('MC Panels stored data was deleted.', [
            'server_id' => $server->id, 'table' => $table, 'row_id' => $id, 'user_id' => $request->user()->id,
        ]);

        return response()->json(['success' => true]);
    }

    private function spec(string $key): array
    {
        foreach (self::TABLES as $tableKey => $spec) {
            if ($tableKey === $key) {
                return ['key' => $tableKey] + $spec;
            }
        }

        abort(404, 'Unknown MC Panels data table.');
    }

    private function tableList(): array
    {
        return array_map(fn (string $key, array $table): array => ['key' => $key, 'label' => $table['label']], array_keys(self::TABLES), self::TABLES);
    }

    private function visibleColumns(array $spec, bool $seeIps): array
    {
        $columns = $spec['columns'];
        if (!$seeIps) {
            $columns = array_values(array_diff($columns, ['last_ip', 'ip']));
        }

        return array_map(fn (string $column): array => ['key' => $column, 'label' => ucwords(str_replace('_', ' ', $column))], $columns);
    }

    private function scopedQuery(array $spec, int $serverId)
    {
        $query = DB::table($spec['table']);
        if ($spec['key'] === 'player_ips') {
            $query->whereExists(function ($nested) use ($serverId): void {
                $nested->selectRaw('1')
                    ->from('mcpanels_players as explorer_players')
                    ->whereColumn('explorer_players.id', 'mcpanels_player_ips.player_id')
                    ->where('explorer_players.server_id', $serverId);
            });
        } else {
            $query->where('server_id', $serverId);
        }

        return $query;
    }

}
