import { t } from '@letterncms/sdk'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from './Button'
import { Fields } from './Fields'
import { Popover } from './Popover'
import { Segmented } from './Segmented'
import type { CalendarDate } from './viewPrefs'

export type OverviewView = 'table' | 'grid' | 'calendar'
export interface ViewColumn { id: string; label: string; sort?: string; descFirst?: boolean; field?: unknown }

/** Shared display preferences for every overview, including collection entries. */
export function DisplayOptions({ view, all, shown, sortable, sortKey, isTree, cardColumns, onColumns, onSort, onReset, calendarDate, onCalendarDate }: {
  view: OverviewView; all: ViewColumn[]; shown: Set<string>; sortable: ViewColumn[]; sortKey: string | null; isTree?: boolean; cardColumns?: string[];
  onColumns: (ids: string[]) => void; onSort: (key: string | null) => void;
  onReset?: () => void;
  calendarDate?: CalendarDate; onCalendarDate?: (date: CalendarDate) => void;
}) {
  const toggles = view === 'calendar' ? [] : view === 'grid' && cardColumns ? all.filter((column) => cardColumns.includes(column.id)) : all
  const builtIn = toggles.filter((c) => !c.field)
  const fields = toggles.filter((c) => c.field)
  const field = sortKey?.replace(/^-/, '') ?? ''
  const values: Record<string, unknown> = { sort: field, direction: sortKey?.startsWith('-') ? 'desc' : 'asc', ...Object.fromEntries(toggles.map((c) => [c.id, shown.has(c.id)])) }
  const checkboxes = (columns: ViewColumn[]) => <Fields layout="stacked" className="!gap-y-1.5" fields={columns.map((c) => ({ handle: c.id, type: 'toggle', label: c.label, display: 'checkbox' }))} values={values} onChange={(id, on) => onColumns(all.filter((c) => c.id === id ? !!on : shown.has(c.id)).map((c) => c.id))} />
  return <Popover align="end" className="max-h-[70vh] w-60 overflow-y-auto !p-3" trigger={<Button size="sm" variant="ghost" icon="sliders">{t('Display')}</Button>}>
    {view === 'calendar' && onCalendarDate && <Fields bare fields={[{ handle: 'calendarDate', type: 'select', label: t('Calendar Date'), required: true, size: 'sm', options: { published: t('Published'), updated: t('Updated') } }]} values={{ calendarDate }} onChange={(_, value) => onCalendarDate(value as CalendarDate)} />}
    {view !== 'calendar' && sortable.length > 0 && <>
      <div className="cms-caps mb-1.5">{t('Sort')}</div>
      <Fields bare layout="inline" className="flex items-center gap-1.5" fields={[
        { handle: 'sort', type: 'select', label: t('Sort By'), size: 'sm', required: true, className: 'min-w-0 flex-1', options: [{ value: '', label: isTree ? t('Manual Order') : t('Default Order') }, ...sortable.map((c) => ({ value: c.sort!, label: c.label }))] },
        { handle: 'direction', type: 'select', label: t('Direction'), display: 'segmented', required: true, if: { sort: sortable.map((c) => c.sort!) }, options: [{ value: 'asc', icon: 'arrow-up', title: t('Ascending') }, { value: 'desc', icon: 'arrow-down', title: t('Descending') }] },
      ]} values={values} onChange={(h, v) => {
        if (h === 'sort') { const column = sortable.find((c) => c.sort === v); onSort(column ? (column.descFirst ? `-${v}` : v) : null) }
        else onSort(v === 'desc' ? `-${field}` : field)
      }} />
    </>}
    {toggles.length > 0 && <>
      <div className="cms-caps mb-2 mt-4 border-t border-border pt-3">{view === 'grid' ? t('On Cards') : t('Columns')}</div>
      {checkboxes(builtIn)}
      {fields.length > 0 && <><div className="cms-caps mb-2 mt-4 border-t border-border pt-3">{t('Fields')}</div>{checkboxes(fields)}</>}
    </>}
    {onReset && <div className="mt-3 border-t border-border pt-2"><Button size="xs" variant="ghost" onClick={onReset}>{t('Reset Display')}</Button></div>}
  </Popover>
}

export function ViewSwitcher({ value, onChange }: { value: OverviewView; onChange: (view: OverviewView) => void }) {
  const options: { value: OverviewView; icon: string; title: string }[] = [
    { value: 'table', icon: 'table', title: t('Table') },
    { value: 'grid', icon: 'grid', title: t('Grid') },
    { value: 'calendar', icon: 'calendar', title: t('Calendar') },
  ]
  return <Segmented value={value} onChange={onChange} options={options} />
}

/** Every overview presents the same menu, view choices and reset behavior. */
export function OverviewControls({ onView, children, ...display }: ComponentProps<typeof DisplayOptions> & { onView: (view: OverviewView) => void; children?: ReactNode }) {
  return <div className="ml-auto flex shrink-0 items-center gap-2">
    {children}
    <DisplayOptions {...display} />
    <ViewSwitcher value={display.view} onChange={onView} />
  </div>
}

/** Header clicks cycle natural direction, reverse, then the source's default order. */
export function nextTableSort(field: string, current: string | null, descFirst = false, implicit: string | null = null): string | null {
  const first = descFirst ? `-${field}` : field
  const flip = (key: string) => key.startsWith('-') ? key.slice(1) : `-${key}`
  if (current?.replace(/^-/, '') === field) return current === first ? flip(first) : null
  if (!current && implicit?.replace(/^-/, '') === field) return flip(implicit)
  return first
}
