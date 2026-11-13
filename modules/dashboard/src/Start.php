<?php

declare(strict_types=1);

namespace Cms\Modules\Dashboard;

use Cms\Cms;
use Cms\Content\Collections\Collection;
use Cms\Support\Files;
use Cms\Users\User;
use Illuminate\Support\Facades\DB;

/**
 * The guided start: the few things a new site wants first, on the Dashboard
 * until they are done or someone hides them. Each step is a verb that leads to
 * the real screen: nothing is set up here.
 *
 * It is for new sites only. Installing writes storage/app/start.json with the
 * moment the site was ready (`since`); a site without that file was installed
 * before the guide existed, or is long past it, and never sees it.
 *
 * Whether a step is done is read from the site, not remembered: its name is
 * set, the design was saved since, an entry was created since, an agent holds
 * a token. The file keeps only `since` and whether the guide was hidden: it is
 * about this installation, not content to deploy.
 *
 * Plugins add steps with the `dashboard.start` filter, which gets the steps and
 * the user, and answers with them and its own: each an `id`, a translated `label` that starts with a
 * verb, the admin path it leads `to`, and whether it is `done`.
 */
final class Start
{
    public function __construct(private readonly Cms $cms) {}

    /**
     * The steps this person can take, in order.
     *
     * @return list<array{id: string, label: string, to: string, done: bool}>
     */
    public function steps(User $user): array
    {
        $since = $this->state()['since'];
        $steps = [];

        if ($user->hasPermission('settings.manage')) {
            $name = trim((string) $this->cms->setting('site', 'name', ''));
            $steps[] = ['id' => 'name', 'label' => __('Name the Site'), 'to' => '/settings/site', 'done' => $name !== '' && $name !== cms_brand()];

            if ($this->cms->isActive('letterncms/site')) {
                $tokens = content_path('design/tokens.json');
                $steps[] = ['id' => 'design', 'label' => __('Choose Colors and Fonts'), 'to' => '/design', 'done' => $since !== null && is_file($tokens) && filemtime($tokens) > $since];
            }
        }

        // A page goes in the collection whose pages sit at the root of the site (`/{slug}`), else the first with
        // pages of their own, else the first: never only the first by name.
        $candidates = array_values(array_filter($this->cms->collections()->all(), static fn ($c) => ! $c->system && $user->hasPermission("entries.{$c->handle}.create")));
        usort($candidates, static fn ($a, $b) => self::rank($a) <=> self::rank($b));

        if (($pages = $candidates[0] ?? null) !== null) {
            $steps[] = ['id' => 'page', 'label' => __('Create the First Page'), 'to' => "/content/{$pages->handle}/new", 'done' => $since !== null && $this->createdSince($since)];
        }

        if ($this->cms->isActive('letterncms/mcp') && $user->hasPermission('tokens.manage')) {
            $steps[] = ['id' => 'agent', 'label' => __('Connect an AI Agent'), 'to' => '/account#mcp', 'done' => DB::table('api_tokens')->where('name', 'like', 'MCP: %')->exists()];
        }

        $steps = (array) $this->cms->hooks()->filter('dashboard.start', $steps, $user);

        return array_values(array_map(static fn (array $step) => [
            'id' => (string) $step['id'], 'label' => (string) $step['label'], 'to' => (string) $step['to'], 'done' => (bool) ($step['done'] ?? false),
        ], $steps));
    }

    /** @return array{since: ?int, dismissed: bool} `since` is null on a site that was not installed with the guide */
    public function state(): array
    {
        $state = is_file($this->file()) ? Files::readJson($this->file()) : [];

        return ['since' => isset($state['since']) ? (int) $state['since'] : null, 'dismissed' => (bool) ($state['dismissed'] ?? false)];
    }

    /** Whether there is still something to show this person. */
    public function open(User $user): bool
    {
        $state = $this->state();

        return $state['since'] !== null && ! $state['dismissed'] && array_any($this->steps($user), static fn (array $step) => ! $step['done']);
    }

    /** A site is ready for its first sign-in: the guide starts counting from now. What the site brought is before it. */
    public function begin(): void
    {
        is_file($this->file()) || Files::putJson($this->file(), ['since' => time(), 'dismissed' => false]);
    }

    public function dismiss(bool $dismissed = true): void
    {
        $state = $this->state();

        if ($state['since'] !== null) {
            Files::putJson($this->file(), [...$state, 'dismissed' => $dismissed]);
        }
    }

    /** Whether someone created an entry after the site was ready. */
    private function createdSince(int $since): bool
    {
        foreach ($this->cms->entries()->query()->get() as $entry) {
            if ($entry->createdAt !== null && $entry->createdAt->getTimestamp() > $since) {
                return true;
            }
        }

        return false;
    }

    private function file(): string
    {
        return storage_path('app/start.json');
    }

    /** 0: its pages are at the root of the site; 1: they have a URL of their own; 2: they have none. Ties keep their order. */
    private static function rank(Collection $collection): int
    {
        if (! $collection->routable()) {
            return 2;
        }

        return str_starts_with(ltrim((string) $collection->route, '/'), '{') ? 0 : 1;
    }
}
