<?php

declare(strict_types=1);

namespace Cms\Modules\Audit;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Content\Entries\Entry;
use Cms\Cms;
use Cms\Users\User;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;

/** Reading the audit log. */
final class AuditAbilities
{
    /** Kept with a change's input: the title of what it was made to, named before the change (a deleted entry's). */
    public const string SUBJECT = '_subject';

    /** The most changes one export holds. */
    public const int EXPORT_LIMIT = 10000;

    /** The periods the log is narrowed to, in days back from the start of today. */
    private const array PERIODS = ['today' => 0, '7d' => 6, '30d' => 29, '90d' => 89];

    /** @var array<string, string>|null ability => what happened, in the reader's language */
    private ?array $past = null;

    public function __construct(private readonly Cms $cms) {}

    /** The title of the entry an ability is about to change, for the log to name it by even once it is deleted. */
    public function entryTitle(string $ability, array $input): ?string
    {
        if ($ability !== 'entries/delete' || ($id = self::entryId($ability, $input)) === null) {
            return null;
        }

        $entry = $this->cms->entries()->findMany([$id])[0] ?? null;

        return $entry ? ($entry->title !== '' ? $entry->title : __('Untitled')) : null;
    }

    public function register(AbilityRegistry $a): void
    {
        $a->register('audit/list', [
            'label' => 'Audit Log',
            'description' => 'Recent changes made through abilities, newest first, each labelled as what happened ("Published Entry"). Narrowed to one person (userId), one ability, a period (today, 7d, 30d, 90d: days back from today, in the site\'s time zone) or dates (from, to: YYYY-MM-DD, both included); `filters` lists the people and abilities the log holds.',
            'permission' => 'audit.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                ...self::narrowing(),
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 50],
            ]],
            'output' => Shape::page([
                'id' => Shape::STRING, 'ability' => Shape::STRING, 'transport' => Shape::STRING, 'label' => Shape::STRING,
                'subject' => Shape::STRING_OR_NULL, 'to' => Shape::STRING_OR_NULL, 'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL,
                'user' => Shape::nullable(['id' => Shape::STRING, 'name' => Shape::STRING]), 'who' => Shape::STRING, 'via' => Shape::STRING,
                'input' => Shape::open('The input the ability was called with, by parameter name (its input schema says which), with secrets redacted and long text cut short.'), 'createdAt' => Shape::STRING_OR_NULL,
            ], ['filters' => ['people' => [['id' => Shape::STRING, 'name' => Shape::STRING]], 'actions' => [['value' => Shape::STRING, 'label' => Shape::STRING]]]]),
            'handler' => function (array $in) {
                $query = $this->narrowed($in);
                $total = (clone $query)->count();
                $rows = $query->offset(($in['page'] - 1) * $in['perPage'])->limit($in['perPage'])->get();
                $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->pluck('name', 'id');

                return [
                    'items' => array_map(static fn (array $d) => [
                        'id' => $d['row']->id, 'ability' => $d['row']->ability, 'transport' => $d['row']->transport,
                        'label' => $d['label'], 'subject' => $d['subject'], 'to' => $d['to'],
                        // The records' timestamp contract, which a log row has no use for: it is never published or updated, it happened (createdAt).
                        'publishedAt' => null, 'updatedAt' => null,
                        'user' => $d['row']->user_id ? ['id' => $d['row']->user_id, 'name' => $users[$d['row']->user_id] ?? __('Deleted user')] : null,
                        // Said in words, for whoever shows the row: who made the change, and where from.
                        'who' => $d['row']->user_id ? ($users[$d['row']->user_id] ?? __('Deleted user')) : __('System'),
                        'via' => self::channel((string) $d['row']->transport),
                        'input' => $d['input'], 'createdAt' => $d['createdAt'],
                    ], $this->describe($rows)),
                    'total' => $total,
                    'page' => $in['page'],
                    'pages' => (int) max(1, ceil($total / $in['perPage'])),
                    'filters' => $this->filters(app(Translations::class)),
                ];
            },
        ]);

        $a->register('audit/recent', [
            'label' => 'Recent Activity',
            'description' => 'The latest changes across the site in plain words: who did what to which entry, page or setting, and through which channel (admin, agent, API, CLI). Repeated saves of the same thing are folded into one item with a count.',
            'permission' => 'audit.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 30, 'default' => 8],
            ]],
            'output' => Shape::of([[
                'id' => Shape::STRING, 'ability' => Shape::STRING, 'label' => Shape::STRING, 'subject' => Shape::STRING_OR_NULL, 'to' => Shape::STRING_OR_NULL,
                'transport' => Shape::STRING, 'user' => Shape::nullable(Shapes::person()), 'count' => Shape::INTEGER, 'createdAt' => Shape::STRING_OR_NULL,
            ]]),
            'handler' => fn (array $in) => $this->recent($in['limit']),
        ]);

        // Not read-only: a copy of who did what leaves the site, and the log says who took it.
        $a->register('audit/export', [
            'label' => 'Export Audit Log',
            'description' => 'The audit log as a CSV file, newest first, narrowed like audit/list (userId, ability, period, from, to): when, who, via, change, subject and ability, one row per change. More than 10,000 rows is refused: narrow it first.',
            'permission' => 'audit.view',
            'annotations' => ['readOnly' => false, 'destructive' => false, 'idempotent' => true],
            'input' => ['type' => 'object', 'properties' => self::narrowing()],
            'output' => Shape::of(['name' => Shape::STRING, 'type' => Shape::STRING, 'content' => Shape::STRING, 'rows' => Shape::INTEGER]),
            'handler' => fn (array $in) => $this->export($in),
        ]);
    }

    /** @return array<string, array<string, mixed>> The inputs that narrow the log, for audit/list and audit/export. */
    private static function narrowing(): array
    {
        return [
            'userId' => ['type' => 'string'],
            'ability' => ['type' => 'string', 'maxLength' => 120],
            'period' => ['type' => 'string', 'enum' => array_keys(self::PERIODS)],
            'from' => ['type' => 'string', 'format' => 'date'],
            'to' => ['type' => 'string', 'format' => 'date'],
        ];
    }

    /** The log, newest first, narrowed by person, ability and time. */
    private function narrowed(array $in): \Illuminate\Database\Query\Builder
    {
        $query = DB::table('audit_log')->orderByDesc('created_at')->orderByDesc('id');

        if (isset($in['userId'])) {
            $query->where('user_id', $in['userId']);
        }

        if (isset($in['ability'])) {
            $query->where('ability', $in['ability']);
        }

        // Days are the site's: its time zone is the app's, which the log's times are written in.
        if (isset($in['period'])) {
            $query->where('created_at', '>=', Carbon::now()->startOfDay()->subDays(self::PERIODS[$in['period']]));
        }

        if (isset($in['from'])) {
            $query->where('created_at', '>=', Carbon::parse($in['from'])->startOfDay());
        }

        if (isset($in['to'])) {
            $query->where('created_at', '<', Carbon::parse($in['to'])->addDay()->startOfDay());
        }

        return $query;
    }

    /** @return array{name: string, type: string, content: string, rows: int} */
    private function export(array $in): array
    {
        // All of it or nothing: a file cut short at the cap would look complete.
        if (($count = $this->narrowed($in)->count()) > self::EXPORT_LIMIT) {
            throw AbilityException::invalid(__('That is :count changes, more than :limit in one file. Narrow it to a person, an action or a shorter time.', ['count' => number_format($count), 'limit' => number_format(self::EXPORT_LIMIT)]));
        }

        $rows = $this->narrowed($in)->get();
        $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->pluck('name', 'id');
        $out = fopen('php://temp', 'r+');
        // A cell that starts like a formula is read as words by a spreadsheet: names, titles and labels are written by people.
        $cell = static fn (?string $text) => (string) preg_replace('/^([=+\-@\t\r])/', "'$1", (string) $text);
        fputcsv($out, [__('When'), __('Who'), __('Via'), __('Change'), __('Subject'), __('Ability')], escape: '');

        foreach ($this->describe($rows) as $d) {
            $row = $d['row'];
            fputcsv($out, array_map($cell, [
                $d['createdAt'] ?? '',
                $row->user_id ? ($users[$row->user_id] ?? __('Deleted user')) : __('System'),
                self::channel((string) $row->transport),
                $d['label'],
                $d['subject'],
                $row->ability,
            ]), escape: '');
        }

        rewind($out);
        $content = (string) stream_get_contents($out);
        fclose($out);

        return ['name' => 'audit-log-'.Carbon::now()->format('Y-m-d').'.csv', 'type' => 'text/csv', 'content' => $content, 'rows' => $rows->count()];
    }

    /**
     * Who and what the log holds, to narrow it by: people by name, abilities by their label.
     *
     * @return array{people: list<array{id: string, name: string}>, actions: list<array{value: string, label: string}>}
     */
    private function filters(Translations $t): array
    {
        $ids = DB::table('audit_log')->whereNotNull('user_id')->distinct()->pluck('user_id');
        $people = User::query()->whereIn('id', $ids)->orderBy('name')->get(['id', 'name'])->map(static fn (User $u) => ['id' => (string) $u->id, 'name' => $u->name])->all();
        $actions = DB::table('audit_log')->distinct()->pluck('ability')
            ->map(fn (string $name) => ['value' => $name, 'label' => $this->label($name)])
            ->sortBy('label', SORT_NATURAL | SORT_FLAG_CASE)->values()->all();

        return ['people' => $people, 'actions' => $actions];
    }

    /**
     * Rows of the log in words: the ability's label in the reader's language ("Publish Entry", not
     * entries/publish) and what it was done to, with where that opens. MCP shows what agents did with it.
     *
     * @param  iterable<object>  $rows  Rows of `audit_log`
     * @return list<array{row: object, input: array, label: string, subject: ?string, to: ?string, createdAt: ?string}>
     */
    public function describe(iterable $rows): array
    {
        $rows = collect($rows);
        [$entries, $settings] = $this->lookups($rows);
        $t = app(Translations::class);

        return $rows->map(function ($row) use ($entries, $settings, $t) {
            $input = (array) json_decode((string) $row->input, true);
            $named = is_string($input[self::SUBJECT] ?? null) ? $input[self::SUBJECT] : null;
            unset($input[self::SUBJECT]);
            [$subject, $to] = $this->subject($row->ability, $input, $entries, $settings);
            $subject ??= $named;

            return [
                'row' => $row, 'input' => $input,
                'label' => $this->label((string) $row->ability),
                'subject' => $subject, 'to' => $to,
                'createdAt' => $row->created_at ? Carbon::parse($row->created_at)->toIso8601String() : null,
            ];
        })->values()->all();
    }

    /**
     * An action in words, as what happened: the label the `audit.past` filter gives it ("Published Entry"),
     * else the ability's own label, or, for one that is gone (renamed since, or its plugin is off), its name
     * read as words. `form-submissions/delete` is Delete Form Submissions: never a raw name among titles.
     */
    public function label(string $ability): string
    {
        $this->past ??= (array) $this->cms->hooks()->filter('audit.past', []);

        if (is_string($this->past[$ability] ?? null)) {
            return $this->past[$ability];
        }

        if ($label = $this->cms->abilities()->get($ability)?->label) {
            return app(Translations::class)->label($label);
        }

        [$thing, $verb] = array_pad(explode('/', $ability, 2), 2, '');
        $words = static fn (string $part) => ucwords(trim((string) preg_replace('/[^a-z0-9]+/i', ' ', $part)));

        return trim($words($verb).' '.$words($thing)) ?: $ability;
    }

    /** @return list<array<string, mixed>> */
    private function recent(int $limit): array
    {
        // Autosave writes a row per save; reading a few times the limit leaves enough after folding them.
        $rows = DB::table('audit_log')->orderByDesc('created_at')->orderByDesc('id')->limit($limit * 6)->get();
        $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->get()->keyBy('id');
        $out = [];
        $last = null;

        foreach ($this->describe($rows) as ['row' => $row, 'input' => $input, 'label' => $label, 'subject' => $subject, 'to' => $to, 'createdAt' => $createdAt]) {
            // Saving one's own preferences (a rearranged home screen, a theme) is not a change to the site.
            if (AuditModule::unrecorded($row->ability, $input)) {
                continue;
            }

            $key = $row->user_id.'|'.$row->ability.'|'.($subject ?? '');

            if ($key === $last) {
                $out[count($out) - 1]['count']++;

                continue;
            }

            if (count($out) >= $limit) {
                break;
            }

            $user = $row->user_id ? $users[$row->user_id] ?? null : null;
            $out[] = [
                'id' => $row->id,
                'ability' => $row->ability,
                'label' => $label,
                'subject' => $subject,
                'to' => $to,
                'transport' => $row->transport,
                'user' => $user ? ['id' => $user->id, 'name' => $user->name, 'initials' => $user->initials(), 'avatar' => $user->avatar] : ($row->user_id ? ['id' => $row->user_id, 'name' => __('Deleted user'), 'initials' => '?', 'avatar' => null] : null),
                'count' => 1,
                'createdAt' => $createdAt,
            ];
            $last = $key;
        }

        return $out;
    }

    /**
     * The entries these rows changed, and the settings pages by namespace (labels in the user's language).
     *
     * @return array{0: array<string, Entry>, 1: array<string, string>}
     */
    private function lookups(iterable $rows): array
    {
        $ids = [];

        foreach ($rows as $row) {
            $ids[] = self::entryId($row->ability, (array) json_decode((string) $row->input, true));
        }

        $ids = array_values(array_unique(array_filter($ids)));
        $entries = [];

        foreach ($ids === [] ? [] : $this->cms->entries()->findMany($ids) as $entry) {
            $entries[$entry->id] = $entry;
        }

        $t = app(Translations::class);

        return [$entries, array_map(static fn (array $s) => $t->label($s['label']), $this->cms->settingsRegistry()->schemas())];
    }

    /** The entry a change was made to: `id` of the entries abilities, `entryId` of others (comments, translations). */
    private static function entryId(string $ability, array $input): ?string
    {
        $id = str_starts_with($ability, 'entries/') ? $input['id'] ?? null : $input['entryId'] ?? null;

        return is_string($id) && $id !== '' ? $id : null;
    }

    /** Where a change came from: someone in the admin, an agent, the assistant, the API or the command line. */
    private static function channel(string $transport): string
    {
        return match ($transport) {
            'mcp' => __('Agent'), 'assistant' => __('Assistant'), 'rest' => __('API'), 'cli' => __('CLI'), 'install' => __('Installation'),
            default => __('Admin'),
        };
    }

    /**
     * What a change was made to, in words, and where it can be opened.
     *
     * @param  array<string, Entry>  $entries
     * @param  array<string, string>  $settings  namespace => label
     * @return array{0: ?string, 1: ?string}
     */
    private function subject(string $ability, array $input, array $entries, array $settings): array
    {
        $id = self::entryId($ability, $input);

        if ($id !== null && isset($entries[$id])) {
            $entry = $entries[$id];

            return [$entry->title !== '' ? $entry->title : __('Untitled'), "/content/{$entry->collection}/{$entry->id}"];
        }

        if ($ability === 'settings/update' && is_string($input['namespace'] ?? null) && isset($settings[$input['namespace']])) {
            $namespace = $input['namespace'];
            $registry = $this->cms->settingsRegistry();

            if ($registry->hasPage($namespace)) {
                return [$settings[$namespace], '/settings/'.$namespace];
            }

            // Values without a page of their own (the default sidebar and Dashboard) are set where they are used:
            // named by what was saved, not by the namespace that keeps them.
            $t = app(Translations::class);
            $labels = array_column($registry->schemas()[$namespace]['fields'] ?? [], 'label', 'handle');
            $saved = array_map(static fn (string $key) => $t->label($labels[$key] ?? ucfirst(str_replace('_', ' ', $key))), array_keys((array) ($input['values'] ?? [])));

            return [$saved !== [] && count($saved) <= 2 ? implode(', ', $saved) : $settings[$namespace], null];
        }

        if (str_starts_with($ability, 'globals/') && $ability !== 'globals/delete' && is_string($input['handle'] ?? null) && ($set = $this->cms->globals()->find($input['handle']))) {
            return [$set->title, '/globals/'.$set->handle];
        }

        if ($ability === 'packages/update-auto' && is_bool($input['on'] ?? null)) {
            return [$input['on'] ? __('On') : __('Off'), null];
        }

        if (str_starts_with($ability, 'packages/') && is_string($input['name'] ?? null)) {
            return [$this->cms->packages()->repository()->find($input['name'])?->label ?? $input['name'], '/plugins'];
        }

        foreach (['title', 'name', 'label', 'handle', 'email'] as $key) {
            if (is_string($input[$key] ?? null) && trim($input[$key]) !== '') {
                return [mb_strimwidth(trim($input[$key]), 0, 80, '…'), null];
            }
        }

        return [null, null];
    }
}
