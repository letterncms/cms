<?php

declare(strict_types=1);

namespace Cms\Console;

use Cms\Content\Schemas\SchemaFiles;

/**
 * The site's content model as JSON Schema files in content/schemas/ (see SchemaFiles). The site keeps
 * them current itself; this writes them by hand, and `--check` is for a deploy or a pull request:
 * it writes nothing and fails when the files are not what the definitions give.
 */
final class SchemasCommand extends Command
{
    protected $signature = 'schemas {--check : Write nothing: exit 1 when a file is missing, differs or is left over}';

    protected $description = 'Write the JSON Schema files of the content model (content/schemas)';

    public function handle(SchemaFiles $schemas): int
    {
        if ($this->option('check')) {
            $status = $schemas->status();

            foreach ($status['files'] as $file) {
                $this->components->twoColumnDetail($status['folder'].'/'.$file['path'], $file['state'] === 'current' ? '<fg=green>current</>' : "<fg=red>{$file['state']}</>");
            }

            if ($status['current']) {
                $this->components->info('The schemas are current.');

                return $this->done($status);
            }

            return $this->failure('The schemas in '.$status['folder'].' are not current. Run php cms schemas.', 'conflict', ['files' => array_values(array_filter($status['files'], static fn (array $file) => $file['state'] !== 'current'))]);
        }

        $changes = $schemas->write();

        foreach ($changes as $change) {
            $this->components->twoColumnDetail($change['path'], $change['action'] === 'delete' ? 'deleted' : 'written');
        }

        $this->components->info($changes === [] ? 'The schemas were current: nothing was written.' : count($changes).' '.(count($changes) === 1 ? 'file' : 'files').' brought in step.');

        return $this->done(['changes' => $changes, ...$schemas->status()]);
    }
}
