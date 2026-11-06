<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Cms;
use Cms\Modules\Blocks\Elements;

/**
 * The design system's specimens: every kind of form field, and every button, in each of
 * their states, drawn by the site's own stylesheet. The Design System shows one part at a
 * time (body[data-show]); data-cms-state shows a state without the pointer or keyboard.
 */
final class Specimen
{
    private int $id = 0;

    public function __construct(private readonly Cms $cms) {}

    public function html(string $kind): string
    {
        $parts = $kind === 'buttons' ? $this->buttons() : $this->fields();
        $html = '';

        foreach ($parts as $part => [$title, $content]) {
            $html .= '<section class="specimen" data-part="'.e($part).'"><div class="specimen-title" role="heading" aria-level="2">'.e($title).'</div>'.$content.'</section>';
        }

        // A board of cards that always shows everything (titles are not h2s: the site styles those); the Design System scrolls to the part being edited and marks it.
        $style = 'body{margin:0;min-height:0;background:var(--color-background,#fff);color:var(--color-foreground,inherit)}'
            .'.specimen-board{padding:28px;columns:18rem auto;column-gap:20px}'
            .'.specimen{break-inside:avoid;display:grid;gap:18px;margin:0 0 20px;padding:20px 22px 24px;border:1px solid color-mix(in srgb,currentColor 10%,transparent);border-radius:14px;scroll-margin:24px;transition:border-color .2s ease,box-shadow .2s ease}'
            .'.specimen[data-active]{border-color:color-mix(in srgb,currentColor 32%,transparent);box-shadow:0 0 0 4px color-mix(in srgb,currentColor 7%,transparent)}'
            .'.specimen-title{margin:0;font-size:11px;font-weight:600;line-height:1.2;letter-spacing:.06em;text-transform:uppercase;color:var(--field-help-color)}'
            .'.specimen-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px 20px}.specimen-cell{display:grid;justify-items:center;gap:8px}.specimen-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px 14px}'
            .'.specimen-caption{font-size:11px;line-height:1.2;color:var(--field-help-color);white-space:nowrap}.specimen-rule{height:1px;background:color-mix(in srgb,currentColor 10%,transparent)}'
            .'@media (max-width:520px){.specimen-board{padding:16px}}';

        // A checkbox is only ever mixed by script.
        return '<style>'.$style.'</style><main id="main" class="specimen-board">'.$html.'</main><script>document.querySelectorAll("[data-cms-indeterminate]").forEach(c=>c.indeterminate=true)</script>';
    }

