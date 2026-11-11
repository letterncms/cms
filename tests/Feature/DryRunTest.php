<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Abilities\Ability;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Assistant\Toolbox;
use Cms\Modules\Collaboration\Comment;
use Cms\Modules\Workspace\Answers;
use Cms\Modules\Workspace\Thread;
use Cms\Support\Schema\Conform;
use Cms\Support\Schema\Validator;
use Cms\Tests\TestCase;
use Cms\Users\ApiToken;
use Cms\Users\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Console\Output\BufferedOutput;

/**
 * `dryRun: true` on anything that changes something: refused exactly where the real run is, nothing written,
 * and a report of what would change. The registry holds every report against Ability::DRY_RUN_OUTPUT here.
 */
final class DryRunTest extends TestCase
{
    private const string GONE = '01jc8w6m3x9k2h4v5t7r0p1q3s';

    private User $admin;

    protected function plugins(): array
    {
        return ['letterncms/mcp', 'letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/site'];
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->admin();
    }

    private function run_(string $name, array $input, ?User $as = null, string $transport = 'admin'): mixed
    {
        return $this->cms()->abilities()->execute($name, $input, AbilityContext::forUser($as ?? $this->admin, $transport));
    }

    private function dry(string $name, array $input, ?User $as = null): array
    {
        $report = $this->run_($name, [...$input, 'dryRun' => true], $as);
        $this->assertTrue(Ability::isDryRun($report), "{$name} answers a dry run with a report");
        $this->assertSame($name, $report['ability']);

        return $report;
    }

    private function refusal(string $name, array $input, ?User $as = null): ?AbilityException
    {
        try {
            $this->run_($name, $input, $as);
        } catch (AbilityException $e) {
            return $e;
        }

        return null;
    }

    /** The dry run and then the real run of the same input are refused, for the same reason. */
    private function assertBothRefuse(string $type, string $name, array $input, ?User $as = null): void
    {
        $before = $this->state();
        $dry = $this->refusal($name, [...$input, 'dryRun' => true], $as);
        $this->assertNotNull($dry, "a dry run of {$name} is refused");
        $this->assertSame($before, $this->state(), "a refused dry run of {$name} writes nothing");
        $real = $this->refusal($name, $input, $as);
        $this->assertNotNull($real, "{$name} is refused");
        $this->assertSame($type, $real->type, $real->getMessage());
        $this->assertSame([$real->type, $real->getMessage(), $real->details], [$dry->type, $dry->getMessage(), $dry->details], "{$name}: the dry run is refused as the real run is");
    }

    /** A dry run that passes writes nothing, and the real run of the same input then passes too. @return array{0: array, 1: mixed} */
    private function assertBothPass(string $name, array $input, ?User $as = null): array
    {
        $before = $this->state();
        $report = $this->dry($name, $input, $as);
        $this->assertSame('full', $report['checked'], $name);
        $this->assertIsArray($report['changes'], $name);
        $this->assertSame($before, $this->state(), "a dry run of {$name} writes nothing");

        $result = $this->run_($name, $input, $as);
        $this->assertFalse(Ability::isDryRun($result));
        $this->assertNotSame($before, $this->state(), "the real run of {$name} is seen by what the dry run is held against");

        return [$report, $result];
    }

