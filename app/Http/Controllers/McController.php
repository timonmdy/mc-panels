<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers;

use Illuminate\Http\Request;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\DebugLog;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Permissions;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\ServerPermissions;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

abstract class McController extends Controller
{
    public function __construct(protected Settings $settings)
    {
    }

    protected function authorizeRead(Request $request, Server $server): void
    {
        $this->authorizeAny($request, $server, [Permissions::READ, 'websocket.connect']);
    }

    protected function authorizeWrite(Request $request, Server $server): void
    {
        $this->authorizeAny($request, $server, [Permissions::EDIT_LAYOUTS, 'settings.rename']);
    }

    protected function authorizeProfileEdit(Request $request, Server $server): void
    {
        $this->authorizeAny($request, $server, [Permissions::EDIT_PROFILES, 'settings.rename']);
    }

    protected function authorizeDataView(Request $request, Server $server): void
    {
        $this->authorizeAny($request, $server, [Permissions::VIEW_DATA, Permissions::MANAGE_DATA]);
    }

    protected function authorizeDataManage(Request $request, Server $server): void
    {
        $this->authorizeAny($request, $server, [Permissions::MANAGE_DATA]);
    }

    protected function canEditLayouts(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::EDIT_LAYOUTS, 'settings.rename']);
    }

    protected function canEditProfiles(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::EDIT_PROFILES, 'settings.rename']);
    }

    protected function canManagePermissions(Request $request, Server $server): bool
    {
        return (bool) $request->user()->root_admin
            || (int) $server->owner_id === (int) $request->user()->id;
    }

    protected function canViewDashboard(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::READ, 'websocket.connect']);
    }

    protected function canViewData(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::VIEW_DATA, Permissions::MANAGE_DATA]);
    }

    protected function canManageData(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::MANAGE_DATA]);
    }

    protected function canSeeIps(Request $request, Server $server): bool
    {
        return $this->canAny($request, $server, [Permissions::VIEW_IPS]);
    }

    protected function spanSeconds(Request $request): int
    {
        $spans = array_column($this->settings->timeSpans(), 'seconds', 'key');
        $key = (string) $request->query('span', $this->settings->defaultTimeSpan());

        return $spans[$key] ?? (int) reset($spans) ?: 3600;
    }

    private function authorizeAny(Request $request, Server $server, array $abilities): void
    {
        $granted = $this->canAny($request, $server, $abilities);
        DebugLog::write($this->settings->all(), 'Server API authorization checked.', [
            'server_id' => $server->id,
            'method' => $request->method(),
            'path' => $request->path(),
            'action' => $request->route()?->getActionMethod(),
            'abilities' => $abilities,
            'granted' => $granted,
        ]);
        if (!$granted) {
            throw new AccessDeniedHttpException('You do not have permission to use this MC Panels feature.');
        }
    }

    protected function canAny(Request $request, Server $server, array $abilities): bool
    {
        if ((bool) $request->user()->root_admin || (int) $server->owner_id === (int) $request->user()->id) {
            return true;
        }

        foreach ($abilities as $ability) {
            if ($request->user()->can($ability, $server)) {
                return true;
            }
            if (app(ServerPermissions::class)->allows($server, (int) $request->user()->id, $ability)) {
                return true;
            }
        }

        return false;
    }
}
