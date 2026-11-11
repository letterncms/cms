<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/** Every action in the Audit Log is said in words, also one whose ability is gone: renamed since, or its plugin is off. */
final class AuditLabelsTest extends TestCase
{
    public function test_an_action_that_is_no_longer_an_ability_reads_as_words(): void
    {
        $admin = $this->admin();
        foreach (['pages/customise', 'form-submissions/delete', 'entries/publish'] as $ability) {
            DB::table('audit_log')->insert(['id' => strtolower((string) Str::ulid()), 'user_id' => $admin->id, 'ability' => $ability, 'transport' => 'admin', 'input' => '{}', 'created_at' => now()]);
        }

        $log = $this->cms()->abilities()->execute('audit/list', [], AbilityContext::forUser($admin, 'admin'));
        $labels = array_column($log['items'], 'label', 'ability');

        $this->assertSame('Customise Pages', $labels['pages/customise']);
        $this->assertSame('Delete Form Submissions', $labels['form-submissions/delete']);
        $this->assertSame('Published Entry', $labels['entries/publish'], 'an ability that is there goes by what happened');

        // The filter offers the same words.
        foreach ($log['filters']['actions'] as $action) {
            $this->assertDoesNotMatchRegularExpression('#^[a-z-]+/[a-z-]+$#', $action['label'], "{$action['value']} is offered by its raw name");
        }
    }

    public function test_a_deleted_entry_is_named_by_the_title_it_had(): void
    {
        $admin = $this->admin();
        $ctx = AbilityContext::forUser($admin, 'admin');
        $entry = $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => 'Old Offers'], $ctx);
        $this->cms()->abilities()->execute('entries/delete', ['id' => $entry['id']], $ctx);

        $row = $this->cms()->abilities()->execute('audit/list', ['ability' => 'entries/delete'], $ctx)['items'][0];

        $this->assertSame(['Deleted Entry', 'Old Offers'], [$row['label'], $row['subject']]);
        $this->assertArrayNotHasKey('_subject', $row['input'], 'what the log keeps for itself is not shown as what was sent');
    }

    public function test_the_log_narrows_to_a_period_or_to_dates(): void
    {
        $admin = $this->admin();
        foreach (['entries/publish' => now()->subHour(), 'entries/update' => now()->subDays(10), 'entries/create' => now()->subDays(40)] as $ability => $at) {
            DB::table('audit_log')->insert(['id' => strtolower((string) Str::ulid()), 'user_id' => $admin->id, 'ability' => $ability, 'transport' => 'admin', 'input' => '{}', 'created_at' => $at]);
        }
        $ctx = AbilityContext::forUser($admin, 'admin');
        $abilities = fn (array $in) => array_column($this->cms()->abilities()->execute('audit/list', $in, $ctx)['items'], 'ability');

        $this->assertSame(['entries/publish'], $abilities(['period' => 'today']));
        $this->assertSame(['entries/publish', 'entries/update'], $abilities(['period' => '30d']));
        $this->assertSame(['entries/update'], $abilities(['from' => now()->subDays(10)->toDateString(), 'to' => now()->subDays(10)->toDateString()]));
        $this->assertSame(['entries/update', 'entries/create'], $abilities(['to' => now()->subDays(2)->toDateString()]));
    }

    public function test_the_export_is_a_csv_of_what_is_narrowed_and_is_itself_recorded(): void
    {
        $admin = $this->admin(['name' => '@Ada Lovelace']);
        $ctx = AbilityContext::forUser($admin, 'admin');
        $this->cms()->abilities()->execute('entries/create', ['collection' => 'pages', 'title' => '=SUM(A1)'], $ctx);
        DB::table('audit_log')->insert(['id' => strtolower((string) Str::ulid()), 'user_id' => $admin->id, 'ability' => 'entries/update', 'transport' => 'mcp', 'input' => '{}', 'created_at' => now()->subDays(40)]);

        $file = $this->cms()->abilities()->execute('audit/export', ['period' => '7d'], $ctx);
        $lines = array_map(str_getcsv(...), explode("\n", trim($file['content'])));

        $this->assertSame(['text/csv', 1], [$file['type'], $file['rows']]);
        $this->assertStringEndsWith('.csv', $file['name']);
        $this->assertSame(['When', 'Who', 'Via', 'Change', 'Subject', 'Ability'], $lines[0]);
        $this->assertSame(["'@Ada Lovelace", 'Admin', 'Created Entry', "'=SUM(A1)", 'entries/create'], array_slice($lines[1], 1), 'a name or a title that looks like a formula stays words');

        $this->assertSame('Exported Audit Log', $this->cms()->abilities()->execute('audit/list', ['ability' => 'audit/export'], $ctx)['items'][0]['label']);
    }

    public function test_an_export_too_large_for_one_file_is_refused_not_cut_short(): void
    {
        $admin = $this->admin();
        $rows = array_map(static fn () => ['id' => strtolower((string) Str::ulid()), 'user_id' => $admin->id, 'ability' => 'entries/update', 'transport' => 'admin', 'input' => '{}', 'created_at' => now()], range(0, \Cms\Modules\Audit\AuditAbilities::EXPORT_LIMIT));
        foreach (array_chunk($rows, 500) as $chunk) {
            DB::table('audit_log')->insert($chunk);
        }

        try {
            $this->cms()->abilities()->execute('audit/export', [], AbilityContext::forUser($admin, 'admin'));
            $this->fail('exported more than fits in one file');
        } catch (\Cms\Abilities\AbilityException $e) {
            $this->assertStringContainsString('10,001', $e->getMessage());
        }
    }
}
