<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Styling;

use Closure;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Support\Schema\Shape;
use InvalidArgumentException;

/** What an agent or the admin can do with the code beside the stylesheet (Code). */
final class CodeAbilities
{
    /**
     * @param  Closure(): Code  $code
     * @param  Closure(): History  $history
     */
    public static function register(Cms $cms, Closure $code, Closure $history): void
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
        // Code::config(): the names that load on every page, with a template and with a component.
        $names = ['scripts' => [Shape::STRING], 'styles' => [Shape::STRING]];
        $listed = Shape::of([...$names, 'load' => [...$names, 'templates' => Shape::map($names), 'components' => Shape::map($names)]]);

        $abilities->register('styling-code/list', [
            'label' => 'Site Scripts and Styles',
            'description' => 'The ES modules (content/styling/scripts/<name>.js) and stylesheets (content/styling/styles/<name>.css) beside the site’s stylesheet, by name, and `load`: which of them load on every page, with a template or with a component (content/styling/code.json). A block loads its own with code: {scripts: [...], styles: [...]}.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'output' => $listed,
            'handler' => $list,
        ]);

        $abilities->register('styling-code/get', [
            'label' => 'Read a Site Script or Style',
            'description' => 'The contents of one file: {"path": "scripts/hero.js"} or {"path": "styles/hero.css"}.',
            'permission' => 'site.code',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['path']],
            'output' => Shape::of(['path' => Shape::STRING, 'contents' => Shape::STRING]),
            'handler' => static fn (array $in) => $guard(static fn () => ['path' => (string) $in['path'], 'contents' => $code()->read((string) $in['path']) ?? throw AbilityException::notFound((string) $in['path'])]),
        ]);

        $abilities->register('styling-code/save', [
            'label' => 'Write a Site Script or Style',
            'description' => 'Create or replace scripts/<name>.js (an ES module; it can import another script by path, "./lib/ease.js") or styles/<name>.css. Names are lowercase letters, digits, - and _, in up to three folders. Pages that load the file are built again. Each save is kept as a version: revisions/list with kind `code` and the path as subject.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200], 'contents' => ['type' => 'string', 'maxLength' => 500000]], 'required' => ['path', 'contents']],
            'output' => Shape::of(['saved' => Shape::STRING]),
            'handler' => static fn (array $in, AbilityContext $ctx) => $guard(static function () use ($in, $ctx, $code, $history) {
                // Kept as a version (revisions/list kind code, the path as subject): Code::parse() refuses a path first.
                Code::parse((string) $in['path']);
                $history()->saveCode((string) $in['path'], static fn () => $code()->write((string) $in['path'], (string) $in['contents']), $ctx->user);

                return ['saved' => (string) $in['path']];
            }),
        ]);

        $abilities->register('styling-code/delete', [
            'label' => 'Delete a Site Script or Style',
            'description' => 'Remove scripts/<name>.js or styles/<name>.css, and its versions.',
            'permission' => 'site.code',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['path' => ['type' => 'string', 'maxLength' => 200]], 'required' => ['path']],
            'output' => Shape::of(['deleted' => Shape::STRING]),
            // A path that is no file's is refused as delete() refuses it; a file that is not there is nothing to remove.
            'dryRun' => static fn (array $in): array => $guard(static fn () => $code()->file((string) $in['path']) === null ? [] : [
                ['action' => 'delete', 'type' => 'styling-code', 'path' => (string) $in['path'], 'removes' => ['file' => true, 'published' => true]],
            ]),
            'handler' => static fn (array $in) => $guard(static function () use ($in, $code, $history) {
                $code()->delete((string) $in['path']);
                $history()->forget((string) $in['path']);

                return ['deleted' => (string) $in['path']];
            }),
        ]);

        $abilities->register('styling-code/set-load', [
            'label' => 'Where Site Scripts and Styles Load',
            'description' => 'Replace content/styling/code.json: {"scripts": ["smooth"], "styles": ["base"]} load on every page; "templates": {"post": {"scripts": [...], "styles": [...]}} with a template; "components": {"header": {...}} on pages that show a component. The site rebuilds.',
            'permission' => 'site.code',
            'input' => ['type' => 'object', 'properties' => [
                'scripts' => ['type' => 'array', 'items' => ['type' => 'string']],
                'styles' => ['type' => 'array', 'items' => ['type' => 'string']],
                'templates' => ['type' => 'object'],
                'components' => ['type' => 'object'],
            ]],
            'output' => $listed,
            'handler' => static function (array $in) use ($code, $list) {
                $code()->saveConfig($in);

                return $list();
            },
        ]);

        $cms->context()->register(
            'cms://site/code',
            'Site Scripts and Styles',
            'ES modules and stylesheets of the site’s own (content/styling/scripts, content/styling/styles), and where they load.',
            static fn () => [
                'rules' => [
                    'content/styling/scripts/<name>.js are ES modules and content/styling/styles/<name>.css stylesheets; a name is its path without the extension ("hero", "lib/ease"). theme.css (the Tailwind stylesheet, styling/get) and custom.js stay: one file each, on every page. A stylesheet here is plain CSS, not compiled by Tailwind: it can use the theme’s variables (var(--color-primary)) but not @apply.',
                    'content/styling/code.json says where they load: top-level "scripts" and "styles" on every page, "templates": {<handle>: {scripts, styles}} with a template, "components": {<handle>: {scripts, styles}} on pages that show that component.',
                    'A block loads its own: {"type": "box", "code": {"scripts": ["hero"], "styles": ["hero"]}}.',
                    'Scripts load as <script type="module"> at the end of the page, never in the editor. One script imports another by path: import { ease } from "./lib/ease.js".',
                    'Libraries come from `cms vendor add <name>@<version>` or styling-vendor/create (see styling-vendor/list): kept in content/styling/vendor, pinned in its lock.json, and imported by name: import gsap from "gsap". Don’t import a library from a CDN in a script: nothing checks a script’s own imports.',
                    'Files are published under /_cms/site/ with a hash in their name and cached forever; changing one rebuilds the pages that load it.',
                ],
                ...$list(),
            ],
        );
    }
}
