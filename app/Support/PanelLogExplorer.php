<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support;

use RuntimeException;

final class PanelLogExplorer
{
    private const MAX_WINDOW_BYTES = 2097152;
    private const MAX_LINES = 20000;
    private const PAGE_SIZE = 100;

    public function files(): array
    {
        $directory = storage_path('logs');
        if (!is_dir($directory) || !is_readable($directory)) {
            throw new RuntimeException('The panel log directory is unavailable or unreadable.');
        }

        $root = realpath($directory);
        $files = glob($directory . DIRECTORY_SEPARATOR . '*.log');
        if ($root === false || $files === false) {
            throw new RuntimeException('The panel log directory could not be listed.');
        }

        $result = [];
        foreach ($files as $path) {
            $realPath = realpath($path);
            if ($realPath === false || !is_file($realPath) || !is_readable($realPath)) {
                continue;
            }
            if (dirname($realPath) !== $root) {
                continue;
            }

            $result[] = basename($realPath);
        }

        rsort($result, SORT_NATURAL);

        return $result;
    }

    public function search(?string $filename, string $query, int $page): array
    {
        $files = $this->files();
        if ($filename !== null && !in_array($filename, $files, true)) {
            throw new \InvalidArgumentException('The selected log file is not available.');
        }
        $filename = $filename ?? ($files[0] ?? null);
        if ($filename === null) {
            return [
                'files' => [],
                'filename' => null,
                'query' => $query,
                'lines' => [],
                'page' => 1,
                'pages' => 1,
                'matched' => 0,
                'scannedLines' => 0,
                'windowTruncated' => false,
                'lineLimitReached' => false,
            ];
        }

        $path = storage_path('logs') . DIRECTORY_SEPARATOR . $filename;
        $size = filesize($path);
        if ($size === false) {
            throw new RuntimeException('The selected log file size could not be read.');
        }

        $truncated = $size > self::MAX_WINDOW_BYTES;
        $tail = $this->readTailLines($path, min($size, self::MAX_WINDOW_BYTES), $truncated);
        $allLines = $tail['lines'];

        $matches = [];
        foreach ($allLines as $line) {
            if ($query === '' || stripos($line, $query) !== false) {
                $matches[] = $line;
            }
        }

        $pages = max(1, (int) ceil(count($matches) / self::PAGE_SIZE));
        $page = min(max(1, $page), $pages);

        return [
            'files' => $files,
            'filename' => $filename,
            'query' => $query,
            'lines' => array_slice($matches, ($page - 1) * self::PAGE_SIZE, self::PAGE_SIZE),
            'page' => $page,
            'pages' => $pages,
            'matched' => count($matches),
            'scannedLines' => count($allLines),
            'windowTruncated' => $truncated,
            'lineLimitReached' => $tail['lineLimitReached'],
        ];
    }

    private function readTailLines(string $path, int $bytes, bool $truncated): array
    {
        $handle = fopen($path, 'rb');
        if ($handle === false) {
            throw new RuntimeException('The selected log file could not be opened.');
        }

        try {
            if ($truncated && fseek($handle, -$bytes, SEEK_END) !== 0) {
                throw new RuntimeException('The selected log file could not be positioned for reading.');
            }

            $content = stream_get_contents($handle, $bytes);
            if ($content === false) {
                throw new RuntimeException('The selected log file could not be read.');
            }

            if ($truncated) {
                $firstNewline = strpos($content, "\n");
                $content = $firstNewline === false ? '' : substr($content, $firstNewline + 1);
            }

            $cursor = strlen($content) - 1;
            if ($cursor >= 0 && $content[$cursor] === "\n") {
                --$cursor;
            }

            $lines = [];
            while ($cursor >= 0 && count($lines) < self::MAX_LINES) {
                $newline = $cursor > 0 ? strrpos($content, "\n", $cursor - strlen($content)) : false;
                $start = $newline === false ? 0 : $newline + 1;
                $line = substr($content, $start, $cursor - $start + 1);
                $lines[] = rtrim($line, "\r");

                if ($newline === false) {
                    break;
                }
                $cursor = $newline - 1;
            }

            return ['lines' => $lines, 'lineLimitReached' => $cursor >= 0];
        } finally {
            fclose($handle);
        }
    }
}
