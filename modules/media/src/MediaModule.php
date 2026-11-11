<?php

declare(strict_types=1);

namespace Cms\Modules\Media;

use Illuminate\Support\Facades\Route;
use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Modules\Media\Http\MediaController;
use Cms\Packages\Plugin;
use Cms\Support\Schema\Shape;

final class MediaModule extends Plugin
{
    public function register(): void
    {
        foreach ([ImageProcessor::class, SvgSanitizer::class, Variants::class, MediaStore::class, MediaManifest::class, MediaReferences::class, Images::class] as $service) {
            $this->app->singleton($service);
        }

        $this->cms()->whenAvailable(\Cms\Content\Fields\FieldTypeRegistry::class, static function ($types): void {
            $types->register(new MediaField);
            $types->register(new FileField);
        });
    }

    public function boot(): void
    {
        $p = $this->cms()->permissions();
        $p->register('media.view', 'View the Media Library', 'Media');
        $p->register('media.upload', 'Upload Files', 'Media');
        $p->register('media.edit', 'Edit Media Details', 'Media');
        $p->register('media.delete', 'Delete Files', 'Media');

        // A link field's file: where it downloads from and what it is called.
        $this->cms()->hooks()->addFilter('fields.link.media', static fn (?array $file, string $id) => $file ?? (($item = MediaItem::query()->find(strtolower($id))) ? ['url' => $item->url(), 'name' => $item->name] : null));

        $this->settingsSchema();
        $this->routes();
        $this->abilities();
        $this->mediaAsContent();

        $admin = $this->cms()->admin();
        $admin->nav('media', ['path' => '/media', 'icon' => 'media', 'section' => 'content', 'order' => 70, 'pinned' => true, 'permission' => 'media.view']);
        $admin->command('upload-media', ['label' => 'Upload Files', 'icon' => 'upload', 'path' => '/media?upload=1', 'permission' => 'media.upload']);
        $admin->widget('media-recent', ['label' => 'Recent Uploads', 'description' => 'The latest files in the media library.', 'icon' => 'media', 'column' => 'main', 'order' => 40, 'permission' => 'media.view']);
        $this->places();
        $this->adminModule();

        // Files in the workspace's search, for those who may see them: each opens the library at it.
        $this->cms()->hooks()->addFilter('workspace.search', static fn (array $sections, string $query, \Cms\Users\User $user) => mb_strlen($query) < 2 || ! $user->hasPermission('media.view') ? $sections : [...$sections, [
            'id' => 'media', 'title' => __('Media'),
            'items' => MediaItem::query()->where(static fn ($w) => $w->where('name', 'like', "%{$query}%")->orWhere('alt', 'like', "%{$query}%")->orWhere('filename', 'like', "%{$query}%"))->latest()->limit(6)->get()
                ->map(static fn (MediaItem $m) => ['label' => $m->name, 'detail' => $m->filename, 'icon' => $m->isImage() ? 'image' : 'file', 'to' => '/media?search='.rawurlencode($m->name)])->all(),
        ]]);

        $this->cms()->context()->register('cms://media', 'Media library', 'The 50 most recent files with ids, alt text and sizes. Use ids in media fields and image blocks.', fn () => MediaItem::query()->latest()->limit(50)->get()->map->toPublic()->all());
    }

    /**
     * The Media place, as data (see Cms\Admin\Views): its name and size, Upload in its bar, and
     * the library (this module's `media/library` component: the grid, filters, details and uploads).
     */
    private function places(): void
    {
        $admin = $this->cms()->admin();
        $none = ['type' => 'object', 'properties' => (object) [], 'additionalProperties' => false];
        $admin->component('media/library', ['label' => 'Media library', 'description' => 'Every file, as a grid or a table, to search, filter by kind and folder, open and delete.', 'surface' => false, 'permission' => 'media.view', 'props' => $none]);
        $admin->component('media/upload', ['label' => 'Upload Files', 'description' => 'The file picker, for files into the library’s folder on view.', 'surface' => false, 'permission' => 'media.upload', 'props' => $none]);

        $this->cms()->views()->register('media', '/media', static fn () => ['type' => 'ui/page', 'props' => [
            'title' => __('Media'), 'icon' => 'media', 'width' => 'wide',
            // How many the library shows: its filters are in the address.
            'count' => ['source' => ['ability' => 'media/list', 'input' => ['perPage' => 1, 'search' => '{query.search}', 'kind' => '{query.kind}', 'folder' => '{query.folder}']], 'at' => 'total'],
        ], 'children' => [
            ['type' => 'ui/tabs', 'children' => [
                ['type' => 'ui/tab', 'props' => ['id' => 'library', 'label' => __('Library'), 'actions' => [
                    ['label' => __('Upload'), 'icon' => 'upload', 'variant' => 'primary', 'component' => 'media/upload', 'can' => 'media.upload'],
                ]], 'children' => [['type' => 'media/library']]],
            ]],
        ]], permission: 'media.view');
    }

