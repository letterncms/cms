<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Illuminate\Support\Str;
use Cms\Abilities\AbilityException;
use Cms\Support\Files;
use Cms\Support\SafeFetcher;
use Cms\Users\User;
use Throwable;

/** Everything that adds, changes or removes media files. */
final class MediaStore
{
    /** Detected MIME type => stored extension. Anything else is refused. */
    public const array TYPES = [
        'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp', 'image/avif' => 'avif', 'image/svg+xml' => 'svg',
        'application/pdf' => 'pdf', 'video/mp4' => 'mp4', 'video/webm' => 'webm', 'video/quicktime' => 'mov',
        'audio/mpeg' => 'mp3', 'audio/mp4' => 'm4a', 'audio/ogg' => 'ogg', 'audio/wav' => 'wav', 'audio/x-wav' => 'wav',
        'text/plain' => 'txt', 'text/csv' => 'csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
        'application/zip' => 'zip',
        // What a scene, an animation player or a WebGL library loads by URL (see ASSETS).
        'model/gltf-binary' => 'glb', 'model/gltf+json' => 'gltf', 'image/vnd.radiance' => 'hdr', 'image/ktx2' => 'ktx2',
        'application/json' => 'json', 'application/vnd.rive' => 'riv',
    ];

    /**
     * Files a script loads, not ones a page shows: 3D models, their environment maps and textures, Lottie and Rive
     * animations. Each has a ceiling of its own in MB (the site's upload limit still applies when it is lower),
     * and none of them is an image to resize, whatever its MIME type starts with.
     */
    public const array ASSETS = [
        'model/gltf-binary' => 64, 'model/gltf+json' => 8, 'image/vnd.radiance' => 32, 'image/ktx2' => 32,
        'application/json' => 4, 'application/vnd.rive' => 16,
    ];

    /** The most JSON that is ever decoded to look at it: a .gltf at its ceiling, or the JSON chunk of a .glb. */
    private const int DECODE = 8 * 1024 * 1024;

    /** What a path inside an asset may be: data it carries, or a plain relative name. Nothing with a host, a scheme, a backslash or a control character. */
    private const string LOCAL = '/^[\w.-][\w.\/-]*$/D';

    /**
     * public/media/.htaccess: what Apache needs to serve the library well, written by the CMS and kept current on
     * every site (a site's own public/.htaccess is copied once and never again). Types a script's loader expects,
     * no sniffing of what a file "really" is, and a long cache: a media file's name never gets new contents.
     */
    private const string HTACCESS = <<<'HTACCESS'
        # Written by the CMS, and again whenever it differs: change public/.htaccess instead.
        <IfModule mod_mime.c>
            AddType model/gltf-binary .glb
            AddType model/gltf+json .gltf
            AddType image/vnd.radiance .hdr
            AddType image/ktx2 .ktx2
            AddType application/vnd.rive .riv
        </IfModule>
        <IfModule mod_headers.c>
            Header set X-Content-Type-Options "nosniff"
            <FilesMatch "\.(glb|gltf|hdr|ktx2|riv|json)$">
                Header set Cache-Control "public, max-age=31536000, immutable"
            </FilesMatch>
        </IfModule>

        HTACCESS;

    /** Make sure public/media/.htaccess is there and is this version's. */
    public function protect(): void
    {
        $file = public_path('media/.htaccess');

        if (! is_file($file) || file_get_contents($file) !== self::HTACCESS) {
            rescue(static fn () => Files::put($file, self::HTACCESS), report: false);
        }
    }

    public function __construct(
        private readonly ImageProcessor $images,
        private readonly SvgSanitizer $svg,
        private readonly Variants $variants,
    ) {}

    private function manifest(): MediaManifest
    {
        return app(MediaManifest::class);
    }

    public function maxBytes(): int
    {
        return (int) cms()->setting('media', 'max_upload_mb', 32) * 1024 * 1024;
    }

