<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Support\Brand;
use Symfony\Component\Process\Process;

/** Development server that mimics the production .htaccess routing. */
final class ServeCommand extends Command
{
    protected $signature = 'serve {--host=127.0.0.1} {--port=8000}';

    protected $description = 'Serve the site for local development';

    public function handle(): int
    {
        $host = (string) $this->option('host');
        $port = (string) $this->option('port');
        $router = app()->cmsPath('resources/server.php');

        $this->components->info(Brand::get()." running at http://{$host}:{$port} — admin at /admin");

        $process = new Process([PHP_BINARY, '-S', "{$host}:{$port}", $router], public_path(), [
            'CMS_SITE_PATH' => app()->sitePath(),
            'PHP_CLI_SERVER_WORKERS' => (string) (getenv('PHP_CLI_SERVER_WORKERS') ?: 4),
        ]);
        $process->setTimeout(null);

        return $process->run(fn ($type, $line) => $this->output->write($line));
    }
}