    /** content/media comes in with git or FTP: the table follows on `cms migrate`, install, a full build or an admin visit. */
    private function mediaAsContent(): void
    {
        // A full build imports it too (SiteBuilder::buildAll).
        $this->cms()->hooks()->on('cms.migrated', fn () => $this->app->make(MediaManifest::class)->import());

        if ($this->app->runningInConsole()) {
            $this->commands([Console\MediaCheckCommand::class]);
        }

        $this->app->terminating(function () {
            $request = $this->app->bound('request') ? $this->app->make('request') : null;

            if ($request && ! $this->app->runningInConsole() && $request->is('admin', 'admin/*', 'api/admin/*') && \Cms\Install\Installer::installed()) {
                $manifest = $this->app->make(MediaManifest::class);
                $manifest->stale() && $manifest->import(5.0);
            }
        });
    }

    /** Upload size, image quality and metadata: the Media screen's Settings tab. */
    private function settingsSchema(): void
    {
        $this->cms()->settingsRegistry()->register('media', fields: [
            ['handle' => 'max_upload_mb', 'type' => 'number', 'label' => 'Max Upload Size', 'suffix' => 'MB', 'default' => 32, 'min' => 1, 'max' => 512],
            ['handle' => 'quality', 'type' => 'number', 'display' => 'slider', 'label' => 'Image Quality', 'default' => 78, 'min' => 40, 'max' => 95],
            // The switches together, one group of rows.
            ['handle' => 'avif', 'type' => 'toggle', 'label' => 'Serve AVIF Images', 'default' => true, 'instructions' => 'Smaller than WebP; slower to generate.'],
            ['handle' => 'strip_metadata', 'type' => 'toggle', 'label' => 'Remove Photo Metadata', 'default' => true, 'instructions' => 'Location and camera details.'],
        ], icon: 'media', description: 'Uploads and responsive images.', order: 30, section: 'system', home: 'media');

        // The server's own limit, in the reader's language (settings are registered at boot, before it is known).
        $this->cms()->hooks()->addFilter('settings.fields', static fn (array $fields, string $namespace) => $namespace !== 'media' ? $fields : array_map(
            static fn (array $field) => $field['handle'] === 'max_upload_mb' && ($limit = self::serverLimitMb()) !== null ? [...$field, 'instructions' => __('Your server allows up to :size MB.', ['size' => $limit])] : $field,
            $fields,
        ));
    }

    /** PHP's upload limit (`64M`, `2G`, bytes) in MB, like the field it is shown under; null when there is none. */
    private static function serverLimitMb(): ?int
    {
        $value = trim((string) ini_get('upload_max_filesize'));
        $bytes = (float) $value * match (strtolower(substr($value, -1))) {
            'g' => 1024 ** 3,
            'm' => 1024 ** 2,
            'k' => 1024,
            default => 1,
        };

        return $bytes > 0 ? max(1, (int) floor($bytes / 1024 ** 2)) : null;
    }

