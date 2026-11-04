<?php

declare(strict_types=1);

namespace Cms\Http\Controllers;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Cms\Admin\Translations;
use Cms\Modules\Email\Message;
use Cms\Modules\Email\Mailer;
use Cms\Users\Accounts;
use Cms\Users\Passwords;
use Cms\Users\Totp;
use Cms\Users\User;

final class AuthController
{
    public function session(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'authenticated' => $user !== null,
            'user' => $user?->toPublic(),
            'twoFactorPending' => $request->session()->has('cms.2fa.user'),
            'site' => ['name' => config('app.name'), 'url' => config('app.url')],
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:254'],
            'password' => ['required', 'string', 'max:1000'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $user = User::query()->where('email', strtolower($credentials['email']))->first();

        // Constant-ish timing: always run a hash check.
        $valid = $user ? Auth::guard('web')->getProvider()->validateCredentials($user, ['password' => $credentials['password']]) : password_verify($credentials['password'], '$2y$12$FsQspXCMXyDcsnwQAckOT./S6COzBPa6tbCdv2l05ZzZpCn7CL0Ma');

        // The admin's door is for the team: a visitor's account opens only the public pages.
        if (! $user || ! $valid || ! $user->hasPermission('admin.access') || ($user->status ?? Accounts::ACTIVE) !== Accounts::ACTIVE) {
            return response()->json(['error' => ['type' => 'invalid_credentials', 'message' => __('These credentials do not match our records.')]], 422);
        }

        Auth::guard('web')->getProvider()->rehashPasswordIfRequired($user, ['password' => $credentials['password']]);

        if ($user->hasTwoFactor()) {
            $request->session()->regenerate();
            $request->session()->put('cms.2fa.user', $user->getKey());
            $request->session()->put('cms.2fa.remember', (bool) ($credentials['remember'] ?? false));
            $request->session()->put('cms.2fa.expires', time() + 300);

            return response()->json(['twoFactor' => true]);
        }

        return $this->complete($request, $user, (bool) ($credentials['remember'] ?? false));
    }

    public function twoFactor(Request $request): JsonResponse
    {
        $input = $request->validate(['code' => ['required', 'string', 'max:32']]);
        $id = $request->session()->get('cms.2fa.user');

        if (! $id || $request->session()->get('cms.2fa.expires', 0) < time()) {
            $request->session()->forget(['cms.2fa.user', 'cms.2fa.remember', 'cms.2fa.expires']);

            return response()->json(['error' => ['type' => 'expired', 'message' => __('Your sign-in expired. Please start again.')]], 422);
        }

        /** @var User $user */
        $user = User::query()->findOrFail($id);
        $code = trim($input['code']);
        $valid = Totp::verify((string) $user->two_factor_secret, $code);

        if (! $valid) {
            $codes = (array) $user->two_factor_recovery_codes;
            $match = array_search(strtolower($code), $codes, true);

            if ($match !== false) {
                unset($codes[$match]);
                $user->forceFill(['two_factor_recovery_codes' => array_values($codes)])->save();
                $valid = true;
            }
        }

        if (! $valid) {
            return response()->json(['error' => ['type' => 'invalid_code', 'message' => __('That code is not valid.')]], 422);
        }

        $remember = (bool) $request->session()->pull('cms.2fa.remember', false);
        $request->session()->forget(['cms.2fa.user', 'cms.2fa.expires']);

        return $this->complete($request, $user, $remember);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    public function forgot(Request $request, Mailer $mailer): JsonResponse
    {
        $input = $request->validate(['email' => ['required', 'email', 'max:254']]);
        $user = User::query()->where('email', strtolower($input['email']))->first();

        if ($user && $user->hasPermission('admin.access')) {
            $token = Password::broker()->createToken($user);
            $link = url('/admin/reset?'.http_build_query(['token' => $token, 'email' => $user->email]));
            $site = (string) config('app.name');
            // In the account's own language when it has one.
            $locale = app(Translations::class)->locale($user, $request);

            $mailer->send(new Message(
                to: $user->email,
                subject: __('Reset your :site password', ['site' => $site], $locale),
                html: '<p>'.e(__('Someone asked to reset the password for your :site account.', ['site' => $site], $locale)).'</p>'
                    .'<p><a href="'.e($link).'">'.e(__('Choose a new password', [], $locale)).'</a></p>'
                    .'<p>'.e(__('This link expires in 30 minutes. If you did not ask for this, ignore this email.', [], $locale)).'</p>',
                text: __('Choose a new password: :link', ['link' => $link], $locale)."\n\n".__('This link expires in 30 minutes. If you did not ask for this, ignore this email.', [], $locale),
                tag: 'password-reset',
            ));
        }

        return response()->json(['ok' => true, 'message' => __('If that address has an account, a reset link is on its way.')]);
    }

    public function reset(Request $request): JsonResponse
    {
        $input = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', ...Passwords::rules()],
        ]);

        $broker = $request->boolean('invite') ? 'invites' : 'users';
        $status = Password::broker($broker)->reset(array_intersect_key($input, array_flip(['token', 'email', 'password'])), static function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => null])->save();
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['error' => ['type' => 'invalid_token', 'message' => __('This reset link is invalid or has expired.')]], 422);
        }

        return response()->json(['ok' => true]);
    }

    private function complete(Request $request, User $user, bool $remember): JsonResponse
    {
        Auth::guard('web')->login($user, $remember);
        $request->session()->regenerate();
        $user->forceFill(['last_login_at' => now()])->saveQuietly();
        cms()->hooks()->dispatch('user.login', $user);

        return response()->json(['user' => $user->toPublic()]);
    }
}
