import { Button, Fields, Icon, Segmented, cn } from '@letterncms/ui'
import { t, useAbility } from '@letterncms/sdk'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useCatalog } from './context'
import { PatternPreview } from './PatternPreview'
import { menuEnter, settleEnter } from './slashKeys'
import type { BlockNode, BlockTypeDef } from './types'

export interface ComponentDef {
  handle: string
  title: string
  description: string
  category: string
  blocks: BlockNode[]
}

/** Blocks to copy and then change freely: never synced, no properties (patterns/list). */
export interface PatternDef {
  handle: string
  id: string | null
  title: string
  description: string
  category: string
  keywords: string[]
  blocks: BlockNode[]
  editable: boolean
}

export type InsertChoice = { kind: 'block'; type: BlockTypeDef } | { kind: 'component'; component: ComponentDef } | { kind: 'pattern'; pattern: PatternDef }

/** A category no catalog names yet: its handle in title case. */
const titled = (handle: string) => handle.replace(/[-_]+/g, ' ').replace(/(^|\s)\S/g, (c) => c.toUpperCase())

export type InsertItem = { kind: 'block'; type: BlockTypeDef; group: string } | { kind: 'component'; component: ComponentDef; group: string } | { kind: 'pattern'; pattern: PatternDef; group: string }

/** What an item reads as and is drawn with in a list of them. */
export const itemTitle = (item: InsertItem) => item.kind === 'block' ? item.type.title : item.kind === 'component' ? item.component.title : item.pattern.title
export const itemIcon = (item: InsertItem) => item.kind === 'block' ? item.type.icon : item.kind === 'component' ? 'symbol' : 'section-copy'
export const itemKey = (item: InsertItem) => item.kind === 'block' ? item.type.name : item.kind === 'component' ? `c-${item.component.handle}` : `p-${item.pattern.handle}`

/** Whether every block of a pattern may go where it would be inserted. */
export function patternFits(pattern: PatternDef, permits: (name: string) => boolean): boolean {
  return pattern.blocks.length > 0 && pattern.blocks.every((node) => permits(node.type))
}

/** Does a pattern answer a search: its name, category, keywords or description. */
export const patternMatches = (pattern: PatternDef, q: string) => !q || [pattern.title, pattern.category, pattern.description, ...(pattern.keywords ?? [])].some((s) => s.toLowerCase().includes(q))

/** Blocks, then components and patterns, that match `query` and fit where they would go. */
export function useInsertItems(types: BlockTypeDef[], query: string, allowed?: (t: BlockTypeDef) => boolean, withComponents = true): { items: InsertItem[]; loading: boolean } {
  const components = useAbility<ComponentDef[]>('components/list', {}, { staleTime: 60_000 })
  const patterns = useAbility<PatternDef[]>('patterns/list', {}, { staleTime: 60_000 })
  const { catalog } = useCatalog()
  const items = useMemo(() => {
    const categories = catalog?.categories ?? []
    // Categories the catalog doesn't list go last, A–Z.
    const rank = (category: string) => { const at = categories.findIndex((c) => c.name === category); return at < 0 ? categories.length : at }
    const label = (category: string) => categories.find((c) => c.name === category)?.label ?? titled(category)
    const q = query.trim().toLowerCase()
    const match = (s: string) => s.toLowerCase().includes(q)
    const blocks = types
      .filter((type) => allowed ? allowed(type) : !type.parent)
      .filter((type) => !q || match(type.title) || match(type.name) || (type.keywords ?? []).some(match))
      .sort((a, b) => rank(a.category) - rank(b.category) || (rank(a.category) === categories.length ? label(a.category).localeCompare(label(b.category)) : 0))
    // A search puts what it names first: "form" is the Form block, before every field a form can hold.
    const named = (type: BlockTypeDef) => { const title = type.title.toLowerCase(); return title === q ? 0 : title.startsWith(q) ? 1 : match(type.title) ? 2 : 3 }
    const found = (q ? [...blocks].sort((a, b) => named(a) - named(b)) : blocks)
      .map((type) => ({ kind: 'block' as const, type, group: q ? t('Blocks') : label(type.category) }))
    const permits = (name: string) => { const type = types.find((item) => item.name === name); return !!type && (allowed ? allowed(type) : !type.parent) }
    const reusable = (withComponents && permits('component') ? (components.data ?? []) : [])
      .filter((p) => !q || match(p.title) || match(p.category) || match(p.description))
      .map((component) => ({ kind: 'component' as const, component, group: t('Components') }))
    const copies = (withComponents ? (patterns.data ?? []) : [])
      .filter((pattern) => patternFits(pattern, permits) && patternMatches(pattern, q))
      .map((pattern) => ({ kind: 'pattern' as const, pattern, group: t('Patterns') }))
    return [...found, ...reusable, ...copies]
  }, [types, query, components.data, patterns.data, allowed, withComponents, catalog])
  return { items, loading: withComponents && (components.isLoading || patterns.isLoading) }
}

