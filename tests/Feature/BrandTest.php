<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Support\Brand;
use Cms\Tests\TestCase;

final class BrandTest extends TestCase
{
    public function test_it_reads_the_brand_file(): void
    {
        $file = json_decode((string) file_get_contents($this->app->cmsPath('brand/brand.json')), true);

        $this->assertSame($file['name'], Brand::get());
        $this->assertSame($file['docs_url'], cms_brand('docs_url'));
        $this->assertSame($file['github_url'], cms_brand('github_url'));
        $this->assertStringContainsString('.svg', Brand::all()['mark']);
        $this->assertFileExists(public_path('_cms/brand/mark.svg'));
    }

    public function test_translations_fill_the_name_in_either_format(): void
    {
        $this->assertSame(Brand::get().' is already installed.', __(':brand is already installed.'));
        $this->assertSame('Ask '.Brand::get(), __('Ask {brand}'));
        $this->assertSame('Fine: x', __('Fine: :value', ['value' => 'x']));
    }

    public function test_no_language_file_contains_the_name(): void
    {
        $name = '/\b'.preg_quote(Brand::get(), '/').'\b/i';

        foreach (glob($this->app->cmsPath('{core,modules/*,plugins/*,themes/*}/lang/*.json'), GLOB_BRACE) ?: [] as $file) {
            $this->assertDoesNotMatchRegularExpression($name, (string) file_get_contents($file), $file);
        }
    }

    public function test_the_manifest_and_admin_page_carry_the_brand(): void
    {
        $this->assertSame(Brand::get(), $this->app->make(\Cms\Admin\Manifest::class)->build($this->admin())['brand']['name']);
    }

    public function test_the_console_uses_the_name(): void
    {
        $console = $this->app->make(\Illuminate\Contracts\Console\Kernel::class);
        $console->call('list');

        $this->assertStringContainsString(Brand::get().' ', $console->output());
    }
}
