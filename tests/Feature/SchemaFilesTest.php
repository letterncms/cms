<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\AbilityContext;
use Cms\Content\Schemas\SchemaFiles;
use Cms\Install\Installer;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\Console\Output\BufferedOutput;

/** content/schemas: the site's content model as JSON Schema files, in step with its definitions. */
final class SchemaFilesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // What an install ends with and every deploy runs: from then on the site keeps the files itself.
        Artisan::call('migrate', ['--no-interaction' => true]);
    }

    private function folder(): string
    {
        return $this->site.'/content/schemas';
    }

    /** @return list<string> the files in the folder, sorted */
    private function files(): array
    {
        $found = [];

        foreach (glob($this->folder().'/{*,*/*}', GLOB_BRACE) ?: [] as $file) {
            is_file($file) && $found[] = substr($file, strlen($this->folder()) + 1);
        }

        sort($found);

        return $found;
    }

    private function schema(string $path): array
    {
        return json_decode((string) file_get_contents($this->folder().'/'.$path), true, 64, JSON_THROW_ON_ERROR);
    }

    private function ability(string $name, array $input = []): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($this->admin(), 'admin'));
    }

    /** @return array{0: int, 1: mixed} exit code and the decoded document */
    private function cli(string $command, array $params = []): array
    {
        $code = Artisan::call($command, [...$params, '--json' => true], $buffer = new BufferedOutput);

        return [$code, json_decode($buffer->fetch(), true)];
    }

    public function test_a_site_has_a_schema_per_collection_from_the_start(): void
    {
        // The site was migrated, as an install does: the files are there before anything asks.
        $this->assertSame(['collections/notes.json', 'collections/pages.json', 'collections/posts.json'], $this->files());

        $posts = $this->schema('collections/posts.json');
        $this->assertSame('https://json-schema.org/draft/2020-12/schema', $posts['$schema']);
        $this->assertSame('Posts: the data of an entry', $posts['title']);
        $this->assertSame('object', $posts['type']);
        $this->assertSame(['excerpt', 'body', 'tags'], array_keys($posts['properties']));
        $this->assertContains('excerpt', $posts['required']);
        // What collections/schema answers with as `data`, as a file.
        $this->assertSame($this->ability('collections/schema', ['handle' => 'posts'])['data']['properties'], $posts['properties']);
    }

    public function test_finishing_an_install_writes_them_even_when_the_site_site_fails(): void
    {
        \Cms\Support\Files::deleteDirectory($this->folder());
        $this->cms()->hooks()->on('cms.installed', static function (): never {
            throw new \RuntimeException('The site broke.');
        });

        $this->app->make(Installer::class)->finish($this->admin());

        $this->assertContains('collections/pages.json', $this->files());
        $this->assertStringContainsString('content/schemas/', (string) file_get_contents($this->site.'/AGENTS.md'));
    }

    public function test_the_files_follow_a_collection_saved_and_deleted(): void
    {
        $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [['handle' => 'place', 'type' => 'text', 'required' => true]]]]);
        $this->assertSame(['place'], array_keys($this->schema('collections/events.json')['properties']));

        $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [['handle' => 'place', 'type' => 'text'], ['handle' => 'seats', 'type' => 'number']]]]);
        $this->assertSame(['place', 'seats'], array_keys($this->schema('collections/events.json')['properties']));

        $this->ability('collections/delete', ['handle' => 'events']);
        $this->assertNotContains('collections/events.json', $this->files());
    }

    public function test_a_blueprint_has_a_file_of_its_own(): void
    {
        $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [], 'blueprints' => ['talk' => ['title' => 'Talk', 'fields' => [['handle' => 'speaker', 'type' => 'text']]]]]]);

        $this->assertContains('collections/events.talk.json', $this->files());
        $this->assertSame('Events, Talk: the data of an entry', $this->schema('collections/events.talk.json')['title']);
        $this->assertSame(['speaker'], array_keys($this->schema('collections/events.talk.json')['properties']));
        // A collection without fields of its own is an object that asks for nothing, and no empty list stands where a map belongs.
        $this->assertSame('object', $this->schema('collections/events.json')['type']);
        $this->assertStringNotContainsString('[]', (string) file_get_contents($this->folder().'/collections/events.json'));
        $this->assertSame("{\n    \"properties\": {},\n    \"required\": [],\n    \"default\": []\n}\n", SchemaFiles::encode(['properties' => [], 'required' => [], 'default' => []]));

        $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => []]]);
        $this->assertNotContains('collections/events.talk.json', $this->files());
    }

    public function test_the_files_follow_a_fieldset_and_a_global(): void
    {
        $this->ability('fieldsets/save', ['handle' => 'venue', 'title' => 'Venue', 'fields' => [['handle' => 'city', 'type' => 'text']]]);
        $this->ability('collections/save', ['handle' => 'events', 'definition' => ['title' => 'Events', 'fields' => [['import' => 'venue']]]]);
        $this->assertSame(['city'], array_keys($this->schema('collections/events.json')['properties']));

        // The fieldset changes: the collection that imports it is another schema, though nobody saved the collection.
        $this->ability('fieldsets/save', ['handle' => 'venue', 'title' => 'Venue', 'fields' => [['handle' => 'city', 'type' => 'text'], ['handle' => 'country', 'type' => 'text']]]);
        $this->assertSame(['city', 'country'], array_keys($this->schema('collections/events.json')['properties']));

        $set = $this->ability('globals/save', ['handle' => 'company', 'title' => 'Company', 'fields' => [['handle' => 'phone', 'type' => 'text']]]);
        $this->assertSame('Company: the values of a global', $this->schema('globals/company.json')['title']);
        $this->assertSame(['phone'], array_keys($this->schema('globals/company.json')['properties']));

        $this->ability('globals/delete', ['handle' => $set['handle'] ?? 'company']);
        $this->assertSame([], glob($this->folder().'/globals/*') ?: []);
        $this->assertDirectoryDoesNotExist($this->folder().'/globals');
    }

    public function test_migrate_picks_up_a_definition_edited_by_hand(): void
    {
        Yaml::write($this->site.'/content/collections/posts.yaml', ['title' => 'Posts', 'singular' => 'Post', 'route' => '/blog/{slug}', 'fields' => [['handle' => 'excerpt', 'type' => 'textarea'], ['handle' => 'rating', 'type' => 'number']]]);
        $this->cms()->collections()->flush();

        [$code] = $this->cli('schemas', ['--check' => true]);
        $this->assertSame(1, $code);

        $this->assertSame(0, Artisan::call('migrate', ['--no-interaction' => true]));

        $this->assertSame(['excerpt', 'rating'], array_keys($this->schema('collections/posts.json')['properties']));
        $this->assertSame(0, $this->cli('schemas', ['--check' => true])[0]);
    }

    public function test_the_command_checks_and_writes(): void
    {
        [$code, $document] = $this->cli('schemas', ['--check' => true]);
        $this->assertSame(0, $code);
        $this->assertTrue($document['data']['current']);
        $this->assertSame('content/schemas', $document['data']['folder']);

        // Edited by hand, removed, and one nobody asked for.
        file_put_contents($this->folder().'/collections/posts.json', "{}\n");
        unlink($this->folder().'/collections/pages.json');
        file_put_contents($this->folder().'/collections/gone.json', "{}\n");
        file_put_contents($this->folder().'/README.md', "Ours.\n");

        [$code, $document] = $this->cli('schemas', ['--check' => true]);
        $this->assertSame(1, $code);
        $this->assertSame('conflict', $document['error']['type']);
        $this->assertSame(
            [['path' => 'collections/pages.json', 'state' => 'missing'], ['path' => 'collections/posts.json', 'state' => 'changed'], ['path' => 'collections/gone.json', 'state' => 'stale']],
            $document['error']['details']['files'],
        );
        // A check writes nothing.
        $this->assertFileDoesNotExist($this->folder().'/collections/pages.json');

        [$code, $document] = $this->cli('schemas');
        $this->assertSame(0, $code);
        $this->assertSame(['delete', 'write', 'write'], (function (array $actions) { sort($actions); return $actions; })(array_column($document['data']['changes'], 'action')));
        $this->assertTrue($document['data']['current']);
        $this->assertSame(['README.md', 'collections/notes.json', 'collections/pages.json', 'collections/posts.json'], $this->files());

        // Again: nothing to do, and nothing touched.
        $before = filemtime($this->folder().'/collections/posts.json');
        [$code, $document] = $this->cli('schemas');
        $this->assertSame([0, []], [$code, $document['data']['changes']]);
        clearstatcache();
        $this->assertSame($before, filemtime($this->folder().'/collections/posts.json'));
    }

    public function test_a_check_writes_nothing_anywhere_on_a_site_that_never_asked_for_its_definitions(): void
    {
        // A site as a deploy finds it: the files there, nothing read yet in this process, the folder gone.
        \Cms\Support\Files::deleteDirectory($this->folder());
        $this->refreshApplicationKeepingSite();
        $before = $this->snapshot();

        [$code] = $this->cli('schemas', ['--check' => true]);

        $this->assertSame(1, $code);
        $this->assertSame($before, $this->snapshot(), 'A check writes no file of the site.');
    }

    public function test_a_package_turned_on_or_off_has_the_next_request_write_them_again(): void
    {
        $stale = $this->site.'/storage/'.SchemaFiles::STALE;

        foreach (['packages/enable', 'packages/disable'] as $ability) {
            @unlink($stale);
            $this->ability($ability, ['name' => 'letterncms/blocks']);
            $this->assertFileExists($stale, "{$ability} leaves the files to the next request, which boots with what is on.");
        }

        // That request, first thing: the files in step, and the mark gone.
        unlink($this->folder().'/collections/posts.json');
        $this->app->make(SchemaFiles::class)->refreshIfStale();
        $this->assertFileExists($this->folder().'/collections/posts.json');
        $this->assertFileDoesNotExist($stale);
    }

    /** @return array<string, string> every file of the site but caches and logs, by path, with its hash */
    private function snapshot(): array
    {
        $out = [];

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->site, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $path = substr($file->getPathname(), strlen($this->site) + 1);

            if ($file->isFile() && ! preg_match('#^storage/(cache|framework|logs|database)/#', $path)) {
                $out[$path] = sha1_file($file->getPathname()).' '.$file->getMTime();
            }
        }

        ksort($out);

        return $out;
    }

    private function refreshApplicationKeepingSite(): void
    {
        $this->app->make(\Cms\Content\Collections\CollectionRepository::class)->flush();
    }

    public function test_the_abilities_say_how_the_folder_stands_and_a_dry_run_writes_nothing(): void
    {
        $this->assertTrue($this->ability('schemas/status')['current']);

        unlink($this->folder().'/collections/pages.json');
        file_put_contents($this->folder().'/old.json', "{}\n");

        $status = $this->ability('schemas/status');
        $this->assertFalse($status['current']);
        $this->assertContains(['path' => 'old.json', 'state' => 'stale'], $status['files']);

        $dry = $this->ability('schemas/refresh', ['dryRun' => true]);
        $this->assertSame([true, 'schemas/refresh', 'full'], [$dry['dryRun'], $dry['ability'], $dry['checked']]);
        $this->assertSame([
            ['action' => 'write', 'type' => 'schema', 'path' => 'content/schemas/collections/pages.json'],
            ['action' => 'delete', 'type' => 'schema', 'path' => 'content/schemas/old.json'],
        ], $dry['changes']);
        $this->assertFileDoesNotExist($this->folder().'/collections/pages.json');
        $this->assertFileExists($this->folder().'/old.json');

        $done = $this->ability('schemas/refresh');
        $this->assertSame($dry['changes'], $done['changes']);
        $this->assertTrue($done['current']);
        $this->assertFileExists($this->folder().'/collections/pages.json');
        $this->assertFileDoesNotExist($this->folder().'/old.json');

        // Someone who may not change definitions may read how the folder stands, and no more.
        $editor = AbilityContext::forUser($this->userWithRole('editor'), 'admin');
        $this->assertTrue($this->cms()->abilities()->execute('schemas/status', [], $editor)['current']);
        $this->expectException(\Cms\Abilities\AbilityException::class);
        $this->cms()->abilities()->execute('schemas/refresh', [], $editor);
    }

    public function test_the_files_are_the_same_whatever_language_the_request_speaks_and_what_a_module_adds_is_held_to_the_folder(): void
    {
        $english = file_get_contents($this->folder().'/collections/posts.json');
        $this->app->make(\Cms\Admin\Translations::class)->apply('de');
        $this->cms()->hooks()->addFilter('schemas.documents', static fn (array $documents) => [...$documents, 'extra.json' => ['type' => 'object'], '../outside.json' => ['type' => 'object'], 'deep/er/x.json' => ['type' => 'object'], 'notes.txt' => ['type' => 'object']]);

        $this->app->make(SchemaFiles::class)->write();

        $this->assertSame($english, file_get_contents($this->folder().'/collections/posts.json'));
        $this->assertSame('de', $this->app->make('translator')->getLocale());
        $this->assertSame(['collections/notes.json', 'collections/pages.json', 'collections/posts.json', 'extra.json'], $this->files());
        $this->assertFileDoesNotExist($this->site.'/content/outside.json');
    }
}
