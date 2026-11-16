import { can, navigate, t, useAbility } from '@letterncms/sdk'
import { Button, DataCard, DataGrid, EmptyState, Fields, Icon, NoMatches, PagePreview, QueryError, Section, Tooltip } from '@letterncms/ui'
import { useMemo, useState } from 'react'
import { patternMatches, patternPage, type PatternDef } from './core/Inserter'

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
  if (list.isLoading) return <DataGrid loading media />
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
          {/* The cards of every list of the design: the site's own drawing of each, its name, and a line on it. */}
          <DataGrid media>
            {patterns.map((pattern) => (
              <DataCard
                key={pattern.handle}
                title={pattern.title}
                href={pattern.editable && pattern.id ? `/content/patterns/${pattern.id}` : undefined}
                image={<PagePreview src={patternPage(pattern.handle)} fill />}
                // A plugin's pattern is used as it is: locked, as what can't be changed here is everywhere.
                footer={!pattern.editable ? <Tooltip content={t('From a Plugin')}><span className="relative z-raised flex items-center gap-1 text-faint"><Icon name="lock" size={12} /><span className="sr-only">{t('From a Plugin')}</span></span></Tooltip> : undefined}
              >
                {pattern.description && <p className="m-0 mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{pattern.description}</p>}
              </DataCard>
            ))}
          </DataGrid>
        </Section>
      ))}
    </div>
  )
}
