<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Cms\Abilities\AbilityException;
use Cms\Modules\Workspace\Answers;
use Cms\Revisions\Kind;
use Cms\Revisions\Revisions;
use Cms\Users\User;
use Illuminate\Support\Carbon;

/**
 * The styling and the site's code keep their versions in the one history (Revisions), like entries:
 *
 *   styling  theme        the stylesheet (theme.css), the page transition and how Styles lists the styles, as Design and the Code screen save them
 *   code     custom.js    the JavaScript on every page
 *   code     scripts/…    a script or a stylesheet beside the site's stylesheet, by its path
 *
 * Before the first version of a thing is kept, what it was is kept too, so the way back to it is never lost.
 */
final class History
{
    private const array TRANSITION = ['type', 'duration', 'navigation'];

    public function __construct(
        private readonly Revisions $revisions,
        private readonly Styling $styling,
        private readonly Code $code,
    ) {}

    /** The kinds `styling` and `code`, which reach this history only when a version is restored. */
    public static function register(Revisions $revisions, \Closure $history): void
    {
        $may = static fn (string $permission) => static fn (?User $user): bool => $user?->hasPermission($permission) ?? false;

        $revisions->kind(new Kind(
            name: 'styling',
            view: $may('settings.manage'),
            edit: $may('settings.manage'),
            restore: static function (array $revision, array $in, $ctx) use ($history): array {
                $self = $history();
                $snapshot = (array) $revision['snapshot'];
                try {
                    $self->saveStyling(static function () use ($self, $snapshot) {
                        $self->styling->saveTheme((string) ($snapshot['css'] ?? ''));
                        // The whole transition as it was: what it did not set goes back to its default.
                        $self->styling->saveSettings(['transition' => [...array_fill_keys(self::TRANSITION, null), ...(array) ($snapshot['transition'] ?? [])], 'arrangement' => $snapshot['arrangement'] ?? null]);
                        $self->styling->saved();
                    }, $ctx->user, 'restore');
                } catch (\InvalidArgumentException|StylingException $e) {
                    throw AbilityException::invalid($e->getMessage());
                }

                return ['kind' => 'styling', 'subject' => 'theme'];
            },
            answer: static fn () => Answers::done(__('Restored the styling')),
        ));

        $revisions->kind(new Kind(
            name: 'code',
            view: $may('site.code'),
            edit: $may('site.code'),
            restore: static function (array $revision, array $in, $ctx) use ($history): array {
                $self = $history();
                $path = (string) $revision['subject'];
                $after = (string) ($revision['snapshot']['contents'] ?? '');
                try {
                    $self->saveCode($path, static function () use ($self, $path, $after) {
                        if ($path === 'custom.js') {
                            $self->styling->saveJs($after);
                            $self->styling->saved();
                        } else {
                            $self->code->write($path, $after);
                        }
                    }, $ctx->user, 'restore');
                } catch (\InvalidArgumentException $e) {
                    throw AbilityException::invalid($e->getMessage());
                }

                return ['kind' => 'code', 'subject' => $path];
            },
            answer: static fn (mixed $out) => Answers::done(__('Restored :name', ['name' => basename((string) ($out['subject'] ?? ''))])),
        ));
    }

    /** @return array{css: string, transition: array, arrangement: array} the styling as it stands */
    public function stylingNow(): array
    {
        $settings = $this->styling->settings();

        return ['css' => $this->styling->theme(), 'transition' => $settings['transition'], 'arrangement' => $settings['arrangement']];
    }

    /**
     * Save the styling with `$write` and keep it as a version; what it was is kept first when it has none yet.
     * A save that changed nothing adds none.
     */
    public function saveStyling(\Closure $write, ?User $user, string $action = 'save'): mixed
    {
        $file = $this->styling->path('theme.css');
        $before = $this->stylingNow();
        $changed = is_file($file) ? (int) filemtime($file) : null;
        $result = $write();
        $now = $this->stylingNow();

        $this->first('styling', 'theme', $before, $changed);
        if ($action !== 'save' || $now['css'] !== $before['css'] || $now['transition'] != $before['transition'] || $now['arrangement'] != $before['arrangement']) {
            $this->revisions->record('styling', 'theme', $action, $now, '', $user);
        }

        return $result;
    }

    /** What a file of code holds now; null when it is not there. */
    public function contents(string $path): ?string
    {
        return $path === 'custom.js' ? ($this->styling->customJs() ?: null) : $this->code->read($path);
    }

    /** Write a file of code with `$write` and keep it as a version, as saveStyling() keeps the styling. */
    public function saveCode(string $path, \Closure $write, ?User $user, string $action = 'save'): mixed
    {
        $file = $path === 'custom.js' ? $this->styling->path('custom.js') : $this->code->file($path);
        $before = $this->contents($path);
        $changed = $file !== null && is_file($file) ? (int) filemtime($file) : null;
        $result = $write();
        $now = (string) $this->contents($path);

        if ($before !== null) {
            $this->first('code', $path, ['contents' => $before], $changed);
        }
        if ($action !== 'save' || $now !== (string) $before) {
            $this->revisions->record('code', $path, $before === null && $action === 'save' ? 'create' : $action, ['contents' => $now], basename($path), $user);
        }

        return $result;
    }

    /** The file is gone, and its history with it. */
    public function forget(string $path): void
    {
        $this->revisions->deleteFor('code', $path);
    }

    /** What a thing was before its first version: kept as of when its file last changed, by no one. */
    private function first(string $kind, string $subject, array $snapshot, ?int $changed): void
    {
        if ($this->revisions->has($kind, $subject)) {
            return;
        }

        $at = Carbon::createFromTimestamp(min($changed ?? time(), time()) - 1);
        $this->revisions->record($kind, $subject, 'save', $snapshot, $kind === 'code' ? basename($subject) : '', null, null, null, $at);
    }
}
