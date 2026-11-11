<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Console\Output\BufferedOutput;

/** `cms migrate` stands where the framework's `migrate` stood: what calls that one by name must still work. */
final class MigrateCommandTest extends TestCase
{
    /** @return array{0: int, 1: string} */
    private function cli(string $command, array $params = []): array
    {
        $code = Artisan::call($command, $params, $buffer = new BufferedOutput);

        return [$code, $buffer->fetch()];
    }

    /** @return array{tables: list<string>, packages: array<string, string>} */
    private function schema(): array
    {
        $tables = array_map(static fn (string $table): string => (string) last(explode('.', $table)), Schema::getTableListing());
        sort($tables);

        return ['tables' => $tables, 'packages' => DB::table('packages')->orderBy('name')->pluck('version', 'name')->all()];
    }

    private function assertIntact(array $before): void
    {
        $this->assertSame($before, $this->schema());
        // The core's tables and two modules' tables, by name: the comparison above must not pass on two empty lists.
        $this->assertEmpty(array_diff(['users', 'entries', 'packages', 'account_grants', 'media', 'audit_log'], $before['tables']));
        $this->assertSame(cms()->packages()->active()['letterncms/media']->version, $before['packages']['letterncms/media']);
        $this->assertSame([], cms()->packages()->pending());
    }

    public function test_force_is_accepted_and_changes_nothing_on_a_current_site(): void
    {
        $before = $this->schema();

        [$code, $output] = $this->cli('migrate', ['--force' => true, '--json' => true]);

        $this->assertSame(0, $code, $output);
        $this->assertSame(['data' => ['done' => []]], json_decode($output, true));
        $this->assertIntact($before);
    }

    public function test_migrate_fresh_wipes_the_database_and_builds_all_of_it_again(): void
    {
        $before = $this->schema();
        $this->admin();
        $this->assertSame(1, User::query()->count());

        [$code, $output] = $this->cli('migrate:fresh', ['--force' => true]);

        $this->assertSame(0, $code, $output);
        $this->assertSame(0, User::query()->count());
        $this->assertIntact($before);
    }

    public function test_migrate_fresh_passes_step_on(): void
    {
        $before = $this->schema();

        [$code, $output] = $this->cli('migrate:fresh', ['--force' => true, '--step' => true]);

        $this->assertSame(0, $code, $output);
        $this->assertIntact($before);
        $this->assertSame(DB::table('migrations')->count(), DB::table('migrations')->distinct()->count('batch'));
    }

    public function test_migrate_status_lists_the_core_and_the_packages_as_run(): void
    {
        [$code, $output] = $this->cli('migrate:status');

        $this->assertSame(0, $code, $output);
        $this->assertStringContainsString('create_cms_core_tables', $output);
        $this->assertStringContainsString('create_media_table', $output);
        $this->assertStringContainsString('Ran', $output);
        $this->assertStringNotContainsString('Pending', $output);
    }

    public function test_migrate_brings_back_what_a_rollback_took(): void
    {
        $before = $this->schema();

        [$code, $output] = $this->cli('migrate:rollback', ['--force' => true]);
        $this->assertSame(0, $code, $output);
        $this->assertNotSame($before['tables'], $this->schema()['tables']);

        [$code, $output] = $this->cli('migrate', ['--force' => true]);
        $this->assertSame(0, $code, $output);
        $this->assertIntact($before);
    }

    public function test_migrate_refresh_and_reset_leave_a_whole_schema_behind(): void
    {
        $before = $this->schema();

        [$code, $output] = $this->cli('migrate:refresh', ['--force' => true]);
        $this->assertSame(0, $code, $output);
        $this->assertIntact($before);

        [$code, $output] = $this->cli('migrate:reset', ['--force' => true]);
        $this->assertSame(0, $code, $output);
        $this->assertFalse(Schema::hasTable('users'));
        $this->assertFalse(Schema::hasTable('media'));

        [$code, $output] = $this->cli('migrate');
        $this->assertSame(0, $code, $output);
        $this->assertIntact($before);
    }

    public function test_path_runs_those_migrations_and_nothing_else(): void
    {
        $before = $this->schema();
        @mkdir($dir = $this->site.'/extra', 0o777, true);
        file_put_contents($dir.'/2030_01_01_000000_create_extra_table.php', <<<'PHP'
            <?php

            use Illuminate\Database\Migrations\Migration;
            use Illuminate\Database\Schema\Blueprint;
            use Illuminate\Support\Facades\Schema;

            return new class extends Migration
            {
                public function up(): void
                {
                    Schema::create('extra', static fn (Blueprint $table) => $table->id());
                }

                public function down(): void
                {
                    Schema::dropIfExists('extra');
                }
            };
            PHP);
        $migrated = 0;
        cms()->hooks()->on('cms.migrated', static function () use (&$migrated): void {
            $migrated++;
        });

        [$code, $output] = $this->cli('migrate', ['--path' => [$dir], '--realpath' => true, '--force' => true, '--json' => true]);

        $this->assertSame(0, $code, $output);
        $this->assertSame(['2030_01_01_000000_create_extra_table' => 'migrated'], json_decode($output, true)['data']['done']);
        $this->assertTrue(Schema::hasTable('extra'));
        $this->assertSame(0, $migrated);

        Schema::drop('extra');
        DB::table('migrations')->where('migration', '2030_01_01_000000_create_extra_table')->delete();
        $this->assertIntact($before);
    }

    public function test_database_migrates_that_connection_and_leaves_the_default_one(): void
    {
        $before = $this->schema();
        touch($file = $this->site.'/other.sqlite');
        config(['database.connections.other' => ['driver' => 'sqlite', 'database' => $file, 'prefix' => '', 'foreign_key_constraints' => true]]);
        $default = config('database.default');

        [$code, $output] = $this->cli('migrate', ['--database' => 'other', '--force' => true]);

        $this->assertSame(0, $code, $output);
        $this->assertSame($default, config('database.default'));
        $this->assertTrue(Schema::connection('other')->hasTable('users'));
        $this->assertTrue(Schema::connection('other')->hasTable('media'));
        $this->assertSame($before['packages'], DB::connection('other')->table('packages')->orderBy('name')->pluck('version', 'name')->all());
        $this->assertIntact($before);
    }

    public function test_an_option_the_command_does_not_take_is_refused(): void
    {
        $this->expectException(\Symfony\Component\Console\Exception\InvalidOptionException::class);

        $this->cli('migrate', ['--pretend' => true]);
    }
}
