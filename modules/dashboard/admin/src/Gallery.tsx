import { t, type WidgetInfo } from '@letterncms/sdk'
import { useEffect, useState } from 'react'
import { Dialog, Fields, Icon, cn } from '@letterncms/ui'

/**
 * Every widget the user may put on their Dashboard: what it shows and where it
 * comes from. A click adds it (to the column the gallery was opened for) or takes it off.
 */
export function Gallery({ open, onOpenChange, widgets, shown, onAdd, onRemove }: { open: boolean; onOpenChange: (open: boolean) => void; widgets: WidgetInfo[]; shown: Set<string>; onAdd: (widget: WidgetInfo) => void; onRemove: (id: string) => void }) {
  const [search, setSearch] = useState('')
  useEffect(() => {
    if (open) setSearch('')
  }, [open])

  const q = search.trim().toLowerCase()
  const matches = widgets
    .filter((w) => !q || [w.label, w.description, w.source].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={t('Widgets')}
      description={t('{count} on your Dashboard', { count: shown.size })}
    >
      <Fields bare fields={[{ handle: 'search', type: 'text', label: t('Search Widgets'), placeholder: t('Search Widgets'), icon: 'search', autofocus: true }]} values={{ search }} onChange={(_, value) => setSearch(String(value ?? ''))} className="mb-4" />

      {matches.length === 0 && <p className="m-0 py-10 text-center text-sm text-muted">{t('No matches')}</p>}

      {/* One stable list: a widget keeps its place when it is added or taken off. */}
      <Grid widgets={matches} shown={shown} onAdd={onAdd} onRemove={onRemove} />
    </Dialog>
  )
}

function Grid({ widgets, shown, onAdd, onRemove }: { widgets: WidgetInfo[]; shown: Set<string>; onAdd: (widget: WidgetInfo) => void; onRemove: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2">
      {widgets.map((w) => {
        const on = shown.has(w.id)
        return (
          <button
            key={w.id}
            type="button"
            aria-pressed={on}
            onClick={() => (on ? onRemove(w.id) : onAdd(w))}
            className={cn('group flex items-start gap-3 rounded-lg border p-3 text-left transition-[background-color,border-color] duration-120 outline-none focus-visible:ring-2 focus-visible:ring-focus', on ? 'border-border bg-surface' : 'border-border hover:border-border-strong hover:bg-surface')}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-sunken text-muted">
              <Icon name={w.icon} size={17} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="truncate text-sm font-medium text-ink">{w.label}</span>
                {w.source.toLowerCase() !== w.label.toLowerCase() && <span className="shrink-0 text-2xs text-faint">{w.source}</span>}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{w.description}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full transition-colors duration-120', on ? 'bg-ink text-ink-contrast group-hover:bg-danger' : 'border border-border-strong text-faint group-hover:border-ink group-hover:text-ink')}
            >
              <Icon name={on ? 'check' : 'plus'} size={11} className={cn(on && 'group-hover:hidden')} />
              {on && <Icon name="minus" size={11} className="hidden group-hover:block" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
