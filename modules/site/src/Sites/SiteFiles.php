<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Sites;

use Cms\Abilities\AbilityException;
use Cms\Modules\Media\MediaManifest;
use Cms\Modules\Media\MediaStore;
use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Vendor;
use Cms\Support\Files;
use Cms\Support\Yaml;
use Throwable;

/**
 * What a site's folder holds, read without trusting it. A site comes from somewhere else, so every file is one
 * the layout names, a plain file and no link, of a kind and a size a site keeps: a media file passes what an
 * upload passes, a script or stylesheet has a name the design's code may have, a library is what its lock
 * says. Anything else refuses the whole site, by the file's name, before a single file is copied.
 */
final class SiteFiles
{
    /** Files a site may hold in all, and their size together. */
    private const int MAX_FILES = 5000;

    private const int MAX_BYTES = 512 * 1024 * 1024;

    /** The most one file of each kind may be, in bytes. A media file has the library's own limit. */
    private const array LIMITS = ['text' => 2_000_000, 'code' => 500_000, 'font' => 5_000_000, 'preview' => 5_000_000];

    /**
     * A folder or file name: no dot first (nothing hidden, never ".."), nothing a shell or a URL reads, and as long
     * as a file system allows (255), so every entry a site has fits: a slug is up to 180 letters, then "-2" and ".md".
     */
    private const string SEGMENT = '/^[A-Za-z0-9_@][A-Za-z0-9._@-]{0,254}$/D';

    /** Names a server may run instead of serve, wherever they sit in a file's name. */
    private const string RUNNABLE = '/\.(php\d?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp|htaccess)(\.|\/|$)/i';

    /** What a repository leaves in a folder: never part of a site, and never copied. */
    private const array IGNORED = ['.gitkeep', '.gitignore', '.gitattributes', '.DS_Store'];

    private const array PREVIEW_TYPES = ['png' => 'image/png', 'jpg' => 'image/jpeg', 'webp' => 'image/webp'];

    public function __construct(private readonly MediaStore $media, private readonly MediaManifest $manifest) {}

    /**
     * Everything the site carries, by kind, as paths inside it.
     *
     * @return array{
     *   collections: array<string, string>, entries: array<string, list<string>>, globals: array<string, string>, menus: array<string, string>,
     *   tokens: ?string, custom: array<string, string>, load: ?string, fonts: array<string, string>, scripts: array<string, string>, styles: array<string, string>,
     *   lock: ?string, vendor: array<string, string>, media: array<string, string>, mediaFiles: array<string, string>,
     *   config: array<string, string>, other: array<string, list<string>>, previews: list<string>, code: bool, bytes: int
     * }
     */
    public function read(Site $sitePackage): array
    {
        $out = [
            'collections' => [], 'entries' => [], 'globals' => [], 'menus' => [], 'tokens' => null, 'custom' => [], 'load' => null, 'fonts' => [],
            'scripts' => [], 'styles' => [], 'lock' => null, 'vendor' => [], 'media' => [], 'mediaFiles' => [], 'config' => [], 'other' => [],
            'previews' => [], 'code' => false, 'bytes' => 0,
        ];
        $count = 0;

        foreach (['content', 'config', 'public', 'previews'] as $top) {
            foreach ($this->walk($sitePackage, $top) as $path) {
                $size = (int) filesize($sitePackage->path.'/'.$path);
                $out['bytes'] += $size;

                if (++$count > self::MAX_FILES || $out['bytes'] > self::MAX_BYTES) {
                    throw $this->refused($sitePackage, __('it is larger than a site may be (:files files, :size MB)', ['files' => self::MAX_FILES, 'size' => intdiv(self::MAX_BYTES, 1024 * 1024)]));
                }

                $this->place($sitePackage, $path, $size, $out);
            }
        }

        foreach ($sitePackage->previews() as $preview) {
            if (! in_array($preview, $out['previews'], true)) {
                throw $this->refused($sitePackage, __('site.json names :file, which is not in it', ['file' => $preview]));
            }
        }

        foreach ($out['media'] as $id => $record) {
            $this->admitMedia($sitePackage, $id, $record, $out['mediaFiles']);
        }

        $this->admitVendor($sitePackage, $out);
        ksort($out['entries']);
        $out['code'] = $out['scripts'] !== [] || $out['styles'] !== [] || $out['vendor'] !== [] || $out['custom'] !== [] || $out['load'] !== null;

        return $out;
    }

