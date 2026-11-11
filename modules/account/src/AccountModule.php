<?php

declare(strict_types=1);

namespace Cms\Modules\Account;

use Illuminate\Http\Request;
use Cms\Modules\Blocks\BlockRegistry;
use Cms\Content\Collections\Collection;
use Cms\Modules\Account\Site\Forms;
use Cms\Modules\Account\Site\Screens;
use Cms\Modules\Account\Site\SignedInCookie;
use Cms\Packages\Plugin;
use Cms\Modules\Site\Rendering\PageContext;
use Cms\Users\AccountInBrowser;
use Cms\Users\AccountToken;
use Cms\Users\Accounts;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Each person's own account. In the admin: profile, password, two-factor sign-in and API tokens.
 * Required: without it nobody could change a password or secure a login. On the site, once a site
 * turns visitor accounts on: sign-up, sign-in, reset, profile, export and deletion.
 */
final class AccountModule extends Plugin
{
    public function boot(): void
    {
        $this->cms()->permissions()->register('tokens.manage', 'Create Personal API Tokens', 'Users');
        $this->app->make(AccountAbilities::class)->register($this->cms()->abilities());
        // First in the settings sidebar: everyone has one, whatever else they may change.
        $this->cms()->admin()->nav('account', ['label' => 'Account', 'path' => '/account', 'icon' => 'user', 'section' => 'account', 'order' => 0]);
        $this->cms()->admin()->widget('account-security', ['label' => 'Security', 'description' => 'Says when two-factor authentication is off or an API token lies unused.', 'icon' => 'shield', 'column' => 'side', 'order' => 60]);
        AccountViews::register($this->cms());
        $this->settingsSchema();
        $this->publicAccounts();
        $this->adminModule();
    }

    private function settingsSchema(): void
    {
        // With the Users screen, these are its Settings tab; without it, a settings page of their own.
        $this->cms()->settingsRegistry()->register(Accounts::SETTINGS, 'Visitor Accounts', [
            ['handle' => 'enabled', 'type' => 'toggle', 'label' => 'Allow Visitor Accounts', 'default' => false],
            ['handle' => 'sign_up', 'type' => 'select', 'label' => 'Who Can Sign Up', 'options' => ['open' => 'Anyone', 'closed' => 'Only People You Add'], 'default' => 'open', 'if' => ['enabled' => true]],
            ['handle' => 'default_role', 'type' => 'select', 'label' => 'Role for New Visitors', 'dynamic' => 'visitor-roles', 'default' => 'visitor', 'if' => ['enabled' => true]],
            ['handle' => 'terms_url', 'type' => 'url', 'label' => 'Terms to Agree To', 'if' => ['enabled' => true]],
            ['handle' => 'after_sign_in', 'type' => 'text', 'label' => 'Page After Sign-In', 'default' => '/account', 'if' => ['enabled' => true]],
            ['handle' => 'remember', 'type' => 'toggle', 'label' => 'Offer “Keep Me Signed In”', 'default' => true, 'if' => ['enabled' => true]],
        ], icon: 'users', description: 'Sign-up and sign-in for visitors.', order: 30, section: 'people', home: 'users');

        $this->cms()->hooks()->addFilter('fields.options.visitor-roles', function (array $options) {
            $team = $this->cms()->accounts()->teamRoles();

            foreach ($this->cms()->roles()->all() as $handle => $role) {
                in_array($handle, $team, true) || $options[$handle] = $role['label'];
            }

            return $options;
        });

        $this->cms()->hooks()->addFilter('settings.saving', function (array $values, string $namespace) {
            if ($namespace === Accounts::SETTINGS && ! empty($values['after_sign_in']) && ! Accounts::safePath((string) $values['after_sign_in'])) {
                throw \Cms\Abilities\AbilityException::invalid(__('Use a path on this site, like /account.'), ['after_sign_in' => __('Use a path on this site, like /account.')]);
            }

            return $values;
        });
    }

