<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mcpanels_samples', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedInteger('server_id');
            $t->unsignedInteger('ts');
            $t->string('state', 16)->default('offline');
            $t->float('cpu')->nullable();
            $t->unsignedBigInteger('mem_bytes')->nullable();
            $t->unsignedBigInteger('mem_limit')->nullable();
            $t->unsignedBigInteger('disk_bytes')->nullable();
            $t->unsignedBigInteger('disk_limit')->nullable();
            $t->unsignedBigInteger('net_rx_bytes')->nullable();
            $t->unsignedBigInteger('net_tx_bytes')->nullable();
            $t->float('net_up')->nullable();
            $t->float('net_down')->nullable();
            $t->unsignedBigInteger('uptime_ms')->nullable();
            $t->unsignedSmallInteger('players_online')->nullable();
            $t->unsignedSmallInteger('players_max')->nullable();
            $t->unsignedInteger('players_registered')->nullable();
            $t->float('tps')->nullable();
            $t->float('mspt')->nullable();
            $t->index(['server_id', 'ts']);
        });

        Schema::create('mcpanels_events', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedInteger('server_id');
            $t->unsignedInteger('ts');
            $t->string('type', 16);
            $t->index(['server_id', 'ts']);
        });

        Schema::create('mcpanels_players', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedInteger('server_id');
            $t->string('name', 32);
            $t->string('uuid', 36)->nullable();
            $t->unsignedInteger('first_seen')->nullable();
            $t->unsignedInteger('last_seen')->nullable();
            $t->string('last_ip', 45)->nullable();
            $t->boolean('online')->default(false);
            $t->boolean('banned')->default(false);
            $t->string('ban_reason', 255)->nullable();
            $t->unique(['server_id', 'name']);
            $t->index(['server_id', 'online']);
        });

        Schema::create('mcpanels_player_ips', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedBigInteger('player_id');
            $t->string('ip', 45);
            $t->unsignedInteger('first_seen');
            $t->unsignedInteger('last_seen');
            $t->unsignedInteger('hits')->default(1);
            $t->unique(['player_id', 'ip']);
        });

        Schema::create('mcpanels_failures', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedInteger('server_id');
            $t->unsignedInteger('ts');
            $t->string('reason', 32);
            $t->string('name', 32)->nullable();
            $t->string('ip', 45)->nullable();
            $t->index(['server_id', 'ts']);
        });

        Schema::create('mcpanels_profiles', function (Blueprint $t) {
            $t->bigIncrements('id');
            $t->unsignedInteger('server_id');
            $t->string('kind', 12)->default('profile');
            $t->string('name', 64);
            $t->longText('layout');
            $t->unsignedSmallInteger('position')->default(0);
            $t->timestamps();
            $t->index(['server_id', 'kind']);
        });

        Schema::create('mcpanels_cursors', function (Blueprint $t) {
            $t->unsignedInteger('server_id')->primary();
            $t->unsignedInteger('last_visit')->default(0);
            $t->string('last_state', 16)->nullable();
            $t->unsignedInteger('log_lines')->default(0);
            $t->string('log_head', 64)->nullable();
            $t->longText('data')->nullable();
        });
    }

    public function down(): void
    {
        foreach (['cursors', 'profiles', 'failures', 'player_ips', 'players', 'events', 'samples'] as $name) {
            Schema::dropIfExists("mcpanels_{$name}");
        }
    }
};
