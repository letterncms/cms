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
        $this->assertSame($this->cms()->abilities()->get('entries/publish')->label, $labels['entries/publish'], 'an ability that is there goes by its own label');

        // The filter offers the same words.
        foreach ($log['filters']['actions'] as $action) {
            $this->assertDoesNotMatchRegularExpression('#^[a-z-]+/[a-z-]+$#', $action['label'], "{$action['value']} is offered by its raw name");
        }
    }
}
