<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Cms\Install\Installer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

/**
 * One thread of the workspace, and only its person's: what they asked, ran and searched,
 * each answered with a view, a search or an agent's reply. `turns` is the neutral
 * transcript every client draws (see Transcript); `agent_state` is the agent's own (its
 * history in its provider's format, calls waiting for approval, a model). Title, turns and
 * the agent's state are encrypted at rest. `untrusted` sticks once the thread holds text
 * others may have written: an agent then asks before changes that go live. `kit` is the site
 * kit it was had with: its links and answers are of that site, so it lists only while the
 * site is that kit again (`mine`).
 *
 * @property string $id
 * @property string $user_id
 * @property ?string $kit
 * @property string $title
 * @property list<array> $turns
 * @property ?string $agent
 * @property array|null $agent_state
 * @property array<string, int>|null $usage
 * @property bool $untrusted
 */
class Thread extends Model
{
    use HasUlids;

    protected $table = 'workspace_threads';

    protected $guarded = ['id'];

    protected $attributes = ['untrusted' => false];

    protected static function booted(): void
    {
        // Defaults go through the encrypting casts, so they cannot be raw column defaults.
        static::creating(static function (self $thread): void {
            $thread->turns ??= [];
            $thread->title ??= '';
            $thread->kit ??= Installer::kit();
        });
    }

    /** This person's chats with the site as it is: of the kit it is now. */
    public static function mine(string $userId): Builder
    {
        $kit = Installer::kit();

        return static::query()->where('user_id', $userId)->where(static fn (Builder $q) => $kit === null ? $q->whereNull('kit') : $q->where('kit', $kit));
    }

    protected function casts(): array
    {
        return [
            'title' => 'encrypted',
            'turns' => 'encrypted:array',
            'agent_state' => 'encrypted:array',
            'usage' => 'array',
            'untrusted' => 'boolean',
        ];
    }

    public function addTurn(array $turn): void
    {
        $this->turns = [...$this->turns, $turn];
    }

    /** Token counts across the thread, as an agent reports them. */
    public function addUsage(array $usage): void
    {
        $total = (array) $this->usage;

        foreach ($usage as $key => $value) {
            if (is_int($value)) {
                $total[$key] = (int) ($total[$key] ?? 0) + $value;
            }
        }

        $this->usage = $total;
    }

    /** One of the agent's own values. */
    public function state(string $key, mixed $default = null): mixed
    {
        return ($this->agent_state ?? [])[$key] ?? $default;
    }

    public function setState(string $key, mixed $value): void
    {
        $this->agent_state = [...($this->agent_state ?? []), $key => $value];
    }

    public function summary(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title ?: __('New Chat'),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
