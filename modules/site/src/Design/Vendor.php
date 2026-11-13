<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Support\Files;
use InvalidArgumentException;
use RuntimeException;

/**
 * Libraries a site's scripts import, kept with the site instead of bundled or loaded from somebody else's server:
 *
 *   cms vendor add gsap@3.12.5        →  content/design/vendor/gsap@3.12.5/index.js
 *                                         content/design/vendor/lock.json   (version, source, a hash per file)
 *   import gsap from "gsap"           ←  the page's import map: "gsap" => /_cms/site/vendor/gsap@3.12.5/index.js
 *
 * The build is jsDelivr's ES module of the package (`+esm`: one file, its own dependencies inside), or of one
 * file in it (`--file=examples/jsm/controls/OrbitControls.js`). Where that file imports another package, the
 * import becomes the package's name and the package is added too, so two libraries share one copy of a third.
 * The files are then the site's, in git with its content, and the site serves them itself. A build that would
 * still import from the CDN or any other address is refused, and a file that no longer matches its hash in the
 * lock is not published. What a library does once it runs, a request of its own included, is the library's.
 */
final class Vendor
{
    public const string CDN = 'https://cdn.jsdelivr.net';

    public const string REGISTRY = 'https://registry.npmjs.org';

    /** One file of a library. */
    public const int MAX_BYTES = 8_000_000;

    /** Files one `add` may bring, its dependencies' included. */
    private const int MAX_FILES = 40;

    private const string PACKAGE = '/^(@[a-z0-9][a-z0-9._-]{0,60}\/)?[a-z0-9][a-z0-9._-]{0,60}$/D';

    private const string VERSION = '/^\d{1,5}\.\d{1,5}\.\d{1,5}(-[0-9A-Za-z][0-9A-Za-z.-]{0,40})?$/D';

    /** Names a server may run instead of serve, wherever they sit in a file's name ("x.php.js"). */
    private const string RUNNABLE = '/\.(php\d?|phtml|phar|pl|py|cgi|sh|asp|aspx|jsp)(\.|\/|$)/i';

    /** A file inside a package: no segment starts with a dot, so none is "..". */
    private const string FILE = '/^[A-Za-z0-9_][A-Za-z0-9._-]{0,80}(\/[A-Za-z0-9_][A-Za-z0-9._-]{0,80}){0,8}\.m?js$/D';

    /** What a script writes after `from`: a package name, with or without a path. */
    private const string SPECIFIER = '/^(@[a-z0-9][a-z0-9._-]{0,60}\/)?[a-z0-9][a-z0-9._-]{0,60}(\/[A-Za-z0-9_][A-Za-z0-9._-]{0,80}){0,8}$/D';

    private ?array $lock = null;

    /** @var array<string, bool> file => published this request */
    private array $published = [];

    public function __construct(private readonly VendorFetcher $fetcher) {}

    public function path(string $relative = ''): string
    {
        return content_path('design/vendor'.($relative !== '' ? '/'.$relative : ''));
    }

    public function flush(): void
    {
        $this->lock = null;
        $this->published = [];
    }

    /**
     * lock.json: import name => what it is.
     *
     * @return array<string, array{package: string, version: string, file: ?string, source: string, path: string, files: array<string, string>, requires?: list<string>}>
     */
    public function all(): array
    {
        return $this->lock ??= self::locked(Files::readJson($this->path('lock.json')));
    }

    /**
     * What a lock.json holds, of this site or of a site, with only what it may hold: nothing in it is trusted to be a path.
     *
     * @return array<string, array{package: string, version: string, file: ?string, source: string, path: string, files: array<string, string>, requires: list<string>}>
     */
    public static function locked(array $json): array
    {
        $out = [];

        foreach ((array) ($json['imports'] ?? []) as $specifier => $entry) {
            if (! is_string($specifier) || ! preg_match(self::SPECIFIER, $specifier) || ! is_array($entry)
                || ! preg_match(self::PACKAGE, (string) ($entry['package'] ?? '')) || ! preg_match(self::VERSION, (string) ($entry['version'] ?? ''))
                || (isset($entry['file']) && ! preg_match(self::FILE, (string) $entry['file']))) {
                continue;
            }

            $path = self::local($entry['package'], $entry['version'], $entry['file'] ?? null);
            $files = array_filter((array) ($entry['files'] ?? []), static fn ($hash, $file) => is_string($file) && self::isLocal($file) && is_string($hash) && preg_match('/^sha384-[A-Za-z0-9+\/]{64}$/D', $hash), ARRAY_FILTER_USE_BOTH);

            if (isset($files[$path])) {
                $out[$specifier] = [
                    'package' => $entry['package'], 'version' => $entry['version'], 'file' => $entry['file'] ?? null,
                    'source' => self::source($entry['package'], $entry['version'], $entry['file'] ?? null), 'path' => $path, 'files' => $files,
                    'requires' => array_values(array_filter((array) ($entry['requires'] ?? []), static fn ($name) => is_string($name) && preg_match(self::PACKAGE, $name))),
                ];
            }
        }

        ksort($out);

        return $out;
    }

