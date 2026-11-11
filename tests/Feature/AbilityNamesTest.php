<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/**
 * Every ability is `thing/verb`, and the same verb means the same act on every thing. The lists below are the
 * exceptions, written down: a new name either uses a standard verb or is added here on purpose.
 */
final class AbilityNamesTest extends TestCase
{
    /** list: many of the thing. get: one, by its id or handle. get-many: several, by their ids. create, update, delete: one record. */
    private const array STANDARD = ['list', 'get', 'get-many', 'create', 'update', 'delete'];

    /**
     * `save` creates or replaces a definition by its handle, and only these things are definitions: what a
     * collection, a fieldset, a global set, a component (pattern) or the user profile is made of, and a
     * script or stylesheet beside the design, whose handle is its path.
     */
    private const array SAVED = ['collections', 'fieldsets', 'globals', 'patterns', 'user-fields', 'design-code'];

    /** Acts that are none of the standard ones: each says what it does to its thing. */
    private const array DOMAIN = [
        // Entries, their revisions and pages.
        'publish', 'unpublish', 'discard-draft', 'duplicate', 'move', 'reorder', 'restore', 'customize',
        // Setting one value of a thing (`update` changes a record's fields).
        'set', 'set-default', 'set-prefix', 'set-custom', 'set-load',
        // One item of a menu.
        'add-item', 'remove-item',
        // Files and fonts brought in from elsewhere.
        'import', 'fonts-import', 'fonts-upload', 'upload',
        // Finding and going.
        'search', 'open',
        // People and their access.
        'invite', 'grant', 'revoke', 'two-factor-setup', 'two-factor-confirm', 'two-factor-disable',
        // Comments and chats.
        'resolve', 'rename',
        // Packages, their installs and the core update.
        'enable', 'disable', 'switch', 'install', 'uninstall', 'migrate', 'rollback', 'add-key', 'plan-install', 'job-step',
        'update-check', 'update-start', 'update-step', 'update-switch', 'update-rollback', 'update-postpone', 'update-auto', 'update-tick',
        // The site, its design, email and the license.
        'build', 'preview', 'test', 'refresh',
        // The Sync module: the only place "sync" is said.
        'connect', 'disconnect', 'allow', 'renew-key', 'start', 'step', 'resume', 'cancel', 'undo',
        // Block Markdown.
        'from-markdown', 'to-markdown',
    ];

    /** Reads named for what they answer with, where `list` or `get` would say less. All are read-only. */
    private const array READS = [
        'info', 'status', 'recent', 'overview', 'editable', 'options', 'schema', 'types', 'icons', 'tree', 'builtin', 'coverage',
        'people', 'inbox', 'log', 'report', 'agents', 'catalog', 'item', 'job-status', 'updates', 'build-status', 'preview-url',
        'arrangement', 'access', 'history', 'skills', 'commands', 'presence',
    ];

    /** Domain verbs that do something and leave the site as it was: they are read-only. */
    private const array CHANGE_NOTHING = ['search', 'open', 'preview', 'plan-install', 'update-check', 'from-markdown', 'to-markdown'];

    protected function plugins(): array
    {
        return ['letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_every_ability_is_a_thing_and_a_verb_from_the_lists(): void
    {
        // The license abilities are there once a paid plugin is: here they are named without one.
        if (! $this->cms()->abilities()->has('license/status')) {
            (new \Cms\Modules\License\LicenseAbilities)->register($this->cms()->abilities());
        }

        $abilities = $this->cms()->abilities()->all();
        $this->assertGreaterThan(150, count($abilities));
        $used = [];

        foreach ($abilities as $name => $ability) {
            $this->assertMatchesRegularExpression('#^[a-z][a-z0-9]*(-[a-z0-9]+)*/[a-z][a-z0-9]*(-[a-z0-9]+)*$#', $name, "{$name} is not thing/verb");
            [$thing, $verb] = explode('/', $name);
            $used[$verb] = true;

            if ($verb === 'save') {
                $this->assertContains($thing, self::SAVED, "{$name}: `save` is for definitions kept by handle. Name it create or update, or add `{$thing}` to SAVED if it is one.");

                continue;
            }

            $this->assertContains($verb, [...self::STANDARD, ...self::DOMAIN, ...self::READS], "{$name}: `{$verb}` is not a standard verb (".implode(', ', self::STANDARD).'). Use one, or add it to DOMAIN or READS on purpose.');

            if (in_array($verb, self::READS, true) || in_array($verb, ['list', 'get', 'get-many'], true)) {
                $this->assertTrue($ability->isReadOnly(), "{$name} is named as a read and is not annotated readOnly");
            }

            if (in_array($verb, ['create', 'update', 'delete', ...self::DOMAIN], true) && $ability->isReadOnly()) {
                $this->assertContains($verb, self::CHANGE_NOTHING, "{$name} is named as an act and is annotated readOnly");
            }
        }

        // The lists hold nothing that is not used: an exception that is gone is taken off.
        $this->assertSame([], array_values(array_diff([...self::STANDARD, ...self::DOMAIN, ...self::READS], array_keys($used))));
        $this->assertSame([], array_values(array_intersect(self::DOMAIN, self::READS)));
        $this->assertSame(self::SAVED, array_values(array_filter(self::SAVED, static fn (string $thing) => isset($abilities["{$thing}/save"]))));
    }

    public function test_the_guide_for_agents_states_the_rule(): void
    {
        $guide = $this->app->make(\Cms\Abilities\AgentGuide::class)->text();

        foreach ([...self::STANDARD, 'save', 'set'] as $verb) {
            $this->assertStringContainsString($verb, $guide);
        }
    }
}
