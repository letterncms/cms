<?php

declare(strict_types=1);

namespace Cms\Modules\Account\Site;

use Cms\Cms;
use Cms\Content\Fields\Field;
use Cms\Users\AccountToken;
use Cms\Users\Accounts;
use Cms\Users\User;
use Cms\Users\UserFields;

/**
 * The account pages' forms, as blocks. Plain HTML that works without JavaScript. They carry no
 * look of their own: fields and buttons look as the site's design system says, and a
 * designer styles and moves each block like any other.
 */
final class Forms
{
    /** Types a visitor may fill in themselves. No uploads and no relations on a public form. */
    public const array PUBLIC_TYPES = ['text', 'textarea', 'select', 'toggle', 'date', 'url', 'email', 'number'];

    /** The first thing on the page that needs attention gets the focus, so nobody hunts for what happened. */
    private bool $focused = false;

    public function __construct(private readonly Cms $cms, private readonly Screens $screens) {}

    /** @return array<string, array{0: string, 1: string}> block => [title, description] */
    public static function blocks(): array
    {
        return [
            'sign-in' => ['Sign-In Form', 'Email and password.'],
            'sign-up' => ['Sign-Up Form', 'Asks for an email address and sends a link.'],
            'complete' => ['Finish Sign-Up Form', 'Name and password, after the link in the email.'],
            'forgot' => ['Forgot Password Form', 'Sends a link to reset the password.'],
            'reset' => ['New Password Form', 'After the link in the email.'],
            'confirm-email' => ['Confirm Email Button', 'Confirms a new email address.'],
            'overview' => ['Account Overview', 'Who is signed in.'],
            'profile' => ['Profile Form', 'Name and the profile fields marked public.'],
            'email' => ['Change Email Form', 'Sends a link to the new address.'],
            'password' => ['Change Password Form', 'Current and new password.'],
            'export' => ['Download My Data', 'Everything held about this account, as a file.'],
            'delete' => ['Delete Account Form', 'Deletes the account for good.'],
            'sign-out' => ['Sign-Out Button', 'Ends the session.'],
            'nav' => ['Account Navigation', 'Links to the account pages, including those plugins add.'],
            'gate-notice' => ['Access Notice', 'On a page behind the gate: how to read the rest.'],
        ];
    }

    public function render(string $form, array $d): string
    {
        $inner = match ($form) {
            'nav' => $this->nav((string) ($d['block']['layout'] ?? 'row')),
            'overview' => $this->overview(),
            'gate-notice' => $this->gateNotice(),
            default => $this->form($form, $d),
        };

        return $inner === '' && ! $d['editor'] ? '' : '<div '.$d['attrs'].($d['editor'] ? ' inert' : '').'>'.$inner.'</div>';
    }

    private function form(string $form, array $d): string
    {
        $locale = $this->locale();
        [$fields, $submit, $footer, $closed] = $this->definition($form, $locale, $d['editor']);
        $status = $this->status($form);

        if ($closed !== null) {
            return $status.'<p>'.e($closed).'</p>'.$footer;
        }

        // The link is on its way: the form has done its work, and asking again is one click away.
        if ($status !== '' && in_array($form, ['sign-up', 'forgot'], true) && (session('account.status')['tone'] ?? 'ok') === 'ok') {
            return $status.'<p class="cms-account-links"><a href="'.e($this->screens->url($form, $locale)).'">'.e(__('Use another address')).'</a></p>';
        }

        $html = $status.'<form class="cms-form" data-look="stacked" method="post" action="/_cms/account/'.e($form).'"><input type="hidden" name="_token" value="'.e($d['editor'] ? '' : csrf_token()).'"><input type="hidden" name="_locale" value="'.e($locale).'">';

        foreach ($fields as $field) {
            $html .= $this->field($form, $field);
        }

        $variant = in_array($form, ['delete', 'sign-out', 'export'], true) ? 'secondary' : 'primary';
        $danger = $form === 'delete' ? ' data-danger' : '';

        return $html.'<button type="submit" class="cms-button cms-form__submit" data-variant="'.$variant.'" data-size="md"'.$danger.'>'.e((string) ($d['block']['submit'] ?? '') ?: $submit).'</button></form>'.$footer;
    }

