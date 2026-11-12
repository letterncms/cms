<?php

declare(strict_types=1);

namespace Cms\Modules\Account\Site;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Cms\Abilities\AbilityException;
use Cms\Cms;
use Cms\Users\AccountToken;
use Cms\Users\Accounts;
use Cms\Users\Passwords;
use Cms\Users\User;
use Cms\Users\UserFields;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * What the account pages' forms post to. Every answer is the same for an address we know and one
 * we don't, in words and in time: anything that looks an address up happens after the response.
 */
final class AccountController
{
    /** Takes as long as a real check, so a failed sign-in doesn't say whether the account exists. */
    private const string BURN = '$2y$12$FsQspXCMXyDcsnwQAckOT./S6COzBPa6tbCdv2l05ZzZpCn7CL0Ma';

    public function __construct(private readonly Cms $cms, private readonly Accounts $accounts, private readonly Screens $screens, private readonly Mailbox $mail) {}

    public function submit(Request $request, string $form): Response
    {
        return match ($form) {
            'sign-in' => $this->signIn($request),
            'sign-up' => $this->signUp($request),
            'complete' => $this->complete($request),
            'forgot' => $this->forgot($request),
            'reset' => $this->reset($request),
            'sign-out' => $this->signOut($request),
            'confirm-email', 'profile', 'email', 'password', 'export', 'delete' => $this->signedIn($request, $form),
            default => abort(404),
        };
    }

    private function signIn(Request $request): Response
    {
        $email = Accounts::email((string) $request->input('email'));
        $password = (string) $request->input('password');
        $next = Accounts::safePath($request->input('next')) ? (string) $request->input('next') : null;
        $failed = fn (string $message) => $this->back('sign-in', $this->screens->url('sign-in', $this->locale($request)).($next ? '?next='.rawurlencode($next) : ''), $message, 'error', old: ['email' => $email, 'next' => $next]);

        if ($this->limited('sign-in:'.$email.'|'.$request->ip(), 5, 60) || $this->limited('sign-in:'.$request->ip(), 20, 60)) {
            return $failed(__('Too many attempts. Please wait a minute and try again.'));
        }

        $user = $email !== '' ? User::query()->where('email', $email)->first() : null;
        $valid = $user && strlen($password) <= 1000
            ? Auth::guard('web')->getProvider()->validateCredentials($user, ['password' => $password])
            : password_verify($password, self::BURN);

        if (! $user || ! $valid || ($user->status ?? Accounts::ACTIVE) !== Accounts::ACTIVE) {
            return $failed(__('That email and password don’t match. Check them and try again, or reset your password.'));
        }

        // The team signs in at the admin, where two-factor sign-in is asked for. No second door.
        if (! $this->accounts->isVisitor($user) || $user->hasTwoFactor()) {
            return $failed(__('This account signs in at /admin.'));
        }

        Auth::guard('web')->getProvider()->rehashPasswordIfRequired($user, ['password' => $password]);
        Auth::guard('web')->login($user, $request->boolean('remember') && $this->cms->setting('accounts', 'remember', true));
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->saveQuietly();
        $this->accounts->touchSession($user);
        RateLimiter::clear('sign-in:'.$email.'|'.$request->ip());
        $this->cms->hooks()->dispatch('account.signed-in', $user);

        return redirect()->to($next ?? $this->screens->home($this->locale($request)), 303);
    }

    private function signOut(Request $request): Response
    {
        $user = Auth::guard('web')->user();
        $this->accounts->signOut();
        $request->session()->regenerate(true);
        $request->session()->regenerateToken();
        $user && $this->cms->hooks()->dispatch('account.signed-out', $user);

        return redirect()->to($this->prefixHome($request), 303);
    }

    private function signUp(Request $request): Response
    {
        $locale = $this->locale($request);
        $back = $this->screens->url('sign-up', $locale);

        if (! $this->accounts->signUpOpen()) {
            return $this->back('sign-up', $back, __('Sign-up is not open.'), 'error');
        }

        $email = Accounts::email((string) $request->input('email'));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->back('sign-up', $back, null, 'error', ['email' => __('Enter your email address, like name@example.com.')], ['email' => $email]);
        }

