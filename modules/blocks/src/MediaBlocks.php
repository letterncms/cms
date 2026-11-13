<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

use Cms\Modules\Media\Image;
use Cms\Modules\Media\Images;
use Cms\Modules\Media\MediaItem;
use Cms\Modules\Media\Variants;

/**
 * Audio, Gallery, Carousel and File: blocks added the way a plugin adds its own, through
 * BlockRegistry::register and BlockRegistry::feature, with the helpers any render function has
 * (Elements, Media, Icons). Their stylesheets and the gallery's lightbox come to a page only when
 * one of them is on it.
 */
final class MediaBlocks
{
    public const array ASPECTS = ['auto' => 'Original', '1/1' => 'Square', '4/3' => '4:3', '3/2' => '3:2', '16/9' => '16:9', '3/4' => 'Portrait', '4/5' => '4:5'];

    /** Audio a page can play from an address: a file of one of these kinds, on this site or over https. */
    private const string AUDIO = '#^(https://|/(?!/))[^\s"\'<>]+\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)(\?[^\s"\'<>]*)?$#i';

    /**
     * @param  \Closure(string): ?string  $asset  The address of a built file of the Blocks module (dist/media/<file>), or null when it isn't built.
     */
    public static function register(BlockRegistry $blocks, \Closure $asset): void
    {
        foreach (['audio', 'gallery', 'carousel', 'file'] as $name) {
            $blocks->feature($name, style: $asset($name.'.css'));
        }

        $blocks->feature('lightbox', script: $asset('lightbox.js'), style: $asset('lightbox.css'));
        $blocks->feature('autoplay', script: $asset('autoplay.js'));

        foreach (self::all() as $block) {
            $blocks->register($block);
        }
    }