/** Searchable block + component picker used by the slash menu, the + buttons and the workspace toolbar. */
export function Inserter({ types, query, onQuery, onChoose, onClose, allowed, showSearch = true, className, style, compact, chooseFirst, onNoMatch, components: withComponents = true, keyboardDocument }: { types: BlockTypeDef[]; query: string; onQuery?: (q: string) => void; onChoose: (c: InsertChoice) => void; onClose?: () => void; allowed?: (t: BlockTypeDef) => boolean; showSearch?: boolean; className?: string; style?: React.CSSProperties; compact?: boolean; chooseFirst?: boolean; onNoMatch?: () => void; components?: boolean; keyboardDocument?: Document }) {
  const { items: all, loading } = useInsertItems(types, query, allowed, withComponents)
  // Patterns are best chosen by how they look: their own tab draws each one, by category.
  const [tab, setTab] = useState<'blocks' | 'patterns'>('blocks')
  const patterns = useMemo(() => all.filter((item) => item.kind === 'pattern'), [all])
  const showTabs = withComponents && !compact && patterns.length > 0 && !query.trim()
  const items = showTabs && tab === 'patterns' ? patterns : all
  const [active, setActive] = useState(0)
  const list = useRef<HTMLDivElement>(null)

  useEffect(() => setActive(0), [query, tab])

  // The key handler reads the latest list through a ref and is attached in a layout effect:
  // once the menu is on screen it takes Enter, however fast someone typed.
  const latest = useRef({ items, active, loading })
  latest.current = { items, active, loading }
  // Enter came before there was anything to pick (the list not drawn yet, components still loading).
  const pending = useRef(!!chooseFirst)

  useEffect(() => {
    if (!pending.current) return
    const decision = settleEnter(items.length, loading)
    if (decision === 'wait') return
    pending.current = false
    // Nothing matches: the Enter was meant for the text after all.
    decision === 'choose' ? onChoose(items[0]) : onNoMatch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loading])

  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { items, active, loading } = latest.current
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((a) => Math.min(items.length - 1, a + 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((a) => Math.max(0, a - 1))
      } else if (e.key === 'Enter') {
        const decision = menuEnter(items.length, active, loading)
        if (decision !== 'pass') {
          e.preventDefault()
          e.stopPropagation()
          if (decision === 'choose') onChoose(items[active])
          else pending.current = true
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey, true)
    keyboardDocument?.addEventListener('keydown', onKey, true)
    return () => { window.removeEventListener('keydown', onKey, true); keyboardDocument?.removeEventListener('keydown', onKey, true) }
  }, [onChoose, onClose, keyboardDocument])

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  let lastGroup = ''

  return (
    <div className={cn('flex max-h-[min(420px,60vh)] w-[300px] flex-col', className)} style={style}>
      {showSearch && (
        <div className="border-b border-border p-1.5">
          <Fields bare fields={[{ handle: 'query', type: 'text', label: t('Search'), icon: 'search', size: 'sm', autofocus: true, placeholder: t('Search Blocks') }]} values={{ query }} onChange={(_, q) => onQuery?.(q ?? '')} />
        </div>
      )}
      {showTabs && (
        <div className="border-b border-border p-1.5">
          <Segmented size="sm" block aria-label={t('Show')} value={tab} onChange={setTab}
            options={[{ value: 'blocks', label: t('Blocks') }, { value: 'patterns', label: t('Patterns') }]} />
        </div>
      )}
      <div ref={list} className="min-h-0 flex-1 overflow-y-auto p-1">
        {items.length === 0 && <div className="px-3 py-6 text-center text-xs text-faint">{t('No matching blocks')}</div>}
        {showTabs && tab === 'patterns' && items.map((item, i) => {
          if (item.kind !== 'pattern') return null
          const heading = item.pattern.category !== lastGroup ? item.pattern.category : null
          lastGroup = item.pattern.category
          return (
            <div key={itemKey(item)}>
              {heading && <div className="cms-label px-2 pb-1 pt-2">{heading}</div>}
              <Button variant="ghost" size="md" data-index={i} title={item.pattern.description || undefined}
                onMouseMove={() => i !== active && setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => onChoose(item)} data-active={i === active || undefined}
                className="!h-auto w-full !flex-col !items-stretch !gap-1.5 !rounded-sm !p-1.5 text-left">
                <PatternPreview handle={item.pattern.handle} maxHeight={160} />
                <span className="min-w-0 truncate px-0.5 text-sm">{item.pattern.title}</span>
              </Button>
            </div>
          )
        })}
        {!(showTabs && tab === 'patterns') && items.map((item, i) => {
          const heading = item.group !== lastGroup ? item.group : null
          lastGroup = item.group
          const title = itemTitle(item)
          const description = item.kind === 'block' ? item.type.description : item.kind === 'component' ? item.component.description || t('Component') : item.pattern.description || item.pattern.category
          const icon = itemIcon(item)
          return (
            <div key={itemKey(item)}>
              {heading && <div className="cms-label px-2 pb-1 pt-2">{heading}</div>}
              <Button
                variant="ghost"
                size="md"
                data-index={i}
                // What a block is for is its tooltip: the list is names, so twice as many fit.
                title={description || undefined}
                // Moving, not entering: a menu that opens under a resting pointer keeps its first item.
                onMouseMove={() => i !== active && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChoose(item)}
                data-active={i === active || undefined}
                className={cn('w-full !justify-start !gap-2.5 !rounded-sm !px-2 text-left', !compact && '!h-9')}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-xs border border-border bg-surface text-muted">
                  <Icon name={icon} size={14} />
                </span>
                <span className="min-w-0 truncate">{title}</span>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