    /**
     * Fetch a package at one version and lock it.
     *
     * @param  string  $spec  "gsap@3.12.5", "@scope/name@1.0.0"
     * @param  ?string  $file  a file inside the package instead of its main entry
     * @param  ?string  $as  the name scripts import it by; the package's name (and the file's path) otherwise
     * @return array{specifier: string, version: string, added: list<string>, notes: list<string>}
     */
    public function add(string $spec, ?string $file = null, ?string $as = null): array
    {
        $at = strrpos($spec, '@');
        [$package, $version] = $at > 0 ? [substr($spec, 0, $at), substr($spec, $at + 1)] : [$spec, ''];

        if (! preg_match(self::PACKAGE, $package)) {
            throw new InvalidArgumentException(__('“:name” is not the name of an npm package.', ['name' => $package]));
        }

        if (! preg_match(self::VERSION, $version)) {
            throw new InvalidArgumentException(__('Name one exact version, like :example. A range would give a different library on another day.', ['example' => $package.'@1.2.3']));
        }

        $file = $file !== null && $file !== '' ? (str_starts_with($file, './') ? substr($file, 2) : $file) : null;

        if (preg_match(self::RUNNABLE, $package.'/'.(string) $file.'/'.(string) $as)) {
            throw new InvalidArgumentException(__('“:name” has the name of something a server runs.', ['name' => trim($package.'/'.(string) $file, '/')]));
        }

        if ($file !== null && ! preg_match(self::FILE, $file)) {
            throw new InvalidArgumentException(__('“:file” is not a .js or .mjs file inside a package.', ['file' => $file]));
        }

        $specifier = $as !== null && $as !== '' ? $as : ($file === null ? $package : $package.'/'.$file);

        if (! preg_match(self::SPECIFIER, $specifier)) {
            throw new InvalidArgumentException(__('“:name” can’t be imported: use a package name, with or without a path.', ['name' => $specifier]));
        }

        $lock = $this->all();
        $notes = [];
        $added = [];
        $budget = self::MAX_FILES;
        $this->fetch($specifier, $package, $version, $file, $lock, $added, $notes, $budget);
        $this->save($lock);

        return ['specifier' => $specifier, 'version' => $version, 'added' => $added, 'notes' => $notes];
    }

    public function remove(string $specifier): void
    {
        $this->removable($specifier);

        $lock = $this->all();
        unset($lock[$specifier]);
        $this->save($lock);
    }

    /**
     * The import a removal is for and the files that go with it (those no other import keeps), refused when
     * nothing is imported by that name or another import needs it. What remove() starts with.
     *
     * @return array{package: string, version: string, files: list<string>}
     */
    public function removable(string $specifier): array
    {
        $lock = $this->all();

        if (! isset($lock[$specifier])) {
            throw new InvalidArgumentException(__('Nothing is imported as “:name”.', ['name' => $specifier]));
        }

        $kept = [];

        foreach ($lock as $other => $entry) {
            if ($other === $specifier) {
                continue;
            }

            if (in_array($lock[$specifier]['package'], $entry['requires'] ?? [], true) && $lock[$specifier]['file'] === null) {
                throw new InvalidArgumentException(__('“:other” imports “:name”. Remove that first.', ['other' => $other, 'name' => $specifier]));
            }

            $kept += $entry['files'];
        }

        return [
            'package' => $lock[$specifier]['package'],
            'version' => $lock[$specifier]['version'],
            'files' => array_keys(array_diff_key($lock[$specifier]['files'], $kept)),
        ];
    }

    /**
     * Move an import to another version: the one named, or the newest the registry knows.
     *
     * @return array{specifier: string, version: string, added: list<string>, notes: list<string>}
     */
    public function update(string $specifier, ?string $version = null): array
    {
        $entry = $this->all()[$specifier] ?? throw new InvalidArgumentException(__('Nothing is imported as “:name”.', ['name' => $specifier]));

        if ($version === null || $version === '') {
            $latest = json_decode($this->fetcher->get(self::REGISTRY.'/'.str_replace('/', '%2F', $entry['package']).'/latest'), true);
            $version = is_array($latest) ? (string) ($latest['version'] ?? '') : '';
        }

        return $this->add($entry['package'].'@'.$version, $entry['file'], $specifier);
    }