    /** @return list<array> */
    public static function all(): array
    {
        $space = static fn (string $default) => ['type' => 'select', 'options' => [
            'token:space.0' => 'None', 'token:space.2' => 'XS', 'token:space.4' => 'S', 'token:space.6' => 'M', 'token:space.8' => 'L', 'token:space.12' => 'XL', 'token:space.16' => '2XL',
        ], 'default' => $default];

        return [
            [
                'name' => 'audio', 'title' => 'Audio', 'icon' => 'music-notes', 'category' => 'media',
                'description' => 'A song, podcast or recording with a player.', 'keywords' => ['sound', 'music', 'podcast', 'mp3', 'player', 'recording', 'episode'],
                'inline' => ['caption'], 'html' => 'figure', 'uses' => ['audio'],
                'fields' => [
                    ['handle' => 'file', 'type' => 'media', 'label' => 'Audio File', 'max' => 1, 'accept' => 'audio/*'],
                    ['handle' => 'url', 'type' => 'url', 'label' => 'Audio URL', 'placeholder' => 'An MP3, M4A, OGG or WAV file', 'about' => 'Used when no file is chosen.'],
                    ['handle' => 'title', 'type' => 'text', 'label' => 'Title'],
                    ['handle' => 'caption', 'type' => 'richtext', 'label' => 'Caption', 'inline' => true],
                    ['handle' => 'loop', 'type' => 'toggle', 'label' => 'Loop'],
                ],
                'render' => self::audio(...),
                'example' => ['url' => '/media/episode-12.mp3', 'title' => 'Episode 12: Slow mornings', 'caption' => 'Recorded at the market, June 2026.'],
            ],
            [
                'name' => 'gallery', 'title' => 'Gallery', 'icon' => 'media', 'category' => 'media',
                'description' => 'Photos in a grid that open large.', 'keywords' => ['photos', 'images', 'pictures', 'grid', 'lightbox', 'portfolio', 'album'],
                'html' => 'ul', 'uses' => ['gallery'],
                'fields' => [
                    ['handle' => 'images', 'type' => 'media', 'label' => 'Images', 'accept' => 'image/*'],
                    ['handle' => 'columns', 'type' => 'number', 'label' => 'Columns', 'min' => 1, 'max' => 6, 'default' => 3],
                    ['handle' => 'aspect', 'type' => 'select', 'label' => 'Crop', 'options' => self::ASPECTS, 'default' => '3/2'],
                    ['handle' => 'gap', 'label' => 'Gap', ...$space('token:space.4')],
                    ['handle' => 'captions', 'type' => 'toggle', 'label' => 'Show Captions', 'default' => true],
                    ['handle' => 'lightbox', 'type' => 'toggle', 'label' => 'Open Large on Click'],
                ],
                'derive' => static function (array $p): array {
                    $n = self::columns($p);

                    return [
                        'base' => ['display' => 'grid', 'gap' => $p['gap'] ?? 'token:space.4', 'gridTemplateColumns' => "repeat({$n},minmax(0,1fr))", 'alignItems' => 'start'],
                        'tablet' => ['gridTemplateColumns' => 'repeat('.min($n, 3).',minmax(0,1fr))'],
                        'mobile' => ['gridTemplateColumns' => 'repeat('.($n >= 3 ? 2 : 1).',minmax(0,1fr))'],
                    ];
                },
                'render' => self::gallery(...),
                'example' => ['images' => ['/media/harbour.jpg', '/media/market.jpg', '/media/dunes.jpg'], 'columns' => 3, 'aspect' => '3/2', 'lightbox' => true],
            ],
            [
                'name' => 'carousel', 'title' => 'Carousel', 'icon' => 'slideshow', 'category' => 'layout',
                'description' => 'Slides in a row to step through.', 'keywords' => ['slider', 'slideshow', 'swipe', 'scroll', 'testimonials', 'cards', 'images', 'row'],
                'children' => true, 'defer' => true, 'html' => 'section', 'uses' => ['carousel'],
                'fields' => [
                    ['handle' => 'per_view', 'type' => 'select', 'label' => 'Slides Per View', 'options' => ['1' => '1', '2' => '2', '3' => '3', '4' => '4', 'auto' => 'Auto'], 'default' => '1', 'display' => 'segmented', 'about' => 'Auto: each slide keeps its own width.'],
                    ['handle' => 'gap', 'label' => 'Gap', ...$space('token:space.4')],
                    ['handle' => 'label', 'type' => 'text', 'label' => 'Name for Screen Readers', 'default' => 'Carousel'],
                ],
                'template' => [
                    ['type' => 'image', 'props' => ['aspect' => '3/2']],
                    ['type' => 'image', 'props' => ['aspect' => '3/2']],
                    ['type' => 'image', 'props' => ['aspect' => '3/2']],
                ],
                'render' => self::carousel(...),
                'example' => ['per_view' => '3', 'gap' => 'token:space.6'],
            ],
            [
                'name' => 'file', 'title' => 'File', 'icon' => 'file', 'category' => 'media',
                'description' => 'A file to download, with its type and size.', 'keywords' => ['download', 'pdf', 'document', 'attachment', 'menu', 'brochure', 'zip'],
                'html' => 'a', 'uses' => ['file'],
                'fields' => [
                    ['handle' => 'file', 'type' => 'media', 'label' => 'File', 'max' => 1, 'accept' => '*'],
                    ['handle' => 'label', 'type' => 'text', 'label' => 'Label', 'placeholder' => 'The file’s name'],
                ],
                'render' => self::file(...),
                'example' => ['file' => ['/media/menu.pdf']],
            ],
        ];
    }

