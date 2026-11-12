<?php

declare(strict_types=1);

namespace Cms\Modules\Site\Design;

use Cms\Cms;
use Cms\Modules\Blocks\Css;
use Cms\Modules\Blocks\Elements;
use Cms\Modules\Blocks\Icons;

/**
 * The design's specimens: every kind of form field, and every button, in each of
 * their states, drawn by the site's own stylesheet. The Design shows one part at a
 * time (body[data-show]); data-cms-state shows a state without the pointer or keyboard.
 */
final class Specimen
{
    private int $id = 0;

    public function __construct(private readonly Cms $cms) {}

    public function html(string $kind): string
    {
        $parts = match ($kind) { 'buttons' => $this->buttons(), 'sizes' => $this->sizes(), 'prose' => $this->prose(), default => $this->fields() };
        $html = '';

        foreach ($parts as $part => [$title, $content]) {
            $html .= '<section class="specimen" data-part="'.e($part).'"><div class="specimen-title" role="heading" aria-level="2">'.e($title).'</div>'.$content.'</section>';
        }

        // One column that always shows everything, part after part (titles are not h2s: the site styles those); the Design scrolls to the part being edited and marks it.
        $style = 'body{margin:0;min-height:0;background:var(--color-background,#fff);color:var(--color-foreground,inherit)}'
            .'.specimen-board{display:grid;gap:48px;max-width:34rem;padding:40px 32px}'
            .'.specimen{display:grid;gap:16px;scroll-margin:32px}'
            .'.specimen-title{margin:0;font-size:11px;font-weight:600;line-height:1.2;letter-spacing:.06em;text-transform:uppercase;color:var(--field-help-color);transition:color .2s ease}'
            .'.specimen[data-active] .specimen-title{color:var(--color-foreground,currentColor)}'
            // The element of prose being edited.
            .'.cms-prose [data-part][data-active]{outline:2px solid var(--color-primary,#2563eb);outline-offset:4px;border-radius:2px}'
            .'.specimen-rows{display:grid;gap:16px}.specimen-surface{display:grid;gap:16px;padding:20px;margin-inline:-20px}.specimen-surface .specimen-caption{color:inherit;opacity:.7}'
            .'.specimen-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:16px 20px}.specimen-cell{display:grid;justify-items:center;gap:8px}.specimen-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px 14px}'
            .'.specimen-caption{font-size:11px;line-height:1.2;color:var(--field-help-color);white-space:nowrap}.specimen-size{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center}'
            .'@media (max-width:520px){.specimen-board{padding:20px}}';

        // A checkbox is only ever mixed by script.
        return '<style>'.$style.'</style><main id="main" class="specimen-board" data-kind="'.e($kind).'">'.$html.'</main><script>document.querySelectorAll("[data-cms-indeterminate]").forEach(c=>c.indeterminate=true)</script>';
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
            .$this->group(__('Reply by'), 'radio', [__('Email'), __('Phone||number'), __('Either')], 0)
            .$this->group(__('Services'), 'chips', [__('Design'), __('Build'), __('Hosting'), __('Care')], 1)
            .$this->choice('switch', __('Send me the newsletter'), true)
            .$this->choice('checkbox', __('I agree to the privacy policy'), false)
            .'<div><button type="button" class="cms-button" data-variant="primary"><span>'.e(__('Send')).'</span></button></div>';

        return [
            'overview' => [__('Form'), '<div class="cms-form">'.$overview.'</div>'],
            'sizes' => [__('Sizes'), implode('', array_map(fn ($size, $caption) => '<div class="specimen-size" data-size="'.$size.'"><input class="cms-input" type="text" aria-label="'.e($caption).'" placeholder="'.e($caption).'"><button type="button" class="cms-button" data-variant="primary"><span>'.e(__('Send')).'</span></button><button type="button" class="cms-button" data-variant="secondary" data-icon-only aria-label="'.e(__('Search')).'">'.Icons::svg('magnifying-glass', 'cms-button__icon').'</button></div>', ['sm', 'md', 'lg'], [__('Small'), __('Medium'), __('Large')]))],
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
            'checkbox' => [__('Checkboxes||controls'), $states(fn ($state) => '<input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'"'.$this->state($state).'>')
                .'<div class="specimen-row"><div class="specimen-cell"><input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'" data-cms-indeterminate><span class="specimen-caption">'.e(__('Some')).'</span></div><div class="specimen-cell"><input type="checkbox" class="cms-check" aria-label="'.e(__('Checkbox')).'" aria-invalid="true"><span class="specimen-caption">'.e(__('Invalid')).'</span></div></div>'
                .$this->group(__('Services'), 'checkbox', [__('Design'), __('Build'), __('Hosting')], 0, 2)],
            'radio' => [__('Radio Buttons'), $states(fn ($state) => '<input type="radio" class="cms-radio" aria-label="'.e(__('Radio')).'"'.$this->state($state).'>')
                .$this->group(__('Reply by'), 'radio', [__('Email'), __('Phone||number'), __('Either')], 0)],
            'switch' => [__('Switches'), $states(fn ($state) => '<input type="checkbox" role="switch" class="cms-switch" aria-label="'.e(__('Switch')).'"'.$this->state($state).'>')
                .'<div class="cms-form">'.$this->choice('switch', __('Send me the newsletter'), true).$this->choice('switch', __('Remember this device'), false).'</div>'],
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
        $icon = static fn (string $name) => Icons::svg($name, 'cms-button__icon');
        // Sizes come from the control size scale; a button with only an icon is square, or round.
        $button = static fn (string $variant, string $inner, string $attrs = '') => '<button type="button" class="cms-button" data-variant="'.e($variant).'"'.$attrs.'>'.$inner.'</button>';
        $cells = static fn (array $cells) => '<div class="specimen-row" style="align-items:flex-end">'.implode('', array_map(static fn ($cell) => '<div class="specimen-cell">'.$cell[0].'<span class="specimen-caption">'.e($cell[1]).'</span></div>', $cells)).'</div>';
        $designed = app(Design::class)->json()->buttons();
        $out = [];

        foreach ($variants as $variant => $name) {
            $variant = (string) $variant;
            $label = '<span>'.e(__('Get started')).'</span>';
            // A look made for another background (a dark band, a colored card) is shown on it, in its own text color.
            $surface = Css::value($designed[$variant]['surface'] ?? null);
            $ink = Css::value($designed[$variant]['base']['color'] ?? null);
            $out[$variant] = [(string) $name, ($surface !== null ? '<div class="specimen-surface" style="background:'.e($surface).($ink !== null ? ';color:'.e($ink) : '').'">' : '<div class="specimen-rows">')
                .$cells(array_map(static fn ($state, $caption) => [$button($variant, $label, $state === '' ? '' : ' data-cms-state="'.$state.'"'.($state === 'disabled' ? ' disabled' : '')), $caption], ['', 'hover', 'active', 'focus', 'disabled'], [__('Default'), __('Hover'), __('Pressed'), __('Focus'), __('Disabled')]))
                
                .$cells(array_map(static fn ($size, $caption) => [$button($variant, '<span>'.e((string) $name).'</span>', ' data-size="'.$size.'"'), $caption], ['sm', 'md', 'lg'], [__('Small'), __('Medium'), __('Large')]))
                .($variant === 'link' ? '' : $cells([
                    [$button($variant, $icon('plus'), ' data-size="sm" data-icon-only aria-label="'.e(__('Add')).'"'), __('Small')],
                    [$button($variant, $icon('plus'), ' data-icon-only aria-label="'.e(__('Add')).'"'), __('Medium')],
                    [$button($variant, $icon('plus'), ' data-size="lg" data-icon-only aria-label="'.e(__('Add')).'"'), __('Large')],
                    [$button($variant, $icon('magnifying-glass'), ' data-icon-only data-shape="round" aria-label="'.e(__('Search')).'"'), __('Round')],
                    [$button($variant, $label.$icon('arrow-right'), ' data-shape="round"'), __('Round, with an icon')],
                ])).'</div>',
            ];
        }

        return $out;
    }

    /**
     * An article with every element prose can style (DesignCompiler::PROSE_ELEMENTS), each marked as the part the
     * Design shows while it is edited, and blocks of their own in it: a callout that is prose too, with
     * paragraphs of its own, and a button, which keeps its look.
     *
     * @return array<string, array{string, string}>
     */
    private function prose(): array
    {
        $p = static fn (string $html, string $part = '') => '<p'.($part !== '' ? ' data-part="'.$part.'"' : '').'>'.$html.'</p>';
        $box = 'padding:1.25rem;border-radius:var(--radius-lg,.75rem);background:var(--color-surface,rgb(0 0 0 / .05))';
        $image = 'data:image/svg+xml,'.rawurlencode('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="280"><rect width="640" height="280" fill="#8882"/></svg>');

        return ['prose' => [__('Prose'), '<div class="cms-prose">'
            .$p(e(__('Long-form text reads best when every block keeps the same distance from the next, whatever kind of block it is.')).' <a data-part="a" href="#">'.e(__('A link')).'</a>, <strong data-part="strong">'.e(__('strong')).'</strong>, <em data-part="em">'.e(__('emphasis')).'</em>, <mark data-part="mark">'.e(__('a highlight')).'</mark>, <code data-part="code">inline code</code>, <kbd data-part="kbd">⌘K</kbd> '.e(__('and')).' <small data-part="small">'.e(__('small print')).'</small>.', 'p')
            .'<h2 data-part="h2">'.e(__('A heading opens a new part')).'</h2>'
            .$p(e(__('The space before a heading is larger than between paragraphs, and the space after it is smaller, so it belongs to what follows.')))
            .'<ul data-part="ul"><li data-part="li">'.e(__('Lists keep their own rhythm')).'</li><li>'.e(__('between their items')).'</li></ul>'
            .'<ol data-part="ol"><li>'.e(__('A numbered list')).'</li><li>'.e(__('counts its items')).'</li></ol>'
            .'<div class="cms-box cms-prose" style="'.$box.'"><p>'.e(__('A block of its own, such as a callout, keeps the same spacing as the text around it.')).'</p><p>'.e(__('With Prose on, its own paragraphs are spaced the same way.')).'</p></div>'
            .'<h3 data-part="h3">'.e(__('A smaller heading')).'</h3>'
            .'<blockquote data-part="blockquote"><p>'.e(__('A quote sits in the flow like any other block.')).'</p></blockquote>'
            .'<pre data-part="pre"><code>php cms build</code></pre>'
            .'<figure><img data-part="img" src="'.e($image).'" alt="" width="640" height="280"><figcaption data-part="figcaption">'.e(__('A picture, with its caption')).'</figcaption></figure>'
            .'<h4 data-part="h4">'.e(__('A fourth-level heading')).'</h4>'
            .'<table data-part="table"><thead><tr><th data-part="th">'.e(__('Plan')).'</th><th>'.e(__('Sites')).'</th></tr></thead><tbody><tr><td data-part="td">'.e(__('Free')).'</td><td>1</td></tr><tr><td>'.e(__('Agency')).'</td><td>25</td></tr></tbody></table>'
            .'<hr data-part="hr">'
            .$p(e(__('A button keeps its own look in prose.')))
            .'<div><a href="#" class="cms-button" data-variant="primary"><span>'.e(__('Get started')).'</span></a></div>'
            .'</div>']];
    }

    /** @return array<string, array{string, string}> size => [name, markup]: fields and buttons of one size, side by side */
    private function sizes(): array
    {
        $out = [];

        foreach (['sm' => __('Small'), 'md' => __('Medium'), 'lg' => __('Large')] as $size => $name) {
            $out[$size] = [$name, '<div class="cms-form" data-size="'.$size.'">'
                .'<div class="specimen-size"><input class="cms-input" type="text" aria-label="'.e(__('Email')).'" placeholder="'.e(__('Email')).'"><button type="button" class="cms-button" data-variant="primary"><span>'.e(__('Send')).'</span></button><button type="button" class="cms-button" data-variant="secondary" data-icon-only aria-label="'.e(__('Search')).'">'.Icons::svg('magnifying-glass', 'cms-button__icon').'</button></div>'
                .'<div class="specimen-size"><select class="cms-input" aria-label="'.e(__('Project')).'"><option>'.e(__('Website')).'</option></select><button type="button" class="cms-button" data-variant="secondary"><span>'.e(__('Cancel')).'</span></button><button type="button" class="cms-button" data-variant="primary" data-icon-only data-shape="round" aria-label="'.e(__('Add')).'">'.Icons::svg('plus', 'cms-button__icon').'</button></div>'
                .'<div class="cms-chips"><label class="cms-chip"><input type="checkbox" checked>'.e(__('Design')).'</label><label class="cms-chip"><input type="checkbox">'.e(__('Build')).'</label><label class="cms-chip"><input type="checkbox">'.e(__('Hosting')).'</label></div>'
                .'</div>'];
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