    /** @return array<string, array{string, string}> part => [title, markup] */
    private function fields(): array
    {
        $text = fn (string $label, array $attrs = [], string $help = '') => $this->field($label, '<input class="cms-input"'.$this->attrs(['type' => 'text', ...$attrs]).'>', $help);
        $states = fn (callable $control) => '<div class="specimen-row">'.implode('', array_map(
            fn ($state, $caption) => '<div class="specimen-cell">'.$control($state).'<span class="specimen-caption">'.e($caption).'</span></div>',
            ['', 'checked', 'hover', 'focus', 'disabled'],
            [__('Off'), __('On'), __('Hover'), __('Focus'), __('Disabled')],
        )).'</div>';
        $topics = [__('Design'), __('Branding'), __('Strategy')];
        $select = fn (array $attrs = []) => '<select class="cms-input"'.$this->attrs($attrs).'><option>'.e(__('Website')).'</option><option>'.e(__('Online store')).'</option><option>'.e(__('Something else')).'</option></select>';

        $overview = $text(__('Name'), ['placeholder' => __('Ada Lovelace'), 'autocomplete' => 'off'])
            .$text(__('Email'), ['type' => 'email', 'value' => 'ada@example.com'], __('We only use it to reply.'))
            .$this->field(__('Project'), $select())
            .$this->slider(__('Budget'), 4000, 1000, 10000, 500, '€')
            .$this->field(__('Topics'), $this->tags($topics, __('Add a topic')))
            .$this->field(__('Message'), '<textarea class="cms-input" rows="3"'.$this->attrs(['placeholder' => __('Tell us about it')]).'></textarea>')
            .$this->group(__('Reply by'), 'radio', [__('Email'), __('Phone'), __('Either')], 0)
            .$this->group(__('Services'), 'chips', [__('Design'), __('Build'), __('Hosting'), __('Care')], 1)
            .$this->choice('switch', __('Send me the newsletter'), true)
            .$this->choice('checkbox', __('I agree to the privacy policy'), false)
            .'<div><button type="button" class="cms-button" data-variant="primary" data-size="md">'.e(__('Send')).'</button></div>';

        return [
            'overview' => [__('Form'), '<div class="cms-form">'.$overview.'</div>'],
            'field' => [__('All Fields'), '<div class="cms-form">'
                .$text(__('Text'), ['placeholder' => __('Placeholder')])
                .$this->field(__('Dropdown'), $select())
                .'<div class="cms-form__row">'.$text(__('Number'), ['type' => 'number', 'value' => '12']).$text(__('Date'), ['type' => 'date', 'value' => '2026-11-06']).'</div>'
                .$this->field(__('Text area'), '<textarea class="cms-input" rows="2">'.e(__('Several lines of text.')).'</textarea>')
                .'</div>'],
            'states' => [__('States'), '<div class="specimen-grid">'
                .$text(__('Default'), ['placeholder' => __('Placeholder')])
                .$text(__('Hover'), ['placeholder' => __('Placeholder'), 'data-cms-state' => 'hover'])
                .$text(__('Focus'), ['value' => __('Typing'), 'data-cms-state' => 'focus'])
                .$text(__('Disabled'), ['value' => __('Not now'), 'disabled' => true, 'data-cms-state' => 'disabled'])
                .$this->field(__('Invalid'), '<input class="cms-input" type="email" value="ada@" aria-invalid="true">', '', __('Enter a full email address.'))
                .$this->field(__('Invalid, typing'), '<input class="cms-input" type="email" value="ada@" aria-invalid="true" data-cms-state="focus">')
                .'</div>'],
            'labels' => [__('Labels and Help'), '<div class="cms-form">'
                .$this->field(__('Company').' <span class="cms-req" aria-hidden="true">*</span>', '<input class="cms-input" type="text">', __('The name on your invoices.'))
                .$this->field(__('Website').' <span class="cms-optional">'.e(__('optional')).'</span>', '<input class="cms-input" type="url" aria-invalid="true" value="example">', '', __('Enter a full web address (https://…).'))
                .$this->slider(__('Team size'), 12, 1, 50, 1)
                .'</div>'],
            'select' => [__('Dropdowns'), '<div class="cms-form">'
                .$this->field(__('Dropdown'), $select())
                .$this->field(__('Nothing chosen yet'), '<select class="cms-input"><option value="">'.e(__('Choose…')).'</option></select>')
                .$this->field(__('Several at once'), '<select class="cms-input" multiple size="3"><option selected>'.e(__('Website')).'</option><option>'.e(__('Online store')).'</option><option selected>'.e(__('Something else')).'</option></select>')
                .'</div>'],
            'textarea' => [__('Text Areas'), '<div class="cms-form">'.$this->field(__('Message'), '<textarea class="cms-input" rows="4">'.e(__('Hello! We are planning a new website for the spring and would love to hear how you work.')).'</textarea>', __('A few lines are enough.')).'</div>'],
            'checkbox' => [__('Checkboxes'), $states(fn ($state) => '<input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'"'.$this->state($state).'>')
                .'<div class="specimen-row"><div class="specimen-cell"><input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'" data-cms-indeterminate><span class="specimen-caption">'.e(__('Some')).'</span></div><div class="specimen-cell"><input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'" aria-invalid="true"><span class="specimen-caption">'.e(__('Invalid')).'</span></div></div>'
                .'<div class="specimen-rule"></div>'.$this->group(__('Services'), 'checkbox', [__('Design'), __('Build'), __('Hosting')], 0, 2)],
            'radio' => [__('Radio Buttons'), $states(fn ($state) => '<input type="radio" class="cms-radio" aria-label="'.e(__('Radio')).'"'.$this->state($state).'>')
                .'<div class="specimen-rule"></div>'.$this->group(__('Reply by'), 'radio', [__('Email'), __('Phone'), __('Either')], 0)],
            'switch' => [__('Switches'), $states(fn ($state) => '<input type="checkbox" role="switch" class="cms-switch" aria-label="'.e(__('Switch')).'"'.$this->state($state).'>')
                .'<div class="specimen-rule"></div><div class="cms-form">'.$this->choice('switch', __('Send me the newsletter'), true).$this->choice('switch', __('Remember this device'), false).'</div>'],
            'slider' => [__('Sliders'), '<div class="cms-form">'.$this->slider(__('Budget'), 4000, 1000, 10000, 500, '€', true).$this->slider(__('Focus'), 30, 0, 100, 1, '', false, 'focus').$this->slider(__('Disabled'), 70, 0, 100, 1, '', false, 'disabled').'</div>'],
            'tags' => [__('Tag Fields'), '<div class="cms-form">'.$this->field(__('Topics'), $this->tags($topics, __('Add a topic')), __('Press Enter after each one.')).$this->field(__('Empty'), $this->tags([], __('Add a topic'))).'</div>'],
            'chips' => [__('Chips'), '<div class="cms-form">'.$this->group(__('Services'), 'chips', [__('Design'), __('Build'), __('Hosting'), __('Care')], 1)
                .'<div class="specimen-row">'.implode('', array_map(fn ($state, $caption) => '<div class="specimen-cell"><span class="cms-chip"'.($state !== '' ? ' data-cms-state="'.$state.'"' : '').'>'.e(__('Design')).'</span><span class="specimen-caption">'.e($caption).'</span></div>', ['', 'checked', 'hover', 'focus'], [__('Off'), __('On'), __('Hover'), __('Focus')])).'</div></div>'],
            'file' => [__('File Pickers'), '<div class="cms-form">'.$this->field(__('Attachment'), '<input class="cms-input" type="file">', __('PDF or Word, 10 MB at most.')).'</div>'],
        ];
    }

    /** @return array<string, array{string, string}> variant => [name, markup] */
    private function buttons(): array
    {
        $variants = $this->cms->hooks()->filter('fields.options.button-variants', []);
        $button = static fn (string $variant, string $label, string $state = '', string $size = 'md') => '<button type="button" class="cms-button" data-variant="'.e($variant).'" data-size="'.$size.'"'.($state !== '' ? ' data-cms-state="'.$state.'"' : '').($state === 'disabled' ? ' disabled' : '').'>'.e($label).'</button>';
        $out = [];

        foreach ($variants as $variant => $name) {
            $variant = (string) $variant;
            $out[$variant] = [(string) $name, '<div class="specimen-row">'.implode('', array_map(
                fn ($state, $caption) => '<div class="specimen-cell">'.$button($variant, __('Get started'), $state).'<span class="specimen-caption">'.e($caption).'</span></div>',
                ['', 'hover', 'active', 'focus', 'disabled'],
                [__('Default'), __('Hover'), __('Pressed'), __('Focus'), __('Disabled')],
            )).'</div><div class="specimen-rule"></div><div class="specimen-row" style="align-items:center">'.implode('', array_map(
                fn ($size, $caption) => '<div class="specimen-cell">'.$button($variant, (string) $name, '', $size).'<span class="specimen-caption">'.e($caption).'</span></div>',
                ['sm', 'md', 'lg'],
                [__('Small'), __('Medium'), __('Large')],
            )).'</div>'];
        }

        return $out;
    }

    private function field(string $label, string $control, string $help = '', string $error = ''): string
    {
        // The label names the control, or the text box of a tag field.
        if (preg_match('/^<(input|select|textarea)\b/', $control)) {
            $id = 'specimen-'.(++$this->id);
            $control = (string) preg_replace('/^<(input|select|textarea)\b/', '<$1 id="'.$id.'"', $control, 1);
        } else {
            $id = preg_match('/<input class="cms-tags__input" id="([^"]+)"/', $control, $m) ? $m[1] : '';
        }

        return '<div class="cms-field'.($error !== '' ? ' is-invalid' : '').'"><label class="cms-label" for="'.$id.'">'.$label.'</label>'.$control
            .($error !== '' ? '<p class="cms-msg">'.e($error).'</p>' : ($help !== '' ? '<p class="cms-help">'.e($help).'</p>' : '')).'</div>';
    }

    private function choice(string $kind, string $label, bool $checked, string $name = ''): string
    {
        $control = match ($kind) {
            'switch' => '<input type="checkbox" role="switch" class="cms-switch"',
            'radio' => '<input type="radio" class="cms-radio" name="'.e($name).'"',
            default => '<input type="checkbox" class="cms-check"'.($name !== '' ? ' name="'.e($name).'"' : ''),
        };

        return '<label class="cms-choice">'.$control.($checked ? ' checked' : '').'><span>'.e($label).'</span></label>';
    }

    /** Options in a fieldset: a list of radios or checkboxes, or chips. */
    private function group(string $legend, string $kind, array $options, int ...$checked): string
    {
        $name = 'specimen-group-'.(++$this->id);
        $items = '';

        foreach ($options as $i => $option) {
            $on = in_array($i, $checked, true);
            $items .= $kind === 'chips'
                ? '<label class="cms-chip"><input type="checkbox" name="'.$name.'"'.($on ? ' checked' : '').'>'.e($option).'</label>'
                : $this->choice($kind, $option, $on, $name);
        }

        return '<fieldset class="cms-choices"'.($kind === 'chips' ? ' data-look="chips"' : '').'><legend class="cms-label">'.e($legend).'</legend><div class="cms-choices__list cms-choices">'.$items.'</div></fieldset>';
    }

    private function slider(string $label, float $value, float $min, float $max, float $step, string $unit = '', bool $scale = false, string $state = ''): string
    {
        $id = 'specimen-'.(++$this->id);
        $format = static fn (float $n) => $unit.number_format($n, 0, '.', ',');

        return '<div class="cms-field"><label class="cms-label" for="'.$id.'">'.e($label).'<output for="'.$id.'" data-prefix="'.e($unit).'">'.e($format($value)).'</output></label>'
            .'<input class="cms-range" type="range" id="'.$id.'" min="'.$min.'" max="'.$max.'" step="'.$step.'" value="'.$value.'" style="--cms-range:'.Elements::fraction($value, $min, $max).'"'.$this->state($state).($state === 'disabled' ? ' disabled' : '').'>'
            .($scale ? '<div class="cms-range__scale" aria-hidden="true"><span>'.e($format($min)).'</span><span>'.e($format($max)).'</span></div>' : '').'</div>';
    }

    private function tags(array $values, string $placeholder): string
    {
        $id = 'specimen-'.(++$this->id);
        $x = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7m0-7l-7 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>';
        $tags = implode('', array_map(static fn ($v) => '<span class="cms-tag"><span>'.e($v).'</span><button type="button" class="cms-tag__remove" aria-label="'.e(__('Remove :tag', ['tag' => $v])).'">'.$x.'</button><input type="hidden" name="'.$id.'[]" value="'.e($v).'"></span>', $values));

        return '<div class="cms-input cms-tags" data-cms-tags data-name="'.$id.'[]" data-remove="'.e(__('Remove')).'">'.$tags.'<input class="cms-tags__input" id="'.$id.'" type="text" placeholder="'.e($placeholder).'"></div>';
    }

    /** A state shown without the pointer: checked is real, the others are data-cms-state. */
    private function state(string $state): string
    {
        return match ($state) {
            '' => '',
            'checked' => ' checked',
            'disabled' => ' disabled data-cms-state="disabled"',
            default => ' data-cms-state="'.$state.'"',
        };
    }

    /** @param array<string, string|bool> $attrs */
    private function attrs(array $attrs): string
    {
        $out = '';

        foreach ($attrs as $name => $value) {
            $out .= $value === true ? ' '.$name : ($value === false ? '' : ' '.$name.'="'.e((string) $value).'"');
        }

        return $out;
    }
}
