<?php

declare(strict_types=1);

namespace Cms\Tests\Unit;

use Cms\Support\Files;
use PHPUnit\Framework\TestCase;
use RuntimeException;

final class FilesTest extends TestCase
{
    public function test_within_joins_safely(): void
    {
        $this->assertSame('/root/a/b.md', Files::within('/root/', 'a/./b.md'));
    }

    public function test_within_blocks_traversal(): void
    {
        $this->expectException(RuntimeException::class);
        Files::within('/root', 'a/../../etc/passwd');
    }

    public function test_handles(): void
    {
        $this->assertTrue(Files::isHandle('blog-posts_2'));
        $this->assertFalse(Files::isHandle('../x'));
        $this->assertFalse(Files::isHandle('Upper'));
    }
}
