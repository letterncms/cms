<?php

declare(strict_types=1);

namespace Cms\Admin;

use Cms\Cms;

/**
 * A part of the admin that admins arrange (the sidebar, the dashboard). Its
 * arrangement is a value of the `admin` settings, under key().
 */
abstract class Arranged
{
    public const string SETTINGS = 'admin';

    public function __construct(protected readonly Cms $cms) {}

    /** @return array<string, Arranged> Every arranged part of the admin, by its settings key (see AdminRegistry::arrange). */
    public static function all(): array
    {
        return app(AdminRegistry::class)->arranged();
    }

    /** The key of its value in the `admin` settings. */
    abstract public function key(): string;

    abstract public function arrangement(): Arrangement;

    /** @return array<string, array{id: string, label: string, icon: string}> Every item, for the editor. */
    abstract public function catalog(): array;

    /** The saved arrangement (config/admin.yaml may be edited by hand), or null for the defaults. */
    public function saved(): ?array
    {
        return $this->arrangement()->normalize($this->cms->settings(self::SETTINGS, $this->key()));
    }

    public function resolved(): array
    {
        return $this->arrangement()->resolve($this->saved());
    }
}
