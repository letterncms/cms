<?php

declare(strict_types=1);

namespace Cms\Modules\Blocks;

/**
 * Map and Place: an open map drawn in the browser from vector tiles (MapLibre with OpenFreeMap's tiles, no account
 * and no key), in a style the site picks from presets or colours itself. A Map holds its Places, as written or one
 * per item of a Repeat, and each Place is also a line of text for people who don't see the map.
 *
 * The map's script and library come to a page only when a Map is on it, and load when it scrolls near.
 */
final class MapBlocks
{
    /** Where the tiles, the styles, the label fonts and the icons come from. A page with a map may connect to it. */
    public const string TILES = 'https://tiles.openfreemap.org';

    /**
     * The presets, in the inspector's order. `site` takes its colours from the theme where the map is, so it
     * follows the site's design, its schemes and dark mode; the rest are looks of their own.
     */
    public const array STYLES = [
        'site' => 'Site Colors',
        'light' => 'Light',
        'dark' => 'Dark',
        'streets' => 'Streets',
        'bright' => 'Bright',
        'night' => 'Night',
        'gray' => 'Gray',
        'pastel' => 'Pastel',
        'blueprint' => 'Blueprint',
    ];

    /** The colours a map's style may be given, over its preset's: each paints one kind of thing on the map. */
    public const array COLORS = ['land' => 'Land Color', 'water' => 'Water Color', 'park' => 'Park Color', 'road' => 'Road Color', 'label' => 'Label Color', 'pin' => 'Pin Color'];

    public const array ASPECTS = ['16/9' => '16:9', '4/3' => '4:3', '3/2' => '3:2', '1/1' => 'Square', '21/9' => 'Wide', '3/4' => 'Portrait'];

    /** Places drawn by the Map being rendered: a Place renders only inside one. */
    private static int $depth = 0;

    /**
     * @param  \Closure(string): ?string  $asset  The address of a built file of the Blocks module (dist/media/<file>), or null when it isn't built.
     */
    public static function register(BlockRegistry $blocks, \Closure $asset): void
    {
        $blocks->feature('map', script: $asset('map.js'), style: $asset('map.css'));

        foreach (self::all() as $block) {
            $blocks->register($block);
        }
    }

    /** @return list<array> */
    public static function all(): array
    {
        $colors = [];

        foreach (self::COLORS as $handle => $label) {
            $colors[] = ['handle' => 'color_'.$handle, 'type' => 'color', 'label' => $label, 'design' => true];
        }

        return [
            [
                'name' => 'map', 'title' => 'Map', 'icon' => 'map-trifold', 'category' => 'media',
                'description' => 'An open map with pins, in your site’s colors or a style of its own.',
                'keywords' => ['location', 'address', 'directions', 'pin', 'marker', 'places', 'openstreetmap', 'where', 'route', 'contact'],
                'children' => ['map-place', 'repeat'], 'defer' => true, 'html' => 'figure', 'uses' => ['map'],
                'fields' => [
                    ['handle' => 'style', 'type' => 'select', 'label' => 'Style', 'options' => self::STYLES, 'default' => 'site', 'about' => 'Site Colors follows your design, its color schemes and dark mode.'],
                    ['handle' => 'zoom', 'type' => 'number', 'label' => 'Zoom', 'min' => 2, 'max' => 19, 'default' => 15, 'about' => 'With more than one place, the map shows them all and zooms in no further than this.'],
                    ['handle' => 'aspect', 'type' => 'select', 'label' => 'Aspect Ratio', 'options' => self::ASPECTS, 'default' => '16/9'],
                    ['handle' => 'interactive', 'type' => 'toggle', 'label' => 'Move and Zoom', 'default' => true, 'about' => 'Off: a still map.'],
                    ['handle' => 'list', 'type' => 'toggle', 'label' => 'List Places Below', 'about' => 'Off: only screen readers read the list.'],
                    ['handle' => 'label', 'type' => 'text', 'label' => 'Name for Screen Readers', 'default' => 'Map'],
                    ...$colors,
                ],
                'template' => [['type' => 'map-place']],
                'render' => self::map(...),
                'example' => ['style' => 'site', 'zoom' => 15],
            ],
            [
                'name' => 'map-place', 'title' => 'Place', 'icon' => 'map-pin', 'category' => 'media', 'parent' => 'map',
                'description' => 'A pin on the map, with its name.', 'keywords' => ['pin', 'marker', 'location', 'address'],
                'html' => 'div',
                'fields' => [
                    ['handle' => 'place', 'type' => 'geo', 'label' => 'Location', 'required' => true],
                    ['handle' => 'title', 'type' => 'text', 'label' => 'Name'],
                    ['handle' => 'text', 'type' => 'textarea', 'label' => 'Details', 'placeholder' => 'Opening hours, a floor, a phone number'],
                    ['handle' => 'url', 'type' => 'url', 'component' => 'link', 'reference' => true, 'label' => 'Link'],
                ],
                'render' => self::place(...),
                'example' => ['place' => ['lat' => 51.0543, 'lng' => 3.7174, 'address' => 'Korenmarkt, Gent'], 'title' => 'Visitor centre'],
            ],
        ];
    }