    /** @return array{0: list<array>, 1: string, 2: string, 3: ?string} fields, submit label, what follows the form, why there is no form */
    private function definition(string $form, string $locale, bool $editor): array
    {
        $accounts = $this->cms->accounts();
        $user = $editor ? null : $accounts->current();
        $link = fn (string $screen, string $label) => '<a href="'.e($this->screens->url($screen, $locale)).'">'.e($label).'</a>';
        $links = static fn (array $items) => '<p class="cms-account-links">'.implode('', array_map(static fn (array $item) => $link(...$item), $items)).'</p>';
        $email = ['name' => 'email', 'type' => 'email', 'label' => __('Email'), 'autocomplete' => 'email', 'required' => true];
        $password = static fn (string $name, string $label, string $auto) => ['name' => $name, 'type' => 'password', 'label' => $label, 'autocomplete' => $auto, 'required' => true];
        $newPassword = $password('password', __('Password'), 'new-password') + ['help' => __('At least 10 characters, with letters and numbers.')];
        $confirm = $password('current', __('Your password'), 'current-password');
        $honeypot = ['name' => '_cms_website', 'type' => 'honeypot', 'label' => __('Leave this empty')];

        return match ($form) {
            'sign-in' => [[
                $email,
                $password('password', __('Password'), 'current-password'),
                ...($this->cms->settings('accounts', 'remember', true) ? [['name' => 'remember', 'type' => 'checkbox', 'label' => __('Keep me signed in')]] : []),
                ['name' => 'next', 'type' => 'hidden', 'value' => Accounts::safePath($next = request()->query('next')) ? $next : (session('account.old.next') ?? '')],
            ], __('Sign in'), $links([['forgot', __('Forgot your password?')], ...($accounts->signUpOpen() || $editor ? [['sign-up', __('Create an account')]] : [])]), null],
            'sign-up' => [[$email, $honeypot], __('Send the link'), $links([['sign-in', __('I already have an account')]]), $accounts->signUpOpen() || $editor ? null : __('Sign-up is not open.')],
            'complete' => $editor || AccountToken::live(session('account.token.complete'), AccountToken::SIGN_UP) ? [[
                ['name' => 'name', 'type' => 'text', 'label' => __('Name'), 'autocomplete' => 'name', 'required' => true],
                $newPassword,
                ...($this->termsUrl() !== '' ? [['name' => 'terms', 'type' => 'checkbox', 'required' => true, 'label' => __('I agree to the terms'), 'help_html' => '<a href="'.e($this->termsUrl()).'">'.e(__('Read the terms')).'</a>']] : []),
            ], __('Create the account'), '', null] : [[], '', $links([['sign-up', __('Ask for a new link')]]), __('This link is invalid or has expired.')],
            'forgot' => [[$email, $honeypot], __('Send the link'), $links([['sign-in', __('Back to sign-in')]]), $accounts->canMail() || $editor ? null : __('Password reset is not available right now. Please contact the site owner.')],
            'reset' => $editor || AccountToken::live(session('account.token.reset'), AccountToken::RESET)
                ? [[$newPassword], __('Save the password'), '', null]
                : [[], '', $links([['forgot', __('Ask for a new link')]]), __('This link is invalid or has expired.')],
            'confirm-email' => $editor || AccountToken::live(session('account.token.confirm-email'), AccountToken::EMAIL)
                ? [[], __('Confirm this address'), '', null]
                : [[], '', '', __('This link is invalid or has expired.')],
            'profile' => [[
                ['name' => 'name', 'type' => 'text', 'label' => __('Name'), 'autocomplete' => 'name', 'required' => true, 'value' => $user?->name],
                ...array_map(fn (Field $f) => $this->profileField($f, $user), $this->profileFields()),
            ], __('Save'), '', null],
            'email' => [[['name' => 'email', 'type' => 'email', 'label' => __('New email address'), 'autocomplete' => 'email', 'required' => true, 'help' => $user ? __('Now: :email', ['email' => $user->email]) : null], $confirm], __('Send the link'), '', null],
            'password' => [[$confirm, $password('password', __('New password'), 'new-password') + ['help' => __('At least 10 characters, with letters and numbers.')]], __('Change password'), '', null],
            'export' => [[$confirm], __('Download my data'), '', null],
            'delete' => $this->deleteDefinition($user, $confirm),
            'sign-out' => [[], __('Sign out'), '', null],
            default => [[], '', '', null],
        };
    }

