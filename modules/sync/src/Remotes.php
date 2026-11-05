<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Illuminate\Support\Str;
use InvalidArgumentException;
use Throwable;

/** The sites this one is connected to, by a short name like `production`. Their secrets are encrypted with this site's APP_KEY. */
final class Remotes
{
    /** @return list<array{name: string, label: string, url: string, site_id: string, added_at: string, last: ?array}> */
    public function all(): array
    {
        return array_values(array_map(self::public(...), array_filter($this->raw(), static fn (array $r) => isset($r['name'], $r['url']))));
    }

    /** @return array{name: string, label: string, url: string, site_id: string, secret: string, added_at: string, last: ?array} */
    public function get(string $name): array
    {
        foreach ($this->raw() as $remote) {
            if (($remote['name'] ?? null) === $name) {
                try {
                    $remote['secret'] = decrypt((string) $remote['secret']);
                } catch (Throwable) {
                    throw new InvalidArgumentException(__('This site’s APP_KEY changed, so it can’t read the key for :name any more. Connect it again.', ['name' => $name]));
                }

                return $remote;
            }
        }

        throw new InvalidArgumentException(__('There’s no site called :name here. Connect it first.', ['name' => $name]));
    }

    public function has(string $name): bool
    {
        return in_array($name, array_column($this->raw(), 'name'), true);
    }

    /** @param  array{site_id: string, label: string}  $hello */
    public function save(string $name, string $label, string $url, string $secret, array $hello): array
    {
        $name = self::handle($name);
        $all = array_values(array_filter($this->raw(), static fn (array $r) => ($r['name'] ?? null) !== $name && ($r['site_id'] ?? null) !== $hello['site_id']));
        $remote = ['name' => $name, 'label' => trim($label) ?: Str::headline($name), 'url' => rtrim($url, '/'), 'site_id' => $hello['site_id'], 'secret' => encrypt($secret), 'added_at' => now()->toIso8601String(), 'last' => null];
        $all[] = $remote;
        Site::writeJson(Site::dir('remotes.json'), ['remotes' => $all]);

        return self::public($remote);
    }

    public function remove(string $name): void
    {
        Site::writeJson(Site::dir('remotes.json'), ['remotes' => array_values(array_filter($this->raw(), static fn (array $r) => ($r['name'] ?? null) !== $name))]);
    }

    /** @param  array<string, mixed>  $last */
    public function touch(string $name, array $last): void
    {
        $all = $this->raw();

        foreach ($all as $i => $remote) {
            if (($remote['name'] ?? null) === $name) {
                $all[$i]['last'] = $last;
            }
        }

        Site::writeJson(Site::dir('remotes.json'), ['remotes' => $all]);
    }

    /** A short lower-case name, as typed in `php cms pull <name>`. */
    public static function handle(string $name): string
    {
        $handle = trim((string) preg_replace('/[^a-z0-9]+/', '-', strtolower(Str::ascii($name))), '-');

        if ($handle === '' || strlen($handle) > 40) {
            throw new InvalidArgumentException(__('Give the site a short name, like production or staging.'));
        }

        return $handle;
    }

    /** @return list<array<string, mixed>> */
    private function raw(): array
    {
        return array_values(array_filter((array) (Site::readJson(Site::dir('remotes.json'))['remotes'] ?? []), 'is_array'));
    }

    private static function public(array $remote): array
    {
        return ['name' => (string) $remote['name'], 'label' => (string) ($remote['label'] ?? $remote['name']), 'url' => (string) $remote['url'], 'site_id' => (string) ($remote['site_id'] ?? ''), 'added_at' => (string) ($remote['added_at'] ?? ''), 'last' => $remote['last'] ?? null];
    }
}