    public static function map(array $d): string
    {
        $b = $d['block'];
        $renderer = $d['renderer'];
        $children = array_values(array_filter((array) ($d['node']['children'] ?? []), static fn ($c) => is_array($c) && empty($c['hidden'])));

        self::$depth++;

        try {
            $places = $renderer->children($children);
        } finally {
            self::$depth--;
        }

        // A map shows where something is: without a place it has nothing to show.
        if (! $d['editor'] && ! str_contains($places, 'data-cms-map-place')) {
            return '';
        }

        // The page loads the map's tiles, styles and label fonts from there: its security policy names it.
        cms()->hooks()->dispatch('site.policy.source', 'connect', self::TILES);

        $label = trim((string) ($b['label'] ?? '')) ?: __('Map');
        $aspect = isset(self::ASPECTS[$b['aspect'] ?? '']) ? (string) $b['aspect'] : '16/9';
        $options = self::options($b, $d['editor']);
        $json = (string) json_encode($options, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $pin = self::color($b['color_pin'] ?? null);
        $attrs = $pin !== null ? Elements::style((string) $d['attrs'], '--cms-map-pin:'.$pin) : (string) $d['attrs'];
        $view = '<div class="cms-map__view" style="aspect-ratio:'.$aspect.'" role="region" aria-label="'.e($label).'" data-cms-map-view';

        // The canvas runs no scripts: the editor draws the map there itself, still, from the same script.
        if ($d['editor'] && ($script = self::script()) !== null) {
            $view .= ' data-cms-canvas="'.e((string) json_encode([['src' => $script, 'props' => $options]], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)).'"';
        }

        $view .= '><p class="cms-map__failed" data-cms-map-failed hidden>'.e(__('The map could not load. The places are listed below.')).'</p></div>';

        $renderer->uses('map');

        return '<figure '.$attrs.' data-cms-map="'.e($json).'"'.(! empty($b['list']) || $d['editor'] ? ' data-list' : '').'>'
            .$view.'<div class="cms-map__places">'.$places.'</div></figure>';
    }

    public static function place(array $d): string
    {
        $b = $d['block'];
        $place = is_array($b['place'] ?? null) ? $b['place'] : [];
        $lat = is_numeric($place['lat'] ?? null) ? (float) $place['lat'] : null;
        $lng = is_numeric($place['lng'] ?? null) ? (float) $place['lng'] : null;
        $valid = $lat !== null && $lng !== null && abs($lat) <= 90 && abs($lng) <= 180;

        // Only a Map shows its places; a Place anywhere else, or without degrees, is nothing on the site.
        if (! $d['editor'] && (! $valid || self::$depth === 0)) {
            return '';
        }

        $title = trim((string) ($b['title'] ?? ''));
        $address = trim((string) ($place['address'] ?? ''));
        $text = trim((string) ($b['text'] ?? ''));
        $url = Elements::url($b['url'] ?? null);
        $name = $title !== '' ? $title : ($address !== '' ? $address : __('Place'));
        $heading = $url !== null ? '<a'.Elements::href($url, false, $d['scope']).'>'.e($name).'</a>' : e($name);
        $data = $valid ? ' data-cms-map-place data-lat="'.round($lat, 6).'" data-lng="'.round($lng, 6).'"' : '';
        $directions = $valid
            ? '<a class="cms-map__directions" href="https://www.openstreetmap.org/directions?to='.round($lat, 6).'%2C'.round($lng, 6).'" target="_blank" rel="noopener">'.e(__('Directions')).'</a>'
            : '';

        return '<div '.$d['attrs'].$data.'>'
            .'<p class="cms-map__name">'.$heading.'</p>'
            .($title !== '' && $address !== '' ? '<p class="cms-map__address">'.nl2br(e($address), false).'</p>' : '')
            .($text !== '' ? '<p class="cms-map__text">'.nl2br(e($text), false).'</p>' : '')
            .$directions.'</div>';
    }

    /** What the script needs to draw the map: its style, the colours over it, how close, and its words in the site's language. */
    private static function options(array $b, bool $editor): array
    {
        $colors = [];

        foreach (array_keys(self::COLORS) as $key) {
            if (($color = self::color($b['color_'.$key] ?? null)) !== null) {
                $colors[$key] = $color;
            }
        }

        $style = isset(self::STYLES[$b['style'] ?? '']) ? (string) $b['style'] : 'site';

        return array_filter([
            'style' => $style,
            'colors' => $colors ?: null,
            'zoom' => max(2, min(19, (int) ($b['zoom'] ?? 15))),
            'interactive' => ! $editor && (bool) ($b['interactive'] ?? true),
            'language' => substr((string) app()->getLocale(), 0, 2),
            'words' => [
                'map' => __('Map'),
                'marker' => __('Place'),
                'zoomIn' => __('Zoom In'),
                'zoomOut' => __('Zoom Out'),
                'close' => __('Close'),
                'attribution' => __('Map Credits'),
                // The script puts the place's name where :place is.
                'pin' => str_replace('@place', ':place', __('Show :place', ['place' => '@place'])),
                'scroll' => __('Use Ctrl and scroll to zoom the map'),
                'scrollMac' => __('Use ⌘ and scroll to zoom the map'),
                'touch' => __('Use two fingers to move the map'),
            ],
        ], static fn ($v) => $v !== null);
    }

    /** A colour as the inspector writes it (#rgb, #rrggbb, #rrggbbaa), or null. */
    private static function color(mixed $value): ?string
    {
        return is_string($value) && preg_match('/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i', trim($value)) ? strtolower(trim($value)) : null;
    }

    /** The map's script, for the editor to draw it in the canvas: null while the module isn't built. */
    private static function script(): ?string
    {
        return app(BlockRegistry::class)->features()['map']['script'] ?? null;
    }
}
