<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft;

class LogParser
{
    public function parseLine(string $raw): ?array
    {
        $raw = $this->clean($raw);
        if (!preg_match(LogRules::LINE, $raw, $m)) {
            return null;
        }

        return ['time' => $m[1], 'level' => $m[2] === 'WARNING' ? 'WARN' : $m[2], 'message' => trim($m[3])];
    }

    public function events(array $lines): array
    {
        $events = [];
        foreach ($lines as $raw) {
            $line = $this->parseLine($raw);
            if ($line === null) {
                continue;
            }

            $event = $this->match($line['message']);
            if ($event !== null) {
                $events[] = $event + ['time' => $line['time']];
            }
        }

        return $events;
    }

    public function issues(array $lines, int $limit = 200, array $ignorePatterns = [], bool $debug = false): array
    {
        $groups = [];
        $validPatterns = [];
        foreach ($ignorePatterns as $pattern) {
            $pattern = trim((string) $pattern);
            if ($pattern === '') {
                continue;
            }
            if (@preg_match($pattern, '') === false) {
                \Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog::write(
                    ['debugLogging' => $debug],
                    'Invalid console issue ignore regex.',
                    ['pattern' => $pattern, 'preg_error' => preg_last_error()],
                );
                continue;
            }
            $validPatterns[] = $pattern;
        }

        foreach ($lines as $raw) {
            $line = $this->parseLine($raw);
            if ($line === null || !in_array($line['level'], ['WARN', 'ERROR', 'FATAL'], true)) {
                continue;
            }
            foreach ($validPatterns as $pattern) {
                if (preg_match($pattern, $line['message'])) {
                    continue 2;
                }
            }

            $level = $line['level'] === 'WARN' ? 'warn' : 'error';
            $key = $level . '|' . preg_replace('/\d+|[0-9a-f]{8}-[0-9a-f-]{27}/i', '#', $line['message']);
            $groups[$key] = [
                'level' => $level,
                'message' => $line['message'],
                'count' => ($groups[$key]['count'] ?? 0) + 1,
                'lastSeen' => $line['time'],
            ];
        }

        return array_slice(array_reverse(array_values($groups)), 0, $limit);
    }

    public function meta(array $lines): array
    {
        $meta = [];
        foreach ($lines as $raw) {
            $line = $this->parseLine($raw);
            if ($line === null) {
                continue;
            }
            foreach (LogRules::META as $rule) {
                if (preg_match($rule['rule'], $line['message'], $m)) {
                    $meta['software'] = strtolower($m['software'] ?? $rule['software'] ?? ($meta['software'] ?? 'vanilla'));
                    if (isset($m['mc'])) {
                        $meta['mcVersion'] = $m['mc'];
                    }
                }
            }
            if (preg_match(LogRules::SYSTEM, $line['message'], $m)) {
                $meta['javaVersion'] = $m['java'];
                $meta['osType'] = strtolower($m['os']);
                $meta['arch'] = $m['arch'];
            }
        }

        return $meta;
    }

    public function classifyFailure(string $text): string
    {
        foreach (LogRules::FAILURE_REASONS as $reason => $pattern) {
            if (preg_match($pattern, $text)) {
                return $reason;
            }
        }

        return 'other';
    }

    private function match(string $message): ?array
    {
        foreach (LogRules::EVENTS as $type => $pattern) {
            if (!preg_match($pattern, $message, $m)) {
                continue;
            }
            $event = ['type' => $type] + array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
            if ($type === 'tps') {
                $event['value'] = $this->firstNumber($m['value']);
            }
            if ($type === 'mspt') {
                $ms = (float) $m['value'];
                $event = ['type' => 'tps', 'value' => $ms > 50 ? round(1000 / $ms, 2) : 20.0, 'mspt' => $ms];
            }

            return $event;
        }

        foreach (LogRules::FAILURE_LINES as $pattern) {
            if (preg_match($pattern, $message, $m)) {
                $who = $m['who'] ?? '';
                $name = preg_match('/name=(\w+)/', $who, $n) ? $n[1] : (preg_match('/^\w{1,16}$/', $who) ? $who : null);

                return ['type' => 'failure', 'reason' => $this->classifyFailure($m['text']), 'name' => $name, 'ip' => $m['ip']];
            }
        }

        return null;
    }

    private function firstNumber(string $text): ?float
    {
        return preg_match('/\d+(?:\.\d+)?/', $text, $m) ? min(20.0, (float) $m[0]) : null;
    }

    private function clean(string $line): string
    {
        return rtrim((string) preg_replace(['/\x1b\[[0-9;]*m/', '/§./u'], '', $line));
    }
}