    /** A YAML file of the site, as an array. */
    public function yaml(Site $sitePackage, string $path): array
    {
        try {
            return Yaml::read($sitePackage->path.'/'.$path);
        } catch (Throwable $e) {
            throw $this->refused($sitePackage, __(':file can’t be read: :problem', ['file' => $path, 'problem' => $e->getMessage()]));
        }
    }

    /** A JSON file of the site, as an array. */
    public function json(Site $sitePackage, string $path): array
    {
        $data = json_decode((string) file_get_contents($sitePackage->path.'/'.$path), true);

        return is_array($data) ? $data : throw $this->refused($sitePackage, __(':file is not JSON', ['file' => $path]));
    }

    /** @return list<string> every file under one of the site's folders, as paths inside the site */
    private function walk(Site $sitePackage, string $relative): array
    {
        $dir = $sitePackage->path.'/'.$relative;

        if (is_link($dir)) {
            throw $this->refused($sitePackage, __(':file is a link', ['file' => $relative]));
        }

        if (! is_dir($dir)) {
            return [];
        }

        $out = [];

        foreach (scandir($dir) ?: [] as $name) {
            if ($name === '.' || $name === '..' || in_array($name, self::IGNORED, true)) {
                continue;
            }

            $path = $relative.'/'.$name;
            $full = $sitePackage->path.'/'.$path;

            if (is_link($full)) {
                throw $this->refused($sitePackage, __(':file is a link', ['file' => $path]));
            }

            if (! preg_match(self::SEGMENT, $name) || preg_match(self::RUNNABLE, $name)) {
                throw $this->refused($sitePackage, __(':file has a name a site’s files can’t have', ['file' => $path]));
            }

            if (is_dir($full)) {
                if (substr_count($path, '/') > 12) {
                    throw $this->refused($sitePackage, __(':file is too deep in folders', ['file' => $path]));
                }

                array_push($out, ...$this->walk($sitePackage, $path));
            } elseif (is_file($full)) {
                $out[] = $path;
            } else {
                throw $this->refused($sitePackage, __(':file is not a plain file', ['file' => $path]));
            }
        }

        return $out;
    }