        // Past the limit or caught by the honeypot: the same answer, and nothing happens.
        if (! $request->filled('_cms_website') && ! $this->limited('mail:'.hash('sha256', $email), 3, 3600) && ! $this->limited('mail:'.$request->ip(), 10, 3600)) {
            $this->after(function () use ($email, $locale): void {
                $user = User::query()->where('email', $email)->first();

                if ($user && ($user->status ?? Accounts::ACTIVE) !== Accounts::INVITED) {
                    $language = $user->locale ?: $locale;
                    $this->mail->send($email, $language, 'already-registered', fn (array $s) => [__('Your :site account', $s), __('Someone tried to create an account with this address on :site, but it already has one. If that was you, sign in, or reset your password if you lost it.', $s), [__('Sign in'), $this->screens->url('sign-in', $language)]]);

                    return;
                }

                $token = AccountToken::issue(AccountToken::SIGN_UP, $email, now()->addDay(), $user, ['locale' => $locale]);
                $this->mail->send($email, $locale, 'sign-up', fn (array $s) => [__('Confirm your :site account', $s), __('Follow this link to finish creating your :site account. It works for 24 hours. If you didn’t ask for this, ignore this email.', $s), [__('Create the account'), $this->screens->url('complete', $locale).'?token='.$token]]);
            });
        }

