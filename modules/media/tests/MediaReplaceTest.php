<?php

declare(strict_types=1);

namespace Cms\Modules\Media\Tests;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Media\MediaItem;
use Cms\Modules\Media\MediaStore;
use Cms\Modules\Media\Variants;
use Cms\Tests\TestCase;
use Illuminate\Http\UploadedFile;

final class MediaReplaceTest extends TestCase
{
    /** A picture whose left half is red and right half blue, so a test can see which part is left. */
    private function picture(string $format = 'jpeg', int $w = 400, int $h = 200): string
    {
        $im = imagecreatetruecolor($w, $h);
        imagefilledrectangle($im, 0, 0, intdiv($w, 2) - 1, $h, imagecolorallocate($im, 220, 30, 30));
        imagefilledrectangle($im, intdiv($w, 2), 0, $w, $h, imagecolorallocate($im, 30, 30, 220));
        ob_start();
        $format === 'png' ? imagepng($im) : imagejpeg($im, null, 95);

        return (string) ob_get_clean();
    }

    private function tmp(string $bytes): string
    {
        $file = tempnam(sys_get_temp_dir(), 'cms');
        file_put_contents($file, $bytes);

        return $file;
    }

    private function run_(string $ability, array $input, ?\Cms\Users\User $user = null): array
    {
        return $this->cms()->abilities()->execute($ability, $input, AbilityContext::forUser($user ?? $this->admin(), 'admin'));
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

    /** @return array{0: int, 1: int, 2: int} the colour at a point of a stored picture */
    private function colour(MediaItem $item, int $x, int $y): array
    {
        $file = public_path($item->path);
        $im = str_ends_with($file, '.png') ? imagecreatefrompng($file) : imagecreatefromjpeg($file);
        $rgb = imagecolorat($im, $x, $y);

        return [($rgb >> 16) & 0xFF, ($rgb >> 8) & 0xFF, $rgb & 0xFF];
    }

    public function test_a_replaced_file_keeps_its_id_and_its_words_and_gets_a_new_address(): void
    {
        $store = app(MediaStore::class);
        $item = $store->store($this->tmp($this->picture()), 'Hero.jpg', null, 'press');
        $store->update($item, ['name' => 'The hero', 'alt' => 'Two colours', 'caption' => 'Ours', 'focal' => ['x' => 20, 'y' => 30]]);
        app(Variants::class)->ensure($item, 480, 'webp');
        $before = [$item->path, $item->hash, app(Variants::class)->version($item)];
        $input = ['id' => $item->id, 'filename' => 'other.jpg', 'data' => base64_encode($this->picture('jpeg', 800, 600))];

        $dry = $this->run_('media/replace', [...$input, 'dryRun' => true]);
        $this->assertSame(['full', [['action' => 'replace', 'type' => 'media', 'id' => $item->id, 'path' => $item->path, 'mime' => 'image/jpeg', 'removes' => ['file' => true, 'variants' => true]]]], [$dry['checked'], $dry['changes']]);
        $this->assertSame($before[1], $item->fresh()->hash);

        $replaced = $this->run_('media/replace', $input);
        $fresh = $item->fresh();

        $this->assertSame([$item->id, 'The hero', 'Two colours', 'Ours', ['x' => 20, 'y' => 30], 'press'], [$replaced['id'], $replaced['name'], $replaced['alt'], $replaced['caption'], $replaced['focal'], $replaced['folder']]);
        $this->assertSame([800, 600], [$replaced['width'], $replaced['height']]);
        // New bytes, new address: the old one is cached for a year by whoever saw it.
        $this->assertNotSame($before[0], $fresh->path);
        $this->assertMatchesRegularExpression('#^media/\d{4}/\d{2}/hero-[a-z0-9]{4}\.jpg$#', $fresh->path);
        $this->assertFileDoesNotExist(public_path($before[0]));
        $this->assertNotSame($before[1], $fresh->hash);
        $this->assertSame([800, 600], getimagesize(public_path($fresh->path)) ? array_slice(getimagesize(public_path($fresh->path)), 0, 2) : null);
        // The old variants are gone and new ones have a new address, since browsers keep them for a year.
        $this->assertDirectoryDoesNotExist(public_path("_cms/img/{$item->id}"));
        $this->assertNotSame($before[2], app(Variants::class)->version($fresh));
        $this->assertStringContainsString($fresh->hash, (string) file_get_contents(content_path("media/{$item->id}.yaml")));
        $this->assertSame(1, MediaItem::query()->count());

        // The same file again changes nothing, not even the address, and its dry run says so.
        $this->assertSame([], $this->run_('media/replace', [...$input, 'dryRun' => true])['changes']);
        $this->run_('media/replace', $input);
        $this->assertSame([$fresh->hash, $fresh->path], [$item->fresh()->hash, $item->fresh()->path]);
    }

    public function test_a_dry_run_holds_the_file_against_what_the_real_run_refuses(): void
    {
        $item = app(MediaStore::class)->store($this->tmp($this->picture()), 'Hero.jpg');
        $dry = fn (array $input) => $this->refused('media/replace', ['id' => $item->id, 'dryRun' => true, ...$input]);

        $this->assertSame('invalid_input', $dry(['filename' => 'notes.txt', 'data' => base64_encode('plain words')]), 'another kind');
        $this->assertSame('invalid_input', $dry(['filename' => 'evil.jpg', 'data' => base64_encode("<?php echo 'pwned';")]), 'not what it says it is');
        $this->assertSame('invalid_input', $dry(['filename' => 'a.jpg', 'data' => '***']), 'not base64');
        $this->assertSame('invalid_input', $dry([]));
        $this->assertSame('invalid_input', $dry(['filename' => 'a.jpg', 'upload' => str_repeat('0', 24)]), 'no such upload');
        $this->assertFileExists(public_path($item->fresh()->path));
        $this->assertSame([], glob(storage_path('app/uploads/*')) ?: [], 'what a check decoded is thrown away');
    }

    public function test_what_names_the_file_by_its_address_follows_it(): void
    {
        $store = app(MediaStore::class);
        $item = $store->store($this->tmp($this->picture()), 'Hero.jpg');
        $old = '/'.$item->path;
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $collection = array_values(array_filter($this->cms()->collections()->all(), static fn ($c) => ! $c->system))[0]->handle;
        $entry = $this->cms()->abilities()->execute('entries/create', ['collection' => $collection, 'title' => 'With a picture', 'data' => ['cover_url' => $old, 'by_id' => $item->id]], $ctx);
        \Cms\Support\Yaml::write(content_path('globals/zz_brand.yaml'), ['title' => 'Brand', 'fields' => [], 'data' => ['logo' => $old.'?v=2', 'other' => '/media/2020/01/else-aaaa.jpg']]);
        app(\Cms\Modules\Media\MediaReferences::class)->forget();

        $input = ['id' => $item->id, 'filename' => 'other.jpg', 'data' => base64_encode($this->picture('jpeg', 800, 600))];
        $changes = $this->run_('media/replace', [...$input, 'dryRun' => true])['changes'];
        $this->assertSame([['update', 'entry', $entry['id']], ['update', 'global', 'zz_brand']], array_map(static fn (array $c) => [$c['action'], $c['type'], $c['id']], array_slice($changes, 1)));
        $this->assertSame($old, $this->cms()->entries()->find($entry['id'])->working()['data']['cover_url'], 'a dry run rewrites nothing');

        $new = $this->run_('media/replace', $input)['url'];
        $this->assertNotSame($old, $new);
        $stored = $this->cms()->entries()->find($entry['id']);
        $this->assertSame([$new, $item->id], [$stored->working()['data']['cover_url'], $stored->working()['data']['by_id']]);
        $global = \Cms\Support\Yaml::read(content_path('globals/zz_brand.yaml'))['data'];
        $this->assertSame([$new.'?v=2', '/media/2020/01/else-aaaa.jpg'], [$global['logo'], $global['other']]);

        // A crop moves the address too, and what names it follows again.
        $cut = $this->run_('media/transform', ['id' => $item->id, 'crop' => ['x' => 0, 'y' => 0, 'width' => 100, 'height' => 100]])['url'];
        $this->assertNotSame($new, $cut);
        $this->assertSame($cut, $this->cms()->entries()->find($entry['id'])->working()['data']['cover_url']);
        $this->assertSame($cut.'?v=2', \Cms\Support\Yaml::read(content_path('globals/zz_brand.yaml'))['data']['logo']);
        @unlink(content_path('globals/zz_brand.yaml'));
    }

    public function test_another_type_gets_a_new_address_and_another_kind_is_refused(): void
    {
        $item = app(MediaStore::class)->store($this->tmp($this->picture()), 'Hero.jpg');
        $old = $item->path;

        $replaced = $this->run_('media/replace', ['id' => $item->id, 'filename' => 'hero.png', 'data' => base64_encode($this->picture('png'))]);

        $this->assertSame([$item->id, 'image/png'], [$replaced['id'], $replaced['mime']]);
        $this->assertMatchesRegularExpression('#^/media/\d{4}/\d{2}/hero-[a-z0-9]{4}\.png$#', $replaced['url']);
        $this->assertFileDoesNotExist(public_path($old));
        $this->assertFileExists(public_path(ltrim($replaced['url'], '/')));

        $this->assertSame('invalid_input', $this->refused('media/replace', ['id' => $item->id, 'filename' => 'notes.txt', 'data' => base64_encode('plain words')]));
        $this->assertSame('invalid_input', $this->refused('media/replace', ['id' => $item->id, 'filename' => 'evil.jpg', 'data' => base64_encode("<?php echo 'pwned';")]));
        $this->assertSame('invalid_input', $this->refused('media/replace', ['id' => $item->id]));
        $this->assertSame('not_found', $this->refused('media/replace', ['id' => '01hzzzzzzzzzzzzzzzzzzzzzzz', 'filename' => 'a.png', 'data' => base64_encode($this->picture('png'))]));
        $this->assertSame('image/png', $item->fresh()->mime);
        $this->assertFileExists(public_path($item->fresh()->path));
    }

    public function test_the_upload_route_replaces_for_someone_who_may_edit(): void
    {
        $item = app(MediaStore::class)->store($this->tmp($this->picture()), 'Hero.jpg');
        $upload = fn () => UploadedFile::fake()->createWithContent('new.jpg', $this->picture('jpeg', 640, 480));

        // An author may upload, not change what is there.
        $this->actingAs($this->userWithRole('author'))->post('/api/admin/media/upload', ['file' => $upload(), 'replace' => $item->id], ['Accept' => 'application/json'])->assertStatus(403);
        $this->actingAs($this->admin())->post('/api/admin/media/upload', ['file' => $upload(), 'replace' => '01hzzzzzzzzzzzzzzzzzzzzzzz'], ['Accept' => 'application/json'])->assertStatus(404);

        // It runs the ability, so it is recorded like every change, by whoever sent the file.
        $ran = [];
        $this->cms()->hooks()->on('ability.executed', static function ($ability, array $input, $result, $context) use (&$ran): void {
            $ran[] = [$ability->name, $context->user?->id, array_keys($input)];
        });
        $admin = $this->admin();

        $this->actingAs($admin)->post('/api/admin/media/upload', ['file' => $upload(), 'replace' => strtoupper($item->id)], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.id', $item->id)->assertJsonPath('data.width', 640);
        $this->assertSame(1, MediaItem::query()->count());
        $this->assertSame([['media/replace', $admin->id, ['id', 'upload', 'filename']]], $ran);
        $this->assertSame([], glob(storage_path('app/uploads/*')) ?: []);
    }

    public function test_a_picture_is_rotated_and_cropped_and_the_focal_point_follows(): void
    {
        $store = app(MediaStore::class);
        $item = $store->store($this->tmp($this->picture()), 'Hero.jpg');
        // On the red half, near the top left.
        $store->update($item, ['focal' => ['x' => 25, 'y' => 10]]);
        $path = $item->path;

        $dry = $this->run_('media/transform', ['id' => $item->id, 'rotate' => 90, 'crop' => ['x' => 0, 'y' => 0, 'width' => 5000, 'height' => 100], 'dryRun' => true]);
        $this->assertEquals(['from' => ['width' => 400, 'height' => 200], 'to' => ['width' => 200, 'height' => 100], 'crop' => ['x' => 0, 'y' => 0, 'width' => 200, 'height' => 100]], array_intersect_key($dry['changes'][0], ['from' => 1, 'to' => 1, 'crop' => 1]));
        $this->assertSame([400, 200], [$item->fresh()->width, $item->fresh()->height]);

        // A quarter turn clockwise: red is on top, and the point that was near the top left is near the top right.
        $turned = $this->run_('media/transform', ['id' => $item->id, 'rotate' => 90]);
        $this->assertSame([200, 400, ['x' => 90, 'y' => 25]], [$turned['width'], $turned['height'], $turned['focal']]);
        $this->assertNotSame("/{$path}", $turned['url'], 'new pixels, new address');
        $this->assertFileDoesNotExist(public_path($path));
        $path = ltrim($turned['url'], '/');
        $this->assertGreaterThan(180, $this->colour($item->fresh(), 100, 50)[0]);
        $this->assertGreaterThan(180, $this->colour($item->fresh(), 100, 350)[2]);

        // Cut to the lower (blue) half: the point lay above it, so it rests on the upper edge.
        $cut = $this->run_('media/transform', ['id' => $item->id, 'crop' => ['x' => 50, 'y' => 200, 'width' => 100, 'height' => 200]]);
        $this->assertSame([100, 200, ['x' => 100, 'y' => 0]], [$cut['width'], $cut['height'], $cut['focal']]);
        $this->assertGreaterThan(180, $this->colour($item->fresh(), 50, 20)[2]);
        $path = $item->fresh()->path;
        $this->assertSame(ltrim($cut['url'], '/'), $path);
        $this->assertSame([100, 200], array_slice((array) getimagesize(public_path($path)), 0, 2));
        $this->assertSame(hash_file('sha256', public_path($path)), $item->fresh()->hash);

        $this->assertSame('invalid_input', $this->refused('media/transform', ['id' => $item->id]));
        $this->assertSame('invalid_input', $this->refused('media/transform', ['id' => $item->id, 'rotate' => 45]));
        $text = $store->store($this->tmp('plain words'), 'notes.txt');
        $this->assertSame('invalid_input', $this->refused('media/transform', ['id' => $text->id, 'rotate' => 90]));
    }

    public function test_a_photo_stored_on_its_side_is_cropped_as_it_stands(): void
    {
        if (! function_exists('exif_read_data')) {
            $this->markTestSkipped('Needs the exif extension.');
        }

        // 400x200 in the file, turned a quarter by its EXIF orientation (6): it stands 200 wide and 400 high, red on top.
        $jpeg = $this->picture();
        $exif = "Exif\0\0MM\0*\0\0\0\x08\0\x01\x01\x12\0\x03\0\0\0\x01\0\x06\0\0\0\0\0\0";
        $jpeg = substr($jpeg, 0, 2)."\xFF\xE1".pack('n', strlen($exif) + 2).$exif.substr($jpeg, 2);
        $this->cms()->settingsRegistry()->save('media', ['strip_metadata' => false]);
        $store = app(MediaStore::class);
        $item = $store->store($this->tmp($jpeg), 'Sideways.jpg');
        $this->assertSame(6, (int) (exif_read_data(public_path($item->path))['Orientation'] ?? 0), 'the metadata was kept');
        $store->update($item, ['focal' => ['x' => 50, 'y' => 75]]);

        // The lower half of the picture as it stands: 200 wide, from 200 down. Against the stored 400x200 this would be cut to nothing.
        $dry = $this->run_('media/transform', ['id' => $item->id, 'crop' => ['x' => 0, 'y' => 200, 'width' => 200, 'height' => 200], 'dryRun' => true]);
        $this->assertEquals(['x' => 0, 'y' => 200, 'width' => 200, 'height' => 200], $dry['changes'][0]['crop']);
        $this->assertEquals(['width' => 200, 'height' => 200], $dry['changes'][0]['to']);

        $cut = $this->run_('media/transform', ['id' => $item->id, 'crop' => ['x' => 0, 'y' => 200, 'width' => 200, 'height' => 200]]);
        $this->assertSame([200, 200, ['x' => 50, 'y' => 50]], [$cut['width'], $cut['height'], $cut['focal']]);
        $this->assertGreaterThan(180, $this->colour($item->fresh(), 100, 100)[2], 'the lower half is the blue one');
    }
}
