<?php

declare(strict_types=1);

namespace Cms\Modules\Users\Tests;

use Cms\Content\Entries\Entry;
use Cms\Contracts\SiteBuilder;
use Cms\Support\Yaml;
use Cms\Tests\TestCase;
use Cms\Users\Accounts;
use Cms\Users\User;

/**
 * Gating proved on two businesses that have nothing to do with each other, using only what any
 * plugin can use (`cms()->accounts()` and hooks), plus every surface a withheld text could leak through.
 */
final class ContentGateTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/blocks', 'letterncms/site', 'letterncms/seo'];
    }

    protected function collections(): array
    {
        return [
            'pages' => ['title' => 'Pages', 'structure' => 'tree', 'route' => '/{parent_uri}/{slug}', 'home' => 'home', 'body' => 'blocks', 'fields' => [['handle' => 'blocks', 'type' => 'blocks']]],
            // A course site: a course is a page, its lessons are children, a lesson can be a free sample.
            'courses' => ['title' => 'Courses', 'structure' => 'tree', 'route' => '/courses/{parent_uri}/{slug}', 'body' => 'body', 'fields' => [['handle' => 'body', 'type' => 'markdown']]],
            // A membership magazine: everything is a teaser for non-members, unless it says otherwise.
            'articles' => ['title' => 'Articles', 'structure' => 'dated', 'route' => '/articles/{slug}', 'body' => 'blocks', 'gate' => ['mode' => 'teaser', 'access' => ['subscriber'], 'teaser_words' => 6, 'teaser_fields' => ['excerpt']], 'fields' => [
                ['handle' => 'excerpt', 'type' => 'textarea'],
                ['handle' => 'secret_note', 'type' => 'text'],
                ['handle' => 'blocks', 'type' => 'blocks'],
            ]],
            'guides' => ['title' => 'Guides', 'driver' => 'files', 'route' => '/guides/{slug}', 'body' => 'body', 'fields' => [['handle' => 'body', 'type' => 'markdown']]],
        ];
    }

    protected function prepareSite(string $site): void
    {
        Yaml::write($site.'/config/accounts.yaml', ['enabled' => true]);
        Yaml::write($site.'/config/site.yaml', ['name' => 'Test site', 'url' => 'http://localhost', 'locale' => 'en', 'locales' => ['en'], 'static' => false]);
    }

    private function entry(string $collection, string $title, array $data = [], ?string $parentId = null): Entry
    {
        $entry = cms()->entryService()->create($collection, ['title' => $title, 'status' => 'published', 'data' => $data, ...($parentId ? ['parentId' => $parentId] : [])]);

        return cms()->entries()->find($entry->id);
    }

    private function member(string $email = 'ada@example.com', array $roles = ['member']): User
    {
        return User::query()->create(['name' => 'Ada', 'email' => $email, 'password' => 'correct-horse-1', 'roles' => $roles]);
    }

    private function as(?User $user): void
    {
        $user ? $this->actingAs($user) : $this->app['auth']->guard('web')->logout();
        cms()->entries()->gate()->forget();
    }

    public function test_a_course_site_sells_lessons_with_a_free_sample(): void
    {
        // What a shop plugin would do at "paid": only the public API, no plugin dependency.
        $course = $this->entry('courses', 'PHP Course', ['body' => 'Everything about PHP.', 'gate' => ['mode' => 'locked', 'access' => ['course-php']]]);
        $lesson = $this->entry('courses', 'Lesson One', ['body' => 'The paid lesson text.'], $course->id);
        $sample = $this->entry('courses', 'Free Sample', ['body' => 'The free lesson text.', 'gate' => ['mode' => 'public']], $course->id);
        $lessonUrl = $lesson->uri;

        // A stranger is sent to sign in, and comes back here afterwards. The free lesson is open.
        $this->get($lessonUrl)->assertRedirect('/sign-in?next='.rawurlencode($lessonUrl));
        $this->get($sample->uri)->assertOk()->assertSee('The free lesson text.');

        // Signed in without the course: told so, in the site's design, without the text.
        $student = $this->member('student@example.com');
        $this->actingAs($student);
        $this->get($lessonUrl)->assertForbidden()->assertDontSee('The paid lesson text.')->assertSee('You don’t have access', false);

        // Bought: the lesson opens. It never becomes something a cache may keep.
        cms()->accounts()->grant($student, 'course-php', 'shop');
        $page = $this->get($lessonUrl)->assertOk()->assertSee('The paid lesson text.');
        $this->assertStringContainsString('no-store', (string) $page->headers->get('Cache-Control'));

        // Refunded, or another source's grant remains: each source removes only its own.
        cms()->accounts()->grant($student, 'course-php', 'gift');
        cms()->accounts()->revoke($student, 'course-php', 'shop');
        $this->get($lessonUrl)->assertOk();
        cms()->accounts()->revoke($student, 'course-php', 'gift');
        $this->get($lessonUrl)->assertForbidden();
    }

    public function test_a_membership_magazine_shows_teasers_and_a_subscription_expires(): void
    {
        $article = $this->entry('articles', 'Big Story', [
            'excerpt' => 'A short summary.',
            'secret_note' => 'never-public-note',
            'blocks' => [
                ['type' => 'paragraph', 'props' => ['text' => 'The opening words anyone reads.']],
                ['type' => 'gate-break'],
                ['type' => 'paragraph', 'props' => ['text' => 'The paying readers part.']],
            ],
        ]);
        $free = $this->entry('articles', 'Free Issue', ['blocks' => [['type' => 'paragraph', 'props' => ['text' => 'One two three four five six seven eight nine ten eleven.']]], 'gate' => ['mode' => 'public']]);

        $guest = $this->get($article->uri)->assertOk()->assertSee('The opening words anyone reads.')->assertDontSee('The paying readers part.')->assertDontSee('never-public-note')->assertSee('Sign in to read the rest');
        $this->assertStringContainsString('no-store', (string) $guest->headers->get('Cache-Control'));
        $this->get($free->uri)->assertOk()->assertSee('eleven');

        $reader = $this->member('reader@example.com');
        $this->actingAs($reader);
        $this->get($article->uri)->assertOk()->assertDontSee('The paying readers part.')->assertSee('doesn’t include', false);

        cms()->accounts()->grant($reader, 'subscriber', 'membership', now()->addMonth());
        $this->get($article->uri)->assertOk()->assertSee('The paying readers part.')->assertDontSee('doesn’t include', false);

        // The year is over: the same page, without a task having to run.
        $this->travel(2)->months();
        $this->app->forgetInstance(Accounts::class);
        $this->get($article->uri)->assertOk()->assertDontSee('The paying readers part.');
    }

    public function test_a_role_opens_a_page_too_and_the_team_can_read_everything(): void
    {
        $page = $this->entry('pages', 'Members Area', ['gate' => ['mode' => 'locked']]);
        $vip = $this->entry('pages', 'VIP', ['gate' => ['mode' => 'locked', 'access' => ['vip']]]);

        $this->actingAs($this->member());
        $this->get($page->uri)->assertOk();
        $this->get($vip->uri)->assertForbidden();

        $this->actingAs($this->member('v@example.com', ['vip']));
        $this->get($vip->uri)->assertOk();

        $this->actingAs($this->userWithRole('editor'));
        $this->get($vip->uri)->assertOk();
    }

    public function test_a_plugin_can_decide_with_a_hook(): void
    {
        $page = $this->entry('pages', 'Sponsors', ['gate' => ['mode' => 'locked', 'access' => ['sponsor']]]);
        $member = $this->member();
        cms()->hooks()->addFilter('gate.allows', static fn (bool $allowed, User $user) => $allowed || $user->email === 'ada@example.com');
        $this->actingAs($member);
        $this->get($page->uri)->assertOk();
    }

    public function test_with_accounts_off_a_locked_page_is_simply_not_there(): void
    {
        $page = $this->entry('pages', 'Hidden', ['gate' => ['mode' => 'locked']]);
        cms()->settingsRegistry()->save('accounts', ['enabled' => false]);
        $this->get($page->uri)->assertNotFound();
    }

    public function test_nothing_leaks_through_any_other_surface(): void
    {
        $locked = $this->entry('pages', 'Locked Title', ['gate' => ['mode' => 'locked', 'access' => ['x']], 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'locked-body-text']]]]);
        $this->entry('pages', 'Child Of Locked', ['blocks' => [['type' => 'paragraph', 'props' => ['text' => 'child-body-text']]]], $locked->id);
        $teaser = $this->entry('articles', 'Teased', ['excerpt' => 'Public bit', 'secret_note' => 'secret-note-text', 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'teased-opening']], ['type' => 'gate-break'], ['type' => 'paragraph', 'props' => ['text' => 'withheld-body-word']]]]);
        $this->entry('pages', 'Plain Page', ['blocks' => [['type' => 'paragraph', 'props' => ['text' => 'plain-body-text']]]]);

        // Lists: PHP and the Delivery API.
        $titles = array_map(static fn (Entry $e) => $e->title, cms()->entries()->query()->collection('pages')->live()->get());
        $this->assertSame(['Plain Page'], $titles);
        $this->assertSame(1, cms()->entries()->query()->collection('pages')->live()->count());
        $this->assertSame(['Child Of Locked', 'Locked Title', 'Plain Page'], array_map(static fn (Entry $e) => $e->title, cms()->entries()->query()->collection('pages')->ungated()->orderBy('title')->get()));

        $api = $this->getJson('/api/v1/content/pages')->assertOk();
        $this->assertSame(1, $api->json('meta.total'));
        $this->assertStringNotContainsString('locked-body-text', $api->getContent());
        $this->getJson('/api/v1/content/pages/locked-title')->assertNotFound();

        $article = $this->getJson('/api/v1/content/articles/teased')->assertOk();
        $this->assertTrue($article->json('data.gated'));
        $this->assertStringNotContainsString('withheld-body-word', $article->getContent());
        $this->assertStringNotContainsString('secret-note-text', $article->getContent());
        $this->assertStringNotContainsString('"gate"', $article->getContent());

        // Guessing at withheld text through search, filters or a sort gets nothing.
        $this->assertSame(0, $this->getJson('/api/v1/content/articles?q=withheld-body-word')->json('meta.total'));
        $this->assertSame(0, $this->getJson('/api/v1/content/articles?filter[secret_note]=secret-note-text')->json('meta.total'));
        $this->assertSame(0, $this->getJson('/api/v1/content/articles?sort=secret_note')->json('meta.total'));

        // Files everyone can fetch.
        $search = $this->get('/search.json')->assertOk()->getContent();
        $this->assertStringNotContainsString('locked-body-text', $search);
        $this->assertStringNotContainsString('Locked Title', $search);
        $this->assertStringNotContainsString('withheld-body-word', $search);

        $sitemap = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringNotContainsString('locked-title', $sitemap);
        $this->assertStringContainsString('plain-page', $sitemap);

        $this->get($locked->uri.'.md')->assertNotFound();
        $this->get($teaser->uri.'.md')->assertNotFound();
        $this->get('/plain-page.md')->assertOk();

        // A template reading an entry or a relation sees only the reader's view.
        $read = fn (string $id) => new \Cms\Modules\Site\Rendering\AugmentedEntry($this->cms()->entries()->find($id));
        $this->assertSame('', (string) $read($locked->id)->raw('blocks', ''));
        $this->assertNull($read($teaser->id)->raw('secret_note'));
        $this->assertSame('Public bit', $read($teaser->id)->raw('excerpt'));
    }

    public function test_a_gated_entry_never_becomes_a_file_and_stops_being_one(): void
    {
        cms()->settingsRegistry()->save('site', ['static' => true]);
        $public = $this->entry('pages', 'Open Page', ['blocks' => [['type' => 'paragraph', 'props' => ['text' => 'open-text']]]]);
        $locked = $this->entry('pages', 'Closed Page', ['gate' => ['mode' => 'locked'], 'blocks' => [['type' => 'paragraph', 'props' => ['text' => 'closed-text']]]]);
        $teaser = $this->entry('articles', 'Teased Page', ['blocks' => [['type' => 'paragraph', 'props' => ['text' => 'teaser-text']]]]);
        // Whoever's request happens to run the build, the files are for everybody.
        $this->actingAs($this->admin());
        $builder = app(SiteBuilder::class);
        $builder->queue(null, 'test');
        $builder->process(60000);

        $this->assertFileExists(public_path('open-page/index.html'));
        $this->assertFileDoesNotExist(public_path('closed-page/index.html'));
        $this->assertFileDoesNotExist(public_path('articles/teased-page/index.html'));

        // Gating a page that is a file removes the file on the next rebuild.
        $id = $public->id;
        cms()->entryService()->update($id, ['data' => ['gate' => ['mode' => 'locked'], 'blocks' => $public->data['blocks']]]);
        cms()->entryService()->publish($id);
        $this->assertTrue($builder->hasWork(), 'A change in the gate changes which pages may exist as files.');
        $builder->process(60000);
        $this->assertFileDoesNotExist(public_path('open-page/index.html'));
        $this->assertFileDoesNotExist(public_path('open-page.md'));
    }

    public function test_a_scheduled_locked_entry_is_closed_before_its_date(): void
    {
        $entry = cms()->entryService()->create('pages', ['title' => 'Later', 'data' => ['gate' => ['mode' => 'locked']]]);
        cms()->entryService()->publish($entry->id, null, now()->addDay()->toIso8601String());
        $this->assertTrue(cms()->entries()->gate()->isGated(cms()->entries()->find($entry->id)));
    }

    public function test_a_file_deployed_without_an_event_is_gated_at_the_next_request(): void
    {
        $guide = $this->entry('guides', 'Deployed', ['body' => 'guide-text']);
        $this->get($guide->uri)->assertOk();
        $gate = cms()->entries()->gate();
        $this->assertFalse($gate->isGated($guide));

        $collection = cms()->collections()->find('guides');
        $file = glob(content_path('collections/guides/*'))[0];
        file_put_contents($file, str_replace('mode: inherit', 'mode: locked', (string) file_get_contents($file)));
        touch($file, time() + 5);
        clearstatcache();
        app(\Cms\Content\Entries\FileDriver::class)->forget($collection);
        $this->app->forgetInstance(\Cms\Content\Entries\EntryGate::class);
        $this->assertTrue(cms()->entries()->gate()->isGated($guide));
    }

    public function test_a_readers_copy_cannot_be_saved_over_the_real_one(): void
    {
        $this->entry('articles', 'Teased', ['secret_note' => 'keep-me', 'blocks' => []]);
        $copy = cms()->entries()->query()->collection('articles')->live()->first();
        $this->assertSame('teaser', $copy->gated);
        $this->expectException(\LogicException::class);
        cms()->entries()->save($copy);
    }

    public function test_the_gate_field_is_offered_only_with_accounts_on_and_stays_out_of_saved_yaml(): void
    {
        $this->assertNotNull(cms()->collections()->find('pages')->blueprint()->field('gate'));
        $definition = cms()->collections()->find('pages')->toYaml();
        $this->actingAs($this->admin());
        cms()->abilities()->execute('collections/save', ['handle' => 'pages', 'definition' => $definition], \Cms\Abilities\AbilityContext::forUser(auth()->user()));
        $this->assertStringNotContainsString('Who Can Read', (string) file_get_contents(content_path('collections/pages.yaml')));
    }

    public function test_people_are_listed_apart(): void
    {
        $admin = $this->admin();
        $this->member();
        $this->userWithRole('editor');
        $context = \Cms\Abilities\AbilityContext::forUser($admin);

        $team = cms()->abilities()->execute('users/list', [], $context);
        $this->assertSame(2, $team['total']);
        $visitors = cms()->abilities()->execute('users/list', ['kind' => 'visitors'], $context);
        $this->assertSame(['ada@example.com'], array_column($visitors['items'], 'email'));
        $this->assertTrue($visitors['items'][0]['visitor']);
        $this->assertSame(3, cms()->abilities()->execute('users/list', ['kind' => 'all'], $context)['total']);
        $this->assertSame(2, cms()->abilities()->execute('users/recent', [], $context)['total']);

        cms()->abilities()->execute('users/grant', ['id' => $visitors['items'][0]['id'], 'access' => 'magazine'], $context);
        $this->assertSame('magazine', cms()->abilities()->execute('users/access', ['id' => $visitors['items'][0]['id']], $context)[0]['access']);
        cms()->abilities()->execute('users/revoke', ['id' => $visitors['items'][0]['id'], 'access' => 'magazine'], $context);
        $this->assertSame([], cms()->abilities()->execute('users/access', ['id' => $visitors['items'][0]['id']], $context));

        cms()->abilities()->execute('users/update', ['id' => $visitors['items'][0]['id'], 'suspended' => true], $context);
        $this->assertSame(Accounts::SUSPENDED, User::query()->find($visitors['items'][0]['id'])->status);
    }
}
