<?php

declare(strict_types=1);

namespace Cms\Content\Schemas;

use Cms\Cms;
use Cms\Content\Fields\Blueprint;
use Cms\Extend\Hooks;
use Cms\Foundation\Application;
use Cms\Support\Files;
use stdClass;
use Throwable;

/**
 * The site's content model as JSON Schema files, in `content/schemas/`: one per collection and per
 * blueprint of a collection, one per global, and what modules add (the Blocks module: the block
 * document). An agent or an editor's tooling working in the site's folder reads what an entry must look
 * like without booting the site, and a pull request shows a change to the model as a diff.
 *
 * In `content/` because that folder is the site's own, in its git, carried by Sync, and refused by the
 * web server on every site there is (`.htaccess`): a folder of its own at the root would be public on
 * sites whose `.htaccess` predates it. The folder belongs to this class: it writes the files the site's
 * definitions give, and removes any other `.json` in it.
 *
 * Written when the site is installed and whenever a definition changes: a collection, a fieldset or a
 * global saved or deleted, an entry of a collection the system keeps (templates, components: they
 * are the choices of a field), and `cms migrate`, which is what picks up a definition edited by hand.
 * `php cms schemas` writes them too, `--check` only says whether they are current.
 */
final class SchemaFiles
{
    public const string FOLDER = 'schemas';

    /** In storage/: a package was turned on or off, so the next request, booted with it, writes the files again. */
    public const string STALE = 'schemas.stale';

    private const string DIALECT = 'https://json-schema.org/draft/2020-12/schema';

    private bool $refreshing = false;

    public function __construct(private readonly Application $app, private readonly Cms $cms, private readonly Hooks $hooks) {}

    public function folder(): string
    {
        return $this->app->contentPath(self::FOLDER);
    }

    /**
     * Every file, by its path in the folder. Modules add theirs with the `schemas.documents` filter:
     * `[...$documents, 'blocks.json' => $schema]`.
     *
     * @return array<string, array<string, mixed>>
     */
    public function documents(): array
    {
        // Reading the definitions may save one (a collection the system keeps), whose hook would write the folder:
        // while they are read, it doesn't, so a check (`schemas --check`, schemas/status) never writes.
        $was = $this->refreshing;
        $this->refreshing = true;

        try {
            return $this->read();
        } finally {
            $this->refreshing = $was;
        }
    }

    /** @return array<string, array<string, mixed>> */
    private function read(): array
    {
        return $this->inEnglish(function (): array {
            $documents = [];

            foreach ($this->cms->collections()->all() as $collection) {
                $documents["collections/{$collection->handle}.json"] = self::document(
                    "{$collection->title}: the data of an entry",
                    "What `data` of an entry of the collection `{$collection->handle}` must follow to be published. A draft may leave required fields empty."
                        .($collection->blueprints() === [] ? '' : ' For an entry made without a blueprint; each blueprint has a file of its own beside this one.'),
                    $collection->blueprint()->schema(),
                );

                foreach ($collection->blueprints() as $name => $blueprint) {
                    $documents["collections/{$collection->handle}.{$name}.json"] = self::document(
                        "{$collection->title}, ".((string) ($blueprint['title'] ?? $name)).': the data of an entry',
                        "What `data` of an entry of the collection `{$collection->handle}` made with the blueprint `{$name}` must follow to be published.",
                        $collection->blueprint((string) $name)->schema(),
                    );
                }
            }

            foreach ($this->cms->globals()->all() as $set) {
                $documents["globals/{$set->handle}.json"] = self::document(
                    "{$set->title}: the values of a global",
                    "The values of the global `{$set->handle}`, by field handle.",
                    $set->blueprint()->schema(partial: true),
                );
            }

            $documents = (array) $this->hooks->filter('schemas.documents', $documents);
            ksort($documents);

            return array_filter($documents, static fn ($schema, $path) => is_array($schema) && self::named((string) $path), ARRAY_FILTER_USE_BOTH);
        });
    }

    /** A schema as a document of its own: the dialect, a title and what it is of, then the schema. */
    public static function document(string $title, string $description, array $schema): array
    {
        unset($schema['$schema'], $schema['title'], $schema['description']);

        return ['$schema' => self::DIALECT, 'title' => $title, 'description' => $description, ...$schema];
    }

