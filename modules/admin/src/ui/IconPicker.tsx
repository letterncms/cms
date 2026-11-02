import { t } from '@letterncms/sdk'
import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { phosphorName, storedName, useIconCatalog, type IconCatalog } from '../lib/iconCatalog'
import { cn } from './cn'
import { Icon } from './Icon'
import { Input } from './Input'
import { Popover } from './Popover'
import { Spinner } from './Spinner'

const COLUMNS = 8
const PAGE = 240
/** What most collections and sets want, shown first until you search. */
const SUGGESTED = ['page', 'article', 'collection', 'file-text', 'newspaper', 'image', 'users', 'building', 'tag', 'calendar', 'star', 'box', 'map-pin', 'megaphone', 'chat', 'globe', 'layout', 'code', 'phone', 'share', 'heart', 'book', 'shopping-cart', 'briefcase']

interface Entry {
  /** What gets stored, and what draws the icon. */
  id: string
  label: string
  /** Lower-cased words in its name and the admin's own names for it. */
  words: string
  /** Other words it is found by, after its name. */
  tags: string
}

function entriesFor(set: IconCatalog | null, choices: string[] | undefined): Entry[] {
  if (choices) return choices.map((id) => ({ id, label: id, words: id.replace(/-/g, ' '), tags: '' }))
  if (!set) return []
  const names = new Map<string, string[]>()
  for (const [own, phosphor] of Object.entries(set.semantic)) names.set(phosphor, [...(names.get(phosphor) ?? []), own])
  return Object.keys(set.icons).map((name) => ({ id: storedName(name, set), label: name, words: [name, ...(names.get(name) ?? [])].join(' ').replace(/-/g, ' '), tags: set.tags[name] ?? '' }))
}

/** Every word you typed has to be in the icon's name or keywords. Names come before keywords: exact, then starting with it, then words starting with it. */
function search(entries: Entry[], query: string): Entry[] {
  const terms = query.toLowerCase().split(/[\s-]+/).filter(Boolean)
  if (!terms.length) return entries
  const joined = terms.join('-')
  const rank = (e: Entry) => {
    if (e.label === joined) return 0
    if (e.label.startsWith(joined)) return 1
    const words = e.words.split(' ')
    if (terms.every((w) => words.some((x) => x.startsWith(w)))) return 2
    return terms.every((w) => e.words.includes(w)) ? 3 : 4
  }
  return entries
    .filter((e) => terms.every((w) => e.words.includes(w) || e.tags.includes(w)))
    .map((e) => [rank(e), e] as const)
    .sort((a, b) => a[0] - b[0] || a[1].label.localeCompare(b[1].label))
    .map(([, e]) => e)
}

export interface IconPickerProps {
  value: string | null
  onChange: (value: string) => void
  /** Offer only these icons instead of the whole set. */
  choices?: string[]
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

/** A button showing the icon, opening a searchable grid of every icon the admin can draw. */
export function IconPicker({ value, onChange, choices, disabled, invalid, id, className, 'aria-label': ariaLabel, 'aria-describedby': describedBy }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
      trigger={
        <button
          type="button"
          id={id}
          aria-label={ariaLabel}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          className={cn('cms-focus-ring flex h-8 w-full items-center gap-2 rounded-sm border border-border-strong bg-bg px-2.5 text-left text-sm transition-[border-color,box-shadow] duration-120 data-[popup-open]:border-focus aria-[invalid=true]:border-danger disabled:opacity-50', className)}
        >
          {value && <Icon name={value} size={16} className="shrink-0 text-muted" />}
          <span className={cn('flex-1 truncate', !value && 'text-faint')}>{value ?? t('Choose an icon…')}</span>
          <Icon name="chevrons-up-down" size={13} className="text-faint" />
        </button>
      }
    >
      <IconPanel value={value} choices={choices} onPick={(icon) => { onChange(icon); setOpen(false) }} />
    </Popover>
  )
}

