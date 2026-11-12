<?php

declare(strict_types=1);

use Cms\Install\Installer;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** A chat is of the kit the site was when it started: switching kits brings that kit's chats with it. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspace_threads', function (Blueprint $table) {
            $table->string('kit', 64)->nullable()->after('user_id');
            $table->index(['user_id', 'kit', 'updated_at']);
        });

        // The chats so far were had with the site as it is now.
        DB::table('workspace_threads')->update(['kit' => Installer::kit()]);
    }

    public function down(): void
    {
        Schema::table('workspace_threads', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'kit', 'updated_at']);
            $table->dropColumn('kit');
        });
    }
};
