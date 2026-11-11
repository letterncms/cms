<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Modules\Audit\AuditModule;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\DB;

/** How long the Audit Log keeps entries: a year until someone says otherwise, and forever when the field is left empty. */
final class AuditRetentionTest extends TestCase
{
    private function audit(): AuditModule
    {
        return $this->app->getProvider(AuditModule::class);
    }

    private function old(): void
    {
        DB::table('audit_log')->insert(['id' => strtolower((string) \Illuminate\Support\Str::ulid()), 'ability' => 'entries/update', 'transport' => 'admin', 'input' => '{}', 'created_at' => now()->subDays(400)]);
    }

    public function test_an_empty_field_keeps_entries_forever_as_its_placeholder_says(): void
    {
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $save = fn (mixed $retention) => $this->cms()->abilities()->execute('settings/update', ['namespace' => 'audit', 'values' => ['retention' => $retention]], $ctx);

        // Never saved: a year, and what is older goes.
        $this->assertSame(365, $this->audit()->retention());
        $this->old();
        $this->assertSame(1, $this->audit()->prune());

        // Left empty and saved: forever, in the form, in the file and when pruning.
        $saved = $save(null);
        $this->assertNull($saved['values']['retention'] ?? null);
        $this->assertSame(0, $this->audit()->retention());
        $this->old();
        $this->assertSame(0, $this->audit()->prune());
        $this->assertSame(1, DB::table('audit_log')->where('created_at', '<', now()->subDays(399))->count());

        // 0 says the same; a number of days prunes again.
        $save(0);
        $this->assertSame(0, $this->audit()->retention());
        $save(30);
        $this->assertSame(30, $this->audit()->retention());
        $this->assertSame(1, $this->audit()->prune());
    }
}
