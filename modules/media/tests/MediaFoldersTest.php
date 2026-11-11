<?php

declare(strict_types=1);

namespace Cms\Modules\Media\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Media\MediaItem;
use Cms\Tests\TestCase;

final class MediaFoldersTest extends TestCase
{
    private function file(string $name, string $folder = ''): MediaItem
    {
        return MediaItem::query()->create(['name' => $name, 'filename' => $name.'.txt', 'path' => 'media/'.$name.'.txt', 'mime' => 'text/plain', 'size' => 1, 'hash' => hash('sha256', $name), 'folder' => $folder]);
    }

    private function run_(string $ability, array $input = []): array
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($this->admin(), 'admin'));
    }

    private function refused(string $ability, array $input): string
    {
        try {
            $this->run_($ability, $input);
        } catch (AbilityException $e) {
            return $e->type;
        }

        $this->fail("{$ability} was not refused");
    }

    public function test_the_tree_is_the_folders_made_and_the_folders_files_are_in(): void
    {
        $this->file('a', 'press/2026');

        $this->assertSame(['press', 'press/2026'], $this->run_('media/list')['folders']);

        // An empty folder stands on its own, as a slug, beside the records.
        $made = $this->run_('media-folders/create', ['path' => 'Team Photos/Summer Party']);
        $this->assertSame('team-photos/summer-party', $made['path']);
        $this->assertSame(['press', 'press/2026', 'team-photos', 'team-photos/summer-party'], $made['folders']);
        $this->assertSame(['team-photos/summer-party'], json_decode((string) file_get_contents(content_path('media/folders.json')), true));
        $this->assertSame($made['folders'], $this->run_('media/list', ['folder' => 'team-photos'])['folders']);
        $this->assertSame([], $this->run_('media/list', ['folder' => 'team-photos'])['items']);

        $this->assertSame('conflict', $this->refused('media-folders/create', ['path' => 'press']));
        $this->assertSame('invalid_input', $this->refused('media-folders/create', ['path' => ' / ']));

        // The records' own import leaves the folders' file alone.
        $report = app(\Cms\Modules\Media\MediaManifest::class)->import();
        $this->assertSame([], $report['parse_errors']);
    }

    public function test_a_folder_too_deep_is_refused_not_cut_and_other_scripts_keep_their_names(): void
    {
        $six = 'a/b/c/d/e/f';
        $this->assertSame($six, $this->run_('media-folders/create', ['path' => $six])['path']);

        // Seven deep: nowhere, by no way in. Nothing lands in a folder nobody named.
        $this->assertSame('invalid_input', $this->refused('media-folders/create', ['path' => $six.'/g']));
        $file = $this->file('deep');
        $this->assertSame('invalid_input', $this->refused('media/move', ['ids' => [$file->id], 'folder' => $six.'/g']));
        $this->assertSame('invalid_input', $this->refused('media/update', ['id' => $file->id, 'folder' => $six.'/g']));
        $this->assertSame('', $file->fresh()->folder);

        // A folder moved under another takes what is inside along: the deepest of it must still fit.
        $this->run_('media-folders/create', ['path' => 'x/y']);
        $this->assertSame('invalid_input', $this->refused('media-folders/rename', ['path' => 'x', 'to' => 'a/b/c/d/e/x']));
        $this->assertSame('a/b/c/d/x', $this->run_('media-folders/rename', ['path' => 'x', 'to' => 'a/b/c/d/x'])['path']);

        // Names in other scripts keep their letters; Latin names are the slugs they always were.
        $this->assertSame('写真/夏', $this->run_('media-folders/create', ['path' => '写真/夏'])['path']);
        $this->assertSame('пресса-2026', $this->run_('media-folders/create', ['path' => 'Пресса 2026'])['path']);
        $this->assertSame('cafe-menus', $this->run_('media-folders/create', ['path' => 'Café Menus'])['path']);
        $this->assertSame('conflict', $this->refused('media-folders/create', ['path' => '写真']));
        $this->run_('media/move', ['ids' => [$file->id], 'folder' => '写真/夏']);
        $this->assertSame(['deep'], array_column($this->run_('media/list', ['folder' => '写真/夏'])['items'], 'name'));

        // Nothing but signs is no name, and says so.
        try {
            $this->run_('media-folders/create', ['path' => '!!!']);
            $this->fail('A folder without a name was made.');
        } catch (AbilityException $e) {
            $this->assertSame('Give the folder a name.', $e->getMessage());
        }
    }

    public function test_files_move_to_a_folder_together_and_a_dry_run_moves_nothing(): void
    {
        [$a, $b, $c] = [$this->file('a'), $this->file('b', 'press'), $this->file('c', 'archive')];
        $input = ['ids' => [$a->id, strtoupper($b->id), $c->id], 'folder' => 'Press'];

        $dry = $this->run_('media/move', [...$input, 'dryRun' => true]);
        $this->assertSame('full', $dry['checked']);
        $this->assertSame([['action' => 'move', 'type' => 'media', 'id' => $a->id, 'from' => '', 'to' => 'press'], ['action' => 'move', 'type' => 'media', 'id' => $c->id, 'from' => 'archive', 'to' => 'press']], $dry['changes']);
        $this->assertSame('', $a->fresh()->folder);

        $this->assertEquals(['moved' => [$a->id, $b->id, $c->id], 'folder' => 'press'], $this->run_('media/move', $input));
        $this->assertSame(['press', 'press', 'press'], [$a->fresh()->folder, $b->fresh()->folder, $c->fresh()->folder]);
        $this->assertStringContainsString('folder: press', (string) file_get_contents(content_path("media/{$a->id}.yaml")));

        // Out of every folder; the folder they left stays, the one that was only ever a file's is gone.
        $this->run_('media/move', ['ids' => [$a->id, $b->id, $c->id], 'folder' => '']);
        $this->assertSame(['press'], $this->run_('media/list')['folders']);

        // One id that is no file moves none of them.
        $this->assertSame('not_found', $this->refused('media/move', ['ids' => [$a->id, '01hzzzzzzzzzzzzzzzzzzzzzzz'], 'folder' => 'press']));
        $this->assertSame('', $a->fresh()->folder);
    }

    public function test_a_renamed_folder_takes_its_files_and_folders_along(): void
    {
        [$a, $b, $other] = [$this->file('a', 'press'), $this->file('b', 'press/2026'), $this->file('other', 'pressroom')];
        $this->run_('media-folders/create', ['path' => 'press/2025']);

        $this->assertSame('conflict', $this->refused('media-folders/rename', ['path' => 'press', 'to' => 'pressroom']));
        $this->assertSame('invalid_input', $this->refused('media-folders/rename', ['path' => 'press', 'to' => 'press/old']));
        $this->assertSame('not_found', $this->refused('media-folders/rename', ['path' => 'nowhere', 'to' => 'somewhere']));

        $dry = $this->run_('media-folders/rename', ['path' => 'press', 'to' => 'News', 'dryRun' => true]);
        $this->assertSame([['action' => 'rename', 'type' => 'media-folder', 'path' => 'press', 'to' => 'news', 'moves' => ['files' => 2]]], $dry['changes']);
        $this->assertSame('press', $a->fresh()->folder);

        $renamed = $this->run_('media-folders/rename', ['path' => 'press', 'to' => 'News']);
        $this->assertSame(['news', 2], [$renamed['path'], $renamed['moved']]);
        $this->assertSame(['news', 'news/2025', 'news/2026', 'pressroom'], $renamed['folders']);
        $this->assertSame(['news', 'news/2026', 'pressroom'], [$a->fresh()->folder, $b->fresh()->folder, $other->fresh()->folder]);

        // The same path again changes nothing.
        $this->assertSame(0, $this->run_('media-folders/rename', ['path' => 'news', 'to' => 'news'])['moved']);
    }

    public function test_deleting_a_folder_keeps_its_files_in_the_folder_above(): void
    {
        [$a, $b, $c] = [$this->file('a', 'press/2026'), $this->file('b', 'press/2026/launch'), $this->file('c', 'press')];
        $this->run_('media-folders/create', ['path' => 'press/2026/empty']);

        $dry = $this->run_('media-folders/delete', ['path' => 'press/2026', 'dryRun' => true]);
        $this->assertSame([['action' => 'delete', 'type' => 'media-folder', 'path' => 'press/2026', 'removes' => ['folders' => 3], 'moves' => ['files' => 2, 'to' => 'press']]], $dry['changes']);
        $this->assertSame('press/2026', $a->fresh()->folder);

        $deleted = $this->run_('media-folders/delete', ['path' => 'press/2026']);
        $this->assertSame(['press/2026', 2, ['press']], [$deleted['deleted'], $deleted['moved'], $deleted['folders']]);
        $this->assertSame(['press', 'press', 'press'], [$a->fresh()->folder, $b->fresh()->folder, $c->fresh()->folder]);
        $this->assertSame(3, MediaItem::query()->count());

        // A top folder's files end up in no folder.
        $this->run_('media-folders/delete', ['path' => 'press']);
        $this->assertSame('', $a->fresh()->folder);
        $this->assertSame([], $this->run_('media/list')['folders']);
        $this->assertSame('not_found', $this->refused('media-folders/delete', ['path' => 'press']));

        // Only someone who may edit media changes its folders.
        $this->expectException(AbilityException::class);
        $this->cms()->abilities()->execute('media-folders/create', ['path' => 'mine'], AbilityContext::forUser($this->userWithRole('author'), 'admin'));
    }

    public function test_new_folder_stands_in_the_medias_bar(): void
    {
        $tab = $this->run_('views/get', ['id' => 'media'])['root']['children'][0]['children'][0];

        $this->assertSame(['media/new-folder', 'media/upload'], array_column($tab['props']['actions'], 'component'));
    }
}
