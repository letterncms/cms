<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Kits;

use Cms\Abilities\AbilityException;
use Cms\Support\Files;
use Throwable;

/**
 * The kits this site can start from or take in: `minimal`, which is part of the CMS, and every folder in the
 * site's `kits/`. Composer puts a package of type `cms-kit` there, the store's installs do, and so can anyone
 * by hand. A folder that is not a kit is passed over, and named by problems().
 */
final class Kits
{
    /** What a new site gets unless someone chooses otherwise. */
    public const string DEFAULT = 'minimal';

    /** @var ?array<string, Kit> */
    private ?array $kits = null;

    /** @var array<string, string> folder => why it is not a kit */
    private array $problems = [];

    /** The kits that are part of the CMS. */
    public static function builtin(): string
    {
        return dirname(__DIR__, 2).'/kits';
    }

    /** The site's own: one folder per kit. */
    public function path(string $handle = ''): string
    {
        return site_path('kits'.($handle !== '' ? '/'.$handle : ''));
    }

    public function flush(): void
    {
        $this->kits = null;
        $this->problems = [];
    }

    /** @return array<string, Kit> by handle: the built-in ones first, then the site's by name */
    public function all(): array
    {
        if ($this->kits !== null) {
            return $this->kits;
        }

        $kits = [];

        foreach (['builtin' => self::builtin(), 'site' => $this->path()] as $source => $root) {
            $found = [];

            foreach (glob($root.'/*', GLOB_ONLYDIR) ?: [] as $dir) {
                $handle = basename($dir);

                // A built-in kit's name is taken: a folder in the site can't stand in for it. Either is said, not passed over.
                if (isset($kits[$handle])) {
                    $this->problems[$handle] = __('“:handle” is the name of a kit that comes with :brand: name the folder otherwise.', ['handle' => $handle]);

                    continue;
                }

                if (! Files::isHandle($handle)) {
                    $this->problems[$handle] = __('“:handle” is not a kit’s name: lowercase letters, digits, - and _.', ['handle' => $handle]);

                    continue;
                }

                try {
                    $found[$handle] = Kit::load($dir, $source);
                } catch (Throwable $e) {
                    $this->problems[$handle] = $e->getMessage();
                }
            }

            uasort($found, static fn (Kit $a, Kit $b) => [$a->handle !== self::DEFAULT, $a->name()] <=> [$b->handle !== self::DEFAULT, $b->name()]);
            $kits += $found;
        }

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
