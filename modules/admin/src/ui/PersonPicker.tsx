import { abilityKey, run, t, useAbility, type Page, type PersonSummary } from '@letterncms/sdk'
import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Avatar } from './Avatar'
import { Button, IconButton } from './Button'
import { Icon } from './Icon'
import { Input } from './Input'
import { Popover } from './Popover'
import { Spinner } from './Spinner'
import { QueryError } from './QueryError'
import { cn } from './cn'

interface PersonPickerProps {
  value: string[]
  onChange: (ids: string[]) => void
  max?: number
  disabled?: boolean
  label?: string
  id?: string
  'aria-describedby'?: string
}

/** Public summaries only. The single-person control keeps the same geometry in every state. */
export function PersonPicker({ value, onChange, max = Infinity, disabled, label = t('Select people'), id, 'aria-describedby': describedBy }: PersonPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const selected = useQueries({ queries: Array.from({ length: Math.ceil(value.length / 100) }, (_, index) => {
    const input = { ids: value.slice(index * 100, (index + 1) * 100), perPage: 100 }
    return { queryKey: abilityKey('users/lookup', input), queryFn: () => run<Page<PersonSummary>>('users/lookup', input) }
  }) })
  const options = useAbility<Page<PersonSummary>>('users/lookup', { search: search || undefined, page, perPage: 25 }, { enabled: open && !disabled })
  const people = new Map([...selected.flatMap((query) => query.data?.items ?? []), ...(options.data?.items ?? [])].map((person) => [person.id, person]))
  const loading = selected.some((query) => query.isLoading)
  const failed = selected.some((query) => query.isError)
  const single = max === 1
  const current = people.get(value[0])
  const personName = (personId: string) => people.get(personId)?.name ?? (loading ? t('Loading…') : failed ? t('Couldn’t load person') : t('Unavailable person'))
  const choose = (person: PersonSummary) => {
    onChange(single ? [person.id] : [...value, person.id])
    if (single || value.length + 1 >= max) setOpen(false)
  }

  const trigger = single ? (
    <button
      id={id}
      type="button"
      aria-label={label}
      aria-describedby={describedBy}
      disabled={disabled}
      className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-sm px-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-default"
    >
      {current && <Avatar name={current.name} initials={current.initials} src={current.avatar} size={18} />}
      <span className={cn('min-w-0 flex-1 truncate', !value.length && 'text-faint')}>
        {value.length ? personName(value[0]) : disabled ? '—' : label}
      </span>
      {!disabled && <Icon name="chevrons-up-down" size={13} className="shrink-0 text-faint" />}
    </button>
  ) : (
    <Button id={id} aria-describedby={describedBy} size="sm" disabled={disabled || value.length >= max}>
      {value.length === 0 ? disabled ? '—' : label : t('Add people')}
    </Button>
  )

  return (
    <div data-person-picker className="space-y-1.5">
      {!single && value.map((personId) => {
        const person = people.get(personId)
        return (
          <div key={personId} className="flex h-8 min-w-0 items-center gap-2 rounded-sm border border-border px-2">
            {person && <Avatar name={person.name} initials={person.initials} src={person.avatar} size={18} />}
            <span className="min-w-0 flex-1 truncate text-sm">{personName(personId)}</span>
            {!disabled && <IconButton size="xs" icon="close" label={t('Remove person')} onClick={() => onChange(value.filter((selectedId) => selectedId !== personId))} />}
          </div>
        )
      })}
      <div data-open={open || undefined} className={cn(single && 'flex h-8 min-w-0 items-center rounded-sm border border-border-strong bg-bg pr-1 focus-within:border-focus data-[open]:border-focus', disabled && single && 'bg-sunken text-muted')}>
        <Popover open={open && !disabled} onOpenChange={(next) => !disabled && setOpen(next)} className="w-72 max-w-[calc(100vw-24px)]" trigger={trigger}>
          <Input size="sm" icon="search" aria-label={t('Search people')} placeholder={t('Search people…')} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
          <div className="mt-1 max-h-64 overflow-y-auto">
            {options.isLoading ? <div className="grid place-items-center py-5"><Spinner /></div> : options.isError ? (
              <QueryError compact message={t('Couldn’t load people.')} onRetry={() => void options.refetch()} />
            ) : (
              <>
                {(options.data?.items ?? []).map((person) => (
                  <button type="button" key={person.id} aria-label={person.name} disabled={value.includes(person.id)} onClick={() => choose(person)} className="flex min-h-9 w-full items-center gap-2 rounded-xs px-2 py-1 text-left text-sm hover:bg-hover disabled:opacity-40">
                    <Avatar name={person.name} initials={person.initials} src={person.avatar} size={20} />
                    <span className="min-w-0 flex-1 truncate">{person.name}</span>
                  </button>
                ))}
                {options.data?.items.length === 0 && <p className="px-2 py-3 text-xs text-muted">{search ? t('No people match your search.') : t('No people available.')}</p>}
                {(options.data?.pages ?? 0) > 1 && (
                  <div className="flex items-center justify-between border-t border-border py-2">
                    <Button size="xs" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('Previous')}</Button>
                    <span className="text-xs text-faint">{page} / {options.data?.pages}</span>
                    <Button size="xs" disabled={page >= (options.data?.pages ?? 1)} onClick={() => setPage(page + 1)}>{t('Next')}</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Popover>
        {single && value.length > 0 && !disabled && <IconButton size="xs" icon="close" label={t('Remove person')} onClick={() => onChange([])} />}
      </div>
      {failed && value.length > 0 && <Button size="xs" onClick={() => selected.filter((query) => query.isError).forEach((query) => void query.refetch())}>{t('Retry')}</Button>}
    </div>
  )
}
