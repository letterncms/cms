<?php

declare(strict_types=1);

namespace Cms\Admin;

use Illuminate\Http\Request;
use Cms\Cms;
use Cms\Users\User;

/**
 * The admin's languages. English is the source: every label is written in English
 * and used as its own key. Core and every package ship a `lang/<code>.json`
 * dictionary per language ("Publish": "Publiceren"); the admin merges the core's
 * and the active packages' into one, and PHP's `__()` reads the same files.
 *
 * Which language: the user's own (Account → Appearance), else the admin's default
 * (Settings → General → Admin Language), else the browser's when the CMS speaks it, else English.
 */
final class Translations
{
    public const string SOURCE = 'en';

    /** Names in the language itself; codes without one show as the code. */
    private const array NAMES = ['en' => 'English', 'nl' => 'Nederlands', 'fr' => 'Français', 'de' => 'Deutsch', 'es' => 'Español', 'it' => 'Italiano', 'pt' => 'Português'];

    /** @var array<string, array<string, string>> */
    private array $messages = [];

    private bool $registered = false;

    public function __construct(private readonly Cms $cms) {}

    /** @return array<string, string> code => name, English first. */
    public function languages(): array
    {
        $codes = [self::SOURCE];

        foreach (glob($this->cms->app()->cmsPath('lang').'/*.json') ?: [] as $file) {
            $codes[] = basename($file, '.json');
        }

        $codes = array_values(array_unique($codes));

        return array_combine($codes, array_map(static fn (string $code) => self::NAMES[$code] ?? $code, $codes));
    }

    public function locale(?User $user = null, ?Request $request = null): string
    {
        $languages = $this->languages();

        foreach ([$user?->locale, (string) $this->cms->settings('site', 'admin_language', '')] as $code) {
            if ($code && isset($languages[$code])) {
                return $code;
            }
        }

        foreach ($request?->getLanguages() ?? [] as $preferred) {
            $code = strtolower(substr($preferred, 0, 2));

            if (isset($languages[$code])) {
                return $code;
            }
        }

        return self::SOURCE;
    }

    /**
     * Use this language for the rest of the request (`__()`, validation messages, the manifest).
     * Only the translator's: `app.locale` is the site's content language and stays as it is.
     */
    public function apply(string $locale): void
    {
        $this->register();
        $this->cms->app()->make('translator')->setLocale($locale);
    }

    /** The language of this request's labels. */
    public function current(): string
    {
        return $this->cms->app()->make('translator')->getLocale();
    }

    /**
     * Every string of the core and the active packages in this language.
     *
     * @return array<string, string>
     */
    public function messages(string $locale): array
    {
        if ($locale === self::SOURCE) {
            return [];
        }

        return $this->messages[$locale] ??= array_merge(...array_map(
            static fn (string $dir) => self::read("{$dir}/{$locale}.json"),
            $this->paths(),
        ));
    }

    /** Translate a label written in English (for labels the PHP side hands to the admin). */
    public function label(?string $text): ?string
    {
        if ($text === null || $text === '') {
            return $text;
        }

        $this->register();

        return (string) __($text);
    }

    /**
     * Field definitions in the user's language: labels, instructions, placeholders,
     * section names, option labels, a select's empty text and action, nested fields included. English too: it is
     * where `{brand}` and `:brand` become the product's name.
     *
     * @param  list<array>  $fields
     * @return list<array>
     */
    public function fields(array $fields): array
    {
        return array_map(function ($field) {
            if (! is_array($field)) {
                return $field;
            }

            foreach (['label', 'instructions', 'placeholder', 'section', 'description', 'prefix', 'suffix', 'add', 'empty'] as $key) {
                if (isset($field[$key]) && is_string($field[$key])) {
                    $field[$key] = $this->label($field[$key]);
                }
            }

            if (isset($field['action']['label']) && is_string($field['action']['label'])) {
                $field['action']['label'] = $this->label($field['action']['label']);
            }

            if (isset($field['options']) && is_array($field['options'])) {
                $field['options'] = array_map(fn ($option) => match (true) {
                    is_string($option) => $this->label($option),
                    is_array($option) && isset($option['label']) && is_string($option['label']) => [...$option, 'label' => $this->label($option['label'])],
                    default => $option,
                }, $field['options']);
            }

            foreach (['fields', 'config'] as $nested) {
                if (isset($field[$nested]) && is_array($field[$nested]) && array_is_list($field[$nested])) {
                    $field[$nested] = $this->fields($field[$nested]);
                }
            }

            return $field;
        }, $fields);
    }

    /** @return list<string> */
    private function paths(): array
    {
        $paths = [$this->cms->app()->cmsPath('lang')];

        foreach ($this->cms->packages()->active() as $package) {
            if (is_dir($package->path('lang'))) {
                $paths[] = $package->path('lang');
            }
        }

        return $paths;
    }

    /** Laravel's translator reads the packages' dictionaries too (`__()` anywhere, mails sent from the CLI or MCP included). */
    public function register(): void
    {
        if ($this->registered) {
            return;
        }

        $this->registered = true;
        $translator = $this->cms->app()->make('translator');

        foreach (array_slice($this->paths(), 1) as $path) {
            $translator->addJsonPath($path);
        }
    }

    /** @return array<string, string> */
    private static function read(string $file): array
    {
        if (! is_file($file)) {
            return [];
        }

        $json = json_decode((string) file_get_contents($file), true);

        return is_array($json) ? array_filter($json, static fn ($v) => is_string($v) && $v !== '') : [];
    }
}
