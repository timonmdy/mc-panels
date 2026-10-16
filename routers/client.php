<?php

use Illuminate\Support\Facades\Route;
use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Http\Controllers as Api;
use Pterodactyl\Http\Middleware\Activity\ServerSubject;
use Pterodactyl\Http\Middleware\Api\Client\Server\AuthenticateServerAccess;
use Pterodactyl\Http\Middleware\Api\Client\Server\ResourceBelongsToServer;

Route::group([
    'prefix' => '/servers/{server}',
    'middleware' => [ServerSubject::class, AuthenticateServerAccess::class, ResourceBelongsToServer::class],
], function () {
    Route::get('/bootstrap', [Api\BootstrapController::class, 'index']);
    Route::get('/live', [Api\LiveController::class, 'index']);
    Route::get('/series', [Api\SeriesController::class, 'index']);
    Route::get('/availability', [Api\SeriesController::class, 'availability']);
    Route::get('/players', [Api\PlayersController::class, 'index']);
    Route::get('/failures', [Api\InsightsController::class, 'failures']);
    Route::get('/issues', [Api\InsightsController::class, 'issues']);
    Route::get('/info', [Api\InfoController::class, 'index']);
    Route::get('/access-keys', [Api\AccessKeysController::class, 'index']);
    Route::post('/access-keys', [Api\AccessKeysController::class, 'store']);
    Route::delete('/access-keys/{id}', [Api\AccessKeysController::class, 'destroy'])->where('id', '[a-f0-9]{16}');
    Route::get('/data-explorer', [Api\DataExplorerController::class, 'index']);
    Route::patch('/data-explorer/{table}/{id}', [Api\DataExplorerController::class, 'update'])
        ->where(['table' => '[a-z_]+', 'id' => '[0-9]+']);
    Route::delete('/data-explorer/{table}/{id}', [Api\DataExplorerController::class, 'destroy'])
        ->where(['table' => '[a-z_]+', 'id' => '[0-9]+']);

    Route::post('/profiles', [Api\ProfilesController::class, 'store']);
    Route::patch('/profiles/{profile}', [Api\ProfilesController::class, 'update'])->whereNumber('profile');
    Route::delete('/profiles/{profile}', [Api\ProfilesController::class, 'destroy'])->whereNumber('profile');
});
