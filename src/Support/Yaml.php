<?php

declare(strict_types=1);

namespace Cms\Support;

use RuntimeException;
use Symfony\Component\Yaml\Yaml as SymfonyYaml;

/** Safe YAML read/write. Objects, PHP constants and custom tags are rejected. */
final class Yaml
{
    /** @return array<string, mixed> */
    public static function parse(string $yaml): array
    {
        $data = SymfonyYaml::parse($yaml);

        return is_array($data) ? $data : [];
    }

    /** @return array<string, mixed> */
    public static function read(string $file): array
    {
        if (! is_file($file)) {
            return [];
        }

        return self::parse((string) file_get_contents($file));
    }

    public static function dump(array $data): string
    {
        return SymfonyYaml::dump($data, 8, 2, SymfonyYaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE | SymfonyYaml::DUMP_MULTI_LINE_LITERAL_BLOCK);
    }

    public static function write(string $file, array $data): void
    {
        Files::put($file, self::dump($data));
    }

    /**
     * Read every *.yaml file in a directory keyed by basename.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function directory(string $dir): array
    {
        $out = [];

        foreach (glob(rtrim($dir, '/').'/*.yaml') ?: [] as $file) {
            try {
                $out[basename($file, '.yaml')] = self::read($file);
            } catch (\Throwable $e) {
                throw new RuntimeException("Invalid YAML in {$file}: {$e->getMessage()}", previous: $e);
            }
        }

        return $out;
    }
}
