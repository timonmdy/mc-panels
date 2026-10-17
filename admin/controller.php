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
        if ($request->input('tpsFormat') === 'custom') {
            $request->validate([
                'tpsCustomPattern' => [
                    'required',
                    'string',
                    'max:300',
                    function (string $attribute, mixed $value, \Closure $fail): void {
                        if (!is_string($value) || @preg_match($value, '') === false) {
                            $fail('Enter a valid PHP regular expression, including its delimiters.');
                        } elseif (!str_contains($value, '(?<tps>')) {
                            $fail('The custom pattern must include a named (?<tps>...) capture.');
                        }
                    },
                ],
            ]);
        }
        $input = $request->all();
        if (($input['tpsFormat'] ?? null) !== 'custom') {
            $input['tpsCustomPattern'] = $this->settings->get('tpsCustomPattern');
        }
        $this->settings->save($input);

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