    public static function audio(array $d): string
    {
        $b = $d['block'];
        $src = Media::url($b['file'] ?? null);
        $url = trim((string) ($b['url'] ?? ''));
        $src ??= preg_match(self::AUDIO, $url) ? $url : null;

        if ($src === null) {
            return $d['editor'] ? Elements::mediaPlaceholder($d, 'music-notes', '8/1') : '';
        }

        // A file from elsewhere is loaded by the page: the site's security policy names its host.
        cms()->hooks()->dispatch('site.policy.source', 'media', $src);

        $title = trim((string) ($b['title'] ?? ''));
        $caption = ! empty($b['caption']) ? '<figcaption'.Elements::editable($d, 'caption').Elements::placeholder($d, 'caption').'>'.$b['caption'].'</figcaption>' : '';

        return '<figure '.$d['attrs'].'>'
            .($title !== '' ? '<p class="cms-audio__title">'.e($title).'</p>' : '')
            .'<audio controls preload="metadata" src="'.e($src).'"'.(! empty($b['loop']) ? ' loop' : '').($title !== '' ? ' aria-label="'.e($title).'"' : '').'></audio>'
            .$caption.'</figure>';
    }

    public static function gallery(array $d): string
    {
        $b = $d['block'];
        $images = array_values(array_filter(is_array($b['images'] ?? null) ? $b['images'] : [$b['images'] ?? null], static fn ($i) => $i instanceof Image || (is_string($i) && $i !== '')));
        $aspect = self::aspect($b['aspect'] ?? '3/2');
        $n = self::columns($b);
        $lightbox = ! empty($b['lightbox']);
        $captions = (bool) ($b['captions'] ?? true);
        // The width each picture is shown at: the content's width split in columns, as the columns fall on each screen.
        $sizes = '(min-width: 72rem) '.round(72 / $n, 2).'rem, (min-width: 64rem) '.round(100 / $n, 2).'vw, (min-width: 48rem) '.round(100 / min($n, 3), 2).'vw, '.round(100 / ($n >= 3 ? 2 : 1), 2).'vw';
        $items = [];

        foreach ($images as $image) {
            $item = app(Images::class)->item($image);
            $img = Media::img($image, '', ['aspect' => $aspect, 'sizes' => $sizes]);

            if ($img === '') {
                continue;
            }

            $caption = $captions && $item?->caption ? '<figcaption>'.e((string) $item->caption).'</figcaption>' : '';
            $items[] = ['img' => $img, 'item' => $item, 'image' => $image, 'caption' => $caption];
        }

        if ($items === []) {
            return $d['editor'] ? Elements::mediaPlaceholder($d, 'images', min($n, 4).'/1', 'div') : '';
        }

        $total = count($items);
        $html = '';

        foreach ($items as $i => $entry) {
            $inner = $entry['img'];

            // Without scripts, a link to the picture at its largest; with them, the lightbox opens on it.
            if ($lightbox) {
                $inner = '<a '.self::fullImage($entry['item'], $entry['image'])
                    .(($entry['item']?->alt ?? '') === '' ? ' aria-label="'.e(__('Image :number of :total', ['number' => $i + 1, 'total' => $total])).'"' : '')
                    .($entry['item']?->caption ? ' data-caption="'.e((string) $entry['item']->caption).'"' : '').'>'.$inner.'</a>';
            }

            $html .= '<li class="cms-gallery__item"><figure>'.$inner.$entry['caption'].'</figure></li>';
        }

        if ($lightbox && ! $d['editor']) {
            $d['renderer']->uses('lightbox');
            $html .= self::lightbox();
        }

        return '<ul '.$d['attrs'].' role="list"'.($lightbox ? ' data-cms-lightbox' : '').'>'.$html.'</ul>';
    }