    private function deleteDefinition(?User $user, array $confirm): array
    {
        $blockers = $user ? $this->cms->accounts()->deleteBlockers($user) : [];

        if ($blockers !== []) {
            return [[], '', '<ul>'.implode('', array_map(static fn ($r) => '<li>'.e((string) $r).'</li>', $blockers)).'</ul>', __('You can’t delete your account yet:')];
        }

        return [[$confirm, ['name' => 'confirm', 'type' => 'checkbox', 'label' => __('Delete my account and everything in it. This can’t be undone.'), 'required' => true]], __('Delete my account'), '', null];
    }

    /** @return list<Field> */
    public function profileFields(): array
    {
        return array_values(array_filter(
            $this->cms->app()->make(UserFields::class)->blueprint()->fields(),
            static fn (Field $f) => (bool) $f->get('public') && in_array($f->type, self::PUBLIC_TYPES, true),
        ));
    }

    private function profileField(Field $field, ?User $user): array
    {
        return [
            'name' => 'data['.$field->handle.']', 'label' => __($field->label), 'value' => $user->data[$field->handle] ?? null, 'options' => (array) $field->get('options', []),
            'type' => ['textarea' => 'textarea', 'select' => 'select', 'toggle' => 'checkbox', 'date' => 'date', 'url' => 'url', 'email' => 'email', 'number' => 'number'][$field->type] ?? 'text',
        ];
    }

    private function field(string $form, array $f): string
    {
        $name = (string) $f['name'];
        $errors = (array) (session('account.form') === $form ? session('account.errors', []) : []);
        $old = (array) (session('account.form') === $form ? session('account.old', []) : []);
        $error = $errors[$name] ?? null;
        $value = data_get($old, preg_replace('/\[(\w+)\]/', '.$1', $name), $f['value'] ?? null);
        $id = 'account-'.$form.'-'.preg_replace('/\W+/', '-', $name);
        $described = $error !== null || isset($f['help']) ? ' aria-describedby="'.e($id).'-note"' : '';
        $required = ! empty($f['required']) ? ' required' : '';
        $invalid = $error !== null ? ' aria-invalid="true"' : '';
        $invalid .= $error !== null && $this->claimFocus() ? ' autofocus' : '';
        $auto = isset($f['autocomplete']) ? ' autocomplete="'.e($f['autocomplete']).'"' : '';
        $label = e((string) ($f['label'] ?? ''));
        $note = ($f['help_html'] ?? '').($error !== null ? '<p class="cms-msg" id="'.e($id).'-note">'.e((string) $error).'</p>' : (isset($f['help']) ? '<p class="cms-help" id="'.e($id).'-note">'.e((string) $f['help']).'</p>' : ''));

        return match ($f['type']) {
            'hidden' => '<input type="hidden" name="'.e($name).'" value="'.e((string) $value).'">',
            'honeypot' => '<div class="cms-form__hp" aria-hidden="true"><label>'.$label.'<input type="text" name="'.e($name).'" tabindex="-1" autocomplete="off"></label></div>',
            'checkbox' => '<div data-field="'.e($name).'"'.($error !== null ? ' class="is-invalid"' : '').'><label class="cms-choice"><input type="checkbox" class="cms-check" id="'.e($id).'" name="'.e($name).'" value="1"'.($value ? ' checked' : '').$required.$described.$invalid.'> <span>'.$label.'</span></label>'.$note.'</div>',
            'textarea' => '<div data-field="'.e($name).'"'.($error !== null ? ' class="is-invalid"' : '').'><label class="cms-label" for="'.e($id).'">'.$label.'</label><textarea class="cms-input" id="'.e($id).'" name="'.e($name).'" rows="4"'.$required.$described.$invalid.'>'.e((string) $value).'</textarea>'.$note.'</div>',
            'select' => '<div data-field="'.e($name).'"'.($error !== null ? ' class="is-invalid"' : '').'><label class="cms-label" for="'.e($id).'">'.$label.'</label><select class="cms-input" id="'.e($id).'" name="'.e($name).'"'.$required.$described.$invalid.'><option value=""></option>'.implode('', array_map(static fn ($k, $v) => '<option value="'.e((string) $k).'"'.((string) $value === (string) $k ? ' selected' : '').'>'.e((string) $v).'</option>', array_keys($f['options']), $f['options'])).'</select>'.$note.'</div>',
            'password' => '<div data-field="'.e($name).'"'.($error !== null ? ' class="is-invalid"' : '').'><label class="cms-label" for="'.e($id).'">'.$label.'</label><div class="cms-reveal"><input class="cms-input" type="password" id="'.e($id).'" name="'.e($name).'"'.$auto.$required.$described.$invalid.'>'.$this->reveal().'</div>'.$note.'</div>',
            default => '<div data-field="'.e($name).'"'.($error !== null ? ' class="is-invalid"' : '').'><label class="cms-label" for="'.e($id).'">'.$label.'</label><input class="cms-input" type="'.e((string) $f['type']).'" id="'.e($id).'" name="'.e($name).'"'.($value !== null ? ' value="'.e((string) $value).'"' : '').$auto.$required.$described.$invalid.'>'.$note.'</div>',
        };
    }

