<?php

declare(strict_types=1);

namespace Cms\Content;

use Closure;

/**
 * Pages a feature brings with it, at addresses of its own: sign in and the
 * account pages, the checkout. Each works out of the box with a standard
 * version; customising one makes it an entry of the group's collection, built
 * from that standard version, with drafts, history and the block editor.
 *
 * They are pages, so the admin lists them with the site's pages, under the
 * name of what brought them. Their collection has no sidebar item of its own.
 *
 *   $cms->builtinPages()->register('checkout', 'Checkout', Pages::COLLECTION,
 *       pages: fn () => ['checkout' => ['label' => 'Checkout', 'path' => '/checkout']],
 *       seed: fn (string $handle, string $locale) => [...blocks]);
 */
final class BuiltinPages
{
    /** @var array<string, array{id: string, label: string, collection: string, pages: Closure, seed: Closure, conflict: ?Closure, order: int, package: ?string}> */
    private array $groups = [];

    /**
     * @param  Closure(): array<string, array{label: string, path?: ?string}>  $pages  by handle (an entry's slug); a page without a path is shown inside other pages
     * @param  Closure(string, string): list<array>  $seed  the standard version's blocks, for a handle in a language
     * @param  (Closure(string): bool)|null  $conflict  whether a page of the site already has this one's address
     */
    public function register(string $id, string $label, string $collection, Closure $pages, Closure $seed, ?Closure $conflict = null, int $order = 50): void
    {
        $this->groups[$id] = ['id' => $id, 'label' => $label, 'collection' => $collection, 'pages' => $pages, 'seed' => $seed, 'conflict' => $conflict, 'order' => $order, 'package' => \Cms\Packages\Scope::$current];
    }

    /** @return list<array{id: string, label: string, collection: string, pages: Closure, seed: Closure, conflict: ?Closure, order: int, package: ?string}> */
    public function all(): array
    {
        $groups = array_values($this->groups);
        usort($groups, static fn ($a, $b) => [$a['order'], $a['label']] <=> [$b['order'], $b['label']]);

        return $groups;
    }

    public function get(string $id): ?array
    {
        return $this->groups[$id] ?? null;
    }

    /** Whether a collection holds built-in pages (it is listed with the pages, not on its own). */
    public function holds(string $collection): bool
    {
        foreach ($this->groups as $group) {
            if ($group['collection'] === $collection) {
                return true;
            }
        }

        return false;
    }
}
