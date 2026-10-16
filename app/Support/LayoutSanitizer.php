<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

final class LayoutSanitizer
{
    private const MAX_PANELS = 80;
    private const MAX_SETTINGS_BYTES = 20000;

    public static function clean(mixed $layout): array
    {
        $sourceLayout = is_array($layout) ? $layout : [];
        $panels = [];
        $source = $sourceLayout['panels'] ?? [];

        foreach (array_slice(is_array($source) ? $source : [], 0, self::MAX_PANELS) as $panel) {
            if (!is_array($panel) || !is_string($panel['id'] ?? null) || !is_string($panel['type'] ?? null)) {
                continue;
            }

            $settings = is_array($panel['settings'] ?? null) ? $panel['settings'] : [];
            if (strlen((string) json_encode($settings)) > self::MAX_SETTINGS_BYTES) {
                $settings = [];
            }

            $panels[] = [
                'id' => substr(preg_replace('/[^\w\-]/', '', $panel['id']), 0, 40),
                'type' => substr(preg_replace('/[^\w\-]/', '', $panel['type']), 0, 40),
                'w' => max(1, min(4, (int) ($panel['w'] ?? 1))),
                'h' => max(1, min(12, (int) ($panel['h'] ?? 2))),
                'settings' => (object) $settings,
            ];
        }

        $clean = ['panels' => $panels];
        if (!is_array($sourceLayout['rows'] ?? null)) {
            return $clean;
        }

        $rows = [];
        $panelIds = array_fill_keys(array_column($panels, 'id'), true);
        $used = [];
        $usedSpaces = [];
        foreach (array_slice($sourceLayout['rows'], 0, self::MAX_PANELS) as $index => $row) {
            if (!is_array($row)) {
                continue;
            }
            $id = substr(preg_replace('/[^\w\-]/', '', (string) ($row['id'] ?? '')), 0, 40);
            if ($id === '' || isset($rows[$id])) {
                $id = 'row-' . ($index + 1);
            }
            $slots = [];
            foreach (is_array($row['slots'] ?? null) ? $row['slots'] : [] as $slot) {
                if (!is_string($slot)) {
                    continue;
                }
                if (isset($panelIds[$slot]) && !isset($used[$slot])) {
                    $slots[] = $slot;
                    $used[$slot] = true;
                } elseif (preg_match('/^space:[\w\-]{1,64}$/', $slot) && !isset($usedSpaces[$slot])) {
                    $slots[] = $slot;
                    $usedSpaces[$slot] = true;
                }
            }
            $rows[$id] = ['id' => $id, 'slots' => $slots];
        }

        $missing = array_values(array_diff(array_keys($panelIds), array_keys($used)));
        if ($missing !== []) {
            if ($rows === []) {
                $rows['row-1'] = ['id' => 'row-1', 'slots' => []];
            }
            $lastId = array_key_last($rows);
            $rows[$lastId]['slots'] = array_merge($rows[$lastId]['slots'], $missing);
        }
        $clean['rows'] = array_values($rows);
        $spaceIds = array_keys($usedSpaces);
        $sourceSizes = is_array($sourceLayout['spaceSizes'] ?? null) ? $sourceLayout['spaceSizes'] : [];
        $spaceSizes = [];
        foreach ($spaceIds as $spaceId) {
            $size = $sourceSizes[$spaceId] ?? null;
            $spaceSizes[$spaceId] = [
                'w' => max(1, min(4, (int) (is_array($size) ? ($size['w'] ?? 1) : 1))),
                'h' => max(1, min(12, (int) (is_array($size) ? ($size['h'] ?? 1) : 1))),
            ];
        }
        if ($spaceSizes !== []) {
            $clean['spaceSizes'] = $spaceSizes;
        }

        return $clean;
    }
}