    /**
     * Take in libraries another lock names (a site's), from the folder that holds their files: each file is
     * checked against its hash before it is kept, and the lock gets the entries. An import this site already
     * has is replaced by the one given.
     *
     * @param  array<string, array>  $entries  import name => entry, as locked() gives them
     */
    public function adopt(array $entries, string $from): void
    {
        $lock = $this->all();

        foreach ($entries as $specifier => $entry) {
            foreach ($entry['files'] as $file => $hash) {
                $contents = is_file($source = Files::within($from, $file)) && ! is_link($source) ? (string) file_get_contents($source) : '';

                if (! hash_equals($hash, self::hash($contents))) {
                    throw new RuntimeException(__('The library “:name” is not what its lock.json says.', ['name' => $specifier]));
                }

                Files::put(Files::within($this->path(), $file), $contents);
            }

            $lock[$specifier] = $entry;
        }

        $this->save($lock);
    }

    /**
     * What the import map needs: each import's published URL, and each published file's hash.
     * A file that is missing or isn't what the lock says is left out, with a warning for the build.
     *
     * @return array{imports: array<string, string>, integrity: array<string, string>}
     */
    public function map(): array
    {
        $imports = $integrity = [];

        foreach ($this->all() as $specifier => $entry) {
            $ok = true;

            foreach ($entry['files'] as $file => $hash) {
                $ok = $this->publish($file, $hash) && $ok;
            }

            if (! $ok) {
                cms()->hooks()->dispatch('render.warning', __('The library “:name” in content/design/vendor is missing or not what lock.json says. Run `cms vendor add :spec` again.', ['name' => $specifier, 'spec' => $entry['package'].'@'.$entry['version']]));

                continue;
            }

            $imports[$specifier] = '/_cms/site/vendor/'.$entry['path'];

            foreach ($entry['files'] as $file => $hash) {
                $integrity['/_cms/site/vendor/'.$file] = $hash;
            }
        }

        ksort($integrity);

        return ['imports' => $imports, 'integrity' => $integrity];
    }

    /** Cheap to ask on every request (see Code::stamp). */
    public function stamp(): string
    {
        return is_file($lock = $this->path('lock.json')) ? filesize($lock).':'.filemtime($lock) : '';
    }

    public static function hash(string $contents): string
    {
        return 'sha384-'.base64_encode(hash('sha384', $contents, true));
    }

    private function fetch(string $specifier, string $package, string $version, ?string $file, array &$lock, array &$added, array &$notes, int &$budget): void
    {
        $files = [];
        $requires = [];
        $queue = [[$package, $version, $file]];

        while ($queue !== []) {
            [$p, $v, $f] = array_shift($queue);
            $local = self::local($p, $v, $f);

            if (isset($files[$local])) {
                continue;
            }

            if (--$budget < 0) {
                throw new RuntimeException(__('“:name” brings more than :count files. Add the parts you need one by one with --file.', ['name' => $specifier, 'count' => self::MAX_FILES]));
            }

            $source = $this->fetcher->get(self::source($p, $v, $f));

            if (strlen($source) > self::MAX_BYTES || trim($source) === '' || str_starts_with(ltrim($source), '<')) {
                throw new RuntimeException(__(':url is not a JavaScript module this site can keep.', ['url' => self::source($p, $v, $f)]));
            }

            // What the CDN's build imports from the CDN: "/npm/three@0.160.0/+esm", "/npm/x@1.0.0/dist/y.js/+esm".
            $source = (string) preg_replace_callback('#(["\'])/npm/((?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*)@([0-9A-Za-z.-]+)(?:/([A-Za-z0-9_./-]+?))?/\+esm\1#', function (array $m) use (&$queue, &$requires, $local) {
                [$name, $at, $inner] = [$m[2], $m[3], ($m[4] ?? '') !== '' ? $m[4] : null];

                if (! preg_match(self::VERSION, $at) || ($inner !== null && (! preg_match(self::FILE, $inner) || preg_match(self::RUNNABLE, $name.'/'.$inner)))) {
                    throw new RuntimeException(__('The build imports :what, which this site can’t keep.', ['what' => $m[0]]));
                }

                if ($inner === null) {
                    // A whole package: by its name, so everything that imports it shares one copy.
                    $requires[$name] = $at;

                    return $m[1].$name.$m[1];
                }

                $queue[] = [$name, $at, $inner];

                return $m[1].self::relative($local, self::local($name, $at, $inner)).$m[1];
            }, $source);

            $source = rtrim((string) preg_replace('#^\s*//[\#@]\s*sourceMappingURL=.*$#m', '', $source))."\n";

            // Whatever is still imported by an address (the CDN's own /npm/, /gh/ or /sm/ paths, another server)
            // would be fetched from the visitor's browser: the build is not kept.
            if (preg_match('#(?:\bfrom\s*|\bimport\s*\(?\s*)["\']\s*((?:[a-z][a-z0-9+.-]*:|/)[^"\']*)["\']#i', $source, $m)) {
                throw new RuntimeException(__('The build of “:name” imports :what, an address and not a file this site keeps.', ['name' => $specifier, 'what' => $m[1]]));
            }

            Files::put(Files::within($this->path(), $local), $source);
            $files[$local] = self::hash($source);
        }

        $lock[$specifier] = [
            'package' => $package, 'version' => $version, 'file' => $file, 'source' => self::source($package, $version, $file),
            'path' => self::local($package, $version, $file), 'files' => $files, 'requires' => array_keys($requires),
        ];
        $added[] = $specifier;

        foreach ($requires as $name => $at) {
            if (! isset($lock[$name])) {
                $this->fetch($name, $name, $at, null, $lock, $added, $notes, $budget);
            } elseif ($lock[$name]['version'] !== $at) {
                $notes[] = __('“:name” was built with :package :wanted and will run with the :package :have this site has.', ['name' => $specifier, 'package' => $name, 'wanted' => $at, 'have' => $lock[$name]['version']]);
            }
        }
    }

