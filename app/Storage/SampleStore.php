<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage;

use Illuminate\Support\Facades\DB;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Metrics;

class SampleStore
{
    private const TABLE = 'mcpanels_samples';

    public function insert(int $serverId, array $row): void
    {
        DB::table(self::TABLE)->insert(array_merge($row, ['server_id' => $serverId]));
    }

    public function latest(int $serverId): ?object
    {
        return DB::table(self::TABLE)->where('server_id', $serverId)->orderByDesc('ts')->first();
    }

    public function series(int $serverId, array $metrics, int $from, int $to, int $step): array
    {
        $metrics = Metrics::sanitize($metrics);
        $step = max(1, $step);
        $select = ["FLOOR(ts / {$step}) * {$step} AS t"];
        foreach ($metrics as $key) {
            $select[] = 'AVG(' . Metrics::EXPRESSIONS[$key] . ") AS m_{$key}";
        }

        $rows = DB::table(self::TABLE)
            ->selectRaw(implode(', ', $select))
            ->where('server_id', $serverId)
            ->whereBetween('ts', [$from, $to])
            ->groupByRaw("FLOOR(ts / {$step})")
            ->orderBy('t')
            ->get();

        $series = array_fill_keys($metrics, []);
        foreach ($rows as $row) {
            foreach ($metrics as $key) {
                $value = $row->{"m_{$key}"};
                if ($value !== null) {
                    $series[$key][] = [(int) $row->t, round((float) $value, 3)];
                }
            }
        }

        return $series;
    }

    public function summary(int $serverId, array $metrics, int $from, int $to): array
    {
        $metrics = Metrics::sanitize($metrics);
        $span = $to - $from;
        $prevFrom = $from - $span;
        $select = [];
        foreach ($metrics as $key) {
            $e = Metrics::EXPRESSIONS[$key];
            $select[] = "AVG(CASE WHEN ts >= {$from} THEN {$e} END) AS avg_{$key}";
            $select[] = "MIN(CASE WHEN ts >= {$from} THEN {$e} END) AS min_{$key}";
            $select[] = "MAX(CASE WHEN ts >= {$from} THEN {$e} END) AS max_{$key}";
            $select[] = "AVG(CASE WHEN ts < {$from} THEN {$e} END) AS prev_{$key}";
        }
        if ($metrics === []) {
            return [];
        }

        $row = DB::table(self::TABLE)
            ->selectRaw(implode(', ', $select))
            ->where('server_id', $serverId)
            ->whereBetween('ts', [$prevFrom, $to])
            ->first();

        $out = [];
        foreach ($metrics as $key) {
            $out[$key] = [
                'avg' => $this->num($row->{"avg_{$key}"} ?? null),
                'min' => $this->num($row->{"min_{$key}"} ?? null),
                'max' => $this->num($row->{"max_{$key}"} ?? null),
                'previousAvg' => $this->num($row->{"prev_{$key}"} ?? null),
            ];
        }

        return $out;
    }

    public function availability(int $serverId, int $from, int $to, int $bars, int $sampleIntervalSeconds): array
    {
        $bars = max(1, min(240, $bars));
        $span = max(1, $to - $from);
        $maxBarsForSampleRate = max(1, (int) ceil($span / max(1, $sampleIntervalSeconds)));
        $bars = min($bars, $maxBarsForSampleRate);
        $bucket = max(1, (int) ceil($span / $bars));

        $rows = DB::table(self::TABLE)
            ->selectRaw("FLOOR((ts - {$from}) / {$bucket}) AS b, SUM(state = 'running') AS up, COUNT(*) AS n")
            ->where('server_id', $serverId)
            ->whereBetween('ts', [$from, $to])
            ->groupByRaw("FLOOR((ts - {$from}) / {$bucket})")
            ->get()
            ->keyBy('b');

        $buckets = [];
        $up = 0;
        $total = 0;
        for ($i = 0; $i < $bars; $i++) {
            $row = $rows->get($i);
            $buckets[] = ['ts' => $from + $i * $bucket, 'up' => $row ? round($row->up / max(1, $row->n), 3) : null];
            $up += $row->up ?? 0;
            $total += $row->n ?? 0;
        }

        return ['buckets' => $buckets, 'uptimePercent' => $total > 0 ? round($up / $total * 100, 2) : null];
    }

    public function prune(int $before): int
    {
        return DB::table(self::TABLE)->where('ts', '<', $before)->delete();
    }

    private function num(mixed $value): ?float
    {
        return $value === null ? null : round((float) $value, 3);
    }
}
