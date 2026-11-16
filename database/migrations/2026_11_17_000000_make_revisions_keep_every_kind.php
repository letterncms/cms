<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * One history for everything that keeps versions: a revision names what it is of by kind and subject, not by an
 * entry's id. The styling's versions, kept as files until now, move into it.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('revisions', 'entry_id')) {
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->dropIndex(['entry_id', 'created_at']);
            });
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->renameColumn('entry_id', 'subject');
            });
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->string('subject', 255)->change();
                $table->string('kind', 32)->default('entry')->after('id');
                $table->string('collection', 64)->nullable()->change();
            });
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->string('kind', 32)->default(null)->change();
                $table->index(['kind', 'subject', 'created_at']);
            });
        }

        $folder = storage_path('styling/versions');
        $files = glob($folder.'/*.json') ?: [];
        sort($files);
        $names = DB::table('users')->pluck('id', 'name');
        foreach ($files as $file) {
            $version = json_decode((string) file_get_contents($file), true);
            if (is_array($version) && isset($version['css'])) {
                DB::table('revisions')->insert([
                    'id' => strtolower((string) Str::ulid()),
                    'kind' => 'styling',
                    'subject' => 'theme',
                    'user_id' => isset($version['user']) ? ($names[$version['user']] ?? null) : null,
                    'action' => 'save',
                    'title' => '',
                    'snapshot' => json_encode(['css' => (string) $version['css'], 'transition' => (array) ($version['transition'] ?? [])], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    'created_at' => isset($version['at']) && $version['at'] !== '' ? Carbon::parse((string) $version['at']) : Carbon::createFromTimestamp((int) filemtime($file)),
                ]);
            }
            @unlink($file);
        }
        @rmdir($folder);
    }

    public function down(): void
    {
        if (Schema::hasColumn('revisions', 'kind')) {
            DB::table('revisions')->where('kind', '!=', 'entry')->delete();
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->dropIndex(['kind', 'subject', 'created_at']);
                $table->dropColumn('kind');
            });
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->renameColumn('subject', 'entry_id');
            });
            Schema::table('revisions', static function (Blueprint $table): void {
                $table->index(['entry_id', 'created_at']);
            });
        }
    }
};
