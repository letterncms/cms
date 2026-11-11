<?php

declare(strict_types=1);

namespace Cms\Modules\Media\Tests;

use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityContext;
use Cms\Modules\Media\MediaItem;
use Cms\Modules\Media\MediaStore;
use Cms\Modules\Media\SvgSanitizer;
use Cms\Modules\Media\Variants;
use Cms\Tests\TestCase;

final class MediaTest extends TestCase
{
    private function tmp(string $contents): string
    {
        $file = tempnam(sys_get_temp_dir(), 'cms');
        file_put_contents($file, $contents);

        return $file;
    }

    private function jpeg(int $w = 1200, int $h = 800): string
    {
        $im = imagecreatetruecolor($w, $h);
        imagefill($im, 0, 0, imagecolorallocate($im, 30, 90, 200));
        ob_start();
        imagejpeg($im, null, 85);

        return $this->tmp((string) ob_get_clean());
    }

    public function test_library_sorts_before_paginating_and_rejects_unknown_sort_fields(): void
    {
        foreach ([['Zulu', 30], ['Alpha', 10], ['Bravo', 20]] as [$name, $size]) {
            MediaItem::query()->create(['name' => $name, 'filename' => $name.'.txt', 'path' => 'media/'.$name.'.txt', 'mime' => 'text/plain', 'size' => $size, 'hash' => hash('sha256', $name), 'folder' => 'tests']);
        }
        $ctx = AbilityContext::forUser($this->admin(), 'admin');
        $list = fn (array $input) => $this->cms()->abilities()->execute('media/list', $input, $ctx);

        $first = $list(['sort' => 'name', 'perPage' => 2]);
        $second = $list(['sort' => 'name', 'perPage' => 2, 'page' => 2]);
        $this->assertSame(['Alpha', 'Bravo'], array_column($first['items'], 'name'));
        $this->assertSame(['Zulu'], array_column($second['items'], 'name'));
        $this->assertSame(3, $first['total']);
        $this->assertSame(['Zulu', 'Bravo'], array_column($list(['sort' => '-size', 'perPage' => 2])['items'], 'name'));
        $this->assertSame(['Bravo'], array_column($list(['sort' => 'name', 'search' => 'Bravo'])['items'], 'name'));

        $this->expectException(AbilityException::class);
        $list(['sort' => 'arbitrary_sql']);
    }

    public function test_a_media_field_keeps_urls_and_resolves_ids_in_order(): void
    {
        $item = app(MediaStore::class)->store($this->tmp($this->jpeg()), 'a.jpg');
        $field = \Cms\Content\Fields\Field::fromArray(['handle' => 'images', 'type' => 'media']);
        $type = new \Cms\Modules\Media\MediaField;

        $images = $type->augment(['/media/a.webp', $item->id, 'https://example.com/b.png', 'nonsense'], $field);

        $this->assertSame('/media/a.webp', $images[0]);
        $this->assertSame($item->id, $images[1]->item->id);
        $this->assertSame('https://example.com/b.png', $images[2]);
        $this->assertCount(3, $images);

        $one = \Cms\Content\Fields\Field::fromArray(['handle' => 'image', 'type' => 'media', 'max' => 1]);
        $this->assertSame('/media/a.webp', $type->augment(['/media/a.webp'], $one));
    }

    public function test_stores_images_with_dimensions_and_dedupes(): void
    {
        $store = app(MediaStore::class);
        $a = $store->store($this->jpeg(), 'My Photo.JPG');
        $b = $store->store($this->jpeg(), 'copy.jpg');

        $this->assertSame('image/jpeg', $a->mime);
        $this->assertSame([1200, 800], [$a->width, $a->height]);
        $this->assertMatchesRegularExpression('#^media/\d{4}/\d{2}/my-photo-[a-z0-9]{4}\.jpg$#', $a->path);
        $this->assertFileExists(public_path($a->path));
        $this->assertSame($a->id, $b->id, 'identical files are stored once');
    }

    public function test_refuses_disguised_and_dangerous_files(): void
    {
        $this->expectException(AbilityException::class);
        app(MediaStore::class)->store($this->tmp("<?php echo 'pwned';"), 'image.jpg');
    }

    public function test_keeps_what_scenes_and_animation_players_load(): void
    {
        $store = app(MediaStore::class);
        $lottie = (string) json_encode(['v' => '5.9.0', 'fr' => 30, 'ip' => 0, 'op' => 60, 'w' => 200, 'h' => 200, 'layers' => [['ty' => 4, 'ks' => ['o' => ['a' => 0, 'k' => 100], 'p' => ['a' => 0, 'k' => [100, 100, 0]]]]], 'assets' => [['id' => 'i', 'p' => 'data:image/png;base64,AAAA', 'u' => '', 'e' => 1]]]);
        $gltf = (string) json_encode(['asset' => ['version' => '2.0'], 'scenes' => [['nodes' => [0]]], 'nodes' => [[]], 'buffers' => [['uri' => 'data:application/octet-stream;base64,AAAA', 'byteLength' => 3]]]);
        $files = [
            'model/gltf-binary' => ['glb', "glTF\x02\x00\x00\x00".pack('V', 20).str_repeat("\x00", 8)],
            'model/gltf+json' => ['gltf', $gltf],
            'image/vnd.radiance' => ['hdr', "#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 1 +X 1\n\x80\x80\x80\x80"],
            'image/ktx2' => ['ktx2', "\xABKTX 20\xBB\r\n\x1A\n".str_repeat("\x00", 68)],
            'application/json' => ['json', $lottie],
            'application/vnd.rive' => ['riv', "RIVE\x07\x00\xB9\x01\x00\x00\x00\x00\x00\x17"],
        ];

        foreach ($files as $mime => [$ext, $bytes]) {
            // The name says nothing: the bytes decide what a file is.
            $item = $store->store($this->tmp($bytes), "Scene one.bin");

            $this->assertSame($mime, $item->mime);
            $this->assertStringEndsWith('.'.$ext, $item->path);
            $this->assertSame('file', $item->kind(), 'not an image to resize, whatever its type starts with');
            $this->assertFalse($item->isImage());
            $this->assertSame([null, null], [$item->width, $item->height]);
            $this->assertSame($bytes, file_get_contents(public_path($item->path)));
        }
    }