    private function routes(): void
    {
        Route::middleware(['web', 'cms.installed', 'auth:web', 'cms.admin', 'cms.locale', 'throttle:60,1'])->post('/api/admin/media/upload', [MediaController::class, 'upload']);
        Route::middleware(['api', 'auth:token', 'throttle:60,1'])->post('/api/v1/media/upload', [MediaController::class, 'upload']);
        Route::get('/_cms/img/{id}/{file}', [MediaController::class, 'variant'])->where('id', '[0-9a-z]{26}');
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();
        $store = fn () => $this->app->make(MediaStore::class);
        $public = static fn (MediaItem $m) => $m->toPublic();

        $a->register('media/list', [
            'label' => 'List Media',
            'description' => 'Browse the media library with search, filters and sorting.',
            'permission' => 'media.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'search' => ['type' => 'string', 'maxLength' => 120],
                'kind' => ['type' => 'string', 'enum' => ['all', 'image', 'video', 'audio', 'pdf', 'file'], 'default' => 'all'],
                'folder' => ['type' => ['string', 'null']],
                'sort' => ['type' => 'string', 'enum' => ['name', '-name', 'size', '-size', 'folder', '-folder', 'created_at', '-created_at', 'updated_at', '-updated_at'], 'default' => '-created_at'],
                'page' => ['type' => 'integer', 'minimum' => 1, 'default' => 1],
                'perPage' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 60],
            ]],
            'output' => Shape::page(self::itemShape(), ['folders' => [Shape::STRING]]),
            'handler' => function (array $in) use ($public) {
                $sort = $in['sort'];
                $q = MediaItem::query()->orderBy(ltrim($sort, '-'), str_starts_with($sort, '-') ? 'desc' : 'asc')->orderBy('id');

                if (! empty($in['search'])) {
                    $term = '%'.$in['search'].'%';
                    $q->where(static fn ($w) => $w->where('name', 'like', $term)->orWhere('alt', 'like', $term)->orWhere('filename', 'like', $term));
                }

                match ($in['kind']) {
                    'image' => $q->where('mime', 'like', 'image/%'),
                    'video' => $q->where('mime', 'like', 'video/%'),
                    'audio' => $q->where('mime', 'like', 'audio/%'),
                    'pdf' => $q->where('mime', 'application/pdf'),
                    'file' => $q->where('mime', 'not like', 'image/%')->where('mime', 'not like', 'video/%')->where('mime', 'not like', 'audio/%'),
                    default => null,
                };

                if (array_key_exists('folder', $in) && $in['folder'] !== null) {
                    $q->where('folder', $in['folder']);
                }

                $page = $q->paginate($in['perPage'], ['*'], 'page', $in['page']);

                return [
                    'items' => array_map($public, $page->items()),
                    'total' => $page->total(),
                    'page' => $page->currentPage(),
                    'pages' => $page->lastPage(),
                    'folders' => MediaItem::query()->select('folder')->distinct()->orderBy('folder')->pluck('folder')->filter()->values()->all(),
                ];
            },
        ]);

        $a->register('media/get-many', [
            'label' => 'Look Up Media',
            'description' => 'Details for media ids.',
            'permission' => 'admin.access',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['ids' => ['type' => 'array', 'items' => ['type' => 'string'], 'maxItems' => 200]], 'required' => ['ids']],
            'output' => Shape::of(['items' => [self::itemShape()]]),
            'handler' => static function (array $in) use ($public) {
                $ids = array_map('strtolower', array_filter($in['ids'], 'is_string'));
                $items = MediaItem::query()->whereIn('id', $ids)->get()->keyBy('id');

                return ['items' => array_values(array_filter(array_map(static fn ($id) => isset($items[$id]) ? $public($items[$id]) : null, $ids)))];
            },
        ]);

        $a->register('media/import', [
            'label' => 'Import Media',
            'description' => 'Add a file from a public URL or base64 data. Returns the new media item (use its id in media fields and image blocks).',
            'permission' => 'media.upload',
            'input' => ['type' => 'object', 'properties' => [
                'url' => ['type' => 'string', 'format' => 'uri'],
                'filename' => ['type' => 'string', 'maxLength' => 200],
                'data' => ['type' => 'string', 'description' => 'Base64 file content (with filename).'],
                'alt' => ['type' => 'string', 'maxLength' => 1000],
                'folder' => ['type' => 'string', 'maxLength' => 200, 'default' => ''],
            ]],
            'output' => self::itemShape(),
            'handler' => function (array $in, AbilityContext $ctx) use ($store, $public) {
                $item = match (true) {
                    isset($in['url']) => $store()->importUrl($in['url'], $ctx->user, $in['folder']),
                    isset($in['data'], $in['filename']) => $store()->importBase64($in['filename'], $in['data'], $ctx->user, $in['folder']),
                    default => throw AbilityException::invalid(__('Send a url, or data with a filename.')),
                };

                if (isset($in['alt'])) {
                    $store()->update($item, ['alt' => $in['alt']]);
                }

                return $public($item->fresh());
            },
        ]);

        $a->register('media/update', [
            'label' => 'Update Media',
            'description' => 'Change name, alt text, caption, folder or focal point (0–100 %).',
            'permission' => 'media.edit',
            'annotations' => ['idempotent' => true],
            'input' => ['type' => 'object', 'properties' => [
                'id' => ['type' => 'string'],
                'name' => ['type' => 'string', 'maxLength' => 200],
                'alt' => ['type' => 'string', 'maxLength' => 1000],
                'caption' => ['type' => 'string', 'maxLength' => 1000],
                'folder' => ['type' => 'string', 'maxLength' => 200],
                'focal' => ['type' => 'object', 'properties' => ['x' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 100], 'y' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 100]]],
            ], 'required' => ['id']],
            'output' => self::itemShape(),
            'handler' => fn (array $in) => $public($store()->update(MediaItem::query()->findOrFail(strtolower($in['id'])), $in)),
        ]);

        $a->register('media/report', [
            'label' => 'Report Media Problems',
            'description' => 'Ids and /media/ URLs that point at nothing, records without a file, files without a record, and items nothing uses.',
            'permission' => 'media.view',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => (object) []],
            'output' => Shape::of([
                'items' => Shape::INTEGER,
                'dangling' => [['id' => Shape::STRING, 'where' => ['kind' => Shape::STRING, 'id' => Shape::STRING, 'title' => Shape::STRING, 'locale?' => Shape::STRING_OR_NULL, 'path' => Shape::STRING]]],
                'missing_files' => [Shape::STRING], 'orphan_files' => [Shape::STRING], 'unused' => [Shape::STRING], 'parse_errors' => [Shape::STRING],
            ]),
            'handler' => fn () => $this->app->make(MediaReferences::class)->report(),
        ]);

        // The file a delete is for, refused while something uses it (unless forced).
        $deletable = function (array $in): MediaItem {
            $item = MediaItem::query()->findOrFail(strtolower($in['id']));
            $used = empty($in['force']) ? $this->app->make(MediaReferences::class)->of($item) : [];

            if ($used !== []) {
                throw AbilityException::conflict(__('This file is still used by :where.', ['where' => implode(', ', array_unique(array_map(static fn (array $r) => $r['where']['title'], $used)))]));
            }

            return $item;
        };

        $a->register('media/delete', [
            'label' => 'Delete Media',
            'description' => 'Permanently delete a file and its image variants. Refused while something uses it, unless force is true.',
            'permission' => 'media.delete',
            'annotations' => ['destructive' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string'], 'force' => ['type' => 'boolean', 'default' => false]], 'required' => ['id']],
            'output' => Shape::of(['deleted' => Shape::STRING]),
            'dryRun' => function (array $in) use ($deletable): array {
                $item = $deletable($in);

                return [['action' => 'delete', 'type' => 'media', 'id' => $item->id, 'path' => $item->path, 'removes' => ['file' => true, 'variants' => true, 'stillUsedBy' => count($this->app->make(MediaReferences::class)->of($item))]]];
            },
            'handler' => function (array $in) use ($store, $deletable) {
                $store()->delete($deletable($in));

                return ['deleted' => $in['id']];
            },
        ]);
    }

    /** MediaItem::toPublic(): a file of the library. */
    private static function itemShape(): Shape
    {
        return Shape::of([
            'id' => Shape::STRING, 'url' => Shape::STRING, 'thumb' => Shape::STRING_OR_NULL, 'name' => Shape::STRING, 'filename' => Shape::STRING, 'mime' => Shape::STRING,
            'kind' => Shape::enum('image', 'video', 'audio', 'pdf', 'file'), 'size' => Shape::INTEGER, 'width' => Shape::INTEGER_OR_NULL, 'height' => Shape::INTEGER_OR_NULL,
            'alt' => Shape::STRING_OR_NULL, 'caption' => Shape::STRING_OR_NULL, 'focal' => ['x' => Shape::INTEGER, 'y' => Shape::INTEGER], 'folder' => Shape::STRING,
            'createdAt' => Shape::STRING_OR_NULL, 'publishedAt' => Shape::STRING_OR_NULL, 'updatedAt' => Shape::STRING_OR_NULL,
        ]);
    }
}
