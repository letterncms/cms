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
    /** @var array<string, ?string> The titles of what the abilities running now act on, by call. */
    private array $subjects = [];

    /** One call of an ability, told apart from another running at the same time by what it was given. */
    private static function call(Ability $ability, array $input): string
    {
        return $ability->name.' '.md5((string) json_encode($input, JSON_PARTIAL_OUTPUT_ON_ERROR));
    }

    public function boot(): void
    {
        $cms = $this->cms();

        $cms->permissions()->register('audit.view', 'View the Audit Log', 'System');
        $this->app->make(AuditAbilities::class)->register($cms->abilities());

        $cms->settingsRegistry()->register('audit', 'Audit Log', [
            ['handle' => 'retention', 'type' => 'number', 'label' => 'Keep Entries For', 'suffix' => 'days', 'default' => 365, 'min' => 0, 'max' => 3650, 'placeholder' => 'Forever'],
            ['handle' => 'reads', 'type' => 'toggle', 'label' => 'Also Record Reads', 'default' => false],
        ], icon: 'activity', description: 'What is recorded and for how long.', order: 85, section: 'system', home: 'audit');

        // What the log calls each change once it has happened; plugins add theirs to the same filter.
        $cms->hooks()->addFilter('audit.past', static fn (array $past): array => $past + Past::labels());

        // What a change was made to, while it is still there to be named: a deleted entry has no title afterwards.
        $cms->hooks()->on('ability.executing', function (Ability $ability, array $input): void {
            $this->subjects[self::call($ability, $input)] = $this->app->make(AuditAbilities::class)->entryTitle($ability->name, $input);
        });

        $cms->hooks()->on('ability.executed', function (Ability $ability, array $input, mixed $result, AbilityContext $context): void {
            $title = $this->subjects[$key = self::call($ability, $input)] ?? null;
            unset($this->subjects[$key]);

            if ((! $ability->isReadOnly() || $this->setting('reads', false)) && ! self::unrecorded($ability->name, $input)) {
                $this->record($ability, $title === null ? $input : [...$input, AuditAbilities::SUBJECT => $title], $context);
            }
        });

        $cms->admin()->nav('audit', ['label' => 'Audit Log', 'path' => '/audit', 'icon' => 'activity', 'section' => 'system', 'order' => 80, 'permission' => 'audit.view']);
        $cms->views()->register('audit', '/audit', self::view(...), permission: 'audit.view', private: true);
        $cms->admin()->widget('audit-activity', ['label' => 'Activity', 'description' => 'Who changed what across the site, and when.', 'icon' => 'activity', 'column' => 'main', 'order' => 40, 'permission' => 'audit.view']);
        $this->adminModule();
    }

    /** The Audit Log: every change, newest first, narrowed to a person or an action; a change opens with what was sent. */
    private static function view(): array
    {
        $periods = [
            ['value' => 'today', 'label' => __('Today')], ['value' => '7d', 'label' => __('Last 7 Days')],
            ['value' => '30d', 'label' => __('Last 30 Days')], ['value' => '90d', 'label' => __('Last 90 Days')],
        ];
        // What is narrowed on the screen is what is exported.
        $narrowed = ['userId' => '{query.userId}', 'ability' => '{query.ability}', 'period' => '{query.period}'];

        return ['type' => 'ui/page', 'props' => ['title' => __('Audit Log'), 'icon' => 'activity'], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                ['type' => 'ui/tab', 'props' => ['id' => 'log', 'label' => __('Log'), 'actions' => [
                    ['label' => __('Export CSV'), 'icon' => 'download', 'ability' => 'audit/export', 'input' => $narrowed, 'then' => 'download'],
                ]], 'children' => [
                    ['type' => 'ui/records', 'props' => [
                        'id' => 'audit', 'label' => __('Audit Log'), 'address' => true,
                        'source' => ['ability' => 'audit/list'],
                        'paged' => ['perPage' => 50],
                        'filters' => [
                            ['param' => 'userId', 'label' => __('Person'), 'all' => __('Everyone'), 'at' => 'filters.people', 'value' => 'id', 'text' => 'name'],
                            ['param' => 'ability', 'label' => __('Action'), 'all' => __('All Actions'), 'at' => 'filters.actions'],
                            ['param' => 'period', 'label' => __('When'), 'all' => __('Any Time'), 'options' => $periods],
                        ],
                        'columns' => [
                            ['key' => 'label', 'label' => __('Change'), 'muted' => 'subject'],
                            ['key' => 'who', 'label' => __('Who'), 'width' => '160px', 'bare' => true],
                            ['key' => 'transport', 'label' => __('Via'), 'width' => '96px', 'format' => 'badge', 'bare' => true,
                                'labels' => ['admin' => __('Admin'), 'mcp' => __('Agent'), 'assistant' => __('Assistant'), 'rest' => __('API'), 'cli' => __('CLI'), 'install' => __('Installation')],
                                'tones' => ['mcp' => 'info', 'assistant' => 'info']],
                            ['key' => 'createdAt', 'label' => __('When'), 'width' => '140px', 'align' => 'end', 'format' => 'ago', 'bare' => true],
                        ],
                        'open' => ['label' => __('Open'), 'dialog' => [
                            'title' => '{row.label}', 'text' => '{row.subject}', 'size' => 'lg',
                            'body' => [
                                ['type' => 'ui/detail', 'props' => ['items' => [
                                    ['label' => __('Who'), 'key' => 'row.who'], ['label' => __('Via'), 'key' => 'row.via'], ['label' => __('When'), 'key' => 'row.createdAt', 'format' => 'datetime'],
                                    ['label' => __('Ability'), 'key' => 'row.ability', 'format' => 'code'],
                                ]]],
                                ['type' => 'ui/detail', 'props' => ['record' => '{row.input}', 'raw' => '{row.input}']],
                            ],
                            'actions' => [['label' => __('Open'), 'icon' => 'arrow-right', 'variant' => 'primary', 'to' => '{row.to}', 'when' => '{row.to}']],
                        ]],
                        'empty' => ['icon' => 'activity', 'title' => __('No changes recorded yet')],
                    ]],
                ]],
            ]],
        ]];
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
                $this->prune();
            }
        } catch (Throwable $e) {
            report($e);
        }
    }

    /**
     * How many days entries are kept, 0 for forever. A site that never saved the setting keeps a year (the
     * field's default); a field left empty, or 0, keeps every entry: its placeholder says Forever, and so it is.
     */
    public function retention(): int
    {
        return max(0, (int) ($this->cms()->settingsRegistry()->get('audit')['retention'] ?? 0));
    }

    /** Delete what is older than is kept. Returns how many entries went. */
    public function prune(): int
    {
        $days = $this->retention();

        return $days > 0 ? DB::table('audit_log')->where('created_at', '<', now()->subDays($days))->delete() : 0;
    }

    /**
     * What is not a change to the site, and never recorded: saving one's own preferences (a list's
     * view and columns, a rearranged home screen), and starting two-factor setup, which changes
     * nothing until it is confirmed (that is recorded) and is often canceled.
     */
    public static function unrecorded(string $ability, array $input): bool
    {
        return ($ability === 'account/update' && array_keys($input) === ['preferences']) || $ability === 'account/two-factor-setup';
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