    public function test_refuses_assets_that_carry_code_point_away_or_are_too_large(): void
    {
        $store = app(MediaStore::class);
        $lottie = ['v' => '5.9.0', 'fr' => 30, 'ip' => 0, 'op' => 60, 'w' => 200, 'h' => 200, 'layers' => []];
        $refused = [
            'expressions' => (string) json_encode([...$lottie, 'layers' => [['ks' => ['r' => ['a' => 0, 'k' => 0, 'x' => 'var $bm_rt; $bm_rt = fetch("https://evil.test")']]]]]),
            'another server' => (string) json_encode([...$lottie, 'assets' => [['id' => 'i', 'u' => 'https://evil.test/', 'p' => 'pixel.png']]]),
            'neither' => '{"name": "just some json", "private": true}',
            'points at other files' => (string) json_encode(['asset' => ['version' => '2.0'], 'scenes' => [], 'buffers' => [['uri' => '../../../config/site.yaml']]]),
            '4 MB at most' => (string) json_encode([...$lottie, 'nm' => str_repeat('x', 4 * 1024 * 1024 + 1)]),
        ];

        foreach ($refused as $why => $bytes) {
            try {
                $store->store($this->tmp($bytes), 'animation.json');
                $this->fail("kept: {$why}");
            } catch (AbilityException $e) {
                $this->assertStringContainsString($why, $e->getMessage());
            }
        }

        // A script that calls itself a model is still a script.
        foreach (['model.glb' => "<?php echo 'pwned';", 'anim.riv' => 'RIVE is just text here', 'env.hdr' => '<script>alert(1)</script>'] as $name => $bytes) {
            try {
                $item = $store->store($this->tmp($bytes), $name);
                $this->assertStringEndsWith('.txt', $item->path, "{$name} is kept as the text it is");
            } catch (AbilityException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_svg_is_sanitized(): void
    {
        $clean = app(SvgSanitizer::class)->clean('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)"><rect width="10" height="10" fill="red"/></a><foreignObject><div/></foreignObject><use href="https://evil.test/x.svg#a"/></svg>');

        $this->assertStringNotContainsString('script', $clean);
        $this->assertStringNotContainsString('onload', $clean);
        $this->assertStringNotContainsString('javascript', $clean);
        $this->assertStringNotContainsString('foreignObject', $clean);
        $this->assertStringNotContainsString('evil.test', $clean);
        $this->assertStringNotContainsString('<rect', $clean, 'children of removed elements go too');
    }

    public function test_svg_with_entities_is_refused(): void
    {
        $this->expectException(\RuntimeException::class);
        app(SvgSanitizer::class)->clean('<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>');
    }

    public function test_picture_markup_and_variants(): void
    {
        $item = app(MediaStore::class)->store($this->jpeg(2000, 1000), 'wide.jpg');
        $item->forceFill(['alt' => 'A wide blue image'])->save();
        $html = app(Variants::class)->picture($item, null, ['aspect' => '1/1', 'priority' => true]);

        $this->assertStringContainsString('<picture>', $html);
        $this->assertStringContainsString('type="image/avif"', $html);
        $this->assertStringContainsString('alt="A wide blue image"', $html);
        $this->assertStringContainsString('fetchpriority="high"', $html);
        $this->assertStringContainsString('width="2000" height="2000"', $html);
        $variant = app(Variants::class)->path($item, 960, 'webp', '1x1');
        $this->assertFileExists($variant);
        [$w, $h] = getimagesize($variant);
        $this->assertSame([960, 960], [$w, $h]);
    }

    public function test_variant_route_only_serves_known_sizes(): void
    {
        $item = app(MediaStore::class)->store($this->jpeg(), 'x.jpg');

        $version = app(Variants::class)->version($item);

        $this->get("/_cms/img/{$item->id}/480-{$version}.webp")->assertOk()->assertHeader('Content-Type', 'image/webp');
        $this->get("/_cms/img/{$item->id}/481-{$version}.webp")->assertNotFound();
        $this->get("/_cms/img/{$item->id}/480-{$version}.gif")->assertNotFound();
        $this->get("/_cms/img/{$item->id}/480-00000000.webp")->assertNotFound();
        $this->get("/_cms/img/{$item->id}/480.webp")->assertNotFound();
    }

    public function test_delete_removes_files(): void
    {
        $store = app(MediaStore::class);
        $item = $store->store($this->jpeg(), 'gone.jpg');
        app(Variants::class)->ensure($item, 480, 'webp');
        $store->delete($item);

        $this->assertFileDoesNotExist(public_path($item->path));
        $this->assertDirectoryDoesNotExist(public_path("_cms/img/{$item->id}"));
        $this->assertNull(MediaItem::query()->find($item->id));
    }


    public function test_the_library_is_a_view(): void
    {
        $view = $this->cms()->abilities()->execute('views/get', ['id' => 'media'], AbilityContext::forUser($this->admin(), 'admin'))['root'];
        $tab = $view['children'][0]['children'][0];
        $this->assertSame(['media/library', 'media/upload'], [$tab['children'][0]['type'], $tab['props']['actions'][0]['component']]);
    }
}