    /** The dialog a gallery's pictures open in, ready for the lightbox script to copy: in the site's language and its icons. */
    private static function lightbox(): string
    {
        $button = static fn (string $kind, string $label, string $icon) => '<button type="button" class="cms-lightbox__button cms-lightbox__'.$kind.'" data-cms-lightbox-'.$kind.' aria-label="'.e($label).'">'.Icons::svg($icon).'</button>';

        return '<template data-cms-lightbox-dialog><dialog class="cms-lightbox" aria-label="'.e(__('Images')).'">'
            .'<div class="cms-lightbox__top"><p class="cms-lightbox__count" aria-live="polite"></p>'.$button('close', __('Close'), 'x').'</div>'
            .'<div class="cms-lightbox__stage"><figure class="cms-lightbox__figure"><img class="cms-lightbox__image" alt="" decoding="async"><figcaption class="cms-lightbox__caption"></figcaption></figure></div>'
            .$button('previous', __('Previous Image'), 'caret-left').$button('next', __('Next Image'), 'caret-right')
            .'</dialog></template>';
    }

    /** href and what the lightbox shows of one picture: uncropped, as large as the library makes it. */
    private static function fullImage(?MediaItem $item, mixed $image): string
    {
        if ($item === null || ! $item->isImage()) {
            return 'href="'.e((string) Media::url($image)).'"';
        }

        $variants = app(Variants::class);
        $widths = $variants->widths($item);
        $largest = end($widths);
        $href = $variants->ensure($item, $largest, 'webp') ? $variants->url($item, $largest, 'webp') : $item->url();

        return 'href="'.e($href).'" data-srcset="'.e($variants->srcset($item, 'webp')).'" data-width="'.(int) $item->width.'" data-height="'.(int) $item->height.'"';
    }

    /**
     * A row of slides on the Carousel behaviour (Logic, behaviors.carousel): the first child scrolls, the buttons
     * after it step through. Without scripts it is a row that scrolls, and the buttons stay out of sight.
     */
    public static function carousel(array $d): string
    {
        $b = $d['block'];
        $renderer = $d['renderer'];
        $children = array_values(array_filter((array) ($d['node']['children'] ?? []), static fn ($c) => is_array($c) && empty($c['hidden'])));
        $perView = in_array((string) ($b['per_view'] ?? '1'), ['1', '2', '3', '4', 'auto'], true) ? (string) ($b['per_view'] ?? '1') : '1';
        $gap = Css::value($b['gap'] ?? 'token:space.4') ?? 'var(--space-4)';
        $id = $renderer->nextId('carousel');
        $label = trim((string) ($b['label'] ?? '')) ?: __('Carousel');

        if ($d['editor']) {
            // The canvas: the blocks themselves are the slides, so each can be selected and moved.
            $slides = $renderer->children($children);
        } else {
            $rendered = array_values(array_filter(array_map(static fn (array $child) => $renderer->children([$child]), $children), static fn (string $html) => trim($html) !== ''));

            if ($rendered === []) {
                return '';
            }

            $slides = '';

            foreach ($rendered as $i => $html) {
                $slides .= '<div class="cms-carousel__slide" role="group" aria-roledescription="'.e(__('slide')).'" aria-label="'.e(__(':number of :total', ['number' => $i + 1, 'total' => count($rendered)])).'">'.$html.'</div>';
            }
        }

        // Keyboards scroll only what takes focus: the row does, unless a slide has something to focus already.
        $focus = preg_match('/<(a\s[^>]*href|button|input|select|textarea)\b|\stabindex="/i', $slides) ? '' : ' tabindex="0"';
        $button = static fn (string $kind, string $text, string $icon) => '<button type="button" class="cms-carousel__button" aria-label="'.e($text).'" aria-controls="'.$id.'">'.Icons::svg($icon).'</button>';
        $behaviour = $d['editor'] || str_contains((string) $d['attrs'], 'x-cms-carousel') ? '' : ' x-cms-carousel="'.e(Logic::attributes(['behaviors' => ['carousel' => []]], '')['x-cms-carousel']).'"';
        $d['editor'] || $renderer->uses('logic');

        return '<section '.$d['attrs'].$behaviour.' aria-roledescription="'.e(__('carousel')).'" aria-label="'.e($label).'" data-per-view="'.$perView.'">'
            .'<div class="cms-carousel__track" id="'.$id.'" style="--cms-gap:'.e($gap).'"'.$focus.'>'.$slides.'</div>'
            .'<div class="cms-carousel__nav">'.$button('previous', __('Previous Slide'), 'caret-left').$button('next', __('Next Slide'), 'caret-right').'</div>'
            .'</section>';
    }

