<?php

declare(strict_types=1);

namespace Cms\Tests\Feature;

use Cms\Tests\TestCase;

/**
 * The Audit Log says what happened ("Published Entry"), not the button that did it. Every core ability that changes
 * something has its words in the `audit.past` filter, with every optional module on: a new one fails here until it does.
 */
final class AuditPastTest extends TestCase
{
    protected function plugins(): array
    {
        return ['letterncms/assistant', 'letterncms/blocks', 'letterncms/collaboration', 'letterncms/languages', 'letterncms/mcp', 'letterncms/site'];
    }

    public function test_every_core_change_has_a_past_tense_label(): void
    {
        $core = array_map(static fn (string $file) => (string) json_decode((string) file_get_contents($file), true)['name'], glob(dirname(__DIR__, 2).'/modules/*/composer.json') ?: []);
        $past = $this->cms()->hooks()->filter('audit.past', []);
        $changes = array_filter($this->cms()->abilities()->all(), static fn ($ability) => ! $ability->isReadOnly() && ($ability->package === null || in_array($ability->package, $core, true)));

        $this->assertGreaterThan(80, count($changes));

        foreach ($changes as $name => $ability) {
            $this->assertIsString($past[$name] ?? null, "{$name} has no past-tense label: add it to Cms\\Modules\\Audit\\Past.");
            $this->assertNotSame($ability->label, $past[$name], "{$name}'s past-tense label is its own label");
        }
    }
}
