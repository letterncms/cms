<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Cms\Abilities\AbilityException;
use Cms\Install\Installer;
use Cms\Support\Files;
use Throwable;

/**
 * The sites this site can start from or take in: every folder in the site's `sites/`. Composer puts a package of
 * type `cms-site` there, the store's installs do, and so can anyone by hand. None is part of the CMS, the one a
 * new site starts from (`starter`) included. A folder that is not a site is passed over, and named by problems().
 *
 * Switching sites (SiteApplier::switchTo) keeps what the site was: the site you leave is saved in `storage/sites/<handle>`
 * and comes back, edits and all, when you switch to that site again. Those are the sites' saved copies: `saved()`.
 * Which site the site is now is `active()`.
 */
final class Sites
{
    /** The site a new site starts from unless someone chooses otherwise: a package of the store like any other, fetched when it isn't in sites/. */
    public const string DEFAULT = 'starter';

    /** @var ?array<string, Site> */
    private ?array $sites = null;

    /** @var array<string, string> folder => why it is not a site */
    private array $problems = [];

    /** The site's own: one folder per site. */
    public function path(string $handle = ''): string
    {
        return site_path('sites'.($handle !== '' ? '/'.$handle : ''));
    }

    /** Where the site you leave is kept: one folder per site, in storage. */
    public function savedPath(string $handle = ''): string
    {
        return storage_path('sites'.($handle !== '' ? '/'.$handle : ''));
    }

    /** The active site’s handle, or null when no site is selected. */
    public function active(): ?string
    {
        return Installer::site();
    }

    public function activate(string $handle): void
    {
        $file = storage_path('installed.json');
        Files::putJson($file, [...Files::readJson($file), 'site' => $handle]);
    }

    /**
     * The sites kept aside by a switch, by handle: a site's own copy of what the site was when you left it,
     * or a site that was no site's. A copy that can't be read is left out.
     *
     * @return array<string, Site>
     */
    public function saved(): array
    {
        $out = [];

        foreach (glob($this->savedPath().'/*', GLOB_ONLYDIR) ?: [] as $dir) {
            try {
                $out[basename($dir)] = Site::load($dir, 'saved');
            } catch (Throwable) {
                // Not a site any more: nothing to switch to.
            }
        }

        return $out;
    }

    /**
     * Every site this site can be, for the admin's switcher: the ones that come as they are, then the sites kept
     * aside that are no site here, each with whether the site is it now.
     *
     * @return list<array{handle: string, name: string, active: bool, preview: ?string}>
     */
    public function switcher(): array
    {
        $active = $this->active();

        return array_values(array_map(static fn (Site $sitePackage) => [
            'handle' => $sitePackage->handle,
            'name' => $sitePackage->name(),
            'active' => $sitePackage->handle === $active,
            'preview' => $sitePackage->toArray()['previews'][0] ?? null,
        ], [...$this->all(), ...array_diff_key($this->saved(), $this->all())]));
    }

    /** What switching to a site brings: the copy this site kept of it, else the site as it comes. */
    public function resolve(string $handle): Site
    {
        return $this->saved()[$handle] ?? $this->findOrFail($handle);
    }

    public function flush(): void
    {
        $this->sites = null;
        $this->problems = [];
    }

    /** @return array<string, Site> by handle: the one a new site starts from first, then the rest by name */
    public function all(): array
    {
        if ($this->sites !== null) {
            return $this->sites;
        }

        $sites = [];

        foreach (glob($this->path().'/*', GLOB_ONLYDIR) ?: [] as $dir) {
            $handle = basename($dir);

            if (! Files::isHandle($handle)) {
                $this->problems[$handle] = __('“:handle” is not a site’s name: lowercase letters, digits, - and _.', ['handle' => $handle]);

                continue;
            }

            try {
                $sites[$handle] = Site::load($dir, 'site');
            } catch (Throwable $e) {
                $this->problems[$handle] = $e->getMessage();
            }
        }

        uasort($sites, static fn (Site $a, Site $b) => [$a->handle !== self::DEFAULT, $a->name()] <=> [$b->handle !== self::DEFAULT, $b->name()]);

        return $this->sites = $sites;
    }

    public function find(string $handle): ?Site
    {
        return $this->all()[$handle] ?? null;
    }

    public function findOrFail(string $handle): Site
    {
        return $this->find($handle) ?? throw new AbilityException(
            $this->problems[$handle] ?? __('There is no site “:handle” here. sites/list has the ones there are.', ['handle' => $handle]),
            isset($this->problems[$handle]) ? 'invalid_input' : 'not_found',
        );
    }

    /** @return array<string, string> folders in sites/ that are not sites, with the reason */
    public function problems(): array
    {
        $this->all();

        return $this->problems;
    }
}
