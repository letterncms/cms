<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Http;

use Cms\Cms;
use Cms\Modules\Blocks\Embeds;
use Cms\Support\Files;

/**
 * The Content-Security-Policy of the public pages, when the site turns it on (Settings → General → Security):
 * what a page may load and run is this site, what the CMS and its plugins put in a page's head and foot,
 * and the hosts the site lists. Markup that got into a page's content some other way runs nothing.
 *
 *   default-src 'self'
 *   script-src  'self' 'wasm-unsafe-eval', a hash for each inline script of a head or a foot (the import
 *               map, the saved theme, a plugin's snippet), the hosts of the scripts they load, listed hosts
 *   style-src   'self' 'unsafe-inline' (a page carries its blocks' styles; a style runs nothing)
 *   img-src, media-src, font-src, connect-src, frame-src: this site (the media library is part of it), data
 *               a page carries, the providers the Embed and Video blocks know, listed hosts
 *
 * Static pages get it from a block the CMS keeps in public/.htaccess, one policy for the whole site: the
 * hashes of every page built. Pages PHP answers get it as a header. The admin, the builder's canvas and
 * previews are not public pages and are never touched.
 */
final class ContentPolicy
{
    private const string BEGIN = '# BEGIN cms';

    private const string END = '# END cms';

    /** More inline scripts than this are not one site's snippets but one per page: those belong in a file. */
    private const int MOST = 120;

    /** @var array{script: array<string, true>, hosts: array<string, array<string, true>>} what the pages rendered in this process carry */
    private array $seen = ['script' => [], 'hosts' => []];

    /** Was a public page rendered for this request, and none for the editor or a preview? */
    private ?bool $public = null;

    public function __construct(private readonly Cms $cms) {}

    public function enabled(): bool
    {
        return (bool) $this->cms->setting('site', 'csp', false);
    }

    /** A host as a policy names it: `example.com`, `*.example.com`, with `https://` or a port when given. */
    public static function host(mixed $host): ?string
    {
        $host = is_string($host) ? strtolower(trim($host)) : '';
        $host = (string) preg_replace('#^(https://[^/]+)/.*$#', '$1', $host);

        return preg_match('#^(?:https://|wss://)?(?:\*\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+(?::\d{1,5})?$#D', $host) ? $host : null;
    }

    /**
     * What the head and foot of a page run and load: the hash of each inline script, and the host of each
     * script and stylesheet from elsewhere. Only these fragments are read: code wrote them. The body is
     * content, and nothing in it is trusted.
     *
     * @param  list<string>  $fragments
     * @return array{script: list<string>, hosts: array<string, list<string>>}
     */
    public static function read(array $fragments): array
    {
        $found = ['script' => [], 'hosts' => ['script' => [], 'style' => []]];

        foreach ($fragments as $fragment) {
            if (! is_string($fragment) || ! str_contains($fragment, '<')) {
                continue;
            }

            preg_match_all('#<script\b([^>]*)>(.*?)</script\s*>#is', $fragment, $scripts, PREG_SET_ORDER);

            foreach ($scripts as [, $attributes, $body]) {
                // An attribute by its own name: `data-src` and `data-type` are not `src` and `type`.
                if (preg_match('#(?<![\w-])src\s*=\s*["\']?(https://[^/"\'\s>]+)#i', $attributes, $src)) {
                    ($host = self::host($src[1])) !== null && $found['hosts']['script'][] = $host;
                } elseif (! preg_match('#(?<![\w-])src\s*=#i', $attributes) && $body !== '' && (
                    ! preg_match('#(?<![\w-])type\s*=\s*["\']?(?!module|importmap|text/javascript|application/javascript)[a-z]#i', $attributes)
                    // A script waiting for consent (text/plain with data-cms-consent) runs as itself once given: named now.
                    || preg_match('#(?<![\w-])data-cms-consent\s*=#i', $attributes)
                )) {
                    // Data a script reads (JSON-LD, a template) runs nothing and needs no hash.
                    $found['script'][] = "'sha256-".base64_encode(hash('sha256', $body, true))."'";
                }
            }

            preg_match_all('#<link\b[^>]*\brel\s*=\s*["\']?stylesheet\b[^>]*>#i', $fragment, $links);

            foreach ($links[0] as $link) {
                if (preg_match('#\bhref\s*=\s*["\']?(https://[^/"\'\s>]+)#i', $link, $href) && ($host = self::host($href[1])) !== null) {
                    $found['hosts']['style'][] = $host;
                }
            }
        }

        return $found;
    }

