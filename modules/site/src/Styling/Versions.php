<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Cms\Support\Files;
use Cms\Users\User;
use Illuminate\Support\Str;

/**
 * The styling as it was saved, save by save: its stylesheet and its page transition, who saved it and
 * when. The newest is what the site has now. Before the first one is kept, the styling as it stood is
 * kept too, so the way back to it is never lost. The newest `KEEP` are kept, in storage/styling/versions.
 */
final class Versions
{
    private const int KEEP = 50;

    public function __construct(private readonly Styling $styling) {}

    /** Keep the styling as it is now, saved by `$user`; `$before` is what it was, kept when nothing is yet. */
    public function record(?User $user, array $before): void
    {
        if ($this->files() === []) {
            $file = $this->styling->path('theme.css');
            $this->write(['css' => $before['css'], 'transition' => $before['transition'], 'user' => null, 'at' => date(DATE_ATOM, (is_file($file) ? (int) filemtime($file) : time()) - 1)]);
        }

        $now = ['css' => $this->styling->theme(), 'transition' => $this->styling->settings()['transition']];
        if ($now['css'] === $before['css'] && $now['transition'] == $before['transition']) {
            return;
        }

        $this->write([...$now, 'user' => $user?->name, 'at' => date(DATE_ATOM)]);

        foreach (array_slice($this->files(), self::KEEP) as $old) {
            @unlink($old);
        }
    }

    /** @return list<array{id: string, at: string, user: ?string, current: bool}> newest first */
    public function list(): array
    {
        return array_map(function (string $file, int $i) {
            $version = Files::readJson($file);

            return ['id' => basename($file, '.json'), 'at' => (string) ($version['at'] ?? ''), 'user' => $version['user'] ?? null, 'current' => $i === 0];
        }, $this->files(), array_keys($this->files()));
    }

    /** @return array{css: string, transition: array}|null */
    public function find(string $id): ?array
    {
        if (preg_match('/^[0-9a-z]{26}$/', $id) !== 1 || ! is_file($file = $this->folder().'/'.$id.'.json')) {
            return null;
        }
        $version = Files::readJson($file);

        return ['css' => (string) ($version['css'] ?? ''), 'transition' => (array) ($version['transition'] ?? [])];
    }

    private function write(array $version): void
    {
        Files::putJson($this->folder().'/'.strtolower((string) Str::ulid()).'.json', $version);
    }

    /** @return list<string> newest first */
    private function files(): array
    {
        $files = glob($this->folder().'/*.json') ?: [];
        rsort($files);

        return $files;
    }

    private function folder(): string
    {
        return storage_path('styling/versions');
    }
}
