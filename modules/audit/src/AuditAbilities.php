<?php

declare(strict_types=1);

namespace Cms\Modules\Audit;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityRegistry;
use Cms\Admin\Translations;
use Cms\Content\Entries\Entry;
use Cms\Cms;
use Cms\Support\RecordTimestamps;
use Cms\Users\User;

/** Reading the audit log. */
final class AuditAbilities
{
    public function __construct(private readonly Cms $cms) {}

    public function register(AbilityRegistry $a): void
    {
        $a->register('audit/list', [
            'label' => 'Audit Log',
            'description' => 'Recent changes made through abilities, newest first. Narrowed to one person (userId) or one ability; `filters` lists the people and abilities the log holds.',
            'permission' => 'audit.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'userId' => ['type' => 'string'],
                'ability' => ['type' => 'string', 'maxLength' => 120],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100, 'default' => 50],
            ]],
            'handler' => function (array $in) {
                $query = DB::table('audit_log')->orderByDesc('created_at')->orderByDesc('id');

                if (isset($in['userId'])) {
                    $query->where('user_id', $in['userId']);
                }

                if (isset($in['ability'])) {
                    $query->where('ability', $in['ability']);
                }

                $total = (clone $query)->count();
                $rows = $query->offset(($in['page'] - 1) * $in['perPage'])->limit($in['perPage'])->get();
                $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->pluck('name', 'id');
                [$entries, $settings] = $this->lookups($rows);
                $t = app(Translations::class);

                return [
                    'items' => $rows->map(function ($r) use ($users, $entries, $settings, $t) {
                        $input = json_decode((string) $r->input, true);
                        [$subject, $to] = $this->subject($r->ability, (array) $input, $entries, $settings);

                        return [
                            'id' => $r->id, 'ability' => $r->ability, 'transport' => $r->transport,
                            // The ability's label in the user's language: "Publish Entry", not entries/publish.
                            'label' => $t->label($this->cms->abilities()->get($r->ability)?->label ?? $r->ability),
                            'subject' => $subject, 'to' => $to,
                            ...RecordTimestamps::api(['updated_at' => $r->created_at]),
                            'user' => $r->user_id ? ['id' => $r->user_id, 'name' => $users[$r->user_id] ?? __('Deleted user')] : null,
                            // Said in words, for whoever shows the row: who made the change, and where from.
                            'who' => $r->user_id ? ($users[$r->user_id] ?? __('Deleted user')) : __('System'),
                            'via' => self::channel((string) $r->transport),
                            'input' => $input, 'createdAt' => $r->created_at ? Carbon::parse($r->created_at)->toIso8601String() : null,
                        ];
                    })->all(),
                    'total' => $total,
                    'page' => $in['page'],
                    'pages' => (int) max(1, ceil($total / $in['perPage'])),
                    'filters' => $this->filters($t),
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
            'handler' => fn (array $in) => $this->recent($in['limit']),
        ]);
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
            ->map(fn (string $name) => ['value' => $name, 'label' => $t->label($this->cms->abilities()->get($name)?->label ?? $name)])
            ->sortBy('label', SORT_NATURAL | SORT_FLAG_CASE)->values()->all();

        return ['people' => $people, 'actions' => $actions];
    }

    /** @return list<array<string, mixed>> */
    private function recent(int $limit): array
    {
        // Autosave writes a row per save; reading a few times the limit leaves enough after folding them.
        $rows = DB::table('audit_log')->orderByDesc('created_at')->orderByDesc('id')->limit($limit * 6)->get();
        $users = User::query()->whereIn('id', $rows->pluck('user_id')->filter()->unique())->get()->keyBy('id');
        [$entries, $settings] = $this->lookups($rows);
        $t = app(Translations::class);
        $out = [];
        $last = null;

        foreach ($rows as $row) {
            $input = (array) json_decode((string) $row->input, true);

            // Saving one's own preferences (a rearranged home screen, a theme) is not a change to the site.
            if (AuditModule::unrecorded($row->ability, $input)) {
                continue;
            }

            [$subject, $to] = $this->subject($row->ability, $input, $entries, $settings);
            $key = $row->user_id.'|'.$row->ability.'|'.($subject ?? '');

            if ($key === $last) {
                $out[count($out) - 1]['count']++;

                continue;
            }

            if (count($out) >= $limit) {
                break;
            }

            $user = $row->user_id ? $users[$row->user_id] ?? null : null;
            $ability = $this->cms->abilities()->get($row->ability);
            $out[] = [
                'id' => $row->id,
                'ability' => $row->ability,
                'label' => $t->label($ability?->label ?? $row->ability),
                'subject' => $subject,
                'to' => $to,
                'transport' => $row->transport,
                'user' => $user ? ['id' => $user->id, 'name' => $user->name, 'initials' => $user->initials(), 'avatar' => $user->avatar] : ($row->user_id ? ['id' => $row->user_id, 'name' => __('Deleted user'), 'initials' => '?', 'avatar' => null] : null),
                'count' => 1,
                'createdAt' => $row->created_at ? Carbon::parse($row->created_at)->toIso8601String() : null,
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

    /**
     * What a change was made to, in words, and where it can be opened.
     *
     * @param  array<string, Entry>  $entries
     * @param  array<string, string>  $settings  namespace => label
     * @return array{0: ?string, 1: ?string}
     */
    /** Where a change came from: someone in the admin, an agent, the assistant, the API or the command line. */
    public static function channel(string $transport): string
    {
        return match ($transport) {
            'mcp' => __('Agent'), 'assistant' => __('Assistant'), 'rest' => __('API'), 'cli' => __('CLI'), 'install' => __('Installation'),
            default => __('Admin'),
        };
    }

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
