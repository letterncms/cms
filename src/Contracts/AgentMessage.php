<?php

declare(strict_types=1);

namespace Cms\Contracts;

/** A message for an agent, with what came with it. */
final readonly class AgentMessage
{
    /**
     * @param  array  $turn  The person's turn as the thread stores it (`id`, `text`, `attached`…)
     * @param  list<array>  $earlier  The thread's turns since the agent last answered: commands the person ran and searches, so it knows what they did
     * @param  array{path?: string, items?: list<array>, skill?: string}  $context  Where the person is in the admin and what the message carries, as the browser reports it
     * @param  array<string, mixed>  $options  What the agent's own controls in the composer chose (a model)
     * @param  ?string  $replaces  For an edit: the id of the turn this one replaces
     */
    public function __construct(
        public string $text,
        public array $turn,
        public array $earlier = [],
        public array $context = [],
        public array $options = [],
        public ?string $replaces = null,
    ) {}
}