        return $this->back('sign-up', $back, __('Check your email. We sent a link to :email.', ['email' => $email]));
    }

    private function complete(Request $request): Response
    {
        $locale = $this->locale($request);
        $back = $this->screens->url('complete', $locale);
        $token = AccountToken::live($request->session()->get('account.token.complete'), AccountToken::SIGN_UP);

        // Sign-up may have closed since the link went out.
        if (! $token || ! $this->accounts->enabled() || $this->cms->setting(Accounts::SETTINGS, 'sign_up', 'open') !== 'open') {
            return $this->back('complete', $back, __('This link is invalid or has expired.'), 'error');
        }

        $name = Accounts::clean((string) $request->input('name'));
        $errors = array_filter([
            'name' => $name === '' ? __('Enter your name.') : null,
            'password' => $this->passwordProblem($request->input('password')),
            'terms' => (string) $this->cms->setting('accounts', 'terms_url', '') !== '' && ! $request->boolean('terms') ? __('Tick this to agree to the terms.') : null,
        ]);

        if ($errors !== []) {
            return $this->back('complete', $back, null, 'error', $errors, ['name' => $name]);
        }

        if (! $token->consume()) {
            return $this->back('complete', $back, __('This link is invalid or has expired.'), 'error');
        }

        $request->session()->forget('account.token.complete');
        $user = User::query()->where('email', $token->email)->first();

        if ($user && ($user->status ?? Accounts::ACTIVE) !== Accounts::INVITED) {
            return $this->back('sign-in', $this->screens->url('sign-in', $locale), __('Please sign in.'));
        }

        $created = $user === null;
        $user ??= new User(['email' => $token->email, 'roles' => $this->accounts->visitorRoles()]);
        $user->fill(['name' => mb_substr($name, 0, 120), 'password' => (string) $request->input('password'), 'locale' => $token->payload['locale'] ?? $locale]);
        $user->forceFill(['status' => Accounts::ACTIVE, 'email_verified_at' => now()])->save();

        $created && $this->cms->hooks()->dispatch('account.created', $user);
        $this->cms->hooks()->dispatch('account.verified', $user);
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $this->accounts->touchSession($user);

        return redirect()->to($this->screens->home($locale), 303);
    }

    private function forgot(Request $request): Response
    {
        $locale = $this->locale($request);
        $back = $this->screens->url('forgot', $locale);
        $email = Accounts::email((string) $request->input('email'));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->back('forgot', $back, null, 'error', ['email' => __('Enter your email address, like name@example.com.')], ['email' => $email]);
        }

        if (! $request->filled('_cms_website') && ! $this->limited('mail:'.hash('sha256', $email), 3, 3600) && ! $this->limited('mail:'.$request->ip(), 10, 3600)) {
            $this->after(function () use ($email, $locale): void {
                $user = User::query()->where('email', $email)->first();

                // The team's accounts reset at the admin; a suspended account gets nothing.
                if (! $user || ! $this->accounts->isVisitor($user) || ($user->status ?? Accounts::ACTIVE) === Accounts::SUSPENDED) {
                    return;
                }

                $language = $user->locale ?: $locale;
                $token = AccountToken::issue(AccountToken::RESET, $user->email, now()->addMinutes(30), $user);
                $this->mail->send($user->email, $language, 'reset', fn (array $s) => [__('Reset your :site password', $s), __('Someone asked to reset the password for your :site account. This link works for 30 minutes. If it wasn’t you, ignore this email.', $s), [__('Choose a new password'), $this->screens->url('reset', $language).'?token='.$token]]);
            });
        }

        return $this->back('forgot', $back, __('If that address has an account, a link is on its way.'));
    }

    private function reset(Request $request): Response
    {
        $locale = $this->locale($request);
        $back = $this->screens->url('reset', $locale);
        $token = AccountToken::live($request->session()->get('account.token.reset'), AccountToken::RESET);
        $user = $token ? User::query()->where('email', $token->email)->first() : null;

        if (! $token || ! $user || ! $this->accounts->isVisitor($user)) {
            return $this->back('reset', $back, __('This link is invalid or has expired.'), 'error');
        }

        if ($problem = $this->passwordProblem($request->input('password'))) {
            return $this->back('reset', $back, null, 'error', ['password' => $problem]);
        }

        if (! $token->consume()) {
            return $this->back('reset', $back, __('This link is invalid or has expired.'), 'error');
        }

        $request->session()->forget('account.token.reset');
        $invited = ($user->status ?? Accounts::ACTIVE) === Accounts::INVITED;
        // The mailbox is proven, and a new remember token ends every "keep me signed in".
        $user->forceFill(['password' => (string) $request->input('password'), 'remember_token' => null, 'status' => Accounts::ACTIVE, 'email_verified_at' => $user->email_verified_at ?? now()])->save();
        $invited && $this->cms->hooks()->dispatch('account.verified', $user);
        $this->cms->hooks()->dispatch('account.password-changed', $user);
        $this->passwordChangedMail($user, $user->locale ?: $locale);

        return $this->back('sign-in', $this->screens->url('sign-in', $locale), __('Your password is changed. Please sign in.'));
    }

    private function signedIn(Request $request, string $form): Response
    {
        $user = $this->accounts->current();

        if (! $user) {
            return redirect()->to((string) $this->accounts->signInUrl(null, $this->locale($request)), 303);
        }

        // The team manages their account in the admin, where it asks for what these pages don't.
        if (! $this->accounts->isVisitor($user)) {
            return redirect()->to('/admin/account', 303);
        }

        if ($this->limited('account:'.$user->id, 20, 60)) {
            return $this->back($form, $this->pageOf($form, $request), __('Too many attempts. Please wait a minute and try again.'), 'error');
        }

        return match ($form) {
            'confirm-email' => $this->confirmEmail($request, $user),
            'profile' => $this->profile($request, $user),
            'email' => $this->changeEmail($request, $user),
            'password' => $this->changePassword($request, $user),
            'export' => $this->export($request, $user),
            'delete' => $this->delete($request, $user),
        };
    }

    private function profile(Request $request, User $user): Response
    {
        $back = $this->pageOf('profile', $request);
        $name = Accounts::clean((string) $request->input('name'));

        if ($name === '') {
            return $this->back('profile', $back, null, 'error', ['name' => __('Enter your name.')]);
        }

        $allowed = array_map(static fn ($f) => $f->handle, app(Forms::class)->profileFields());
        $values = [];

        foreach ($allowed as $handle) {
            $value = $request->input('data.'.$handle);
            $values[$handle] = is_string($value) ? Accounts::clean($value) : $value;
        }

        try {
            $this->cms->app()->make(UserFields::class)->fill($user, $values);
        } catch (AbilityException $e) {
            return $this->back('profile', $back, $e->getMessage(), 'error', array_combine(array_map(static fn ($k) => "data[{$k}]", array_keys($e->details)), array_values($e->details)), ['name' => $name, 'data' => $values]);
        }

        $user->name = mb_substr($name, 0, 120);
        $user->save();
        $this->cms->hooks()->dispatch('account.updated', $user);

        return $this->back('profile', $back, __('Saved.'));
    }

    private function changeEmail(Request $request, User $user): Response
    {
        $back = $this->pageOf('email', $request);
        $locale = $user->locale ?: $this->locale($request);
        $email = Accounts::email((string) $request->input('email'));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->back('email', $back, null, 'error', ['email' => __('Enter your email address, like name@example.com.')], ['email' => $email]);
        }

        if (! Hash::check((string) $request->input('current'), $user->password)) {
            return $this->back('email', $back, null, 'error', ['current' => __('That password doesn’t match this account.')], ['email' => $email]);
        }

        if (! $this->limited('mail:'.$user->id, 3, 3600)) {
            $this->after(function () use ($email, $user, $locale): void {
                if (User::query()->where('email', $email)->exists()) {
                    $this->mail->send($email, $locale, 'email-taken', static fn (array $s) => [__('Your :site account', $s), __('Someone tried to change their :site account to this address, but it already has an account. No action is needed.', $s)]);

                    return;
                }

                $token = AccountToken::issue(AccountToken::EMAIL, $email, now()->addDay(), $user);
                $this->mail->send($email, $locale, 'email-confirm', fn (array $s) => [__('Confirm your new email address'), __('Follow this link to use this address for your :site account. It works for 24 hours, while you are signed in.', $s), [__('Confirm this address'), $this->screens->url('confirm-email', $locale).'?token='.$token]]);
                $this->mail->send($user->email, $locale, 'email-notice', static fn (array $s) => [__('Your :site email address is changing', $s), __('Someone asked to move your :site account to another address. If that wasn’t you, change your password now.', $s)]);
            });
        }

        return $this->back('email', $back, __('Check your email. We sent a link to :email.', ['email' => $email]));
    }

    private function confirmEmail(Request $request, User $user): Response
    {
        $back = $this->screens->url('confirm-email', $this->locale($request));
        $token = AccountToken::live($request->session()->get('account.token.confirm-email'), AccountToken::EMAIL);

        // The link proves the new mailbox, the session proves whose account it is.
        if (! $token || $token->user_id !== $user->id || User::query()->where('email', $token->email)->exists() || ! $token->consume()) {
            return $this->back('confirm-email', $back, __('This link is invalid or has expired.'), 'error');
        }

        $request->session()->forget('account.token.confirm-email');
        $old = $user->email;
        $user->forceFill(['email' => $token->email, 'email_verified_at' => now(), 'remember_token' => null])->save();
        $this->accounts->touchSession($user);
        $this->cms->hooks()->dispatch('account.verified', $user);
        $this->cms->hooks()->dispatch('account.email-changed', $user, $old);
        $locale = $user->locale ?: $this->locale($request);
        $this->after(fn () => $this->mail->send($old, $locale, 'email-changed', static fn (array $s) => [__('Your :site email address changed', $s), __('Your :site account now uses another email address. If that wasn’t you, contact the site owner.', $s)]));

        return $this->back('overview', $this->screens->url('account', $this->locale($request)), __('Your email address is changed.'));
    }

    private function changePassword(Request $request, User $user): Response
    {
        $back = $this->pageOf('password', $request);

        if (! Hash::check((string) $request->input('current'), $user->password)) {
            return $this->back('password', $back, null, 'error', ['current' => __('That password doesn’t match this account.')]);
        }

        if ($problem = $this->passwordProblem($request->input('password'))) {
            return $this->back('password', $back, null, 'error', ['password' => $problem]);
        }

        // Every other browser is signed out by the session check; this one stays.
        $user->forceFill(['password' => (string) $request->input('password'), 'remember_token' => null])->save();
        $this->accounts->touchSession($user);
        $request->session()->regenerate(true);
        $this->cms->hooks()->dispatch('account.password-changed', $user);
        $locale = $user->locale ?: $this->locale($request);
        $this->passwordChangedMail($user, $locale);

        return $this->back('password', $back, __('Your password is changed.'));
    }

    private function export(Request $request, User $user): Response
    {
        $back = $this->pageOf('export', $request);

        if (! Hash::check((string) $request->input('current'), $user->password)) {
            return $this->back('export', $back, null, 'error', ['current' => __('That password doesn’t match this account.')]);
        }

        if ($this->limited('export:'.$user->id, 3, 86400)) {
            return $this->back('export', $back, __('You can download this three times a day. Please try again tomorrow.'), 'error');
        }

        $sections = [
            'profile' => ['name' => $user->name, 'email' => $user->email, 'locale' => $user->locale, 'fields' => (array) ($user->data ?? [])],
            'account' => ['created_at' => $user->created_at?->toIso8601String(), 'email_verified_at' => $user->email_verified_at?->toIso8601String(), 'last_login_at' => $user->last_login_at?->toIso8601String(), 'roles' => (array) ($user->roles ?? [])],
            'access' => array_map(static fn ($g) => $g->toPublic(), $this->accounts->grants($user)),
        ];

        return response()->json([
            'exported_at' => now()->toIso8601String(),
            'site' => (string) config('app.name'),
            'sections' => (array) $this->cms->hooks()->filter('account.export', $sections, $user),
        ], 200, ['Content-Disposition' => 'attachment; filename="account-'.date('Y-m-d').'.json"', 'Cache-Control' => 'no-store, private'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function delete(Request $request, User $user): Response
    {
        $back = $this->pageOf('delete', $request);
        $locale = $user->locale ?: $this->locale($request);

        if (! Hash::check((string) $request->input('current'), $user->password)) {
            return $this->back('delete', $back, null, 'error', ['current' => __('That password doesn’t match this account.')]);
        }

        if (! $request->boolean('confirm')) {
            return $this->back('delete', $back, null, 'error', ['confirm' => __('Tick this to confirm.')]);
        }

        if (($blockers = $this->accounts->deleteBlockers($user)) !== []) {
            return $this->back('delete', $back, implode(' ', array_map('strval', $blockers)), 'error');
        }

        $email = $user->email;

        try {
            $this->accounts->erase($user);
        } catch (Throwable $e) {
            report($e);

            return $this->back('delete', $back, __('We couldn’t delete your account. Please try again or contact the site owner.'), 'error');
        }

        $this->accounts->signOut();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $this->after(fn () => $this->mail->send($email, $locale, 'deleted', static fn (array $s) => [__('Your :site account is deleted', $s), __('We deleted your :site account and the data that belongs to it, as you asked.', $s)]));

        return redirect()->to($this->screens->url('deleted', $locale), 303);
    }

    private function passwordChangedMail(User $user, string $locale): void
    {
        $this->after(fn () => $this->mail->send($user->email, $locale, 'password-changed', fn (array $s) => [__('Your :site password changed', $s), __('The password of your :site account was just changed. If that wasn’t you, reset it now.', $s), [__('Reset your password'), $this->screens->url('forgot', $locale)]]));
    }

    /** Null, or what is wrong with a new password. Length first: a megabyte never reaches the hasher. */
    private function passwordProblem(mixed $password): ?string
    {
        $valid = is_string($password) && Validator::make(['password' => $password], ['password' => ['required', 'string', ...Passwords::rules()]])->passes();

        return $valid ? null : Passwords::message();
    }

    private function back(string $form, string $to, ?string $message, string $tone = 'ok', array $errors = [], array $old = []): RedirectResponse
    {
        $response = redirect()->to($to, 303)->with('account.form', $form)->with('account.errors', $errors)->with('account.old', $old);

        return $message !== null ? $response->with('account.status', ['form' => $form, 'tone' => $tone, 'message' => $message]) : $response;
    }

    private function pageOf(string $form, Request $request): string
    {
        $screen = ['profile' => 'profile', 'email' => 'security', 'password' => 'security', 'export' => 'privacy', 'delete' => 'privacy', 'confirm-email' => 'confirm-email'][$form] ?? 'account';

        return $this->screens->url($screen, $this->locale($request));
    }

    private function prefixHome(Request $request): string
    {
        $url = $this->screens->url('sign-in', $this->locale($request));

        return substr($url, 0, -strlen('/sign-in')) ?: '/';
    }

    private function locale(Request $request): string
    {
        $locale = (string) $request->input('_locale');

        return in_array($locale, $this->cms->locales(), true) ? $locale : $this->cms->defaultLocale();
    }

    private function limited(string $key, int $max, int $seconds): bool
    {
        if (RateLimiter::tooManyAttempts($key, $max)) {
            return true;
        }

        RateLimiter::hit($key, $seconds);

        return false;
    }

    /** After the response is on its way, so looking up an address and sending mail can't be timed. */
    private function after(callable $work): void
    {
        $done = false;
        $this->cms->app()->terminating(static function () use ($work, &$done): void {
            if ($done) {
                return;
            }

            $done = true;

            try {
                $work();
            } catch (Throwable $e) {
                report($e);
            }
        });
    }
}
