<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Packages\Install\PackageJobs;
use Cms\Tests\TestCase;
use Cms\Update\CoreUpdate;
use Cms\Update\ReleaseFeed;
use Illuminate\Support\Facades\DB;
use RuntimeException;

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

    public function test_an_admin_visit_that_finds_no_update_to_move_along_records_nothing(): void
    {
        // No store, no update waiting: the tick every admin visit sends changes nothing.
        $answer = $this->tick();

        $this->assertSame(['more' => false, 'drive' => false, 'acted' => false], $answer);
        $this->assertSame(0, $this->ticks());
    }

    public function test_a_tick_that_finishes_a_core_update_is_recorded(): void
    {
        $this->quietFeed();
        $this->core(['more' => false, 'state' => 'done']);

        $this->assertTrue($this->tick()['acted']);
        $this->assertSame(1, $this->ticks());
    }

    public function test_a_tick_that_finishes_an_automatic_plugin_update_is_recorded(): void
    {
        $this->quietFeed();
        $this->core(['more' => false, 'reason' => 'up_to_date']);
        $jobs = $this->createMock(PackageJobs::class);
        $jobs->method('running')->willReturn(['id' => 'job1', 'context' => ['auto' => true]]);
        $jobs->expects($this->once())->method('step')->with('job1')->willReturn(['state' => 'done']);
        $this->app->instance(PackageJobs::class, $jobs);

        $answer = $this->tick();

        $this->assertSame(['more' => false, 'drive' => false, 'acted' => true], $answer);
        $this->assertSame(1, $this->ticks());
    }

    public function test_a_tick_that_fails_is_recorded(): void
    {
        $this->quietFeed();
        $core = $this->createStub(CoreUpdate::class);
        $core->method('auto')->willThrowException(new RuntimeException('The download was cut off.'));
        $this->app->instance(CoreUpdate::class, $core);

        $this->assertTrue($this->tick()['acted']);
        $this->assertSame(1, $this->ticks());

        // And a core step that ran and failed, without throwing.
        $this->core(['more' => false, 'state' => 'failed']);
        $this->app->instance(PackageJobs::class, $this->createStub(PackageJobs::class));
        $this->assertTrue($this->tick()['acted']);
        $this->assertSame(2, $this->ticks());
    }

    private function tick(): array
    {
        return $this->cms()->abilities()->execute('packages/update-tick', [], AbilityContext::forUser($this->admin(), 'admin'));
    }

    private function ticks(): int
    {
        return DB::table('audit_log')->where('ability', 'packages/update-tick')->count();
    }

    /** A feed that was checked lately: the tick asks no store. */
    private function quietFeed(): void
    {
        $feed = $this->createStub(ReleaseFeed::class);
        $feed->method('due')->willReturn(false);
        $this->app->instance(ReleaseFeed::class, $feed);
    }

    private function core(array $step): void
    {
        $core = $this->createStub(CoreUpdate::class);
        $core->method('auto')->willReturn($step);
        $core->method('status')->willReturn(['drive' => false, 'managed' => null]);
        $this->app->instance(CoreUpdate::class, $core);
    }
}
