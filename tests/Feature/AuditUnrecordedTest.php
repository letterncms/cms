<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\DB;

/** A plugin leaves out of the Audit Log what it calls over and over for one change, and keeps what matters. */
final class AuditUnrecordedTest extends TestCase
{
    public function test_a_plugin_leaves_a_call_out_by_what_it_was_and_what_it_answered(): void
    {
        $abilities = $this->cms()->abilities();
        $abilities->register('demo/step', ['label' => 'Step Demo', 'input' => ['type' => 'object', 'properties' => ['done' => ['type' => 'boolean']]], 'handler' => static fn (array $in) => ['status' => ! empty($in['done']) ? 'done' : 'running']]);
        // Only the turn that finishes is kept.
        $this->cms()->hooks()->addFilter('audit.unrecorded', static fn (bool $skip, string $ability, array $input, mixed $result) => $skip || ($ability === 'demo/step' && ($result['status'] ?? null) === 'running'));
        $ctx = AbilityContext::forUser($this->admin(), 'admin');

        $abilities->execute('demo/step', [], $ctx);
        $abilities->execute('demo/step', [], $ctx);
        $abilities->execute('demo/step', ['done' => true], $ctx);

        $this->assertSame(['{"done":true}'], DB::table('audit_log')->where('ability', 'demo/step')->pluck('input')->all());
    }
}
