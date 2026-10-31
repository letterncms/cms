<?php

declare(strict_types=1);

namespace Cms\Support;

/**
 * What a site says to its visitors and buyers by mail: short paragraphs and at most one button, with
 * the link written out too. Tables and inline styles, because that is what mail clients read. The
 * mailer puts it in its layout, and both wear the site's colours through the `mail.colors` filter.
 */
final class MailBody
{
    /** @return array{background: string, card: string, text: string, muted: string, line: string, button: string, button_text: string} */
    public static function colors(): array
    {
        return (array) cms()->hooks()->filter('mail.colors', ['background' => '#f4f4f3', 'card' => '#ffffff', 'text' => '#1c1c1a', 'muted' => '#6b6b66', 'line' => '#e7e7e5', 'button' => '#1c1c1a', 'button_text' => '#ffffff']);
    }

    /**
     * @param  list<string>  $lines  Plain text, one paragraph each
     * @param  array{0: string, 1: string}|null  $action  Label and absolute URL
     * @param  string|null  $footer  Who this is from, in small type
     * @return array{html: string, text: string}
     */
    public static function render(array $lines, ?array $action = null, ?string $footer = null): array
    {
        $c = self::colors();
        $html = '';

        foreach ($lines as $line) {
            $html .= '<p style="margin:0 0 16px;color:'.e($c['text']).'">'.e($line).'</p>';
        }

        if ($action !== null) {
            $html .= '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0"><tr><td style="border-radius:8px;background:'.e($c['button']).'"><a href="'.e($action[1]).'" style="display:inline-block;padding:11px 18px;font-size:14px;font-weight:500;line-height:1.2;color:'.e($c['button_text']).';text-decoration:none;border-radius:8px">'.e($action[0]).'</a></td></tr></table>'
                .'<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:'.e($c['muted']).';word-break:break-all">'.e($action[1]).'</p>';
        }

        if ($footer !== null) {
            $html .= '<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid '.e($c['line']).';font-size:12px;line-height:1.5;color:'.e($c['muted']).'">'.e($footer).'</p>';
        }

        return ['html' => $html, 'text' => implode("\n\n", $lines).($action !== null ? "\n\n".$action[0].': '.$action[1] : '').($footer !== null ? "\n\n-- \n".$footer : '')];
    }
}