    /** A page was rendered: what its head and foot carry counts for the site's policy and for this request's. */
    public function rendered(array $fragments, bool $public): void
    {
        $this->public = $public && $this->public !== false;

        if (! $public) {
            return;
        }

        $found = self::read($fragments);
        $this->seen['script'] += array_fill_keys($found['script'], true);

        foreach ($found['hosts'] as $kind => $hosts) {
            $this->seen['hosts'][$kind] = ($this->seen['hosts'][$kind] ?? []) + array_fill_keys($hosts, true);
        }
    }

    /**
     * An address a page loads from that code made, not content: an image's (`img`) or a video file's (`media`),
     * from outside the site or through a CDN (the `site.policy.source` hook, which Images and Embeds call).
     */
    public function source(string $kind, mixed $url): void
    {
        if (in_array($kind, ['img', 'media'], true) && is_string($url) && preg_match('#^https://[^/"\'\s>]+#i', $url, $m) && ($host = self::host($m[0])) !== null) {
            $this->seen['hosts'][$kind][$host] = true;
        }
    }

    /**
     * A request starts, and ends, with nothing rendered: what a page answered by PHP carried is that answer's,
     * never the built site's, which only a build says.
     */
    public function begin(): void
    {
        $this->public = null;
        $this->seen = ['script' => [], 'hosts' => []];
    }

    /** The header for the answer to this request: null when the policy is off or no public page was rendered for it. */
    public function forResponse(): ?string
    {
        return $this->enabled() && $this->public === true && $this->complete() ? $this->value($this->merged($this->stored(), '')) : null;
    }

    /** The header's name: the policy itself, or only reported while a site tries it (`csp_report_only`). */
    public function header(): string
    {
        return $this->cms->setting('site', 'csp_report_only', false) ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    }

    /**
     * Whether the policy knows every page: after a full build. A site that builds no files renders each page for
     * its request, and the request's own scripts are in its header.
     */
    private function complete(): bool
    {
        return ! $this->cms->setting('site', 'static', true) || ! empty($this->stored()['complete']);
    }

    /**
     * Keep what the pages built so far carry and bring public/.htaccess up to date. After a full build
     * ($finished is its generation) what no page carries any more leaves the policy.
     */
    public function publish(?string $generation = null, ?string $finished = null): void
    {
        $state = $this->merged($this->stored(), $generation ?? '');

        if ($finished !== null) {
            $state['script'] = array_filter($state['script'], static fn ($stamp) => $stamp === $finished);
            $state['hosts'] = array_map(static fn (array $hosts) => array_filter($hosts, static fn ($stamp) => $stamp === $finished), $state['hosts']);
            $state['full'] = $finished;
            $state['complete'] = true;
        }

        if (count($state['script']) > self::MOST) {
            $this->cms->hooks()->dispatch('render.warning', __('The pages carry more than :count different inline scripts: put what changes per page in an attribute and the script in a file, or the security policy cannot name them.', ['count' => self::MOST]));
            // What the pages just built carry and what the last full build saw stay; what single pages added since
            // goes first. The import map and a live page's scripts are never the ones dropped.
            $keep = array_intersect_key($state['script'], $this->seen['script']) + array_filter($state['script'], static fn ($stamp) => $stamp !== '' && $stamp === ($state['full'] ?? null));
            $state['script'] = $keep + array_slice(array_diff_key($state['script'], $keep), 0, max(0, self::MOST - count($keep)), true);
            ksort($state['script']);
        }

        if ($state !== $this->stored()) {
            Files::putJson(storage_path('build/policy.json'), $state);
        }

        $this->seen = ['script' => [], 'hosts' => []];
        // Only a policy that knows every page goes out: until the first full build, none (and nosniff alone).
        $this->write($this->enabled() && ($finished !== null || ! empty($state['complete']) || ! $this->cms->setting('site', 'static', true)) ? $this->value($state) : null);
    }

    /** @return array{script: array<string, string>, hosts: array<string, array<string, string>>} each with the build that last saw it */
    private function stored(): array
    {
        $state = is_file($file = storage_path('build/policy.json')) ? json_decode((string) file_get_contents($file), true) : null;

        return ['script' => (array) ($state['script'] ?? []), 'hosts' => array_map(static fn ($hosts) => (array) $hosts, (array) ($state['hosts'] ?? [])), ...(isset($state['full']) ? ['full' => (string) $state['full'], 'complete' => true] : [])];
    }

