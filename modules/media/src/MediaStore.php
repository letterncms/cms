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
        'text/plain' => 'txt', 'text/csv' => 'csv', 'text/markdown' => 'md',
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

            [$mime, $ext] = $this->admit($tmp, $originalName);

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

    /**
     * What every file passes before it is kept, new or in another's place: not empty, within the limits, of a
     * type the library takes, safe, and cleaned where that is how it is made safe (SVG, a photo's metadata).
     *
     * @return array{0: string, 1: string} its MIME type and the extension it is stored with
     */
    private function admit(string $tmp, string $originalName): array
    {
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

        return [$mime, $ext];
    }

    public function importUrl(string $url, ?User $user = null, string $folder = ''): MediaItem
    {
        return $this->store(...[...$this->fetched($url), $user, $folder]);
    }

    public function importBase64(string $filename, string $data, ?User $user = null, string $folder = ''): MediaItem
    {
        return $this->store($this->decoded($data), $filename, $user, $folder);
    }

    /**
     * A file from a public URL, in a temp file.
     *
     * @return array{0: string, 1: string} the temp file and the name it came with
     */
    public function fetched(string $url): array
    {
        try {
            $response = SafeFetcher::get($url, $this->maxBytes());
        } catch (Throwable $e) {
            throw AbilityException::invalid($e->getMessage());
        }

        $tmp = $this->tmp();
        file_put_contents($tmp, $response['body']);

        return [$tmp, basename((string) parse_url($response['url'], PHP_URL_PATH)) ?: 'download'];
    }

    /** Base64 data (a data: URL too), in a temp file. */
    public function decoded(string $data): string
    {
        $data = preg_replace('#^data:[^;]+;base64,#', '', $data) ?? $data;
        $binary = base64_decode($data, true);

        if ($binary === false) {
            throw AbilityException::invalid(__('The data is not valid base64.'));
        }

        $tmp = $this->tmp();
        file_put_contents($tmp, $binary);

        return $tmp;
    }

    /**
     * Put another file in an item's place. The item stays what it was to everything that uses it: its id, name,
     * alt text, caption, focal point and folder. Its address changes: files are served to be kept for a year
     * by their address, so new bytes at the old one would not reach anyone who has seen it. What names the
     * file by its id follows by itself; what names it by its address is rewritten (MediaReferences::repoint).
     * Variants are made again from the new pixels. The temp file is moved or removed.
     */
    public function replace(MediaItem $item, string $tmp, string $originalName): MediaItem
    {
        try {
            $this->protect();
            ['mime' => $mime, 'ext' => $ext, 'hash' => $hash] = $this->replacing($item, $tmp, $originalName);

            if ($hash === $item->hash) {
                return $item;
            }

            $old = $item->path;
            $relative = $this->readdressed($old, $ext);
            $target = Files::within(public_path(), $relative);

            Files::ensureDir(dirname($target));

            if (! @rename($tmp, $target) && ! @copy($tmp, $target)) {
                throw new AbilityException(__('Could not save the file.'));
            }

            @chmod($target, 0o644);
            clearstatcache(true, $target);
            $this->variants->forget($item);
            [$width, $height] = $this->dimensions($target, $mime);
            $item->fill(['path' => $relative, 'filename' => basename($relative), 'mime' => $mime, 'size' => filesize($target), 'width' => $width, 'height' => $height, 'hash' => $hash]);
            $this->saved($item);
            @unlink(Files::within(public_path(), $old));
            app(MediaReferences::class)->repoint($old, $relative);

            return $item;
        } finally {
            if (is_file($tmp)) {
                @unlink($tmp);
            }
        }
    }

    /**
     * Whether a file may take an item's place, or why not: it passes what every upload passes and is of the
     * item's kind. Changes nothing but the temp file, which a check may clean (an SVG). replace() asks the same.
     *
     * @return array{mime: string, ext: string, hash: string}
     */
    public function replacing(MediaItem $item, string $tmp, string $originalName): array
    {
        [$mime, $ext] = $this->admit($tmp, $originalName);

        if ((new MediaItem(['mime' => $mime]))->kind() !== $item->kind()) {
            throw AbilityException::invalid(__('Replace a file with one of its kind: an image with an image, a video with a video.'));
        }

        return ['mime' => $mime, 'ext' => $ext, 'hash' => (string) hash_file('sha256', $tmp)];
    }

    /** Another address for a file whose bytes change: where it was, by the name it had, with a new suffix. */
    private function readdressed(string $path, string $ext): string
    {
        return dirname($path).'/'.(preg_replace('/-[a-z0-9]{4}$/', '', pathinfo($path, PATHINFO_FILENAME)) ?: 'file').'-'.Str::lower(Str::random(4)).'.'.$ext;
    }

    /**
     * Turn a picture by quarter turns (clockwise) and cut it to a rectangle (in pixels of the turned picture):
     * the same item with new pixels, at a new address like every file whose bytes change (see replace()).
     * The focal point stays on what it marked.
     *
     * @param  array{x: int, y: int, width: int, height: int}|null  $crop
     */
    public function transform(MediaItem $item, int $rotate = 0, ?array $crop = null): MediaItem
    {
        [$format, $size, $crop] = $this->transforming($item, $rotate, $crop);
        $file = Files::within(public_path(), $item->path);
        [$fx, $fy] = match ($rotate) {
            90 => [100 - $item->focal_y, $item->focal_x],
            180 => [100 - $item->focal_x, 100 - $item->focal_y],
            270 => [$item->focal_y, 100 - $item->focal_x],
            default => [$item->focal_x, $item->focal_y],
        };

        // Measured before the file is written over.
        [$w, $h] = $this->standing($item, $rotate);

        try {
            $this->images->edit($file, $format, $rotate, $crop);
        } catch (Throwable $e) {
            throw AbilityException::invalid($e->getMessage());
        }

        if ($crop !== null) {
            $fx = (int) round(max(0, min(100, ($fx / 100 * $w - $crop['x']) / $crop['width'] * 100)));
            $fy = (int) round(max(0, min(100, ($fy / 100 * $h - $crop['y']) / $crop['height'] * 100)));
        }

        $old = $item->path;
        $relative = $this->readdressed($old, pathinfo($old, PATHINFO_EXTENSION));
        $moved = Files::within(public_path(), $relative);

        if (! @rename($file, $moved)) {
            throw new AbilityException(__('Could not save the file.'));
        }

        clearstatcache(true, $moved);
        $this->variants->forget($item);
        // The size is read back: a photo that was stored turned (EXIF) is written upright.
        $size = $this->images->dimensions($moved) ?? $size;
        $item->fill(['path' => $relative, 'filename' => basename($relative), 'size' => filesize($moved), 'width' => $size[0], 'height' => $size[1], 'hash' => (string) hash_file('sha256', $moved), 'focal_x' => $fx, 'focal_y' => $fy]);
        $this->saved($item);
        app(MediaReferences::class)->repoint($old, $relative);

        return $item;
    }

    /**
     * What a transform would do, or why it can't: the format it is written in, the size it ends at and the
     * rectangle that is cut, held inside the picture.
     *
     * @param  array{x: int, y: int, width: int, height: int}|null  $crop
     * @return array{0: string, 1: array{0: int, 1: int}, 2: ?array{x: int, y: int, width: int, height: int}}
     */
    public function transforming(MediaItem $item, int $rotate = 0, ?array $crop = null): array
    {
        $format = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$item->mime] ?? null;

        if ($format === null || ! $item->width || ! $item->height) {
            throw AbilityException::invalid(__('Only JPEG, PNG and WebP images can be rotated and cropped.'));
        }

        if (! in_array($rotate, [0, 90, 180, 270], true) || ($rotate === 0 && $crop === null)) {
            throw AbilityException::invalid(__('Give a rotation of 90, 180 or 270 degrees, a crop, or both.'));
        }

        [$w, $h] = $this->standing($item, $rotate);

        if ($crop !== null) {
            $x = max(0, min($w - 1, (int) ($crop['x'] ?? 0)));
            $y = max(0, min($h - 1, (int) ($crop['y'] ?? 0)));
            $crop = ['x' => $x, 'y' => $y, 'width' => max(1, min($w - $x, (int) ($crop['width'] ?? $w))), 'height' => max(1, min($h - $y, (int) ($crop['height'] ?? $h)))];
            [$w, $h] = [$crop['width'], $crop['height']];
        }

        return [$format, [$w, $h], $crop];
    }

    /**
     * A picture's size as it stands after a turn: upright first (a JPEG kept with its metadata may lie on its
     * side in the file and be turned by its EXIF orientation, which is how it is shown and how it is edited),
     * then turned. A crop and the focal point are measured against this, not against the stored numbers.
     *
     * @return array{0: int, 1: int}
     */
    private function standing(MediaItem $item, int $rotate): array
    {
        [$w, $h] = $this->images->upright(Files::within(public_path(), $item->path)) ?? [(int) $item->width, (int) $item->height];

        return $rotate === 90 || $rotate === 270 ? [$h, $w] : [$w, $h];
    }

    /** An item whose file changed: saved, written to its record, and said to whoever listens. */
    private function saved(MediaItem $item): void
    {
        $this->manifest()->locked(function () use ($item) {
            $item->save();
            $this->manifest()->write($item);
        });

        cms()->hooks()->dispatch('media.updated', $item);
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

        // Plain text is told apart by what it is called: a table, or Markdown.
        if (in_array($mime, ['text/plain', 'text/markdown', 'text/x-markdown'], true)) {
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

            if ($ext === 'csv' && $mime === 'text/plain') {
                return 'text/csv';
            }

            if (in_array($ext, ['md', 'markdown'], true) || $mime !== 'text/plain') {
                return 'text/markdown';
            }
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

    /** How deep folders go. */
    public const int FOLDER_DEPTH = 6;

    /**
     * A folder's path as it is stored: each part a slug; '' is no folder. A name in Latin letters is the slug it
     * always was (`Press Kit` is `press-kit`, `Café` is `cafe`); a name in another script keeps its letters
     * (`写真`, `пресса`), lowercased, with a hyphen for whatever is not a letter or a digit. Deeper than six is
     * refused, not cut: a file would land in a folder nobody named.
     */
    public function folder(string $folder): string
    {
        $parts = array_values(array_filter(array_map(self::folderPart(...), explode('/', $folder)), static fn (string $part) => $part !== ''));

        if (count($parts) > self::FOLDER_DEPTH) {
            throw AbilityException::invalid(__('Folders go :count deep at most.', ['count' => self::FOLDER_DEPTH]), ['folder' => __('Folders go :count deep at most.', ['count' => self::FOLDER_DEPTH])]);
        }

        return implode('/', $parts);
    }

    private static function folderPart(string $name): string
    {
        $name = trim($name);

        if ($name === '' || preg_match('/^[\p{Latin}\p{N}\p{P}\p{Z}\p{S}]+$/u', $name)) {
            return Str::slug($name);
        }

        return mb_substr(trim((string) preg_replace('/[^\p{L}\p{M}\p{N}]+/u', '-', mb_strtolower($name)), '-'), 0, 80);
    }

    /** The file the admin's upload endpoint parked under a token (MediaController::upload), or a refusal. */
    public static function uploaded(string $token): string
    {
        $file = storage_path('app/uploads/'.$token);

        if (! preg_match('/^[0-9a-f]{24}$/', $token) || ! is_file($file)) {
            throw AbilityException::invalid(__('No file was uploaded.'));
        }

        return $file;
    }

    private function tmp(): string
    {
        $dir = storage_path('app/uploads');

        Files::ensureDir($dir);

        return $dir.'/'.bin2hex(random_bytes(12));
    }
}
