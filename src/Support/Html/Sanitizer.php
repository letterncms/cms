<?php

declare(strict_types=1);

namespace Cms\Support\Html;

use Dom\Element;
use Dom\HTMLDocument;
use Dom\Node;

/**
 * Allowlist HTML sanitizer built on the HTML5 parser. Anything not explicitly
 * allowed is unwrapped (text kept) or dropped (script/style/iframe…).
 */
final class Sanitizer
{
    public const array INLINE = [
        'strong' => [], 'b' => [], 'em' => [], 'i' => [], 'u' => [], 's' => [], 'del' => [],
        'code' => [], 'mark' => [], 'sub' => [], 'sup' => [], 'br' => [], 'kbd' => [],
        'a' => ['href', 'target', 'rel', 'title'],
        'span' => ['data-token'],
    ];

    public const array RICH = self::INLINE + [
        'p' => [], 'h2' => ['id'], 'h3' => ['id'], 'h4' => ['id'], 'ul' => [], 'ol' => ['start'], 'li' => [],
        'blockquote' => [], 'pre' => [], 'hr' => [],
        'table' => [], 'thead' => [], 'tbody' => [], 'tr' => [], 'th' => ['scope', 'colspan', 'rowspan'], 'td' => ['colspan', 'rowspan'],
    ];

    private const array DROP = ['script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript', 'svg', 'math', 'form', 'input', 'textarea', 'select', 'button', 'link', 'meta', 'base', 'title', 'head'];

    /** @param array<string, list<string>> $allowed */
    public static function clean(string $html, array $allowed = self::RICH): string
    {
        if (trim($html) === '') {
            return '';
        }

        if (! preg_match('/[<&]/', $html)) {
            return htmlspecialchars($html, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }

        $doc = HTMLDocument::createFromString('<!doctype html><html><body><div id="__k">'.$html.'</div></body></html>', LIBXML_NOERROR | \Dom\HTML_NO_DEFAULT_NS);
        $root = $doc->getElementById('__k');

        if (! $root) {
            return '';
        }

        self::walk($root, $allowed);

        return $root->innerHTML;
    }

    public static function inline(string $html): string
    {
        return self::clean($html, self::INLINE);
    }

    public static function text(string $html): string
    {
        return trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace(['<br>', '</p>', '</li>', '</h2>', '</h3>'], ' ', $html)), ENT_QUOTES | ENT_HTML5, 'UTF-8')) ?? '');
    }

    private static function walk(Node $node, array $allowed): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof Element) {
                $tag = strtolower($child->localName);

                if (in_array($tag, self::DROP, true)) {
                    $child->remove();
                    continue;
                }

                self::walk($child, $allowed);

                if (! array_key_exists($tag, $allowed)) {
                    // Unwrap: keep children, drop the element.
                    while ($child->firstChild) {
                        $child->parentNode->insertBefore($child->firstChild, $child);
                    }
                    $child->remove();
                    continue;
                }

                foreach (iterator_to_array($child->attributes) as $attr) {
                    $name = strtolower($attr->name);

                    if (! in_array($name, $allowed[$tag], true) || ! self::safeAttribute($tag, $name, $attr->value)) {
                        $child->removeAttribute($attr->name);
                    }
                }

                if ($tag === 'a' && $child->getAttribute('target') === '_blank') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
            } elseif ($child->nodeType === XML_COMMENT_NODE) {
                $child->remove();
            }
        }
    }

    private static function safeAttribute(string $tag, string $name, string $value): bool
    {
        return match ($name) {
            'href' => self::safeUrl($value),
            'target' => in_array($value, ['_blank', '_self'], true),
            'id', 'data-token' => (bool) preg_match('/^[A-Za-z][\w.-]{0,80}$/', $value),
            'colspan', 'rowspan', 'start' => ctype_digit($value) && (int) $value < 1000,
            'scope' => in_array($value, ['row', 'col', 'rowgroup', 'colgroup'], true),
            default => strlen($value) < 500,
        };
    }

    public static function safeUrl(string $url): bool
    {
        $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5));

        if ($url === '' || preg_match('/[\x00-\x1F\x7F]/', $url)) {
            return false;
        }

        if (preg_match('#^(/(?!/)|\#|\?)#', $url)) {
            return true;
        }

        return (bool) preg_match('#^(https?:|mailto:|tel:)#i', $url);
    }
}