    /** Put one file where its path says it belongs, or refuse the site for it. */
    private function place(Site $sitePackage, string $path, int $size, array &$out): void
    {
        $limit = fn (string $kind) => $size <= self::LIMITS[$kind] ? true : throw $this->refused($sitePackage, __(':file is larger than :size MB', ['file' => $path, 'size' => round(self::LIMITS[$kind] / 1_000_000, 1)]));
        $handle = static fn (string $name) => Files::isHandle($name);

        switch (true) {
            case preg_match('#^content/collections/([^/]+)\.yaml$#D', $path, $m) && $handle($m[1]):
                $limit('text');
                $out['collections'][$m[1]] = $path;

                return;
            case preg_match('#^content/collections/([^/]+)/(.+\.md)$#D', $path, $m) && $handle($m[1]):
                $limit('text');
                $out['entries'][$m[1]][] = $m[2];

                return;
            case preg_match('#^content/globals/([^/]+)\.yaml$#D', $path, $m) && $handle($m[1]):
                $limit('text');
                $out['globals'][$m[1]] = $path;

                return;
            case preg_match('#^content/navigation/([^/]+)\.yaml$#D', $path, $m) && $handle($m[1]):
                $limit('text');
                $out['menus'][$m[1]] = $path;

                return;
            case $path === 'content/design/tokens.json':
                $limit('text');
                $out['tokens'] = $path;

                return;
            case $path === 'content/design/code.json':
                $limit('text');
                $out['load'] = $path;

                return;
            case $path === 'content/design/custom.css' || $path === 'content/design/custom.js':
                $limit('code');
                $out['custom'][pathinfo($path, PATHINFO_EXTENSION)] = $path;

                return;
            case preg_match('#^content/design/fonts/([\w.-]+\.woff2)$#D', $path, $m) === 1:
                $limit('font');

                if (file_get_contents($sitePackage->path.'/'.$path, false, null, 0, 4) !== 'wOF2') {
                    throw $this->refused($sitePackage, __(':file is not a .woff2 font', ['file' => $path]));
                }

                $out['fonts'][$m[1]] = $path;

                return;
            case preg_match('#^content/design/((?:scripts|styles)/.+)$#D', $path, $m) === 1:
                $limit('code');

                try {
                    [$kind, $name] = Code::parse($m[1]);
                } catch (Throwable $e) {
                    throw $this->refused($sitePackage, $path.': '.$e->getMessage());
                }

                $out[$kind][$name] = $path;

                return;
            case $path === 'content/design/vendor/lock.json':
                $limit('text');
                $out['lock'] = $path;

                return;
            case preg_match('#^content/design/vendor/(.+\.js)$#D', $path, $m) === 1:
                if ($size > Vendor::MAX_BYTES) {
                    throw $this->refused($sitePackage, __(':file is larger than :size MB', ['file' => $path, 'size' => round(Vendor::MAX_BYTES / 1_000_000, 1)]));
                }

                $out['vendor'][$m[1]] = $path;

                return;
            case preg_match('#^content/media/([0-9a-z]{26})\.yaml$#D', $path, $m) === 1:
                $limit('text');
                $out['media'][$m[1]] = $path;

                return;
            case preg_match('#^public/(media/.+)$#D', $path, $m) === 1:
                if ($size > $this->media->maxBytes()) {
                    throw $this->refused($sitePackage, __(':file is larger than this site’s upload limit', ['file' => $path]));
                }

                $out['mediaFiles'][$m[1]] = $path;

                return;
            case preg_match('#^config/([a-z0-9][a-z0-9_-]{0,63})\.yaml$#D', $path, $m) === 1:
                $limit('text');
                $out['config'][$m[1]] = $path;

                return;
            case preg_match('#^previews/[^/]+\.(png|jpg|webp)$#D', $path, $m) === 1:
                $limit('preview');

                if ((new \finfo(FILEINFO_MIME_TYPE))->file($sitePackage->path.'/'.$path) !== self::PREVIEW_TYPES[$m[1]]) {
                    throw $this->refused($sitePackage, __(':file is not the picture its name says', ['file' => $path]));
                }

                $out['previews'][] = $path;

                return;
            // What a plugin keeps beside the content (forms, redirects…): plain data, taken when something here asks for it.
            case preg_match('#^content/([a-z0-9][a-z0-9_-]{0,63})(?:/.+)?\.(yaml|json|md)$#D', $path, $m) === 1 && ! in_array($m[1], ['collections', 'globals', 'navigation', 'design', 'media'], true):
                $limit('text');
                $out['other'][$m[1]][] = $path;

                return;
        }

        throw $this->refused($sitePackage, __(':file is not something a site carries', ['file' => $path]));
    }

    /** A media record and its file pass what an upload passes; a file without a record is not media. */
    private function admitMedia(Site $sitePackage, string $id, string $record, array $files): void
    {
        $data = $this->yaml($sitePackage, $record);

        if (($data['id'] ?? null) !== $id || ! isset($files[(string) ($data['path'] ?? '')])) {
            throw $this->refused($sitePackage, __(':file does not name a file under public/media of the site', ['file' => $record]));
        }

        if (($reason = $this->manifest->validate($data, $sitePackage->path.'/public')) !== null) {
            throw $this->refused($sitePackage, __(':file is not a file the media library takes (:reason)', ['file' => 'public/'.$data['path'], 'reason' => $reason]));
        }
    }

    /** Every library file is one the lock names, and is what the lock says it is. */
    private function admitVendor(Site $sitePackage, array $out): void
    {
        if ($out['vendor'] === [] && $out['lock'] === null) {
            return;
        }

        $named = [];

        foreach (Vendor::locked($out['lock'] !== null ? $this->json($sitePackage, $out['lock']) : []) as $entry) {
            $named += $entry['files'];
        }

        foreach ($out['vendor'] as $local => $path) {
            if (! isset($named[$local]) || ! hash_equals($named[$local], Vendor::hash((string) file_get_contents($sitePackage->path.'/'.$path)))) {
                throw $this->refused($sitePackage, __(':file is not what the site’s lock.json says', ['file' => $path]));
            }
        }

        if (($missing = array_diff_key($named, $out['vendor'])) !== []) {
            throw $this->refused($sitePackage, __('its lock.json names :file, which is not in it', ['file' => 'content/design/vendor/'.array_key_first($missing)]));
        }
    }

    private function refused(Site $sitePackage, string $why): AbilityException
    {
        return AbilityException::invalid(__('The site “:name” can’t be used: :why.', ['name' => $sitePackage->handle, 'why' => $why]));
    }
}
