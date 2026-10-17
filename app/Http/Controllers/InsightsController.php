<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\LogParser;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services\ServerFiles;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\FailureStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class InsightsController extends McController
{
    private const ISSUES_CACHE_SECONDS = 10;

    public function __construct(
        Settings $settings,
        private FailureStore $failures,
        private ServerFiles $files,
        private LogParser $parser,
    ) {
        parent::__construct($settings);
    }

    public function failures(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);
        $since = time() - $this->spanSeconds($request);

        return response()->json($this->failures->summary($server->id, $since, $this->canSeeIps($request, $server)));
    }

    public function issues(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);

        $rawPatterns = $request->query('ignorePatterns', '');
        $patterns = is_string($rawPatterns)
            ? array_slice(array_map(
                fn ($pattern) => substr(trim($pattern), 0, 256),
                preg_split('/\R/', $rawPatterns, -1, PREG_SPLIT_NO_EMPTY) ?: [],
            ), 0, 30)
            : [];
        $patterns = array_values(array_filter($patterns, fn ($pattern) => $pattern !== ''));
        $cacheKey = 'mcpanels:issues:' . $server->id . ':' . md5(implode("\n", $patterns));
        $entries = Cache::remember($cacheKey, self::ISSUES_CACHE_SECONDS, function () use ($server, $patterns) {
            $lines = $this->files->lines($server, '/logs/latest.log', (int) $this->settings->get('logMaxKiB') * 1024);
            if ($lines === null) {
                throw new ServiceUnavailableHttpException(null, 'Unable to read the server log. Check that logs/latest.log exists and is accessible.');
            }

            return $this->parser->issues(
                $lines,
                200,
                $patterns,
                (bool) $this->settings->get('debugLogging'),
            );
        });

        $level = $request->query('level');
        $filtered = in_array($level, ['error', 'warn'], true) ? array_values(array_filter($entries, fn ($e) => $e['level'] === $level)) : $entries;
        $count = fn (string $l) => array_sum(array_column(array_filter($entries, fn ($e) => $e['level'] === $l), 'count'));

        return response()->json([
            'counts' => ['all' => $count('error') + $count('warn'), 'error' => $count('error'), 'warn' => $count('warn')],
            'entries' => array_slice($filtered, 0, max(1, min(200, (int) $request->query('limit', 50)))),
        ]);
    }
}