    /** Everything a change could touch: entries, the site's files (content, config, storage but its caches), revisions and the audit log. */
    private function state(): array
    {
        $files = [];

        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->site, \FilesystemIterator::SKIP_DOTS)) as $file) {
            $path = substr((string) $file, strlen($this->site));

            if ($file->isFile() && ! preg_match('#^/(storage/(framework|cache|logs)|database)/#', $path) && ! str_ends_with($path, '.sqlite')) {
                $files[$path] = md5_file((string) $file);
            }
        }

        ksort($files);
        $this->cms()->entries()->flush();

        return [
            'entries' => array_map(static fn ($e) => [$e->id, $e->version(), $e->uri, $e->parentId, $e->position, $e->status], $this->cms()->entries()->query()->orderBy('id')->get()),
            'files' => $files,
            'revisions' => DB::table('revisions')->orderBy('id')->pluck('id')->all(),
            'audit' => DB::table('audit_log')->count(),
            'users' => User::query()->count(),
        ];
    }

    public function test_every_ability_that_changes_something_takes_it_and_no_other_does(): void
    {
        foreach ($this->cms()->abilities()->all() as $name => $ability) {
            $properties = (array) ($ability->toArray()['input']['properties'] ?? []);
            $this->assertSame(! $ability->isReadOnly(), isset($properties['dryRun']), $name);
        }

        // Asking an ability that only reads is not a way around its input schema.
        $this->assertFalse(Ability::isDryRun($this->run_('entries/list', ['collection' => 'pages', 'dryRun' => true])));
        $this->assertSame('invalid_input', $this->refusal('entries/create', ['collection' => 'pages', 'title' => 'x', 'dryRun' => 'perhaps'])->type);
    }

    public function test_the_report_is_exact_and_says_how_far_it_was_checked(): void
    {
        $this->assertSame([], Conform::errors(json_decode((string) json_encode(Ability::DRY_RUN_OUTPUT['properties'])), ['type' => 'object', 'additionalProperties' => true]));
        $this->assertStringContainsString('checked', Ability::DRY_RUN['description']);

        // An ability with a callback is checked in full and lists its changes.
        $report = $this->dry('entries/create', ['collection' => 'posts', 'title' => 'Not yet', 'data' => ['excerpt' => 'Soon']]);
        $this->assertSame(['dryRun', 'ability', 'checked', 'input', 'changes'], array_keys($report));
        $this->assertSame('full', $report['checked']);
        $this->assertSame('draft', $report['input']['status'], 'the input is reported as it was understood, defaults included');
        $this->assertSame([['action' => 'create', 'type' => 'entry', 'collection' => 'posts', 'title' => 'Not yet', 'slug' => 'not-yet', 'locale' => 'en', 'status' => 'draft', 'uri' => '/blog/not-yet']], $report['changes']);

        // One without is checked as far as its input and the permission, and says so.
        $report = $this->dry('users/create', ['name' => 'New', 'email' => 'new@example.com', 'password' => 'a-long-secret-123', 'roles' => ['editor']]);
        $this->assertSame('input', $report['checked']);
        $this->assertNull($report['changes']);
        $this->assertFalse(User::query()->where('email', 'new@example.com')->exists());
        $this->assertSame('invalid_input', $this->refusal('users/create', ['name' => 'New', 'dryRun' => true])->type);
        $this->assertSame('forbidden', $this->refusal('users/create', ['name' => 'New', 'email' => 'n@example.com', 'password' => 'a-long-secret-123', 'roles' => ['editor'], 'dryRun' => true], $this->userWithRole('author'))->type);

        // Sent as the report's own schema says, not as the ability's: an empty input is an object.
        $ability = $this->cms()->abilities()->get('sync/renew-key');
        $encoded = $ability->encode($this->dry('sync/renew-key', []));
        $this->assertInstanceOf(\stdClass::class, $encoded->input);
        $this->assertSame([], Conform::errors($encoded, Ability::DRY_RUN_OUTPUT));
        $this->assertNotSame([], Conform::errors($encoded, $ability->output()));
    }

    public function test_every_ability_that_asks_first_is_checked_in_full(): void
    {
        $asking = array_filter($this->cms()->abilities()->all(), static fn (Ability $a) => $a->asksFirst());
        $missing = array_keys(array_filter($asking, static fn (Ability $a) => $a->dryRun === null));

        $this->assertSame([], $missing, 'An ability annotated destructive or confirm needs a `dryRun` callback that names what would be removed.');

        foreach (['entries/delete', 'entries/discard-draft', 'collections/delete', 'globals/delete', 'navigation/delete', 'media/delete', 'users/delete', 'users/revoke', 'tokens/revoke', 'comments/delete', 'threads/delete',
            'languages/remove', 'packages/enable', 'packages/disable', 'packages/switch', 'packages/uninstall', 'sync/start', 'sync/undo', 'sync/disconnect', 'sync/renew-key',
            'design/code-delete', 'design/vendor-remove'] as $name) {
            $this->assertArrayHasKey($name, $asking, "{$name} asks first");
        }
    }

    public function test_nothing_is_written_run_or_recorded(): void
    {
        $page = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Parent', 'status' => 'published']);
        $child = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Child', 'parentId' => $page['id'], 'status' => 'published']);
        $note = $this->run_('entries/create', ['collection' => 'notes', 'title' => 'Kept', 'data' => ['body' => 'As it is.'], 'status' => 'published']);
        $under = $this->run_('entries/create', ['collection' => 'notes', 'title' => 'Under', 'parentId' => $note['id']]);
        $this->run_('entries/update', ['id' => $page['id'], 'title' => 'Parent, changed']);
        $revision = $this->run_('entries/revisions', ['id' => $page['id']])[0]['id'];

        $fired = [];
        foreach (['ability.executing', 'ability.executed', 'entry.saved', 'entry.published', 'entry.unpublished', 'entry.deleting', 'entry.deleted', 'entry.structure-changed', 'entry.uri-changed', 'entries.reordered', 'settings.saved', 'navigation.saved'] as $hook) {
            $this->cms()->hooks()->on($hook, static function () use (&$fired, $hook): void { $fired[] = $hook; });
        }

        $before = $this->state();

        foreach ([
            'entries/create' => ['collection' => 'notes', 'title' => 'Never', 'parentId' => $note['id'], 'status' => 'published'],
            'entries/update' => ['id' => $note['id'], 'title' => 'Renamed', 'slug' => 'renamed', 'data' => ['body' => 'Other.'], 'publish' => true],
            'entries/publish' => ['id' => $under['id']],
            'entries/unpublish' => ['id' => $note['id']],
            'entries/discard-draft' => ['id' => $page['id']],
            'entries/duplicate' => ['id' => $note['id']],
            'entries/move' => ['id' => $under['id'], 'parentId' => null],
            'entries/reorder' => ['collection' => 'pages', 'ids' => [$child['id'], $page['id']]],
            'entries/restore' => ['revisionId' => $revision],
            'entries/delete' => ['id' => $note['id']],
            'collections/delete' => ['handle' => 'notes', 'deleteEntries' => true],
            'settings/update' => ['namespace' => 'site', 'values' => ['name' => 'Renamed']],
        ] as $name => $input) {
            $report = $this->dry($name, $input);
            $this->assertSame('full', $report['checked'], $name);
            $this->assertNotSame([], $report['changes'], $name);
            $this->assertSame($before, $this->state(), "{$name} wrote something");
        }

        $this->assertSame([], $fired);
        $this->assertNotNull($this->cms()->collections()->find('notes'));
        $this->assertSame('Kept', $this->run_('entries/get', ['id' => $note['id']])['title']);
    }

    public function test_an_entry_is_refused_where_the_real_run_refuses_it(): void
    {
        $author = $this->userWithRole('author');
        $post = $this->run_('entries/create', ['collection' => 'posts', 'title' => 'No excerpt']);
        $parent = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'About', 'status' => 'published']);
        $child = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Team', 'parentId' => $parent['id']]);
        $stale = str_repeat('0', 64);

        // A required field is missing when it is published.
        $this->assertBothRefuse('invalid_input', 'entries/publish', ['id' => $post['id']]);
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'posts', 'title' => 'Live', 'status' => 'published']);
        $this->assertBothRefuse('invalid_input', 'entries/update', ['id' => $post['id'], 'title' => 'Still none', 'publish' => true]);
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'posts', 'title' => 'Tags', 'data' => ['excerpt' => ['not', 'text']]]);

        // Under its own child; a published entry by someone who may not publish.
        $this->assertBothRefuse('invalid_input', 'entries/move', ['id' => $parent['id'], 'parentId' => $child['id']]);
        $this->assertBothRefuse('forbidden', 'entries/move', ['id' => $parent['id'], 'parentId' => null, 'position' => 5], $author);
        $this->assertBothRefuse('forbidden', 'entries/reorder', ['collection' => 'pages', 'ids' => [$parent['id']]], $author);
        $this->assertBothRefuse('invalid_input', 'entries/reorder', ['collection' => 'pages', 'ids' => [$post['id']]]);

        // A slug or an address that is taken.
        $this->assertBothRefuse('conflict', 'entries/create', ['collection' => 'pages', 'title' => 'Another', 'slug' => 'about']);
        $other = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Other']);
        $this->assertBothRefuse('conflict', 'entries/update', ['id' => $other['id'], 'slug' => 'about']);
        $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Team']);
        $this->assertBothRefuse('conflict', 'entries/move', ['id' => $child['id'], 'parentId' => null]);
        $this->assertBothRefuse('conflict', 'entries/delete', ['id' => $parent['id']]);

        // A language, a parent, an author that is not there.
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'pages', 'title' => 'Hola', 'locale' => 'es']);
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'pages', 'title' => 'Lost', 'parentId' => $post['id']]);
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'pages', 'title' => 'Ghost', 'authorId' => self::GONE]);
        $this->assertBothRefuse('invalid_input', 'entries/update', ['id' => $other['id'], 'authorId' => self::GONE]);

        // A time without publishing; a live entry scheduled again.
        $this->assertBothRefuse('invalid_input', 'entries/create', ['collection' => 'pages', 'title' => 'Later', 'at' => '2031-01-01T00:00:00Z']);
        $this->assertBothRefuse('invalid_input', 'entries/update', ['id' => $other['id'], 'at' => '2031-01-01T00:00:00Z']);
        $this->assertBothRefuse('invalid_input', 'entries/publish', ['id' => $parent['id'], 'at' => '2031-01-01T00:00:00Z']);

        // Changed since it was read, or gone.
        $revision = $this->run_('entries/revisions', ['id' => $other['id']])[0]['id'];

        foreach (['entries/update' => ['title' => 'x'], 'entries/publish' => [], 'entries/unpublish' => [], 'entries/discard-draft' => [], 'entries/delete' => [], 'entries/duplicate' => [], 'entries/move' => ['parentId' => null]] as $name => $more) {
            $this->assertBothRefuse('conflict', $name, ['id' => $other['id'], 'expectedVersion' => $stale, ...$more]);
            $this->assertBothRefuse('not_found', $name, ['id' => self::GONE, ...$more]);
        }

        $this->assertBothRefuse('conflict', 'entries/restore', ['revisionId' => $revision, 'expectedVersion' => $stale]);
        $this->assertBothRefuse('conflict', 'entries/reorder', ['collection' => 'pages', 'ids' => [$other['id']], 'versions' => [$other['id'] => $stale]]);

        // The permission, before any of it.
        $this->assertBothRefuse('forbidden', 'entries/create', ['collection' => 'pages', 'title' => 'Sneaky', 'status' => 'published'], $author);
        $this->assertBothRefuse('forbidden', 'entries/delete', ['id' => $other['id']], $author);
    }

    public function test_a_dry_run_that_passes_is_followed_by_a_run_that_passes(): void
    {
        [$report, $parent] = $this->assertBothPass('entries/create', ['collection' => 'pages', 'title' => 'About', 'status' => 'published']);
        $this->assertSame(['action' => 'create-published', 'type' => 'entry', 'collection' => 'pages', 'title' => 'About', 'slug' => 'about', 'locale' => 'en', 'status' => 'published', 'uri' => '/about'], $report['changes'][0]);
        $this->assertSame([$report['changes'][0]['slug'], $report['changes'][0]['uri']], [$parent['slug'], $parent['uri']]);

        [, $child] = $this->assertBothPass('entries/create', ['collection' => 'pages', 'title' => 'Team', 'parentId' => $parent['id'], 'data' => ['summary' => 'Us']]);
        [, $note] = $this->assertBothPass('entries/create', ['collection' => 'notes', 'title' => 'On file', 'data' => ['body' => 'Words.']]);

        // The fields that would change, of the ones sent: the same value is no change.
        [$report, $saved] = $this->assertBothPass('entries/update', ['id' => $parent['id'], 'title' => 'About Us', 'data' => ['summary' => 'Who we are']]);
        $this->assertSame(['action' => 'update', 'type' => 'entry', 'id' => $parent['id'], 'collection' => 'pages', 'title' => 'About Us', 'fields' => ['title', 'summary']], $report['changes'][0]);
        $this->assertSame('changed', $saved['displayStatus']);
        $this->assertSame(['slug'], $this->dry('entries/update', ['id' => $child['id'], 'slug' => 'people', 'data' => ['summary' => 'Us']])['changes'][0]['fields']);
        $this->assertSame('update-published', $this->dry('entries/update', ['id' => $child['id'], 'publish' => true])['changes'][0]['action']);

        // What a discard throws away, then what a publish puts live.
        [$report] = $this->assertBothPass('entries/discard-draft', ['id' => $parent['id'], 'expectedVersion' => $saved['version']]);
        $this->assertSame(['title', 'summary'], $report['changes'][0]['removes']);
        [$report, $live] = $this->assertBothPass('entries/publish', ['id' => $child['id']]);
        $this->assertSame(['publish', '/about/team'], [$report['changes'][0]['action'], $report['changes'][0]['uri']]);
        $this->assertSame('schedule', $this->dry('entries/publish', ['id' => $note['id'], 'at' => '2031-01-01T00:00:00Z'])['changes'][0]['action']);
        [$report] = $this->assertBothPass('entries/unpublish', ['id' => $child['id'], 'expectedVersion' => $live['version']]);
        $this->assertSame('unpublish', $report['changes'][0]['action']);

        [$report, $copy] = $this->assertBothPass('entries/duplicate', ['id' => $child['id']]);
        $this->assertSame(['duplicate', $child['id'], 'Team (copy)', 'team-copy'], [$report['changes'][0]['action'], $report['changes'][0]['from'], $report['changes'][0]['title'], $report['changes'][0]['slug']]);
        $this->assertSame('team-copy', $copy['slug']);

        [$report, $moved] = $this->assertBothPass('entries/move', ['id' => $copy['id'], 'parentId' => null]);
        $this->assertSame([null, '/team-copy'], [$report['changes'][0]['parentId'], $report['changes'][0]['uri']]);
        $this->assertSame('/team-copy', $moved['uri']);

        [$report] = $this->assertBothPass('entries/reorder', ['collection' => 'pages', 'ids' => [$copy['id'], $parent['id']]]);
        $this->assertSame(['action' => 'reorder', 'type' => 'entries', 'collection' => 'pages', 'parentId' => null, 'ids' => [$copy['id'], $parent['id']]], $report['changes'][0]);

        $this->run_('entries/update', ['id' => $child['id'], 'title' => 'The Team']);
        $first = last($this->run_('entries/revisions', ['id' => $child['id']]))['id'];
        [$report, $restored] = $this->assertBothPass('entries/restore', ['revisionId' => $first]);
        $this->assertSame(['restore', ['title']], [$report['changes'][0]['action'], $report['changes'][0]['fields']]);
        $this->assertSame('Team', $restored['title']);

        // What goes with an entry: its history, and the entries under it move up.
        [$report, $gone] = $this->assertBothPass('entries/delete', ['id' => $parent['id']]);
        $this->assertSame(['delete', 'About', '/about', true, 1], [$report['changes'][0]['action'], $report['changes'][0]['title'], $report['changes'][0]['uri'], $report['changes'][0]['live'], $report['changes'][0]['childrenMovedUp']]);
        $this->assertGreaterThan(0, $report['changes'][0]['revisions']);
        $this->assertSame($parent['id'], $gone['deleted']);
        $this->assertNull($this->run_('entries/get', ['id' => $child['id']])['parentId']);

        // A built-in page made the site's own, once: the second time there is nothing to change.
        $this->cms()->collections()->save(\Cms\Content\Collections\Collection::fromArray('shop-pages', ['title' => 'Shop Pages', 'fields' => [['handle' => 'blocks', 'type' => 'blocks']]]));
        $this->cms()->builtinPages()->register('shop', 'Shop', 'shop-pages', static fn () => ['basket' => ['label' => 'Basket', 'path' => '/basket']], static fn () => []);
        $this->assertBothRefuse('not_found', 'pages/customise', ['group' => 'shop', 'handle' => 'nothing']);
        [$report] = $this->assertBothPass('pages/customise', ['group' => 'shop', 'handle' => 'basket']);
        $this->assertSame(['create', 'shop-pages', 'basket'], [$report['changes'][0]['action'], $report['changes'][0]['collection'], $report['changes'][0]['slug']]);
        $this->assertSame([], $this->dry('pages/customise', ['group' => 'shop', 'handle' => 'basket'])['changes']);
    }

    public function test_settings_are_checked_as_a_save_checks_them(): void
    {
        $this->assertBothRefuse('not_found', 'settings/update', ['namespace' => 'nothing', 'values' => []]);
        $this->assertBothRefuse('invalid_input', 'settings/update', ['namespace' => 'site', 'values' => ['locale' => 'French']]);
        $this->assertBothRefuse('invalid_input', 'settings/update', ['namespace' => 'roles', 'values' => ['roles' => ['Bad Role' => ['label' => 'x']]]]);
        $this->assertBothRefuse('forbidden', 'settings/update', ['namespace' => 'site', 'values' => ['name' => 'Mine']], $this->userWithRole('author'));

        // Only what would differ from what is stored is a change.
        $name = $this->cms()->settings('site', 'name');
        [$report] = $this->assertBothPass('settings/update', ['namespace' => 'site', 'values' => ['name' => 'Renamed']]);
        $this->assertSame([['action' => 'update', 'type' => 'settings', 'namespace' => 'site', 'fields' => ['name']]], $report['changes']);
        $this->assertNotSame($name, $this->cms()->settings('site', 'name'));
        $this->assertSame([], $this->dry('settings/update', ['namespace' => 'site', 'values' => ['name' => 'Renamed']])['changes'][0]['fields']);
    }

    public function test_what_would_be_removed_is_named_and_refused_as_the_real_run_refuses(): void
    {
        $author = $this->userWithRole('author');
        $entry = $this->run_('entries/create', ['collection' => 'pages', 'title' => 'Here']);

        // A collection: with its entries only when asked, and never for someone who may not.
        $this->assertBothRefuse('invalid_input', 'collections/delete', ['handle' => 'pages']);
        $this->assertBothRefuse('forbidden', 'collections/delete', ['handle' => 'pages'], $author);
        $this->assertBothRefuse('invalid_input', 'collections/delete', ['handle' => 'nothing']);
        [$report, $gone] = $this->assertBothPass('collections/delete', ['handle' => 'pages', 'deleteEntries' => true]);
        $this->assertSame([['action' => 'delete', 'type' => 'collection', 'handle' => 'pages', 'title' => 'Pages', 'removes' => ['entries' => 1, 'history' => true]]], $report['changes']);
        $this->assertSame(1, $gone['deletedEntries']);

        // People, what they hold and their tokens.
        $this->assertBothRefuse('conflict', 'users/delete', ['id' => $this->admin->id]);
        $this->assertBothRefuse('not_found', 'users/delete', ['id' => self::GONE]);
        [, $token] = [ApiToken::issue($author, 'a'), ApiToken::issue($author, 'b')];
        $this->run_('users/grant', ['id' => $author->id, 'access' => 'members']);
        $this->assertSame([], $this->dry('users/revoke', ['id' => $author->id, 'access' => 'nothing'])['changes']);
        [$report] = $this->assertBothPass('users/revoke', ['id' => $author->id, 'access' => 'members']);
        $this->assertSame(['revoke', 'members', 1], [$report['changes'][0]['action'], $report['changes'][0]['access'], $report['changes'][0]['removes']['grants']]);
        $mine = $author->tokens()->first();
        $this->assertSame([], $this->dry('tokens/revoke', ['id' => $mine->id])['changes'], 'another person\'s token is not there to revoke');
        [$report] = $this->assertBothPass('tokens/revoke', ['id' => $mine->id], $this->userWithToken($author));
        $this->assertSame([['action' => 'revoke', 'type' => 'token', 'id' => (string) $mine->id, 'name' => $mine->name]], $report['changes']);
        [$report] = $this->assertBothPass('users/delete', ['id' => $author->id]);
        $this->assertSame(['delete', 'user', $author->id, 1], [$report['changes'][0]['action'], $report['changes'][0]['type'], $report['changes'][0]['id'], $report['changes'][0]['removes']['tokens']]);

        // Globals and menus: nothing there is nothing to remove.
        $this->run_('globals/save', ['handle' => 'footer', 'title' => 'Footer', 'fields' => [['handle' => 'note', 'type' => 'text']]]);
        $this->assertSame([], $this->dry('globals/delete', ['handle' => 'nothing'])['changes']);
        [$report] = $this->assertBothPass('globals/delete', ['handle' => 'footer']);
        $this->assertSame([['action' => 'delete', 'type' => 'global', 'handle' => 'footer', 'title' => 'Footer', 'removes' => ['fields' => 1, 'values' => true]]], $report['changes']);
        $this->run_('navigation/save', ['handle' => 'main', 'title' => 'Main', 'items' => [['url' => '/a', 'label' => 'A'], ['url' => '/b', 'label' => 'B']]]);
        $this->assertSame([], $this->dry('navigation/delete', ['handle' => 'nothing'])['changes']);
        [$report, $gone] = $this->assertBothPass('navigation/delete', ['handle' => 'main']);
        $this->assertSame(['delete', 'menu', 'main'], [$report['changes'][0]['action'], $report['changes'][0]['type'], $report['changes'][0]['handle']]);
        $this->assertTrue($gone['deleted']);

        // A language: not the default, and not while it has entries.
        $this->assertBothRefuse('invalid_input', 'languages/remove', ['code' => 'en']);
        $german = $this->run_('entries/create', ['collection' => 'posts', 'title' => 'Hallo', 'locale' => 'de']);
        $this->assertBothRefuse('invalid_input', 'languages/remove', ['code' => 'de']);
        $this->run_('entries/delete', ['id' => $german['id']]);
        [$report] = $this->assertBothPass('languages/remove', ['code' => 'de']);
        $this->assertSame([['action' => 'remove', 'type' => 'language', 'code' => 'de', 'remaining' => ['en']]], $report['changes']);

        // Comments and chats: your own.
        $post = $this->run_('entries/create', ['collection' => 'posts', 'title' => 'Talk']);
        $thread = $this->run_('comments/create', ['entryId' => $post['id'], 'body' => 'First']);
        $this->run_('comments/create', ['entryId' => $post['id'], 'body' => 'Second', 'parentId' => $thread['id']]);
        $this->assertBothRefuse('forbidden', 'comments/delete', ['id' => $thread['id']], $this->userWithRole('author'));
        $this->assertBothRefuse('forbidden', 'comments/delete', ['id' => self::GONE]);
        [$report, $gone] = $this->assertBothPass('comments/delete', ['id' => $thread['id']]);
        $this->assertSame([['action' => 'delete', 'type' => 'comment', 'id' => $thread['id'], 'removes' => ['comments' => 2, 'replies' => 1]]], $report['changes']);
        $this->assertSame([2, 0], [$gone['deleted'], Comment::query()->count()]);
        $chat = Thread::query()->create(['user_id' => $this->admin->id, 'title' => 'A chat']);
        $this->assertSame([], $this->dry('threads/delete', ['id' => $chat->id], $this->userWithRole('editor'))['changes']);
        [$report] = $this->assertBothPass('threads/delete', ['id' => $chat->id]);
        $this->assertSame([['action' => 'delete', 'type' => 'thread', 'id' => $chat->id, 'title' => 'A chat']], $report['changes']);

        // Modules and plugins: what enable(), disable() and uninstall() themselves refuse.
        $this->assertBothRefuse('conflict', 'packages/disable', ['name' => 'letterncms/content']);
        $this->assertBothRefuse('conflict', 'packages/switch', ['name' => 'letterncms/content', 'on' => false]);
        $this->assertBothRefuse('conflict', 'packages/enable', ['name' => 'letterncms/nothing']);
        $this->assertBothRefuse('conflict', 'packages/uninstall', ['name' => 'letterncms/nothing']);
        $this->assertBothRefuse('conflict', 'packages/uninstall', ['name' => 'letterncms/audit']);
        $this->assertSame([['action' => 'enable', 'type' => 'package', 'name' => 'letterncms/audit', 'label' => 'Audit Log', 'changes' => false]], $this->dry('packages/enable', ['name' => 'letterncms/audit'])['changes']);
        [$report] = $this->assertBothPass('packages/disable', ['name' => 'letterncms/audit']);
        $this->assertSame(['disable', true], [$report['changes'][0]['action'], $report['changes'][0]['changes']]);
        $this->assertSame('enable', $this->dry('packages/switch', ['name' => 'letterncms/audit', 'on' => true])['changes'][0]['action']);

        // Sync: checked by what starts it.
        $this->assertBothRefuse('conflict', 'sync/start', ['remote' => 'nowhere', 'direction' => 'pull', 'groups' => ['content']]);
        $this->assertBothRefuse('conflict', 'sync/undo', ['id' => self::GONE]);
        $this->assertBothRefuse('conflict', 'sync/undo', ['id' => self::GONE, 'remote' => 'nowhere']);
        $this->assertSame([], $this->dry('sync/disconnect', ['name' => 'nowhere'])['changes']);
        $key = $this->run_('sync/overview', [])['site']['key'];
        $this->assertSame([['action' => 'replace', 'type' => 'connection-key', 'removes' => ['key' => true]]], $this->dry('sync/renew-key', [])['changes']);
        $this->assertSame($key, $this->run_('sync/overview', [])['site']['key']);
    }

    public function test_a_design_file_and_a_library_are_named_and_refused_as_the_real_run_refuses(): void
    {
        $author = $this->userWithRole('author');
        $this->run_('design/code-write', ['path' => 'scripts/hero.js', 'contents' => 'export function mount() {}']);

        $this->assertBothRefuse('invalid_input', 'design/code-delete', ['path' => 'scripts/../hero.js']);
        $this->assertBothRefuse('forbidden', 'design/code-delete', ['path' => 'scripts/hero.js'], $author);
        // A file that is not there is nothing to remove, as the real run removes nothing.
        $this->assertSame([], $this->dry('design/code-delete', ['path' => 'scripts/none.js'])['changes']);
        [$report] = $this->assertBothPass('design/code-delete', ['path' => 'scripts/hero.js']);
        $this->assertSame([['action' => 'delete', 'type' => 'design-code', 'path' => 'scripts/hero.js', 'removes' => ['file' => true, 'published' => true]]], $report['changes']);
        $this->assertSame([], $this->run_('design/code-files', [])['scripts']);

        $this->app->instance(\Cms\Modules\Site\Design\VendorFetcher::class, new \Cms\Modules\Site\Tests\FakeVendorFetcher([
            'https://cdn.jsdelivr.net/npm/three@0.160.0/+esm' => "export class Vector3{}\n",
            'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js/+esm' => 'import{Vector3 as u}from"/npm/three@0.160.0/+esm";export class OrbitControls{}'."\n",
        ]));
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Vendor::class);
        $this->app->forgetInstance(\Cms\Modules\Site\Design\Code::class);
        $this->run_('design/vendor-add', ['package' => 'three@0.160.0', 'file' => 'examples/jsm/controls/OrbitControls.js', 'as' => 'three/addons/controls/OrbitControls.js']);

        // Nothing by that name, and a library another import still needs.
        $this->assertBothRefuse('invalid_input', 'design/vendor-remove', ['import' => 'gsap']);
        $this->assertBothRefuse('invalid_input', 'design/vendor-remove', ['import' => 'three']);
        $this->assertBothRefuse('forbidden', 'design/vendor-remove', ['import' => 'three/addons/controls/OrbitControls.js'], $author);

        [$report, $removed] = $this->assertBothPass('design/vendor-remove', ['import' => 'three/addons/controls/OrbitControls.js']);
        $this->assertSame(['action' => 'delete', 'type' => 'design-vendor', 'import' => 'three/addons/controls/OrbitControls.js', 'package' => 'three', 'version' => '0.160.0'], array_diff_key($report['changes'][0], ['removes' => 1]));
        $this->assertCount(1, $report['changes'][0]['removes']['files']);
        $this->assertStringContainsString('OrbitControls', $report['changes'][0]['removes']['files'][0]);
        $this->assertSame(['three'], array_column($removed['imports'], 'import'));

        // The last import takes its files and the lock with it.
        [$report] = $this->assertBothPass('design/vendor-remove', ['import' => 'three']);
        $this->assertCount(1, $report['changes'][0]['removes']['files']);
        $this->assertFileDoesNotExist(content_path('design/vendor/lock.json'));
    }

    public function test_a_file_is_not_deleted_while_it_is_used(): void
    {
        $file = $this->run_('media/import', ['data' => base64_encode('plain words'), 'filename' => 'words.txt']);
        $this->assertBothRefuse('not_found', 'media/delete', ['id' => self::GONE]);
        $report = $this->dry('media/delete', ['id' => $file['id']]);
        $this->assertSame(['delete', 'media', $file['id'], 0], [$report['changes'][0]['action'], $report['changes'][0]['type'], $report['changes'][0]['id'], $report['changes'][0]['removes']['stillUsedBy']]);
        $this->assertTrue(\Cms\Modules\Media\MediaItem::query()->whereKey($file['id'])->exists());
        $this->assertSame($file['id'], $this->run_('media/delete', ['id' => $file['id']])['deleted']);
    }

    public function test_the_workspace_and_the_assistant_do_not_take_a_report_for_a_change(): void
    {
        $answers = $this->app->make(Answers::class);
        $create = $this->cms()->abilities()->get('entries/create');
        $input = ['collection' => 'pages', 'title' => 'Dry'];
        $flat = static fn (array $view): string => (string) json_encode($view, JSON_UNESCAPED_UNICODE);

        // A real run is answered with what was done; a dry run with what was checked and would change.
        $filtered = 0;
        $this->cms()->hooks()->addFilter('workspace.answer', static function (array $view) use (&$filtered): array {
            $filtered++;

            return $view;
        });
        $view = $flat($answers->command($create, $input, $this->dry('entries/create', $input), $this->admin));
        $this->assertStringContainsString('Checked only: nothing was changed', $view);
        $this->assertStringContainsString('Would Change', $view);
        $this->assertStringContainsString('"title":"Dry"', $view);
        $this->assertStringNotContainsString('Created', $view);
        $this->assertStringNotContainsString('"ability"', $view, 'nothing to publish or delete: it does not exist');
        $this->assertSame(0, $filtered);
        $this->assertStringContainsString('Created', $flat($answers->command($create, $input, $this->run_('entries/create', $input), $this->admin)));

        // One that could only check the input says that is all it knows.
        $users = ['name' => 'New', 'email' => 'new@example.com', 'password' => 'a-long-secret-123', 'roles' => ['editor']];
        $view = $flat($answers->command($this->cms()->abilities()->get('users/create'), $users, $this->dry('users/create', $users), $this->admin));
        $this->assertStringContainsString('What it would change is not known until it runs.', $view);
        $this->assertStringNotContainsString('Would Change', $view);

        // The assistant: nothing to approve and nothing changed, and the model reads the report.
        $tools = $this->app->make(Toolbox::class);
        $entry = $this->run_('entries/create', $input);
        $this->assertTrue($tools->needsApproval('entries__delete', 'destructive', false, ['id' => $entry['id']]));
        $this->assertTrue($tools->needsApproval('entries__delete', 'destructive', false, ['id' => $entry['id'], 'dryRun' => false]));
        $this->assertFalse($tools->needsApproval('entries__delete', 'writes', true, ['id' => $entry['id'], 'dryRun' => true]));
        $result = $tools->run('entries__delete', ['id' => $entry['id'], 'dryRun' => true, Toolbox::SUMMARY => 'Check deleting Dry'], AbilityContext::forUser($this->admin, 'assistant'));
        $this->assertSame([false, false], [$result['isError'], $result['mutated']]);
        $this->assertSame('full', json_decode($result['content'], true)['checked']);
        $this->assertTrue($tools->run('entries__delete', ['id' => $entry['id']], AbilityContext::forUser($this->admin, 'assistant'))['mutated']);
        $this->assertSame(0, DB::table('audit_log')->where('ability', 'entries/delete')->count() - 1, 'only the real run is recorded');
    }

    public function test_rest_mcp_and_the_command_line_take_it(): void
    {
        [, $token] = ApiToken::issue($this->admin, 'a');
        $headers = ['Authorization' => "Bearer {$token}"];
        $input = ['collection' => 'pages', 'title' => 'Dry', 'dryRun' => true];

        $this->postJson('/api/v1/abilities/entries/create', $input, $headers)->assertOk()
            ->assertJsonPath('data.dryRun', true)->assertJsonPath('data.checked', 'full')->assertJsonPath('data.changes.0.action', 'create');
        $this->postJson('/api/v1/abilities/entries/create', ['collection' => 'pages', 'title' => 'Dry', 'slug' => 'x', 'locale' => 'es', 'dryRun' => true], $headers)->assertStatus(422);
        $this->postJson('/api/v1/abilities/globals/delete', ['handle' => 'nothing', 'dryRun' => true], $headers)->assertOk()->assertExactJson(['data' => [
            'dryRun' => true, 'ability' => 'globals/delete', 'checked' => 'full', 'input' => ['handle' => 'nothing'], 'changes' => [],
        ]]);

        $rpc = fn (string $method, array $params = []) => $this->postJson('/mcp', ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => [...$params, '_meta' => ['io.modelcontextprotocol/protocolVersion' => '2026-07-28']]], $headers);
        $tools = array_column($rpc('tools/list')->json('result.tools'), null, 'name');
        $this->assertSame('boolean', $tools['entries.create']['inputSchema']['properties']['dryRun']['type']);
        $this->assertStringContainsString('"input"', $tools['entries.create']['inputSchema']['properties']['dryRun']['description']);
        $this->assertArrayNotHasKey('dryRun', $tools['entries.list']['inputSchema']['properties']);
        $this->assertSame('object', $tools['entries.create']['outputSchema']['type']);
        $this->assertSame(Ability::DRY_RUN_OUTPUT, $tools['entries.create']['outputSchema']['anyOf'][1]);
        $this->assertArrayNotHasKey('anyOf', $tools['entries.list']['outputSchema']);

        // The content is the report, and the tool's schema takes it and the real result, and nothing else.
        $content = $rpc('tools/call', ['name' => 'entries.create', 'arguments' => $input])->assertJsonPath('result.isError', false)->json('result.structuredContent');
        $this->assertSame([true, 'full'], [$content['dryRun'], $content['checked']]);
        Validator::validate($content, $tools['entries.create']['outputSchema']);
        $schema = $tools['entries.create']['outputSchema'];
        $encode = static fn (array $value) => json_decode((string) json_encode($value));
        $this->assertSame([], Conform::errors($encode($content), $schema));
        $real = $rpc('tools/call', ['name' => 'entries.create', 'arguments' => ['collection' => 'posts', 'title' => 'Real']])->json('result.structuredContent');
        $this->assertSame([], Conform::errors($this->cms()->abilities()->get('entries/create')->encode($real), $schema));
        $this->assertNotSame([], Conform::errors($encode([...$content, 'more' => 1]), $schema));

        $code = Artisan::call('run', ['ability' => 'entries/create', 'input' => ['collection=pages', 'title=Dry'], '--dry-run' => true], $buffer = new BufferedOutput);
        $this->assertSame(0, $code);
        $printed = json_decode($buffer->fetch(), true)['data'];
        $this->assertSame([true, 'full', 'create'], [$printed['dryRun'], $printed['checked'], $printed['changes'][0]['action']]);
        $this->assertSame(1, Artisan::call('run', ['ability' => 'entries/delete', 'input' => ['id='.self::GONE], '--dry-run' => true], new BufferedOutput));

        $this->assertSame(0, $this->cms()->entries()->query()->collection('pages')->count());
    }

    /** The person themselves, as tokens/revoke wants them: it is only for one's own tokens. */
    private function userWithToken(User $user): User
    {
        return $user->forceFill(['super' => true]);
    }
}