    /**
     * How the folder stands against the definitions.
     *
     * @return array{current: bool, folder: string, files: list<array{path: string, state: string}>}
     */
    public function status(): array
    {
        $files = [];

        foreach ($this->documents() as $path => $schema) {
            $file = $this->folder().'/'.$path;
            $files[] = ['path' => $path, 'state' => ! is_file($file) ? 'missing' : (file_get_contents($file) === self::encode($schema) ? 'current' : 'changed')];
        }

        foreach ($this->strays() as $path) {
            $files[] = ['path' => $path, 'state' => 'stale'];
        }

        return [
            'current' => array_all($files, static fn (array $file) => $file['state'] === 'current'),
            'folder' => 'content/'.self::FOLDER,
            'files' => $files,
        ];
    }

    /**
     * What writing would do, as a dry run lists changes: a file to write for each that is missing or
     * differs, a file to delete for each that no definition gives any more.
     *
     * @return list<array{action: string, type: string, path: string}>
     */
    public function changes(): array
    {
        return array_values(array_map(
            static fn (array $file) => ['action' => $file['state'] === 'stale' ? 'delete' : 'write', 'type' => 'schema', 'path' => 'content/'.self::FOLDER.'/'.$file['path']],
            array_filter($this->status()['files'], static fn (array $file) => $file['state'] !== 'current'),
        ));
    }

    /**
     * Brings the folder in step. A file that is already right is left alone, so nothing changes on disk
     * or in git when nothing changed in the model.
     *
     * @return list<array{action: string, type: string, path: string}> what was written and deleted
     */
    public function write(): array
    {
        $changes = $this->changes();

        if ($changes === []) {
            return [];
        }

        $documents = $this->documents();

        foreach ($changes as $change) {
            $path = substr($change['path'], strlen('content/'.self::FOLDER.'/'));
            $file = $this->folder().'/'.$path;

            if ($change['action'] === 'delete') {
                @unlink($file);
                // A folder nothing is left in goes with its last file.
                @rmdir(dirname($file));

                continue;
            }

            is_dir(dirname($file)) || mkdir(dirname($file), 0o775, true);
            Files::put($file, self::encode($documents[$path]));
        }

        return $changes;
    }

    /**
     * For the hooks that follow a definition: the model is saved whatever happens here. A folder that
     * cannot be written is reported, not thrown at whoever saved a collection.
     */
    public function refresh(): void
    {
        // Reading a definition can save one (a collection the system keeps is made the first time it is asked for):
        // the write that is under way covers it.
        if ($this->refreshing) {
            return;
        }

        $this->refreshing = true;

        try {
            $this->write();
        } catch (Throwable $e) {
            report($e);
        } finally {
            $this->refreshing = false;
        }
    }

    /** What every request does first: write the files again when a package was turned on or off since (STALE). */
    public function refreshIfStale(): void
    {
        if (is_file($stale = storage_path(self::STALE)) && @unlink($stale)) {
            $this->refresh();
        }
    }

    /** The file as it is written: the same bytes for the same model, on every machine. */
    public static function encode(array $schema): string
    {
        return json_encode(self::objects($schema), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
    }

    /** Keys of a schema whose value is a map or a schema: empty, PHP would write a list (`[]`) where JSON Schema reads an object. */
    private const array MAPS = ['properties', 'patternProperties', '$defs', 'dependentSchemas', 'dependentRequired', 'if', 'then', 'else', 'not', 'additionalProperties', 'propertyNames', 'contains'];

    private static function objects(array $schema): array
    {
        foreach ($schema as $key => $value) {
            if (is_array($value)) {
                $schema[$key] = $value === [] && in_array($key, self::MAPS, true) ? new stdClass : self::objects($value);
            }
        }

        return $schema;
    }

    /** @return list<string> `.json` files in the folder that no definition gives. */
    private function strays(): array
    {
        $folder = $this->folder();

        if (! is_dir($folder)) {
            return [];
        }

        $wanted = $this->documents();
        $found = [];

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($folder, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $path = str_replace('\\', '/', substr($file->getPathname(), strlen($folder) + 1));

            if ($file->isFile() && str_ends_with($path, '.json') && ! isset($wanted[$path])) {
                $found[] = $path;
            }
        }

        sort($found);

        return $found;
    }

    /** A path a module may add: `.json`, in the folder or one folder down, of plain name parts. */
    private static function named(string $path): bool
    {
        return preg_match('#^([a-z0-9][a-z0-9_-]*/)?[a-z0-9][a-z0-9_.-]*\.json$#', $path) === 1 && ! str_contains($path, '..');
    }

    /** Titles and descriptions as written: the files are the same whoever's request wrote them. */
    private function inEnglish(\Closure $work): array
    {
        $translator = $this->app->make('translator');
        $locale = $translator->getLocale();
        $translator->setLocale(\Cms\Admin\Translations::SOURCE);

        try {
            return $work();
        } finally {
            $translator->setLocale($locale);
        }
    }
}
