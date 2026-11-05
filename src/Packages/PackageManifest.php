<?php

declare(strict_types=1);

namespace Cms\Packages;

use InvalidArgumentException;

/**
 * A plugin or module, described by its composer.json (`extra.cms`).
 */
final readonly class PackageManifest
{
    public const string PLUGIN = 'cms-plugin';

    /** The Composer vendor of everything first-party. */
    public const string VENDOR = 'letterncms';

    /** The package the kernel is, in every package's `require`. */
    public const string CORE = self::VENDOR.'/cms';

    /**
     * @param  array<string, string>  $requires  Packages this package needs (name => constraint): CMS packages, composer libraries, and the optional modules in `extra.cms.modules`
     * @param  array<string, string>  $psr4
     * @param  list<string>  $files  Files from composer's `autoload.files`, loaded when the package starts
     * @param  array<string, mixed>  $extra  Raw extra.cms block
     */
    public function __construct(
        public string $name,
        public string $version,
        public string $path,
        public string $label,
        public string $description,
        public string $icon,
        public ?string $provider,
        public string $namespace,
        public array $requires,
        public ?string $coreConstraint,
        public array $psr4,
        public array $authors,
        public ?string $homepage,
        public array $extra,
        public bool $core = false,
        public bool $required = false,
        public array $files = [],
    ) {}

    /**
     * @param  bool  $module  Found in the CMS package's modules/ folder: one of the modules the admin is made of.
     *                      Modules are on unless switched off; `required` ones cannot be switched off.
     */
    public static function fromComposer(string $path, array $composer, bool $module = false): self
    {
        $name = (string) ($composer['name'] ?? '');

        if (! preg_match('#^[a-z0-9]([_.-]?[a-z0-9]+)*/[a-z0-9](([_.]|-{1,2})?[a-z0-9]+)*$#', $name)) {
            throw new InvalidArgumentException("Invalid package name in {$path}/composer.json");
        }

        $type = (string) ($composer['type'] ?? '');

        if ($type !== self::PLUGIN) {
            throw new InvalidArgumentException("{$name} is not a package for this CMS (type {$type}).");
        }

        $cms = (array) ($composer['extra']['cms'] ?? []);
        $short = explode('/', $name, 2)[1];

        $requires = [];
        $core = null;

        foreach ((array) ($composer['require'] ?? []) as $dep => $constraint) {
            if ($dep === self::CORE) {
                $core = (string) $constraint;
            } elseif (str_contains((string) $dep, '/')) {
                $requires[(string) $dep] = (string) $constraint;
            }
        }

        // Optional modules a plugin builds on, such as letterncms/blocks: they come with the core, so not from Composer.
        foreach ((array) ($cms['modules'] ?? []) as $needed) {
            $requires[(string) $needed] ??= '*';
        }

        return new self(
            name: $name,
            version: (string) ($composer['version'] ?? '0.0.0'),
            path: rtrim($path, '/'),
            label: (string) ($cms['label'] ?? ucwords(str_replace(['-', '_'], ' ', $short))),
            description: (string) ($composer['description'] ?? ''),
            icon: (string) ($cms['icon'] ?? 'plugin'),
            provider: isset($cms['provider']) ? (string) $cms['provider'] : null,
            namespace: (string) ($cms['namespace'] ?? $short),
            requires: $requires,
            coreConstraint: $core,
            psr4: array_map(static fn ($p) => is_array($p) ? (string) $p[0] : (string) $p, (array) ($composer['autoload']['psr-4'] ?? [])),
            authors: array_values((array) ($composer['authors'] ?? [])),
            homepage: isset($composer['homepage']) ? (string) $composer['homepage'] : null,
            extra: $cms,
            core: $module,
            required: $module && (bool) ($cms['required'] ?? false),
            files: array_values(array_map('strval', (array) ($composer['autoload']['files'] ?? []))),
        );
    }

    /** Filesystem/URL-safe handle, e.g. "cms-seo". */
    public function handle(): string
    {
        return str_replace('/', '-', $this->name);
    }

    public function firstParty(): bool
    {
        return str_starts_with($this->name, self::VENDOR.'/');
    }

    public function path(string $relative = ''): string
    {
        return $relative === '' ? $this->path : $this->path.'/'.ltrim($relative, '/');
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'version' => $this->version,
            'label' => $this->label,
            'description' => $this->description,
            'icon' => $this->icon,
            'firstParty' => $this->firstParty(),
            'core' => $this->core,
            'required' => $this->required,
            'requires' => $this->requires,
            'authors' => $this->authors,
            'homepage' => $this->homepage,
        ];
    }
}
