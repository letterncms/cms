import { t, useAbility, useManifest, type EntrySummary, type FieldProps, type Page } from '@letterncms/sdk'
import { useId, useState, type KeyboardEvent } from 'react'
import { Icon, Spinner, cn, fieldControlId } from '../ui'
import { Pressable } from '../ui/Pressable'
import { EntriesField } from './complex'

const isId = (value: string) => /^[0-9a-z]{26}$/.test(value)

/**
 * A terms field. Categories are picked like entries, from their taxonomy. Tags are typed into the entry: a tag
 * that exists is offered while typing, and a name no tag has stays as it was typed until the entry is saved,
 * which makes the tag. Outside an entry (a global) tags are picked like categories. Both offer the terms of the
 * entry's language.
 */
export function TermsField(props: FieldProps<string[]>) {
  const taxonomy = ((props.field.collections as string[] | undefined) ?? [])[0] ?? ''
  const collection = useManifest().collections.find((c) => c.handle === taxonomy)
  if (props.field.tags && props.context.entry) return <TagsInput {...props} taxonomy={taxonomy} locale={props.context.entry.locale} />
  // Terms of the entry's own language, as the server looks a name up in it.
  return <EntriesField {...props} locale={props.context.entry?.locale} addLabel={collection ? t('Add {type}', { type: collection.singular }) : undefined} />
}

function TagsInput({ field, value, onChange, disabled, taxonomy, locale }: FieldProps<string[]> & { taxonomy: string; locale: string }) {
  const tags = Array.isArray(value) ? value : []
  const max = (field.max as number) || Infinity
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState(0)
  const listbox = useId()
  const query = draft.trim()
  const named = useAbility<EntrySummary[]>('entries/get-many', { ids: tags.filter(isId) }, { enabled: tags.some(isId) })
  // The tags of the entry's own language: the name of one in another language names no tag here.
  const found = useAbility<Page<EntrySummary>>('entries/list', { collection: taxonomy, locale, search: query, perPage: 8 }, { enabled: !!taxonomy && query.length > 0 })
  const titles = new Map((named.data ?? []).map((tag) => [tag.id, tag.title]))
  const taken = new Set(tags.map((tag) => (titles.get(tag) ?? tag).toLowerCase()))
  const offered = query ? (found.data?.items ?? []).filter((tag) => !tags.includes(tag.id) && !taken.has(tag.title.toLowerCase())) : []
  const full = tags.length >= max

  const add = (tag: string) => {
    if (tag && !full && !tags.includes(tag) && !taken.has((titles.get(tag) ?? tag).toLowerCase())) onChange([...tags, tag])
    setDraft('')
    setActive(0)
  }
  // What is typed: the tag offered for it, or a tag of exactly that name, or else the name for a new tag.
  const commit = () => {
    const name = query.replace(/,$/, '').trim()
    if (!name) return
    const same = (found.data?.items ?? []).find((tag) => tag.title.toLowerCase() === name.toLowerCase())
    add(offered[active]?.id ?? same?.id ?? name)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'ArrowDown' && offered.length) {
      e.preventDefault()
      setActive((active + 1) % offered.length)
    } else if (e.key === 'ArrowUp' && offered.length) {
      e.preventDefault()
      setActive((active - 1 + offered.length) % offered.length)
    } else if (e.key === 'Escape' && draft) {
      e.preventDefault()
      setDraft('')
    } else if (e.key === 'Backspace' && draft === '' && tags.length) onChange(tags.slice(0, -1))
  }

  return (
    <div className="space-y-1">
      <div data-disabled={disabled || undefined} className="cms-input flex min-h-8 flex-wrap items-center gap-1 rounded-md px-1.5 py-1 focus-within:border-focus focus-within:shadow-focus">
        {tags.map((tag) => {
          const label = titles.get(tag) ?? (isId(tag) ? '…' : tag)
          return (
            <span key={tag} className={cn('inline-flex h-5 items-center gap-1 rounded-xs bg-active pl-1.5 text-xs font-medium text-text', disabled ? 'pr-1.5' : 'pr-0.5')}>
              {label}
              {!disabled && <Pressable compact onClick={() => onChange(tags.filter((x) => x !== tag))} className="grid size-4 place-items-center rounded-xs text-faint hover:bg-active hover:text-text" aria-label={t('Remove {tag}', { tag: label })}>
                <Icon name="close" size={10} />
              </Pressable>}
            </span>
          )
        })}
        {!full && (
          <input
            id={fieldControlId(field)}
            role="combobox"
            aria-expanded={offered.length > 0}
            aria-controls={listbox}
            aria-autocomplete="list"
            aria-activedescendant={offered[active] ? `${listbox}-${offered[active].id}` : undefined}
            aria-describedby={field.describedBy}
            value={draft}
            disabled={disabled}
            onChange={(e) => { setDraft(e.target.value); setActive(0) }}
            onKeyDown={onKey}
            onBlur={commit}
            placeholder={tags.length ? '' : typeof field.placeholder === 'string' ? field.placeholder : t('Add Tags')}
            className="h-5 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
          />
        )}
        {found.isFetching && <Spinner />}
      </div>
      {offered.length > 0 && (
        <div id={listbox} role="listbox" aria-label={t('Tags')} className="rounded-md border border-border bg-bg p-1 shadow-pop">
          {offered.map((tag, i) => (
            <Pressable
              compact
              key={tag.id}
              id={`${listbox}-${tag.id}`}
              role="option"
              aria-selected={i === active}
              data-active={i === active || undefined}
              // Picked before the field loses its focus, so the click is not read as a new name.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(tag.id)}
              className="cms-menu-item h-8 w-full"
            >
              <Icon name="tag" size={14} className="text-faint" />
              <span className="min-w-0 flex-1 truncate">{tag.title}</span>
            </Pressable>
          ))}
        </div>
      )}
    </div>
  )
}
