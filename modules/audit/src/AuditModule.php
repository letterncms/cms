<?php

declare(strict_types=1);

namespace Cms\Modules\Audit;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Packages\Plugin;
use Throwable;

/**
 * Records every change made through an ability — any transport, any person or
 * agent — and shows it. Off, nothing is written: one insert less per change.
 */
final class AuditModule extends Plugin
{
    public function boot(): void
    {
        $cms = $this->cms();

        $cms->permissions()->register('audit.view', 'View the Audit Log', 'System');
        $this->app->make(AuditAbilities::class)->register($cms->abilities());

        $cms->settingsRegistry()->register('audit', 'Auditing', [
            ['handle' => 'retention', 'type' => 'number', 'label' => 'Keep Entries for (Days)', 'default' => 365, 'min' => 1, 'max' => 3650, 'required' => true, 'width' => 'half'],
            ['handle' => 'reads', 'type' => 'toggle', 'label' => 'Also Record Reads', 'default' => false, 'instructions' => 'For sites that must show who looked at what. The log grows quickly.'],
        ], icon: 'history', description: 'What is recorded and for how long.', order: 85, section: 'system');

        $cms->hooks()->on('ability.executed', function (Ability $ability, array $input, mixed $result, AbilityContext $context): void {
            if (! $ability->isReadOnly() || $this->settings('reads', false)) {
                $this->record($ability, $input, $context);
            }
        });

        $cms->admin()->nav('audit', ['label' => 'Audit Log', 'path' => '/audit', 'icon' => 'activity', 'section' => 'system', 'order' => 80, 'permission' => 'audit.view']);
        $cms->admin()->widget('audit-activity', ['label' => 'Activity', 'description' => 'Who changed what across the site, and when.', 'icon' => 'activity', 'column' => 'main', 'order' => 40, 'permission' => 'audit.view']);
        $this->adminModule();
    }

    private function record(Ability $ability, array $input, AbilityContext $context): void
    {
        try {
            DB::table('audit_log')->insert([
                'id' => (string) Str::ulid(),
                'user_id' => $context->user?->getKey(),
                'ability' => $ability->name,
                'transport' => $context->transport,
                'input' => json_encode(self::redact($input), JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR),
                'ip' => $context->transport === 'cli' ? null : request()?->ip(),
                'created_at' => now(),
            ]);

            // Pruning on roughly one write in a hundred keeps the table bounded without a cron job.
            if (random_int(1, 100) === 1) {
                DB::table('audit_log')->where('created_at', '<', now()->subDays((int) $this->settings('retention', 365)))->delete();
            }
        } catch (Throwable $e) {
            report($e);
        }
    }

    private static function redact(array $input): array
    {
        foreach ($input as $key => $value) {
            if (is_string($key) && preg_match('/pass(word)?|secret|token|key$/i', $key)) {
                $input[$key] = '[redacted]';
            } elseif (is_array($value)) {
                $input[$key] = self::redact($value);
            } elseif (is_string($value) && strlen($value) > 2000) {
                $input[$key] = substr($value, 0, 2000).'…';
            }
        }

        return $input;
    }
}
