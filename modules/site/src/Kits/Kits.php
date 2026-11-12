<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Cms\Abilities\AbilityException;
use Cms\Install\Installer;
use Cms\Support\Files;
use Throwable;

/**
 * The kits this site can start from or take in: every folder in the site's `kits/`. Composer puts a package of
 * type `cms-kit` there, the store's installs do, and so can anyone by hand. None is part of the CMS, the one a
 * new site starts from (`minimal`) included. A folder that is not a kit is passed over, and named by problems().
 *
 * Switching kits (KitApplier::switchTo) keeps what the site was: the site you leave is saved in `storage/kits/<handle>`
 * and comes back, edits and all, when you switch to that kit again. Those are the kits' saved copies: `saved()`.
 * Which kit the site is now is `active()`.
 */
final class Kits
{
    /** The kit a new site starts from unless someone chooses otherwise: a package of the store like any other, fetched when it isn't in kits/. */
    public const string DEFAULT = 'minimal';

    /** @var ?array<string, Kit> */
    private ?array $kits = null;

    /** @var array<string, string> folder => why it is not a kit */
    private array $problems = [];

    /** The site's own: one folder per kit. */
    public function path(string $handle = ''): string
    {
        return site_path('kits'.($handle !== '' ? '/'.$handle : ''));
    }

    /** Where the site you leave is kept: one folder per kit, in storage. */
    public function savedPath(string $handle = ''): string
    {
        return storage_path('kits'.($handle !== '' ? '/'.$handle : ''));
    }

    /** The kit this site is, or null when it started from none (a site that was never a kit's). */
    public function active(): ?string
    {
        return Installer::kit();
    }

    public function activate(string $handle): void
    {
        $file = storage_path('installed.json');
        Files::putJson($file, [...Files::readJson($file), 'kit' => $handle]);
    }

    /**
     * The sites kept aside by a switch, by handle: a kit's own copy of what the site was when you left it,
     * or a site that was no kit's. A copy that can't be read is left out.
     *
     * @return array<string, Kit>
     */
    public function saved(): array
    {
        $out = [];

        foreach (glob($this->savedPath().'/*', GLOB_ONLYDIR) ?: [] as $dir) {
            try {
                $out[basename($dir)] = Kit::load($dir, 'saved');
            } catch (Throwable) {
                // Not a kit any more: nothing to switch to.
            }
        }

        return $out;
    }

    /**
     * Every kit this site can be, for the admin's switcher: the ones that come as they are, then the sites kept
     * aside that are no kit here, each with whether the site is it now.
     *
     * @return list<array{handle: string, name: string, active: bool, preview: ?string}>
     */
    public function switcher(): array
    {
        $active = $this->active();

        return array_values(array_map(static fn (Kit $kit) => [
            'handle' => $kit->handle,
            'name' => $kit->name(),
            'active' => $kit->handle === $active,
            'preview' => $kit->toArray()['previews'][0] ?? null,
        ], [...$this->all(), ...array_diff_key($this->saved(), $this->all())]));
    }

    /** What switching to a kit brings: the copy this site kept of it, else the kit as it comes. */
    public function resolve(string $handle): Kit
    {
        return $this->saved()[$handle] ?? $this->findOrFail($handle);
    }

    public function flush(): void
    {
        $this->kits = null;
        $this->problems = [];
    }

    /** @return array<string, Kit> by handle: the one a new site starts from first, then the rest by name */
    public function all(): array
    {
        if ($this->kits !== null) {
            return $this->kits;
        }

        $kits = [];

        foreach (glob($this->path().'/*', GLOB_ONLYDIR) ?: [] as $dir) {
            $handle = basename($dir);

            if (! Files::isHandle($handle)) {
                $this->problems[$handle] = __('“:handle” is not a kit’s name: lowercase letters, digits, - and _.', ['handle' => $handle]);

                continue;
            }

            try {
                $kits[$handle] = Kit::load($dir, 'site');
            } catch (Throwable $e) {
                $this->problems[$handle] = $e->getMessage();
            }
        }

        uasort($kits, static fn (Kit $a, Kit $b) => [$a->handle !== self::DEFAULT, $a->name()] <=> [$b->handle !== self::DEFAULT, $b->name()]);

        return $this->kits = $kits;
    }

    public function find(string $handle): ?Kit
    {
        return $this->all()[$handle] ?? null;
    }

    public function findOrFail(string $handle): Kit
    {
        return $this->find($handle) ?? throw new AbilityException(
            $this->problems[$handle] ?? __('There is no kit “:handle” here. kits/list has the ones there are.', ['handle' => $handle]),
            isset($this->problems[$handle]) ? 'invalid_input' : 'not_found',
        );
    }

    /** @return array<string, string> folders in kits/ that are not kits, with the reason */
    public function problems(): array
    {
        $this->all();

        return $this->problems;
    }
}