    /** A button that shows what was typed, so a long password can be checked. It appears once a script can run it. */
    private function reveal(): string
    {
        \Cms\Modules\Site\Rendering\PageContext::current()?->addFoot('cms-reveal', '<script>document.querySelectorAll(".cms-reveal__button").forEach(b=>{b.hidden=false;b.onclick=()=>{const i=b.previousElementSibling,s=i.type==="password";i.type=s?"text":"password";b.textContent=s?b.dataset.hide:b.dataset.show}})</script>');

        return '<button type="button" class="cms-reveal__button" hidden data-show="'.e(__('Show password')).'" data-hide="'.e(__('Hide password')).'">'.e(__('Show password')).'</button>';
    }

    private function claimFocus(): bool
    {
        if ($this->focused) {
            return false;
        }

        return $this->focused = true;
    }

    private function status(string $form): string
    {
        $status = session('account.status');

        if (! is_array($status) || ($status['form'] ?? null) !== $form) {
            return '';
        }

        $tone = ($status['tone'] ?? 'ok') === 'error' ? 'error' : 'ok';
        $focus = $this->claimFocus() ? ' tabindex="-1" autofocus' : '';

        return '<p class="cms-account-status" data-tone="'.$tone.'" role="'.($tone === 'error' ? 'alert' : 'status').'"'.$focus.'>'.e((string) $status['message']).'</p>';
    }

    private function nav(string $layout): string
    {
        $locale = $this->locale();
        $here = '/'.ltrim(request()->path(), '/');
        $links = '';
        $user = $this->cms->accounts()->current();

        foreach ($this->screens->menu($user) as $handle => $screen) {
            $url = $this->screens->url($handle, $locale);
            $links .= '<a href="'.e($url).'"'.($url === $here ? ' aria-current="page"' : '').'>'.e(__($screen['nav_label'] ?? $screen['label'])).'</a>';
        }

        // The team's profile, password and data are in the admin.
        if ($user && ! $this->cms->accounts()->isVisitor($user)) {
            $links .= '<a href="/admin/account">'.e(__('Profile and password')).'</a>';
        }

        return '<nav class="cms-account-nav" data-layout="'.e($layout).'" aria-label="'.e(__('Account')).'">'.$links.'</nav>';
    }

    private function overview(): string
    {
        $user = $this->cms->accounts()->current();

        return $this->status('overview').'<p class="cms-account-who">'.e($user ? __('Signed in as :email.', ['email' => $user->email]) : __('Signed in as :email.', ['email' => 'name@example.com'])).'</p>'.$this->cms->hooks()->filter('account.overview', '', $user);
    }

    /** How to read the rest of a page behind the gate. Plugins that sell access add to it with `account.gate-notice`. */
    private function gateNotice(): string
    {
        $accounts = $this->cms->accounts();
        $locale = $this->locale();

        if (! $accounts->enabled()) {
            return '';
        }

        $user = $accounts->current();
        $next = '/'.ltrim(request()->path(), '/');
        $html = $user
            ? '<p>'.e(__('Your account doesn’t include the rest of this page.')).'</p>'
            : '<p>'.e(__('Sign in to read the rest of this page.')).'</p><p><a class="cms-button" data-variant="primary" data-size="md" href="'.e((string) $accounts->signInUrl($next, $locale)).'">'.e(__('Sign in')).'</a></p>';

        return (string) $this->cms->hooks()->filter('account.gate-notice', $html, $user, request()->path());
    }

    private function termsUrl(): string
    {
        return (string) $this->cms->settings('accounts', 'terms_url', '');
    }

    private function locale(): string
    {
        return \Cms\Modules\Site\Rendering\PageContext::current()?->locale() ?? $this->cms->defaultLocale();
    }
}
