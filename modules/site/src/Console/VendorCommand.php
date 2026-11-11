<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Console;

use Cms\Modules\Site\Design\Code;
use Cms\Modules\Site\Design\Vendor;
use Illuminate\Console\Command;
use Throwable;

final class VendorCommand extends Command
{
    protected $signature = 'vendor
        {action=list : add, list, remove or update}
        {package? : add: name@version (gsap@3.12.5). remove and update: the name scripts import it by}
        {version? : update: the version to move to; the newest when left out}
        {--file= : add: one file inside the package instead of its main entry}
        {--as= : add: the name scripts import it by}';

    protected $description = 'Keep the libraries the site’s scripts import in content/design/vendor';

    public function handle(Vendor $vendor, Code $code): int
    {
        $action = (string) $this->argument('action');
        $package = (string) $this->argument('package');

        try {
            $result = match ($action) {
                'list' => null,
                'add' => $vendor->add($package, $this->option('file'), $this->option('as')),
                'update' => $vendor->update($package, $this->argument('version')),
                'remove' => $vendor->remove($package),
                default => throw new \InvalidArgumentException(__('Use add, list, remove or update.')),
            };
        } catch (Throwable $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $code->flush();

        if (is_array($result)) {
            foreach ($result['added'] as $name) {
                $entry = $vendor->all()[$name];
                $this->components->info("{$name} {$entry['version']}: import … from \"{$name}\"");
            }

            foreach ($result['notes'] as $note) {
                $this->components->warn($note);
            }

            return self::SUCCESS;
        }

        if ($action === 'remove') {
            $this->components->info(__('Removed :name.', ['name' => $package]));

            return self::SUCCESS;
        }

        $rows = array_map(static fn (string $name, array $entry) => [$name, $entry['package'].'@'.$entry['version'], $entry['file'] ?? '', count($entry['files']), $entry['files'][$entry['path']]], array_keys($vendor->all()), array_values($vendor->all()));
        $rows === [] ? $this->components->info(__('No libraries yet. Add one: cms vendor add gsap@3.12.5')) : $this->table(['Import', 'Package', 'File', 'Files', 'Integrity'], $rows);

        return self::SUCCESS;
    }
}