    /** Write the lock, and take away the files nothing in it names any more. */
    private function save(array $lock): void
    {
        ksort($lock);
        $keep = array_merge([], ...array_map(static fn (array $entry) => array_keys($entry['files']), array_values($lock)));
        self::prune($this->path(), [...$keep, 'lock.json']);

        // And what was published of them, so a removed library is not left reachable.
        self::prune(public_path('_cms/site/vendor'), $keep);

        if ($lock === []) {
            @unlink($this->path('lock.json'));
            @rmdir($this->path());
        } else {
            Files::putJson($this->path('lock.json'), ['imports' => array_map(static fn (array $entry) => array_filter($entry, static fn ($v) => $v !== null && $v !== []), $lock)]);
        }

        $this->flush();
    }

    /** Delete every file under $root that isn't in $keep (paths relative to it), and the folders that leaves empty. */
    private static function prune(string $root, array $keep): void
    {
        if (! is_dir($root)) {
            return;
        }

        $all = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($root, \FilesystemIterator::SKIP_DOTS), \RecursiveIteratorIterator::CHILD_FIRST);

        foreach ($all as $item) {
            if ($item->isDir() && ! $item->isLink()) {
                @rmdir((string) $item); // only when empty
            } elseif (! in_array(str_replace('\\', '/', substr((string) $item, strlen($root) + 1)), $keep, true)) {
                @unlink((string) $item);
            }
        }

        @rmdir($root);
    }

    /** Copy a file to public/_cms/site/vendor when it isn't there as the lock describes it. */
    private function publish(string $file, string $hash): bool
    {
        if (isset($this->published[$file])) {
            return $this->published[$file];
        }

        $source = Files::within($this->path(), $file);
        $target = Files::within(public_path('_cms/site/vendor'), $file);

        if (! is_file($source) || is_link($source)) {
            @unlink($target);

            return $this->published[$file] = false;
        }

        if (is_file($target) && filesize($target) === filesize($source) && filemtime($target) >= filemtime($source)) {
            return $this->published[$file] = true;
        }

        $contents = (string) file_get_contents($source);

        if (! hash_equals($hash, self::hash($contents))) {
            @unlink($target);

            return $this->published[$file] = false;
        }

        Files::put($target, $contents);

        return $this->published[$file] = true;
    }

    private static function source(string $package, string $version, ?string $file): string
    {
        return self::CDN.'/npm/'.$package.'@'.$version.($file !== null ? '/'.$file : '').'/+esm';
    }

    /** Where a build is kept under content/design/vendor, and published under /_cms/site/vendor. */
    private static function local(string $package, string $version, ?string $file): string
    {
        // Always .js: every server knows what to send for it.
        return $package.'@'.$version.'/'.($file === null ? 'index.js' : (string) preg_replace('/\.mjs$/', '.js', $file));
    }

    private static function isLocal(string $path): bool
    {
        return preg_match('#^((?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*)@([0-9A-Za-z.-]+)/(.+)$#D', $path, $m) === 1
            && preg_match(self::VERSION, $m[2]) === 1 && preg_match(self::FILE, $m[3]) === 1 && str_ends_with($m[3], '.js') && preg_match(self::RUNNABLE, $path) !== 1;
    }

    /** "../three@0.160.0/x.js": from one kept file to another. */
    private static function relative(string $from, string $to): string
    {
        return str_repeat('../', substr_count($from, '/')).$to;
    }
}
