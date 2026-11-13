import { can, navigate, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, EmptyState, Fields, NoMatches, Pressable, QueryError, Section, Skeleton } from '@letterncms/ui'
import { useMemo, useState } from 'react'
import { patternMatches, type PatternDef } from './core/Inserter'
import { PatternPreview } from './core/PatternPreview'

/** Patterns by category, in the order patterns/list gives them (the usual categories first). */
export function byCategory(patterns: PatternDef[]): [string, PatternDef[]][] {
  const groups = new Map<string, PatternDef[]>()
  for (const pattern of patterns) groups.set(pattern.category, [...(groups.get(pattern.category) ?? []), pattern])
  return [...groups]
}

/** Design → Patterns: every pattern as the site draws it, grouped by category. One of the site's opens where it is edited. */
export default function PatternsScreen() {
  const list = useAbility<PatternDef[]>('patterns/list', { working: true }, { staleTime: 10_000 })
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const groups = useMemo(() => byCategory((list.data ?? []).filter((pattern) => patternMatches(pattern, q))), [list.data, q])

  if (list.error) return <QueryError message={t('Patterns could not be loaded')} onRetry={() => void list.refetch()} retrying={list.isFetching} />
  if (list.isLoading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-md" />)}</div>
  if (!list.data?.length) {
    return <EmptyState icon="section-copy" title={t('No patterns yet')} action={can('entries.patterns.create') ? <Button variant="primary" icon="plus" onClick={() => navigate('/content/patterns/new')}>{t('New Pattern')}</Button> : undefined} />
  }

  return (
    <div>
      <div className="mb-6 max-w-sm">
        <Fields bare fields={[{ handle: 'query', type: 'text', label: t('Search'), icon: 'search', size: 'sm', placeholder: t('Search Patterns') }]} values={{ query }} onChange={(_, value) => setQuery(value ?? '')} />
      </div>
      {groups.length === 0 && <NoMatches onClear={() => setQuery('')} />}
      {groups.map(([category, patterns]) => (
        <Section key={category} title={category}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {patterns.map((pattern) => {
              const card = (
                <>
                  <PatternPreview handle={pattern.handle} maxHeight={240} />
                  <span className="mt-2 flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{pattern.title}</span>
                    {!pattern.editable && <Badge>{t('From a Plugin')}</Badge>}
                  </span>
                  {pattern.description && <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{pattern.description}</span>}
                </>
              )
              return pattern.editable && pattern.id
                ? <Pressable key={pattern.handle} to={`/content/patterns/${pattern.id}`} className="block min-w-0 rounded-md p-1 text-left hover:bg-hover">{card}</Pressable>
                : <div key={pattern.handle} className="min-w-0 p-1">{card}</div>
            })}
          </div>
        </Section>
      ))}
    </div>
  )
}