function IconPanel({ value, choices, onPick }: { value: string | null; choices?: string[]; onPick: (icon: string) => void }) {
  const set = useIconCatalog()
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const [hovered, setHovered] = useState<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  const entries = useMemo(() => entriesFor(set, choices), [set, choices])
  const found = useMemo(() => search(entries, query), [entries, query])
  const suggested = useMemo(() => {
    if (query || choices || !set) return []
    const byId = new Map(entries.map((e) => [e.id, e]))
    return SUGGESTED.map((name) => byId.get(storedName(set.semantic[name] ?? name, set))).filter((e): e is Entry => !!e)
  }, [query, choices, set, entries])
  const selected = value && set && !choices ? phosphorName(value, set) : undefined
  const isSelected = (e: Entry) => (choices ? e.id === value : e.label === selected)
  const loading = !choices && !set
  // Opens at the current icon: its row is rendered up front, and scrolled to unless it is among the suggestions.
  const at = query || suggested.some(isSelected) ? -1 : found.findIndex(isSelected)
  const shown = found.slice(0, Math.max(limit, at + PAGE / 4))
  const scrolled = useRef(false)

  const move = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLUMNS, ArrowUp: -COLUMNS }[e.key]
    if (!step) return
    const buttons = [...grid.current!.querySelectorAll<HTMLButtonElement>('button[data-icon]')]
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (at < 0) return
    e.preventDefault()
    if (at + step < 0) input.current?.focus()
    else buttons[Math.min(at + step, buttons.length - 1)]?.focus()
  }

  const cell = (e: Entry, current = false) => (
    <button
      key={e.id}
      ref={current ? (el) => { if (el && !scrolled.current) { scrolled.current = true; el.scrollIntoView({ block: 'center' }) } } : undefined}
      type="button"
      data-icon={e.id}
      title={e.label}
      aria-label={e.label}
      aria-pressed={isSelected(e)}
      onClick={() => onPick(e.id)}
      onMouseEnter={() => setHovered(e.label)}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered(e.label)}
      onBlur={() => setHovered(null)}
      className={cn('cms-focus-ring grid aspect-square place-items-center rounded-xs text-muted transition-colors duration-120 hover:bg-hover hover:text-text', isSelected(e) && 'bg-active text-ink')}
    >
      <Icon name={e.id} size={20} />
    </button>
  )

  return (
    <div>
      <div className="p-2">
        <Input
          ref={input}
          icon="search"
          size="sm"
          type="search"
          aria-label={t('Search icons…')}
          placeholder={t('Search icons…')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); grid.current?.scrollTo({ top: 0 }) }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); grid.current?.querySelector<HTMLButtonElement>('button[data-icon]')?.focus() }
            if (e.key === 'Enter' && found[0]) { e.preventDefault(); onPick(found[0].id) }
          }}
        />
      </div>
      <div
        ref={grid}
        onKeyDown={move}
        onScroll={(e) => { const el = e.currentTarget; if (shown.length < found.length && el.scrollTop + el.clientHeight > el.scrollHeight - 240) setLimit(shown.length + PAGE) }}
        className="h-64 overflow-y-auto overscroll-contain px-2 pb-2"
      >
        {loading ? (
          <div className="grid h-full place-items-center text-faint"><Spinner size={18} /></div>
        ) : !found.length ? (
          <p className="grid h-full place-items-center px-6 text-center text-sm text-faint">{t('No icons match “{query}”', { query })}</p>
        ) : (
          <>
            {suggested.length > 0 && (
              <>
                <h3 className="pb-1 pt-0.5 text-xs font-medium text-faint">{t('Suggested')}</h3>
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}>{suggested.map((e) => cell(e))}</div>
                <h3 className="pb-1 pt-3 text-xs font-medium text-faint">{t('All icons')}</h3>
              </>
            )}
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}>{shown.map((e) => cell(e, at >= 0 && isSelected(e)))}</div>
          </>
        )}
      </div>
      <div className="flex h-8 items-center justify-between gap-3 border-t border-border px-3 text-xs text-faint">
        <span className="truncate text-muted">{hovered ?? selected ?? (choices ? value : null) ?? ''}</span>
        {!loading && <span className="shrink-0 tabular-nums">{found.length}</span>}
      </div>
    </div>
  )
}
