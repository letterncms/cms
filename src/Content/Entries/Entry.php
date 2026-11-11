<?php

declare(strict_types=1);

namespace Cms\Content\Entries;

use Carbon\CarbonImmutable;
use Cms\Content\Collections\Collection;
use Cms\Content\Collections\CollectionRepository;
use Cms\Users\User;

/**
 * A piece of content. Storage-agnostic: database and flat-file drivers both
 * hydrate this object. Published entries may carry a working-copy draft
 * (`draft` = {title, slug, data, authorId}) that is promoted on publish.
 */
final class Entry
{
    public function __construct(
        public string $id,
        public string $collection,
        public string $locale,
        public string $slug,
        public string $title,
        public string $status = 'draft',
        public array $data = [],
        public ?array $draft = null,
        public ?string $uri = null,
        public ?string $originId = null,
        public ?string $parentId = null,
        public int $position = 0,
        public ?string $authorId = null,
        public ?string $blueprint = null,
        public ?CarbonImmutable $publishedAt = null,
        /** When it stops being published: from then on it is not live, and the scheduler unpublishes it. */
        public ?CarbonImmutable $expiresAt = null,
        public ?CarbonImmutable $createdAt = null,
        public ?CarbonImmutable $updatedAt = null,
    ) {}

    /** Set on a copy made for one reader (see {@see EntryGate::view()}): `full`, `teaser` or `locked`. */
    public ?string $gated = null;

    public function collection(): Collection
    {
        return app(CollectionRepository::class)->findOrFail($this->collection);
    }

    /** The fields this entry has: its collection's, or those of the blueprint it was made with. */
    public function blueprint(): \Cms\Content\Fields\Blueprint
    {
        return $this->collection()->blueprint($this->blueprint);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isScheduled(): bool
    {
        return $this->isPublished() && $this->publishedAt !== null && $this->publishedAt->isFuture();
    }

    /** Published, and its time is up: no longer on the site, and unpublished the next time the scheduler runs. */
    public function isExpired(): bool
    {
        return $this->isPublished() && $this->expiresAt !== null && ! $this->expiresAt->isFuture();
    }

    /** Published and visible right now. */
    public function isLive(): bool
    {
        return $this->isPublished() && ! $this->isScheduled() && ! $this->isExpired();
    }

    public function hasDraft(): bool
    {
        return $this->draft !== null;
    }

    public function get(string $field, mixed $default = null): mixed
    {
        return $this->data[$field] ?? $default;
    }

    /** The version editors see: the draft when there is one, otherwise the saved content. */
    public function working(): array
    {
        return array_replace($this->content(), $this->draft ?? []);
    }

    /** The content served publicly; publishing applies a complete working snapshot. */
    public function content(): array
    {
        return ['title' => $this->title, 'slug' => $this->slug, 'data' => $this->data, 'authorId' => $this->authorId];
    }

    public function applyContent(array $content): void
    {
        $this->title = (string) $content['title'];
        $this->slug = (string) $content['slug'];
        $this->data = (array) $content['data'];
        $this->authorId = $content['authorId'];
        $this->draft = null;
    }

    /** A copy with the working draft applied (used for previews). */
    public function withWorkingCopy(): self
    {
        $clone = clone $this;
        $clone->applyContent($this->working());

        return $clone;
    }

    /** Opaque semantic version: works across both drivers and same-second saves. */
    public function version(): string
    {
        $canonical = static function (mixed $value) use (&$canonical): mixed {
            if (! is_array($value)) {
                return $value;
            }
            if (! array_is_list($value)) {
                ksort($value);
            }

            return array_map($canonical, $value);
        };

        return hash('sha256', json_encode($canonical([
            'id' => $this->id, 'collection' => $this->collection, 'locale' => $this->locale,
            'content' => $this->content(), 'draft' => $this->draft === null ? null : $this->working(),
            'status' => $this->status, 'parentId' => $this->parentId, 'position' => $this->position,
            'originId' => $this->originId, 'blueprint' => $this->blueprint, 'uri' => $this->uri,
            'publishedAt' => $this->publishedAt?->getTimestamp(), 'expiresAt' => $this->expiresAt?->getTimestamp(),
        ]), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));
    }

    public function author(bool $withDraft = true): ?array
    {
        $id = $withDraft ? $this->working()['authorId'] : $this->authorId;

        return $id ? User::query()->find($id)?->toPerson() : null;
    }

    public function displayStatus(): string
    {
        return match (true) {
            $this->isExpired() => 'expired',
            $this->isScheduled() => 'scheduled',
            $this->isPublished() && $this->hasDraft() => 'changed',
            default => $this->status,
        };
    }

    /** Admin/API representation. */
    public function toArray(bool $withDraft = true): array
    {
        $working = $withDraft ? $this->working() : $this->content();

        return [
            'id' => $this->id,
            'collection' => $this->collection,
            'blueprint' => $this->blueprint,
            'locale' => $this->locale,
            'title' => $working['title'],
            'slug' => $working['slug'],
            'uri' => $this->uri,
            'status' => $this->status,
            'displayStatus' => $this->displayStatus(),
            'hasDraft' => $this->hasDraft(),
            'data' => $working['data'],
            'originId' => $this->originId,
            'parentId' => $this->parentId,
            'position' => $this->position,
            'authorId' => $working['authorId'],
            'author' => $this->author($withDraft),
            'version' => $this->version(),
            'publishedAt' => $this->publishedAt?->toIso8601String(),
            'expiresAt' => $this->expiresAt?->toIso8601String(),
            'createdAt' => $this->createdAt?->toIso8601String(),
            'updatedAt' => $this->updatedAt?->toIso8601String(),
        ];
    }

    /** Lightweight representation for lists. */
    public function toSummary(bool $withAuthor = true): array
    {
        $working = $this->working();

        return [
            'id' => $this->id,
            'collection' => $this->collection,
            'locale' => $this->locale,
            'title' => $working['title'],
            'slug' => $working['slug'],
            'uri' => $this->uri,
            'status' => $this->status,
            'displayStatus' => $this->displayStatus(),
            'parentId' => $this->parentId,
            'position' => $this->position,
            'authorId' => $working['authorId'],
            ...($withAuthor ? ['author' => $this->author()] : []),
            'version' => $this->version(),
            'publishedAt' => $this->publishedAt?->toIso8601String(),
            'expiresAt' => $this->expiresAt?->toIso8601String(),
            'updatedAt' => $this->updatedAt?->toIso8601String(),
        ];
    }
}
