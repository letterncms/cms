<?php

declare(strict_types=1);

namespace Cms\Revisions;

use Cms\Abilities\AbilityContext;
use Cms\Abilities\AbilityException;
use Cms\Abilities\AbilityRegistry;
use Cms\Abilities\Shapes;
use Cms\Support\Schema\Shape;
use Cms\Users\User;

/**
 * The history of whatever keeps versions, through one set of abilities: a thing is named by its kind and its
 * subject (`entry` and an entry's id, `styling` and `theme`, `code` and a file's path).
 */
final class RevisionAbilities
{
    public function __construct(private readonly Revisions $revisions) {}

    public function register(AbilityRegistry $a): void
    {
        $kind = fn (string $name): Kind => $this->revisions->kindOf($name) ?? throw AbilityException::invalid(__('Nothing of this kind keeps versions.'));
        $revision = fn (string $id): array => $this->revisions->find($id) ?? throw new AbilityException(__('Revision not found.'), 'not_found');
        // Who may read or restore a version is up to its kind; a version of an unknown kind is no one's.
        $may = fn (?User $user, string $kindName, string $subject, string $act): bool => ($k = $this->revisions->kindOf($kindName)) !== null && ($act === 'view' ? ($k->view)($user, $subject) : ($k->edit)($user, $subject));
        $version = fn (?User $user, string $id, string $act): bool => ($r = $this->revisions->find($id)) !== null && $may($user, $r['kind'], $r['subject'], $act);
        $subject = ['type' => 'string', 'minLength' => 1, 'maxLength' => 255];

        $a->register('revisions/list', [
            'label' => 'Version History',
            'description' => 'The versions of one thing, newest first. `kind` and `subject` say which: an entry (`entry` and its id), the site\'s styling (`styling` and `theme`: its stylesheet and page transition), or a file of the site\'s code (`code` and its path: custom.js, scripts/<name>.js, styles/<name>.css). Saves by the same person within ten minutes are one version.',
            'permission' => fn (?User $user, array $in) => $may($user, (string) ($in['kind'] ?? ''), (string) ($in['subject'] ?? ''), 'view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => [
                'kind' => ['type' => 'string', 'maxLength' => 32, 'description' => 'What the thing is: entry, styling or code (a plugin may add its own).'],
                'subject' => $subject + ['description' => 'Which one: an entry\'s id, `theme` for the styling, a file\'s path for code.'],
            ], 'required' => ['kind', 'subject']],
            'output' => Shape::of([[
                'id' => Shape::STRING, 'action' => Shape::STRING, 'title' => Shape::STRING_OR_NULL, 'message' => Shape::STRING_OR_NULL,
                'user' => Shape::nullable(['id' => Shape::STRING, 'name' => Shape::STRING, 'initials' => Shape::STRING]), 'createdAt' => Shape::STRING,
            ]]),
            'handler' => function (array $in) use ($kind) {
                $kind((string) $in['kind']);

                return $this->revisions->list((string) $in['kind'], (string) $in['subject']);
            },
        ]);

        $a->register('revisions/get', [
            'label' => 'Get Version',
            'description' => 'One version, whole, by its id (revisions/list has them): `snapshot` is the thing as it was then. An entry\'s has its title, slug, status, data and the unpublished changes it had beside them (`draft`); the styling\'s its stylesheet (`css`) and page transition; a file\'s its `contents`.',
            'permission' => fn (?User $user, array $in) => $version($user, (string) ($in['id'] ?? ''), 'view'),
            'annotations' => ['readOnly' => true],
            'input' => ['type' => 'object', 'properties' => ['id' => ['type' => 'string', 'maxLength' => 40]], 'required' => ['id']],
            'output' => Shape::of(['id' => Shape::STRING, 'kind' => Shape::STRING, 'subject' => Shape::STRING, 'action' => Shape::STRING,
                'snapshot' => Shape::open('The thing as it was saved then; what it holds depends on its kind.'), 'createdAt' => Shape::STRING]),
            'handler' => fn (array $in) => $revision((string) $in['id']),
        ]);

        $a->register('revisions/restore', [
            'label' => 'Restore Version',
            'description' => 'Put a thing back as one of its versions was. An entry gets that version\'s content (as unpublished changes when it is published) and answers as the entry; the styling and a file of code are saved as they were, and answer which. Restoring adds a version of its own, so it can be undone the same way.',
            'permission' => fn (?User $user, array $in) => $version($user, (string) ($in['revisionId'] ?? ''), 'edit'),
            'input' => ['type' => 'object', 'properties' => [
                'revisionId' => ['type' => 'string', 'maxLength' => 40],
                'expectedVersion' => ['type' => 'string', 'pattern' => '^[a-f0-9]{64}$', 'description' => 'For an entry: the version of it you last read; a newer one is refused.'],
            ], 'required' => ['revisionId']],
            'answer' => function (mixed $out, mixed ...$rest) {
                $answer = $this->revisions->kindOf(is_array($out) && isset($out['kind']) ? (string) $out['kind'] : 'entry')?->answer;

                return $answer ? $answer($out, ...$rest) : [];
            },
            'output' => Shape::either(Shapes::entry(), Shape::of(['kind' => Shape::STRING, 'subject' => Shape::STRING])),
            'dryRun' => function (array $in, AbilityContext $ctx) use ($revision, $kind): array {
                $r = $revision((string) $in['revisionId']);
                $k = $kind($r['kind']);

                return $k->dryRun ? ($k->dryRun)($r, $in, $ctx) : [['action' => 'restore', 'type' => $r['kind'], 'subject' => $r['subject'], 'revisionId' => $r['id']]];
            },
            'handler' => function (array $in, AbilityContext $ctx) use ($revision, $kind) {
                $r = $revision((string) $in['revisionId']);

                return ($kind($r['kind'])->restore)($r, $in, $ctx);
            },
        ]);
    }
}
