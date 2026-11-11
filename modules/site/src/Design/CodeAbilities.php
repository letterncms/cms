<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Closure;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use InvalidArgumentException;

/** What an agent or the admin can do with the code beside the design (Code). */
final class CodeAbilities
{
    /** @param Closure(): Code $code */
    public static function register(Cms $cms, Closure $code): void
    {
        $abilities = $cms->abilities();
        $guard = static function (Closure $work) {
            try {
                return $work();
            } catch (InvalidArgumentException $e) {
                throw AbilityException::invalid($e->getMessage());
            }
        };
        $list = static fn () => [
            'scripts' => array_keys($code()->files('scripts')),
            'styles' => array_keys($code()->files('styles')),
            'load' => $code()->config(),
        ];

        $abilities->register('design/code-files', [
            'label' => 'Design Scripts and Styles',
            'description' => 'The ES modules (content/design/scripts/<name>.js) and stylesheets (content/design/styles/<name>.css) beside the design, by name, and `load`: which of them load on every page, with a template or with a component (content/design/code.json). A block loads its own with code: {scripts: [...], styles: [...]}.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'handler' => $list,
        ]);

        $abilities->register('design/code-read', [
            'label' => 'Read a Design Script or Style',
            'description' => 'The contents of one file: {"path": "scripts/hero.js"} or {"path": "styles/hero.css"}.',
            'permission' => 'site.code',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['path']],
            'handler' => static fn (array $in) => $guard(static fn () => ['path' => (string) $in['path'], 'contents' => $code()->read((string) $in['path']) ?? throw AbilityException::notFound((string) $in['path'])]),
        ]);

        $abilities->register('design/code-write', [
            'label' => 'Write a Design Script or Style',
            'description' => 'Create or replace scripts/<name>.js (an ES module; it can import another script by path, "./lib/ease.js") or styles/<name>.css. Names are lowercase letters, digits, - and _, in up to three folders. Pages that load the file are built again.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200], 'contents' => ['type' => 'string', 'maxLength' => 500000]], 'required' => ['path', 'contents']],
            'handler' => static fn (array $in) => $guard(static function () use ($in, $code) {
                $code()->write((string) $in['path'], (string) $in['contents']);

                return ['saved' => (string) $in['path']];
            }),
        ]);

        $abilities->register('design/code-delete', [
            'label' => 'Delete a Design Script or Style',
            'description' => 'Remove scripts/<name>.js or styles/<name>.css.',
            'permission' => 'site.code',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['path']],
            'handler' => static fn (array $in) => $guard(static function () use ($in, $code) {
                $code()->delete((string) $in['path']);

                return ['deleted' => (string) $in['path']];
            }),
        ]);

        $abilities->register('design/code-load', [
            'label' => 'Where Design Scripts and Styles Load',
            'description' => 'Replace content/design/code.json: {"scripts": ["smooth"], "styles": ["base"]} load on every page; "templates": {"post": {"scripts": [...], "styles": [...]}} with a template; "components": {"header": {...}} on pages that show a component. The site rebuilds.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => [
                'scripts' => ['type' => 'array', 'items' => ['type' => 'string']],
                'styles' => ['type' => 'array', 'items' => ['type' => 'string']],
                'templates' => ['type' => 'object'],
                'components' => ['type' => 'object'],
            ]],
            'handler' => static function (array $in) use ($code, $list) {
                $code()->saveConfig($in);

                return $list();
            },
        ]);

        $cms->context()->register(
            'cms://site/code',
            'Design Scripts and Styles',
            'ES modules and stylesheets beside the design (content/design/scripts, content/design/styles), and where they load.',
            static fn () => [
                'rules' => [
                    'content/design/scripts/<name>.js are ES modules and content/design/styles/<name>.css stylesheets; a name is its path without the extension ("hero", "lib/ease"). custom.css and custom.js stay: one file each, on every page.',
                    'content/design/code.json says where they load: top-level "scripts" and "styles" on every page, "templates": {<handle>: {scripts, styles}} with a template, "components": {<handle>: {scripts, styles}} on pages that show that component.',
                    'A block loads its own: {"type": "box", "code": {"scripts": ["hero"], "styles": ["hero"]}}.',
                    'Scripts load as <script type="module"> at the end of the page, never in the editor. One script imports another by path: import { ease } from "./lib/ease.js".',
                    'Libraries come from `cms vendor add <name>@<version>` or design/vendor-add (see design/vendor-list): kept in content/design/vendor, pinned in its lock.json, and imported by name: import gsap from "gsap". Don’t import a library from a CDN in a script: nothing checks a script’s own imports.',
                    'Files are published under /_cms/site/ with a hash in their name and cached forever; changing one rebuilds the pages that load it.',
                ],
                ...$list(),
            ],
        );
    }
}
