<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** When an entry stops being published. */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('entries', 'expires_at')) {
            Schema::table('entries', static function (Blueprint $table): void {
                $table->timestamp('expires_at')->nullable()->after('published_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('entries', 'expires_at')) {
            Schema::table('entries', static fn (Blueprint $table) => $table->dropColumn('expires_at'));
        }
    }
};