    private function publicAccounts(): void
    {
        $hooks = $this->cms()->hooks();
        $screens = fn () => $this->app->make(Screens::class);
        $this->app->singleton(Screens::class);

        // Now and then, like other housekeeping without a cron.
        $this->app->terminating(function () {
            if (random_int(1, 200) === 1 && $this->cms()->accounts()->enabled()) {
                rescue(static fn () => AccountToken::prune(), report: false);
            }
        });

        if (! $this->cms()->isActive('letterncms/site') || ! $this->cms()->accounts()->enabled()) {
            return;
        }

        $this->screensCollection();
        $this->screenBlocks();
        $this->builtinPages();
        $this->app->make(\Illuminate\Contracts\Http\Kernel::class)->appendMiddlewareToGroup('web', SignedInCookie::class);

        // After every plugin has had the chance to add screens, before the site's catch-all.
        $this->app->booted(fn () => $screens()->routes());

        $hooks->addFilter('site.head', static function (array $head, $context = null) {
            return ($context->entry ?? null)?->collection === Screens::COLLECTION ? [...$head, '<meta name="robots" content="noindex">'] : $head;
        });

        // `account` is who's signed in. A page anyone may get the same copy of leaves that to the
        // browser. `accounts` has the sign-in and account pages, in the page's language.
        $hooks->addFilter('site.scope', function (array $scope, $context = null) use ($screens) {
            $page = $context instanceof PageContext;
            $user = $page && in_array($context->mode, [PageContext::REQUEST, PageContext::PREVIEW], true) ? $this->cms()->accounts()->current() : null;
            $account = match (true) {
                $user !== null => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'roles' => (array) $user->roles, 'fields' => (array) ($user->data ?? [])],
                $page && $context->editor => ['id' => '', 'name' => 'Ada Lovelace', 'email' => 'ada@example.com', 'roles' => []],
                $page && in_array($context->mode, [PageContext::REQUEST, PageContext::BUILD], true) => new AccountInBrowser,
                default => null,
            };
            $locale = $page ? $context->locale() : $this->cms()->defaultLocale();
            $link = static fn (string $screen, string $label) => ['url' => $screens()->url($screen, $locale), 'label' => $label];

            return [...$scope, 'account' => $account, 'accounts' => [
                'sign_in' => $link('sign-in', __('Sign in')),
                'sign_up' => $link('sign-up', __('Create an account')),
                'account' => $link('account', __('My account')),
            ]];
        });

        // These pages are answered on request, so a build's link check won't find them as files.
        $hooks->addFilter('site.links.answered', static function (bool $answered, string $path) use ($screens) {
            foreach ($screens()->all() as $handle => $screen) {
                if ($answered || (($screen['path'] ?? null) !== null && $screens()->url($handle) === (rtrim($path, '/') ?: '/'))) {
                    return true;
                }
            }

            return $answered;
        });

        // A form left open past its session: back to the form with a plain message, not an error page.
        $this->app->make(\Illuminate\Contracts\Debug\ExceptionHandler::class)->renderable(static function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 419 && $request->is('_cms/account/*')) {
                return redirect()->back(303)->with('account.status', ['form' => (string) $request->route('form'), 'tone' => 'error', 'message' => __('Your session expired. Please try again.')]);
            }

            return null;
        });
    }

    /** Customised account pages are entries, so they get drafts, history and the block workspace. */
    private function screensCollection(): void
    {
        $this->cms()->hooks()->addFilter('collections', static function (array $collections) {
            $collections[Screens::COLLECTION] ??= Collection::fromArray(Screens::COLLECTION, [
                'title' => 'Account Pages', 'singular' => 'Account Page', 'icon' => 'user', 'driver' => 'files', 'structure' => 'list',
                'section' => 'design', 'system' => true, 'body' => 'blocks', 'sort' => 'title',
                'description' => 'Your versions of the sign-in and account pages. A page without a version here uses the standard one.',
                'fields' => [
                    ['handle' => 'blocks', 'type' => 'blocks', 'label' => 'Page'],
                    ['handle' => 'template', 'type' => 'select', 'label' => 'Template', 'dynamic' => 'templates', 'section' => 'sidebar'],
                ],
            ]);

            return $collections;
        });
    }

    private function screenBlocks(): void
    {
        $registry = $this->app->make(BlockRegistry::class);
        $forms = fn () => $this->app->make(Forms::class);

        foreach (Forms::blocks() as $form => [$title, $description]) {
            $registry->register([
                'name' => 'account/'.$form, 'title' => $title, 'description' => $description, 'icon' => 'user', 'category' => 'account',
                'keywords' => ['account', 'login', 'members'],
                'styles' => ['layout', 'size', 'spacing', 'typography'],
                'fields' => match ($form) {
                    'nav' => [['handle' => 'layout', 'type' => 'select', 'label' => 'Links', 'options' => ['row' => 'In a Row', 'column' => 'In a Column'], 'default' => 'row']],
                    'overview', 'gate-notice' => [],
                    default => [['handle' => 'submit', 'type' => 'text', 'label' => 'Button Label']],
                },
                'render' => static fn (array $d) => $forms()->render($form, $d),
            ]);
        }
    }

    /** The sign-in and account pages are listed with the site's pages, and customised there. */
    private function builtinPages(): void
    {
        $screens = fn () => $this->app->make(Screens::class);

        $this->cms()->builtinPages()->register('accounts', 'Accounts', Screens::COLLECTION,
            pages: static fn () => array_map(static fn (array $screen) => ['label' => $screen['label'], 'path' => $screen['path'] ?? null], $screens()->all()),
            seed: static fn (string $handle, string $locale) => $screens()->seedIn($handle, $locale),
            conflict: static fn (string $handle) => $screens()->conflict($handle),
            order: 20,
        );
    }
}
