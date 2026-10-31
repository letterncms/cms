<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Cms\Support\Yaml;

/** `---\nyaml\n---\nbody` documents. */
final class Frontmatter
{
    /** @return array{0: array<string, mixed>, 1: string} */
    public static function parse(string $document): array
    {
        $document = str_replace("\r\n", "\n", $document);

        if (! str_starts_with($document, "---\n")) {
            return [[], $document];
        }

        $end = strpos($document, "\n---", 4);

        if ($end === false) {
            return [[], $document];
        }

        $yaml = substr($document, 4, $end - 4);
        $body = trim(substr($document, $end + 4), "\n");

        return [Yaml::parse($yaml), $body];
    }

    public static function dump(array $data, string $body = ''): string
    {
        $yaml = $data === [] ? '' : Yaml::dump($data);

        return "---\n".$yaml."---\n".($body === '' ? '' : "\n".rtrim($body)."\n");
    }
}
