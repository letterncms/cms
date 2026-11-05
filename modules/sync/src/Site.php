<?php

declare(strict_types=1);

namespace Cms\Modules\Sync;

use Cms\Support\Files;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

/**
 * This site as Sync sees it: who it is, the key another site connects with, and what that site
 * may do. All of it lives in storage/sync, which never moves, so a sync can't hand one site's
 * key or connections to another.
 */
final class Site
{
    public static function dir(string $path = ''): string
    {
        return storage_path('sync'.($path === '' ? '' : '/'.$path));
    }

    /** @return array<string, mixed> */
    public static function readJson(string $file, array $default = []): array
    {
        $data = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;

        return is_array($data) ? $data : $default;
    }

    public static function writeJson(string $file, array $data): void
    {
        Files::put($file, (string) json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)."\n");
    }

    /** @return array{id: string, secret: string, allow_pull: bool, allow_push: bool} */
    public function settings(): array
    {
        $file = self::dir('site.json');
        $data = self::readJson($file);
        $secret = null;

        try {
            $secret = isset($data['secret']) ? decrypt((string) $data['secret']) : null;
        } catch (Throwable) {
            // A new APP_KEY can't read the old secret: a new key it is.
        }

        if (! isset($data['id']) || ! is_string($secret)) {
            $data = ['id' => $data['id'] ?? self::newId(), 'secret' => encrypt($secret = self::newSecret()), 'allow_pull' => $data['allow_pull'] ?? true, 'allow_push' => $data['allow_push'] ?? true];
            self::writeJson($file, $data);
        }

        return ['id' => (string) $data['id'], 'secret' => $secret, 'allow_pull' => (bool) ($data['allow_pull'] ?? true), 'allow_push' => (bool) ($data['allow_push'] ?? true)];
    }

    public function id(): string
    {
        return $this->settings()['id'];
    }

    public function allows(string $what): bool
    {
        return $this->settings()['allow_'.$what] ?? false;
    }

    public function allow(string $what, bool $on): void
    {
        if (! in_array($what, ['pull', 'push'], true)) {
            throw new RuntimeException(__('Choose pull or push.'));
        }

        $this->settings();
        $data = self::readJson(self::dir('site.json'));
        $data['allow_'.$what] = $on;
        self::writeJson(self::dir('site.json'), $data);
    }

    /** A new key: every site connected with the old one has to be given the new one. With `$identity`, a new id too, for a copy of another site's folder. */
    public function renew(bool $identity = false): void
    {
        $data = self::readJson(self::dir('site.json'));
        $data['secret'] = encrypt(self::newSecret());

        if ($identity || ! isset($data['id'])) {
            $data['id'] = self::newId();
        }

        self::writeJson(self::dir('site.json'), $data);
    }

    public function key(): string
    {
        return Key::format($this->url(), $this->settings()['secret']);
    }

    /** The address this site has in its settings, which is the one the other site is told about. */
    public function url(): string
    {
        $url = rtrim((string) (cms()->site('url') ?? ''), '/');

        return $url !== '' ? $url : rtrim((string) url('/'), '/');
    }

    public function name(): string
    {
        return (string) (cms()->site('name') ?? '') ?: (string) parse_url($this->url(), PHP_URL_HOST);
    }

    public function root(): string
    {
        return rtrim(str_replace('\\', '/', base_path()), '/');
    }

    private static function newId(): string
    {
        return strtolower((string) Str::ulid());
    }

    private static function newSecret(): string
    {
        return rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
    }
}
