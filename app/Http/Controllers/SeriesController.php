<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\EventStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Storage\SampleStore;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Metrics;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\Models\Server;

class SeriesController extends McController
{
    public function __construct(Settings $settings, private SampleStore $samples, private EventStore $events)
    {
        parent::__construct($settings);
    }

    public function index(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);

        $span = $this->spanSeconds($request);
        $to = time();
        $from = $to - $span;
        $metrics = Metrics::sanitize(explode(',', (string) $request->query('metrics', '')));
        $step = max((int) $this->settings->get('pollSeconds'), (int) ceil($span / (int) $this->settings->get('maxPoints')));

        return response()->json([
            'from' => $from,
            'to' => $to,
            'step' => $step,
            'series' => (object) $this->samples->series($server->id, $metrics, $from, $to, $step),
            'summary' => (object) $this->samples->summary($server->id, $metrics, $from, $to),
        ]);
    }

    public function availability(Request $request, Server $server): JsonResponse
    {
        $this->authorizeRead($request, $server);

        $to = time();
        $from = $to - $this->spanSeconds($request);
        $bars = (int) $request->query('bars', 60);

        return response()->json($this->samples->availability($server->id, $from, $to, $bars) + [
            'outages' => $this->events->count($server->id, 'crash', $from),
        ]);
    }
}
