<?php

declare(strict_types=1);

namespace Cms\Modules\Email;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Cms\Abilities\AbilityException;
use Cms\Modules\Settings\SettingsModule;
use Cms\Packages\Plugin;
use Cms\Users\User;
use Throwable;
use Cms\Support\Schema\Shape;

final class EmailModule extends Plugin
{
    public function register(): void
    {
        $this->app->singleton(Transports::class);
        $this->app->singleton(Mailer::class);
    }

    public function boot(): void
    {
        // Registered once every plugin had the chance to add a transport.
        $this->app->booted(fn () => $this->settingsSchema());
        $this->abilities();
        // On the Email settings page: try what is saved, sent to whoever presses it.
        $this->cms()->hooks()->addFilter('view.settings', static fn (array $view, User $user, array $params) => ($params['namespace'] ?? '') !== 'email' ? $view : SettingsModule::withAction($view, [
            // What is saved is what it tries: with changes waiting, Save comes first.
            'label' => __('Send Test Email'), 'icon' => 'mail', 'ability' => 'email/test', 'input' => ['to' => '{user.email}'], 'success' => __('Test email sent to {user.email}'), 'disabled' => '{dirty}',
        ]));
        // Someone's erased account takes their row in the log with it.
        $this->cms()->hooks()->on('account.deleting', static fn ($user) => DB::table('email_log')->where('to', $user->email)->delete());
        $this->cms()->admin()->widget('email-status', ['label' => 'Email', 'description' => 'How email is sent, whether it arrives, and the latest messages.', 'icon' => 'mail', 'column' => 'side', 'order' => 60, 'permission' => 'settings.manage']);
        $this->adminModule();
    }

    private function settingsSchema(): void
    {
        $transports = $this->app->make(Transports::class)->all();
        $fields = [
            ['handle' => 'transport', 'type' => 'select', 'label' => 'Send With', 'options' => array_map(static fn ($t) => $t['label'], $transports), 'default' => 'log', 'display' => 'dropdown'],
            ['handle' => 'from_address', 'type' => 'email', 'label' => 'From Address', 'width' => 'half'],
            ['handle' => 'from_name', 'type' => 'text', 'label' => 'From Name', 'width' => 'half'],
        ];

        foreach ($transports as $key => $transport) {
            array_push($fields, ...array_map(static fn ($f) => [...$f, 'if' => ['transport' => $key]], $transport['fields']));
        }

        $fields[] = ['handle' => 'footer', 'type' => 'text', 'label' => 'Email Footer', 'instructions' => 'Shown under every email, like your address.'];

        // After boot, so out of the module's scope: it names itself.
        $this->cms()->settingsRegistry()->register('email', fields: $fields, icon: 'mail', description: 'How :brand sends email.', package: $this->manifest->name, order: 40, section: 'system');
    }

    private function abilities(): void
    {
        $a = $this->cms()->abilities();

        $a->register('email/test', [
            'label' => 'Send Test Email',
            'description' => 'Send a test message with the current email settings.',
            'permission' => 'settings.manage',
            'expose' => ['mcp' => false],
            'input' => ['type' => 'object', 'properties' => ['to' => ['type' => 'string', 'format' => 'email']], 'required' => ['to']],
            'output' => Shape::of(['sent' => Shape::BOOLEAN, 'transport' => Shape::STRING]),
            'handler' => function (array $in) {
                try {
                    $this->app->make(Mailer::class)->deliver(new Message(
                        to: $in['to'],
                        subject: __('Test email from :site', ['site' => config('app.name')]),
                        html: '<p>'.e(__('This is a test from :site. If you can read it, email works.', ['site' => config('app.name')])).'</p>',
                        tag: 'test',
                    ));
                } catch (Throwable $e) {
                    throw new AbilityException(__('Sending failed: :error', ['error' => $e->getMessage()]), 'failed');
                }

                return ['sent' => true, 'transport' => $this->cms()->settings('email', 'transport', 'log')];
            },
        ]);

        $a->register('email/status', [
            'label' => 'Email Status',
            'description' => 'The transport email is sent with, whether it really delivers (log only does not), sent and failed counts for the last 7 days and the latest emails.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 20, 'default' => 5]]],
            'output' => Shape::of([
                'transport' => ['key' => Shape::STRING, 'label' => Shape::STRING, 'delivers' => Shape::BOOLEAN],
                'from' => Shape::STRING, 'sent' => Shape::INTEGER, 'failed' => Shape::INTEGER,
                'latest' => [[
                    'id' => Shape::STRING, 'to' => Shape::STRING, 'subject' => Shape::STRING, 'tag' => Shape::STRING_OR_NULL, 'transport' => Shape::STRING,
                    'status' => Shape::STRING, 'error' => Shape::STRING_OR_NULL, 'createdAt' => Shape::STRING_OR_NULL,
                ]],
            ]),
            'handler' => function (array $in) {
                $key = (string) $this->cms()->settings('email', 'transport', 'log');
                $transports = $this->app->make(Transports::class);
                $counts = DB::table('email_log')->where('created_at', '>=', now()->subDays(7))->selectRaw('status, count(*) as n')->groupBy('status')->pluck('n', 'status');

                return [
                    'transport' => ['key' => $key, 'label' => $transports->all()[$key]['label'] ?? $key, 'delivers' => $this->app->make(Mailer::class)->configured()],
                    'from' => (string) ($this->cms()->settings('email', 'from_address') ?: $this->app->make(Mailer::class)->noReply()),
                    'sent' => (int) ($counts['sent'] ?? 0),
                    'failed' => (int) ($counts['failed'] ?? 0),
                    'latest' => DB::table('email_log')->orderByDesc('created_at')->limit($in['limit'])->get(['id', 'to', 'subject', 'tag', 'transport', 'status', 'error', 'created_at'])
                        ->map(static fn ($r) => ['id' => $r->id, 'to' => $r->to, 'subject' => $r->subject, 'tag' => $r->tag, 'transport' => $r->transport, 'status' => $r->status, 'error' => $r->error, 'createdAt' => $r->created_at ? Carbon::parse($r->created_at)->toIso8601String() : null])->all(),
                ];
            },
        ]);

        $a->register('email/log', [
            'label' => 'Email Log',
            'description' => 'Recently sent and failed emails.',
            'permission' => 'settings.manage',
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['limit' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 200, 'default' => 50]]],
            'output' => Shape::of([[
                'id' => Shape::STRING, 'to' => Shape::STRING, 'subject' => Shape::STRING, 'tag' => Shape::STRING_OR_NULL, 'transport' => Shape::STRING,
                'status' => Shape::STRING, 'error' => Shape::STRING_OR_NULL, 'created_at' => Shape::STRING_OR_NULL,
            ]]),
            'handler' => fn (array $in) => DB::table('email_log')->orderByDesc('created_at')->limit($in['limit'])->get()->all(),
        ]);
    }
}
