<?php

declare(strict_types=1);

namespace Cms\Foundation;

use Illuminate\Foundation\Configuration\ApplicationBuilder;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Http\Request;
use Cms\Http\Middleware\EnsureInstalled;
use Cms\Http\Middleware\SecurityHeaders;
use Cms\Http\Middleware\SiteCookies;
use Cms\Http\Middleware\VerifySiteCsrf;
use Cms\CmsServiceProvider;
use Cms\Support\Files;
use Cms\Update\CoreUpdate;
use Cms\Update\Upgrader;
use Symfony\Component\Console\Input\ArgvInput;

final class Bootstrap
{
    public static function create(string $cmsPath, string $sitePath): Application
    {
        $app = new Application($cmsPath, $sitePath);
        self::ensureStorage($app);

        // A loader flipped back to the previous release: what the failed one cached goes with it.
        if (is_file($app->storagePath('update/purge'))) {
            Upgrader::purgeCaches($app);
        }

        $app = (new ApplicationBuilder($app))
            ->withKernels()
            ->withEvents(false)
            ->withProviders([CmsServiceProvider::class], withBootstrapProviders: false)
            ->withMiddleware(static function (Middleware $middleware): void {
                $middleware->redirectGuestsTo(static fn () => '/admin/login');
                $middleware->web(prepend: [SiteCookies::class], replace: [PreventRequestForgery::class => VerifySiteCsrf::class]);
                $middleware->append(SecurityHeaders::class);
                $middleware->append(EnsureInstalled::class);
                // JSON bodies are structured content: keep whitespace (code, Markdown) and empty strings as sent.
                $middleware->trimStrings(except: [static fn (Request $request) => $request->isJson()]);
                $middleware->convertEmptyStringsToNull(except: [static fn (Request $request) => $request->isJson()]);
                $middleware->encryptCookies(except: ['cms_theme', 'cms_staff', \Cms\Users\AccountInBrowser::COOKIE]);
                $middleware->trustProxies(at: env('TRUSTED_PROXIES') ? explode(',', (string) env('TRUSTED_PROXIES')) : null);
            })
            ->withExceptions(static function (Exceptions $exceptions): void {
                $exceptions->shouldRenderJsonWhen(
                    static fn (Request $request) => $request->is('api/*') || $request->expectsJson()
                );
            })
            ->create();

        // The console's own failures (no such command, a provider that cannot boot) follow --json too.
        $app->singleton(\Illuminate\Contracts\Console\Kernel::class, ConsoleKernel::class);

        return $app;
    }

    /** Runtime folders are created on demand so a fresh checkout or upload just works. */
    private static function ensureStorage(Application $app): void
    {
        if (is_dir($app->storagePath('framework/views'))) {
            return;
        }

        foreach (['framework/cache', 'framework/views', 'framework/sessions', 'cache/data', 'logs', 'database', 'app', 'drafts'] as $dir) {
            $path = $app->storagePath($dir);

            if (! is_dir($path)) {
                @mkdir($path, 0o775, true);
            }
        }
    }

    /** Handle the current HTTP request (front controller). */
    public static function http(string $cmsPath, string $sitePath): void
    {
        self::create($cmsPath, $sitePath)->handleRequest(Request::capture());
    }

    /**
     * Finish an update on the code the pointer just switched to, driven by `/_cms/update/tick`
     * or `cms update:finish`. Takes no input and holds no secret: it only ever runs what an
     * admin's switch already decided, and outside that window it answers 204 and does nothing.
     */
    public static function upgrade(string $cmsPath, string $sitePath): void
    {
        // One tick at a time: the loopback, a browser and cron may all knock, and migrations don't run twice at once.
        Files::locked($sitePath.'/storage/update/tick.lock', static function () use ($cmsPath, $sitePath): void {
            try {
                // Core tables first: no provider may read a schema that isn't there yet.
                CmsServiceProvider::$withoutPackages = true;
                $bare = self::create($cmsPath, $sitePath);
                $bare->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
                $due = CoreUpdate::due($bare);

                if ($due) {
                    Upgrader::migrateCore($bare);
                }

                CmsServiceProvider::$withoutPackages = false;
                \Illuminate\Support\Facades\Facade::clearResolvedInstances();

                if (! $due) {
                    self::answer(204, null);

                    return;
                }

                $app = self::create($cmsPath, $sitePath);
                $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
                self::answer(200, $app->make(CoreUpdate::class)->drive());
            } catch (\Throwable $e) {
                CmsServiceProvider::$withoutPackages = false;
                self::answer(200, CoreUpdate::abandon($sitePath, $e->getMessage()));
            }
        }, static fn () => self::answer(200, ['state' => 'migrating']));
    }

    private static function answer(int $status, mixed $body): void
    {
        if (PHP_SAPI === 'cli') {
            echo $body === null ? '' : json_encode($body)."\n";

            return;
        }

        http_response_code($status);
        header('Cache-Control: no-store');

        if ($body !== null) {
            header('Content-Type: application/json');
            echo json_encode($body);
        }
    }

    /** Run the CLI and exit with its status code. */
    public static function console(string $cmsPath, string $sitePath): never
    {
        $input = new ArgvInput;

        if ($site = $input->getParameterOption('--site')) {
            $sitePath = realpath((string) $site) ?: (string) $site;
        }

        try {
            $status = self::create($cmsPath, $sitePath)->handleCommand($input);
        } catch (\Throwable $e) {
            // The site could not even start (a broken config file, a missing extension). With --json, and for `run`, that is still the one document.
            if (! \Cms\Console\Command::answersJson($input)) {
                throw $e;
            }

            fwrite(STDOUT, \Cms\Console\Command::errorDocument(\Cms\Console\Command::said($e))."\n");
            $status = 1;
        }

        exit($status);
    }
}
