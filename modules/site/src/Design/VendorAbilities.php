<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Closure;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Shape;
use Throwable;

/** `cms vendor …` for agents and the admin: the libraries a site's scripts import by name (Vendor). */
final class VendorAbilities
{
    /**
     * @param Closure(): Vendor $vendor
     * @param Closure(): Code $code
     */
    public static function register(Cms $cms, Closure $vendor, Closure $code): void
    {
        $abilities = $cms->abilities();
        $list = static fn () => ['imports' => array_map(
            static fn (string $name, array $entry) => ['import' => $name, 'package' => $entry['package'], 'version' => $entry['version'], 'file' => $entry['file'], 'source' => $entry['source'], 'url' => '/_cms/site/vendor/'.$entry['path'], 'files' => count($entry['files']), 'integrity' => $entry['files'][$entry['path']]],
            array_keys($vendor()->all()),
            array_values($vendor()->all()),
        )];
        $imports = ['imports' => [[
            'import' => Shape::STRING, 'package' => Shape::STRING, 'version' => Shape::STRING, 'file' => Shape::STRING_OR_NULL, 'source' => Shape::STRING,
            'url' => Shape::STRING, 'files' => Shape::INTEGER, 'integrity' => Shape::STRING,
        ]]];
        // Vendor::add() and update(): what was asked for, every import it brought, and what to know about them.
        $fetched = Shape::of(['specifier' => Shape::STRING, 'version' => Shape::STRING, 'added' => [Shape::STRING], 'notes' => [Shape::STRING], ...$imports]);
        $change = static function (Closure $work) use ($code, $list) {
            try {
                $result = $work();
            } catch (AbilityException $e) {
                throw $e;
            } catch (Throwable $e) {
                throw AbilityException::invalid($e->getMessage());
            }

            $code()->flush();

            return [...(array) $result, ...$list()];
        };

        $abilities->register('design/vendor-list', [
            'label' => 'Vendored Libraries',
            'description' => 'The libraries in content/design/vendor that the site’s scripts import by name (import gsap from "gsap"): package, pinned version, where it came from and the hash of its file.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => Shape::of($imports),
            'handler' => $list,
        ]);

        $abilities->register('design/vendor-add', [
            'label' => 'Add a Library',
            'description' => 'Fetch an npm package’s ES module at one exact version into content/design/vendor and lock it: {"package": "gsap@3.12.5"}. Scripts then import it by name. `file` takes one file of the package instead ({"package": "three@0.160.0", "file": "examples/jsm/controls/OrbitControls.js", "as": "three/addons/controls/OrbitControls.js"}); `as` is the name to import it by. Packages it imports are added too. The site serves the files itself; a build that would still import from an address is refused. What the library does when it runs is not checked.',
            'permission' => 'site.code',
            'annotations' => ['openWorld' => true],
            'input' => ['type' => 'object', 'properties' => [
                'package' => ['type' => 'string', 'maxLength' => 160, 'description' => 'name@version'],
                'file' => ['type' => 'string', 'maxLength' => 300],
                'as' => ['type' => 'string', 'maxLength' => 300],
            ], 'required' => ['package']],
            'output' => $fetched,
            'handler' => static fn (array $in) => $change(static fn () => $vendor()->add((string) $in['package'], isset($in['file']) ? (string) $in['file'] : null, isset($in['as']) ? (string) $in['as'] : null)),
        ]);

        $abilities->register('design/vendor-update', [
            'label' => 'Update a Library',
            'description' => 'Move an import to another exact version, or without `version` to the newest one: {"import": "gsap", "version": "3.13.0"}.',
            'permission' => 'site.code',
            'annotations' => ['openWorld' => true],
            'input' => ['type' => 'object', 'properties' => ['import' => ['type' => 'string', 'maxLength' => 300], 'version' => ['type' => 'string', 'maxLength' => 60]], 'required' => ['import']],
            'output' => $fetched,
            'handler' => static fn (array $in) => $change(static fn () => $vendor()->update((string) $in['import'], isset($in['version']) ? (string) $in['version'] : null)),
        ]);

        $abilities->register('design/vendor-remove', [
            'label' => 'Remove a Library',
            'description' => 'Take an import and its files out of content/design/vendor: {"import": "gsap"}.',
            'permission' => 'site.code',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['import' => ['type' => 'string', 'maxLength' => 300]], 'required' => ['import']],
            'output' => Shape::of(['removed' => Shape::STRING, ...$imports]),
            // Vendor::removable() is what remove() starts with: no such import, or one another import needs, is refused here too.
            'dryRun' => static function (array $in) use ($vendor): array {
                try {
                    $import = $vendor()->removable((string) $in['import']);
                } catch (Throwable $e) {
                    throw AbilityException::invalid($e->getMessage());
                }

                return [['action' => 'delete', 'type' => 'design-vendor', 'import' => (string) $in['import'], 'package' => $import['package'], 'version' => $import['version'], 'removes' => ['files' => $import['files']]]];
            },
            'handler' => static fn (array $in) => $change(static function () use ($in, $vendor) {
                $vendor()->remove((string) $in['import']);

                return ['removed' => (string) $in['import']];
            }),
        ]);
    }
}
