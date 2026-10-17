<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mcpanels_access_defaults', function (Blueprint $table) {
            $table->unsignedInteger('server_id')->primary();
            $table->longText('permissions');
            $table->unsignedInteger('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('mcpanels_user_permissions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('server_id');
            $table->unsignedInteger('user_id');
            $table->longText('permissions');
            $table->unsignedInteger('granted_by')->nullable();
            $table->timestamps();
            $table->unique(['server_id', 'user_id']);
        });

        Schema::create('mcpanels_access_requests', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('server_id');
            $table->unsignedInteger('user_id');
            $table->string('status', 16)->default('pending');
            $table->unsignedInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['server_id', 'user_id']);
            $table->index(['server_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mcpanels_access_requests');
        Schema::dropIfExists('mcpanels_user_permissions');
        Schema::dropIfExists('mcpanels_access_defaults');
    }
};