    /** What is stored with what this process saw: stamped with the full build that saw it, or ('') as it was. */
    private function merged(array $state, string $generation): array
    {
        foreach (array_keys($this->seen['script']) as $hash) {
            $state['script'][$hash] = $generation !== '' ? $generation : ($state['script'][$hash] ?? '');
        }

        foreach ($this->seen['hosts'] as $kind => $hosts) {
            foreach (array_keys($hosts) as $host) {
                $state['hosts'][$kind][$host] = $generation !== '' ? $generation : ($state['hosts'][$kind][$host] ?? '');
            }
        }

        ksort($state['script']);
        ksort($state['hosts']);
        array_walk($state['hosts'], static function (array &$hosts): void {
            ksort($hosts);
        });

        return $state;
    }

    /**
     * Where frames on the site's pages may come from: the embeds the core knows, the hosts the site lists and what
     * plugins add to `site.policy`. The admin's own policy takes these too, so the canvas shows what the site shows.
     *
     * @return list<string>
     */
    public function frames(): array
    {
        return $this->sources($this->directives($this->stored())['frame-src'] ?? []);
    }

    /** @return list<string> the hosts the site lists, as a policy names them */
    public function listed(): array
    {
        return array_values(array_unique(array_filter(array_map(self::host(...), (array) $this->cms->setting('site', 'csp_hosts', [])))));
    }

    /** The policy: one line, nothing in it that a header or an .htaccess string could not hold. */
    private function value(array $state): string
    {
        $lines = [];

        foreach ($this->directives($state) as $directive => $sources) {
            $sources = $this->sources($sources);

            if (preg_match('/^[a-z-]+$/D', (string) $directive) && $sources !== []) {
                $lines[] = $directive.' '.implode(' ', $sources);
            }
        }

        return implode('; ', $lines);
    }

    /** @return list<string> the sources a header can hold, each once */
    private function sources(mixed $sources): array
    {
        return array_values(array_unique(array_filter((array) $sources, static fn ($source) => is_string($source) && preg_match('#^[A-Za-z0-9\'*:/.+=_-]+$#D', $source))));
    }

    /** @return array<string, mixed> the policy by directive, with what plugins add (`site.policy`) */
    private function directives(array $state): array
    {
        $listed = $this->listed();
        $frames = array_filter(array_map(self::host(...), Embeds::HOSTS));
        $of = static fn (string $kind) => array_keys($state['hosts'][$kind] ?? []);

        $policy = (array) $this->cms->hooks()->filter('site.policy', [
            'default-src' => ["'self'"],
            'script-src' => ["'self'", "'wasm-unsafe-eval'", ...array_keys($state['script']), ...$of('script'), ...$listed],
            'style-src' => ["'self'", "'unsafe-inline'", ...$of('style'), ...$listed],
            'img-src' => ["'self'", 'data:', 'blob:', ...$of('img'), ...$listed],
            'media-src' => ["'self'", 'blob:', ...$of('media'), ...$listed],
            'font-src' => ["'self'", ...$listed],
            'connect-src' => ["'self'", 'data:', 'blob:', ...$listed],
            'frame-src' => ["'self'", ...$frames, ...$listed],
            'worker-src' => ["'self'", 'blob:'],
            'object-src' => ["'none'"],
            'base-uri' => ["'self'"],
            'form-action' => ["'self'", ...$listed],
        ]);

        return $policy;
    }

    /**
     * The CMS's own lines in public/.htaccess, between two markers: a site's file was copied once and is the
     * site's to change, so what must reach every site is written here, and again whenever it differs.
     */
    private function write(?string $policy): void
    {
        $file = public_path('.htaccess');
        $current = is_file($file) ? (string) file_get_contents($file) : '';
        $block = self::BEGIN.": written by the CMS, and again whenever it differs. Change what is outside these lines.\n"
            ."<IfModule mod_headers.c>\n    <FilesMatch \"\\.html$\">\n        Header set X-Content-Type-Options \"nosniff\"\n"
            .($policy !== null ? "        Header set {$this->header()} \"{$policy}\"\n" : '')
            ."    </FilesMatch>\n</IfModule>\n".self::END."\n";
        $pattern = '/^'.preg_quote(self::BEGIN, '/').'\b.*?^'.preg_quote(self::END, '/').'\R?/ms';
        $next = preg_match($pattern, $current) ? (string) preg_replace_callback($pattern, static fn () => $block, $current, 1) : ($current === '' || str_ends_with($current, "\n") ? $current : $current."\n").($current === '' ? '' : "\n").$block;

        if ($next !== $current && rescue(static function () use ($file, $next): bool { Files::put($file, $next); return true; }, false, report: false) === false) {
            // Said where a build's problems are said: a site whose .htaccess cannot be written has no policy and no nosniff.
            $this->cms->hooks()->dispatch('render.warning', __('public/.htaccess could not be written, so its security headers are not current. Make it writable for the web server.'));
        }
    }
}
