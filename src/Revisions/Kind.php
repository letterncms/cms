<?php

declare(strict_types=1);

namespace Cms\Revisions;

use Closure;
use Cms\Abilities\AbilityContext;
use Cms\Users\User;

/**
 * A kind of thing that keeps versions in Revisions: what it is called, who may read a thing's versions and put
 * one back, and how a version is put back. revisions/list, revisions/get and revisions/restore answer for every
 * kind through this.
 */
final class Kind
{
    /**
     * @param  string  $name  how a version names its kind: `entry`, `styling`, `code`
     * @param  Closure(?User, string): bool  $view  may read the versions of this subject
     * @param  Closure(?User, string): bool  $edit  may put one of them back
     * @param  Closure(array, array, AbilityContext): array  $restore  put a version back (the revision, the ability's input); answers what revisions/restore says
     * @param  ?Closure(array, array, AbilityContext): array  $dryRun  what restoring would change, without changing it
     * @param  ?Closure(mixed, array, ?User): array  $answer  what the workspace shows after a restore (see Ability's `answer`)
     */
    public function __construct(
        public readonly string $name,
        public readonly Closure $view,
        public readonly Closure $edit,
        public readonly Closure $restore,
        public readonly ?Closure $dryRun = null,
        public readonly ?Closure $answer = null,
    ) {}
}