    /** Store an uploaded or downloaded file. The temp file is moved or removed. A new file fires `media.uploaded`; the same file again is the one already stored. */
    public function store(string $tmp, string $originalName, ?User $user = null, string $folder = ''): MediaItem
    {
        try {
            $this->protect();

            if (! is_file($tmp) || filesize($tmp) === 0) {
                throw AbilityException::invalid(__('The file is empty.'));
            }

            if (filesize($tmp) > $this->maxBytes()) {
                throw AbilityException::invalid(__('The file is larger than :size MB.', ['size' => cms()->setting('media', 'max_upload_mb', 32)]));
            }

            $mime = $this->detect($tmp, $originalName);
            $ext = self::TYPES[$mime] ?? throw AbilityException::invalid(__('Files of type :type are not allowed.', ['type' => $mime]));

            if (isset(self::ASSETS[$mime])) {
                if (filesize($tmp) > self::ASSETS[$mime] * 1024 * 1024) {
                    throw AbilityException::invalid(__('A .:ext file can be :size MB at most.', ['ext' => $ext, 'size' => self::ASSETS[$mime]]));
                }

                if (($problem = $this->unsafe($mime, $tmp)) !== null) {
                    throw AbilityException::invalid($problem);
                }
            } elseif ($mime === 'image/svg+xml') {
                file_put_contents($tmp, $this->svg->clean((string) file_get_contents($tmp)));
            } elseif (str_starts_with($mime, 'image/')) {
                if (! $this->images->dimensions($tmp)) {
                    throw AbilityException::invalid(__('This image could not be read.'));
                }

                // Remove EXIF (location, camera) by re-encoding photos.
                if ($mime === 'image/jpeg' && cms()->setting('media', 'strip_metadata', true)) {
                    $this->images->strip($tmp, 'jpg');
                }
            }

            $hash = hash_file('sha256', $tmp);
            $folder = $this->folder($folder);

            if ($existing = MediaItem::query()->where('hash', $hash)->where('folder', $folder)->first()) {
                return $existing;
            }

            $base = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) ?: 'file';
            $relative = 'media/'.date('Y/m').'/'.mb_substr($base, 0, 80).'-'.Str::lower(Str::random(4)).'.'.$ext;
            $target = Files::within(public_path(), $relative);

            Files::ensureDir(dirname($target));

            if (! @rename($tmp, $target) && ! @copy($tmp, $target)) {
                throw new AbilityException(__('Could not save the file.'));
            }

            @chmod($target, 0o644);
            [$width, $height] = $this->dimensions($target, $mime);

            $item = MediaItem::query()->create([
                'path' => $relative,
                'name' => Str::of(pathinfo($originalName, PATHINFO_FILENAME))->replace(['-', '_'], ' ')->squish()->limit(120, '')->ucfirst()->toString() ?: 'Untitled',
                'filename' => basename($relative),
                'mime' => $mime,
                'size' => filesize($target),
                'width' => $width,
                'height' => $height,
                'folder' => $folder,
                'hash' => $hash,
                'user_id' => $user?->getKey(),
            ]);

            try {
                $this->manifest()->locked(fn () => $this->manifest()->write($item));
            } catch (Throwable $e) {
                $item->delete();
                @unlink($target);

                throw new AbilityException($e->getMessage());
            }

            // Every way in (the admin, an ability, a URL import) adds a file the same way.
            cms()->hooks()->dispatch('media.uploaded', $item, $user);

            return $item;
        } finally {
            if (is_file($tmp)) {
                @unlink($tmp);
            }
        }
    }

    public function importUrl(string $url, ?User $user = null, string $folder = ''): MediaItem
    {
        try {
            $response = SafeFetcher::get($url, $this->maxBytes());
        } catch (Throwable $e) {
            throw AbilityException::invalid($e->getMessage());
        }

        $tmp = $this->tmp();
        file_put_contents($tmp, $response['body']);
        $name = basename((string) parse_url($response['url'], PHP_URL_PATH)) ?: 'download';

        return $this->store($tmp, $name, $user, $folder);
    }

    public function importBase64(string $filename, string $data, ?User $user = null, string $folder = ''): MediaItem
    {
        $data = preg_replace('#^data:[^;]+;base64,#', '', $data) ?? $data;
        $binary = base64_decode($data, true);

        if ($binary === false) {
            throw AbilityException::invalid(__('The data is not valid base64.'));
        }

        $tmp = $this->tmp();
        file_put_contents($tmp, $binary);

        return $this->store($tmp, $filename, $user, $folder);
    }

    public function update(MediaItem $item, array $attributes): MediaItem
    {
        $focalChanged = (isset($attributes['focal']['x']) && (int) $attributes['focal']['x'] !== $item->focal_x) || (isset($attributes['focal']['y']) && (int) $attributes['focal']['y'] !== $item->focal_y);

        $item->fill(array_filter([
            'name' => $attributes['name'] ?? null,
            'alt' => array_key_exists('alt', $attributes) ? (string) $attributes['alt'] : null,
            'caption' => array_key_exists('caption', $attributes) ? (string) $attributes['caption'] : null,
            'folder' => isset($attributes['folder']) ? $this->folder($attributes['folder']) : null,
            'focal_x' => isset($attributes['focal']['x']) ? max(0, min(100, (int) $attributes['focal']['x'])) : null,
            'focal_y' => isset($attributes['focal']['y']) ? max(0, min(100, (int) $attributes['focal']['y'])) : null,
        ], static fn ($v) => $v !== null));

        $this->manifest()->locked(function () use ($item) {
            $item->save();
            $this->manifest()->write($item);
        });

        if ($focalChanged) {
            $this->variants->forget($item);
        }

        cms()->hooks()->dispatch('media.updated', $item);

        return $item;
    }

    public function delete(MediaItem $item): void
    {
        $this->manifest()->locked(function () use ($item) {
            $this->variants->forget($item);
            @unlink(Files::within(public_path(), $item->path));
            $this->manifest()->forget($item->id);
            $item->delete();
        });

        cms()->hooks()->dispatch('media.deleted', $item);
    }

    public function detect(string $file, string $name): string
    {
        $mime = (string) (new \finfo(FILEINFO_MIME_TYPE))->file($file);
        $head = (string) file_get_contents($file, false, null, 0, 16);

        // Formats finfo has no name for, by the bytes they must start with. The file's name decides nothing.
        $asset = match (true) {
            str_starts_with($head, "glTF\x02\x00\x00\x00") => 'model/gltf-binary',
            str_starts_with($head, "\xABKTX 20\xBB\r\n\x1A\n") => 'image/ktx2',
            str_starts_with($head, "#?RADIANCE\n"), str_starts_with($head, "#?RGBE\n") => 'image/vnd.radiance',
            str_starts_with($head, 'RIVE') && $mime === 'application/octet-stream' => 'application/vnd.rive',
            default => null,
        };

        if ($asset !== null) {
            return $asset;
        }

        // JSON is allowed as the two things it is uploaded for: a glTF model and a Lottie animation.
        // A file too large to be either is not decoded to find out.
        if (in_array($mime, ['application/json', 'text/plain'], true) && str_starts_with(ltrim($head), '{') && ($json = $this->json($file)) !== null) {
            if (is_string($json['asset']['version'] ?? null) && array_intersect_key($json, ['scenes' => 1, 'nodes' => 1, 'meshes' => 1]) !== []) {
                return 'model/gltf+json';
            }

            if (self::lottie($json)) {
                return 'application/json';
            }
        }

        // SVGs are often reported as text; trust content, not the name.
        if (in_array($mime, ['text/plain', 'text/xml', 'application/xml', 'image/svg'], true) && preg_match('/<svg[\s>]/i', (string) file_get_contents($file, false, null, 0, 4096))) {
            return 'image/svg+xml';
        }

        // Office formats are zip containers; keep their real type when the name matches.
        if ($mime === 'application/zip' || $mime === 'application/octet-stream') {
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            $office = array_search($ext, self::TYPES, true);

            if ($office && str_starts_with((string) $office, 'application/vnd.openxmlformats')) {
                return (string) $office;
            }
        }

        if ($mime === 'text/plain' && strtolower(pathinfo($name, PATHINFO_EXTENSION)) === 'csv') {
            return 'text/csv';
        }

        return $mime;
    }

    /**
     * Why an asset can't be kept, or null. A player runs what an animation carries and fetches what it or a
     * model points at, so neither may carry code or name an address. The same for an upload and for a file
     * that arrived by git or FTP (MediaManifest).
     */
    public function unsafe(string $mime, string $file): ?string
    {
        if ($mime === 'model/gltf-binary') {
            // The model's description is the first chunk: its length, "JSON", then the JSON.
            $head = (string) file_get_contents($file, false, null, 12, 8);
            $length = strlen($head) === 8 ? (int) unpack('V', $head)[1] : 0;

            if (substr($head, 4) !== 'JSON' || $length < 2 || $length > self::DECODE) {
                return __('This .glb could not be read.');
            }

            $json = json_decode((string) file_get_contents($file, false, null, 20, $length), true, 64);

            return is_array($json) ? self::gltf($json) : __('This .glb could not be read.');
        }

        if (! in_array($mime, ['application/json', 'model/gltf+json'], true)) {
            return null;
        }

        $json = $this->json($file);

        if ($json === null) {
            return __('This file could not be read.');
        }

        if ($mime === 'model/gltf+json') {
            return self::gltf($json);
        }

        if (! self::lottie($json)) {
            return __('JSON files are kept when they are a Lottie animation or a glTF model. This one is neither.');
        }

        $problem = null;
        $walk = static function (array $node) use (&$walk, &$problem): void {
            foreach ($node as $key => $value) {
                if ($problem !== null) {
                    return;
                }

                // An expression: JavaScript the Lottie player evaluates.
                if ($key === 'x' && is_string($value) && trim($value) !== '') {
                    $problem = __('This Lottie animation has expressions, which run as code in the visitor’s browser. Export it without expressions.');
                } elseif ($key === 'fPath' && is_string($value) && trim($value) !== '') {
                    // Where a font comes from: the player adds it to the page as a stylesheet or a script.
                    $problem = __('This Lottie animation loads a font from an address. Export it with its text converted to shapes, or with fonts the page already has.');
                } elseif (in_array($key, ['u', 'p'], true) && is_string($value) && $value !== '' && ! str_starts_with($value, 'data:') && ! preg_match(self::LOCAL, $value)) {
                    $problem = __('This Lottie animation loads images from another server. Export it with its images embedded.');
                } elseif (is_array($value)) {
                    $walk($value);
                }
            }
        };
        $walk($json);

        return $problem;
    }

    /** A model's buffers and images are inside it, or it would look for files this library has renamed, or anywhere else. */
    private static function gltf(array $json): ?string
    {
        foreach ([...(array) ($json['buffers'] ?? []), ...(array) ($json['images'] ?? [])] as $part) {
            if (is_array($part) && isset($part['uri']) && ! (is_string($part['uri']) && str_starts_with($part['uri'], 'data:'))) {
                return __('This model points at other files, which it won’t find here. Export it as one .glb with everything inside.');
            }
        }

        return null;
    }

    private static function lottie(array $json): bool
    {
        return isset($json['v'], $json['w'], $json['h'], $json['fr']) && is_array($json['layers'] ?? null);
    }

    /** @var array{0: string, 1: ?array}|null the last file looked into, so detecting and checking decode it once */
    private ?array $decoded = null;

    /** A JSON file's contents, when it is small enough to look into and is an object. */
    private function json(string $file): ?array
    {
        $key = $file.':'.filesize($file).':'.filemtime($file);

        if (($this->decoded[0] ?? null) === $key) {
            return $this->decoded[1];
        }

        $json = filesize($file) <= self::DECODE ? json_decode((string) file_get_contents($file), true, 64) : null;
        $this->decoded = [$key, is_array($json) && ! array_is_list($json) ? $json : null];

        return $this->decoded[1];
    }

    /** @return array{0: ?int, 1: ?int} */
    private function dimensions(string $file, string $mime): array
    {
        if (isset(self::ASSETS[$mime])) {
            return [null, null];
        }

        if ($mime === 'image/svg+xml') {
            $svg = (string) file_get_contents($file, false, null, 0, 4096);

            if (preg_match('/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/i', $svg, $m)) {
                return [(int) round((float) $m[1]), (int) round((float) $m[2])];
            }

            return [null, null];
        }

        return str_starts_with($mime, 'image/') ? ($this->images->dimensions($file) ?? [null, null]) : [null, null];
    }

    private function folder(string $folder): string
    {
        $parts = array_filter(array_map(static fn ($p) => Str::slug($p), explode('/', $folder)));

        return implode('/', array_slice($parts, 0, 6));
    }

    private function tmp(): string
    {
        $dir = storage_path('app/uploads');

        Files::ensureDir($dir);

        return $dir.'/'.bin2hex(random_bytes(12));
    }
}