    public static function file(array $d): string
    {
        $b = $d['block'];
        $item = app(Images::class)->item($b['file'] ?? null);
        $given = $b['file'] ?? null;
        $given = is_array($given) ? ($given[0] ?? null) : $given;
        $href = $item ? Media::url($item->id) : (is_string($given) && preg_match('#^(https://|/(?!/))[^\s"\'<>]+$#', $given) ? $given : null);

        if ($href === null) {
            return $d['editor'] ? Elements::mediaPlaceholder($d, 'file-arrow-down', '8/1', 'div') : '';
        }

        $extension = strtolower(pathinfo((string) parse_url($item ? $item->filename : $href, PHP_URL_PATH), PATHINFO_EXTENSION));
        $name = $item ? trim((string) $item->name).($extension !== '' ? '.'.$extension : '') : rawurldecode(basename((string) parse_url($href, PHP_URL_PATH)));
        $label = trim((string) ($b['label'] ?? '')) ?: $name;
        $meta = implode(', ', array_filter([$extension !== '' ? strtoupper($extension) : null, $item ? self::size((int) $item->size) : null]));
        $kind = $item ? $item->kind() : 'file';
        $icon = match (true) {
            $kind === 'pdf' => 'file-pdf',
            $kind === 'image' => 'file-image',
            $kind === 'video' => 'file-video',
            $kind === 'audio' => 'file-audio',
            in_array($extension, ['zip', 'gz', 'tar', '7z', 'rar'], true) => 'file-zip',
            in_array($extension, ['doc', 'docx', 'odt', 'rtf'], true) => 'file-doc',
            in_array($extension, ['xls', 'xlsx', 'ods', 'csv'], true) => 'file-xls',
            in_array($extension, ['ppt', 'pptx', 'odp', 'key'], true) => 'file-ppt',
            in_array($extension, ['txt', 'md'], true) => 'file-text',
            default => 'file',
        };

        return '<a '.$d['attrs'].' href="'.e($href).'" download="'.e($name).'">'
            .'<span class="cms-file__icon">'.Icons::svg($icon).'</span>'
            .'<span class="cms-file__body"><span class="cms-file__name">'.e($label).'</span>'.($meta !== '' ? '<span class="cms-file__meta">'.e($meta).'</span>' : '').'</span>'
            .'<span class="cms-file__download">'.Icons::svg('download-simple').'</span></a>';
    }

    /** A file's size for people: 240 KB, 1.2 MB, in the site's language. */
    public static function size(int $bytes): string
    {
        [$value, $unit] = match (true) {
            $bytes >= 1_000_000_000 => [$bytes / 1_000_000_000, 'GB'],
            $bytes >= 1_000_000 => [$bytes / 1_000_000, 'MB'],
            default => [max(1, $bytes / 1000), 'KB'],
        };
        $decimals = $unit !== 'KB' && $value < 10 ? 1 : 0;
        $number = class_exists(\NumberFormatter::class)
            ? (new \NumberFormatter(app()->getLocale(), \NumberFormatter::DECIMAL))->format(round($value, $decimals))
            : number_format($value, $decimals);

        return match ($unit) {
            'GB' => __(':size GB', ['size' => $number]),
            'MB' => __(':size MB', ['size' => $number]),
            default => __(':size KB', ['size' => $number]),
        };
    }

    private static function columns(array $props): int
    {
        return max(1, min(6, (int) ($props['columns'] ?? 3)));
    }

    private static function aspect(mixed $aspect): ?string
    {
        return is_string($aspect) && $aspect !== 'auto' && isset(self::ASPECTS[$aspect]) ? $aspect : null;
    }
}
