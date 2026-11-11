<?php

declare(strict_types=1);

namespace Cms\Modules\Workspace;

use Cms\Abilities\AbilityException;
use Cms\Admin\Translations;
use Cms\Cms;
use Cms\Users\User;

/**
 * The places of the admin an agent may open for a person (`admin/open`): a path of the admin,
 * never an address elsewhere, and only one the person may see when the admin knows who may.
 * A path it doesn't know passes: the admin shows its own Not Found there.
 */
final class Places
{
    public function __construct(private readonly Cms $cms) {}

    /** @return array{to: string, label: string} */
    public function open(string $to, User $user, ?string $label = null): array
    {
        $to = trim($to);
        // An agent may write the admin's own prefix; the admin's paths start after it.
        if (preg_match('~^/admin(?=/|$|\?|#)~', $to) === 1) {
            $to = substr($to, 6) ?: '/';
        }

        $path = (string) strtok($to, '?#');
        if (preg_match('~^/(?!/)[^\s\\\\]*$~', $to) !== 1 || preg_match('~(^|/)\.\.?(/|$)~', $path) === 1 || preg_match('~^[a-z][a-z0-9+.-]*:~i', $to) === 1) {
            throw AbilityException::invalid(__('Open only places of the admin, such as /content/pages.'), ['to' => __('Open only places of the admin, such as /content/pages.')]);
        }

        if ($this->forbidden($path, $user)) {
            throw AbilityException::forbidden();
        }

        return ['to' => $to, 'label' => trim((string) $label) !== '' ? trim((string) $label) : $this->named($path, $user) ?? $to];
    }

    /** Whether the admin knows this person may not see the place: by its view, its sidebar item, the entry's collection or the settings page. */
    private function forbidden(string $path, User $user): bool
    {
        if (! $user->hasPermission('admin.access')) {
            return true;
        }

        if (preg_match('~^/content/([a-z0-9_-]+)(?:/([^/]+))?$~', $path, $m) === 1 && $this->cms->collections()->find($m[1]) !== null) {
            return ! $user->hasPermission("entries.{$m[1]}.view");
        }

        if (preg_match('~^/settings/([a-z0-9_-]+)$~', $path, $m) === 1 && ($schema = $this->cms->settingsRegistry()->schemas()[$m[1]] ?? null) !== null) {
            return ! $user->hasPermission((string) ($schema['permission'] ?? 'settings.manage'));
        }

        $view = $this->cms->views()->opens($path, $user);
        if ($view !== null) {
            return ! $view;
        }

        foreach ($this->cms->adminNav()->items() as $item) {
            if (($item['path'] ?? null) === $path) {
                return ! (($item['permission'] === null || $user->hasPermission($item['permission'], any: true)) && ($item['visible'] === null || ($item['visible'])($user)));
            }
        }

        return false;
    }

    /** The place's name in the sidebar, when it has one. */
    private function named(string $path, User $user): ?string
    {
        foreach ($this->cms->adminNav()->forUser($user)['nav'] as $item) {
            if (($item['path'] ?? null) === $path) {
                return $this->cms->app()->make(Translations::class)->label($item['label']);
            }
        }

        return null;
    }
}
