<?php

namespace Pterodactyl\Http\Controllers\Admin\Extensions\{identifier};

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\Factory as ViewFactory;
use Illuminate\View\View;
use InvalidArgumentException;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\PanelLogExplorer;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\Settings;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Support\SettingsSchema;
use Pterodactyl\BlueprintFramework\Libraries\ExtensionLibrary\Admin\BlueprintAdminLibrary as BlueprintExtensionLibrary;
use Pterodactyl\Http\Controllers\Controller;
use RuntimeException;

class {identifier}ExtensionController extends Controller
{
    public function __construct(
        private ViewFactory $view,
        private BlueprintExtensionLibrary $blueprint,
        private Settings $settings,
        private PanelLogExplorer $logs,
    ) {
    }

    public function index(Request $request): View
    {
        $isLogExplorer = $request->query('view') === 'logs';
        $logData = null;
        $logError = null;

        if ($isLogExplorer) {
            abort_unless((bool) $request->user()?->root_admin, 403);
            $queryValue = $request->query('q', '');
            $query = is_string($queryValue) ? trim($queryValue) : '';
            if (mb_strlen($query) > 200) {
                $query = mb_substr($query, 0, 200);
            }
            $filenameValue = $request->query('file');
            $pageValue = $request->query('page', 1);

            try {
                $logData = $this->logs->search(
                    is_string($filenameValue) ? $filenameValue : null,
                    $query,
                    is_numeric($pageValue) ? max(1, (int) $pageValue) : 1,
                );
            } catch (InvalidArgumentException | RuntimeException $exception) {
                $logError = $exception->getMessage();
            }
        }

        return $this->view->make('admin.extensions.{identifier}.index', [
            'root' => '/admin/extensions/{identifier}',
            'blueprint' => $this->blueprint,
            'sections' => SettingsSchema::sections(),
            'values' => $this->settings->all(),
            'isLogExplorer' => $isLogExplorer,
            'logData' => $logData,
            'logError' => $logError,
        ]);
    }

    public function patch(Request $request): RedirectResponse
    {
        $this->settings->save($request->all());

        return redirect()->back()->with('success', 'MC Panels settings saved.');
    }

    public function update(Request $request): RedirectResponse
    {
        return $this->patch($request);
    }

    public function post(Request $request): RedirectResponse
    {
        return $this->patch($request);
    }

    public function put(Request $request): RedirectResponse
    {
        return $this->patch($request);
    }
}
