import { t } from '@letterncms/sdk'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from './Button'
import { cn } from './cn'
import { Fields } from './Fields'
import { Popover } from './Popover'
import { Segmented } from './Segmented'
import type { CalendarDate } from './viewPrefs'

export type OverviewView = 'table' | 'grid' | 'calendar'
export interface ViewColumn { id: string; label: string; sort?: string; descFirst?: boolean; field?: unknown }

/** Shared display preferences for every overview, including collection entries. */
function DisplayOptions({ view, all, shown, sortable, sortKey, implicitSort = null, isTree, onColumns, onSort, onReset, calendarDate, onCalendarDate, calendarDates = ['published', 'updated'] }: {
  view: OverviewView; all: ViewColumn[]; shown: Set<string>; sortable: ViewColumn[]; sortKey: string | null;
  /** The order the list has while nobody picked one ("-published_at"): the menu shows it, as the table's header does. */
  implicitSort?: string | null;
  isTree?: boolean;
  onColumns: (ids: string[]) => void; onSort: (key: string | null) => void;
  onReset?: () => void;
  calendarDate?: CalendarDate; onCalendarDate?: (date: CalendarDate) => void;
  /** The dates the records have: the choice shows only when there are two. */
  calendarDates?: CalendarDate[];
}) {
  const toggles = view === 'calendar' ? [] : all
  // Without a pick of its own the list keeps its own order, named like the header names it.
  const implicit = !isTree && implicitSort && sortable.some((c) => c.sort === implicitSort.replace(/^-/, '')) ? implicitSort : null
  const effective = sortKey ?? implicit
  const field = effective?.replace(/^-/, '') ?? ''
  const dateChoice = view === 'calendar' && !!onCalendarDate && calendarDates.length > 1
  const sorting = view !== 'calendar' && sortable.length > 0
  const values: Record<string, unknown> = { sort: field, direction: effective?.startsWith('-') ? 'desc' : 'asc', ...Object.fromEntries(toggles.map((c) => [c.id, shown.has(c.id)])) }
  return <Popover align="end" className="max-h-[70vh] w-[280px] max-w-[calc(100vw-24px)] overflow-y-auto !p-3" trigger={<Button size="sm" variant="ghost" icon="sliders">{t('Display')}</Button>}>
    {dateChoice && <Fields bare fields={[{ handle: 'calendarDate', type: 'select', label: t('Calendar Date'), required: true, size: 'sm', options: { published: t('Published'), updated: t('Updated') } }]} values={{ calendarDate }} onChange={(_, value) => onCalendarDate(value as CalendarDate)} />}
    {sorting && <>
      <div className="cms-label mb-1.5">{t('Sort')}</div>
      <Fields bare layout="inline" className="flex items-center gap-1.5" fields={[
        { handle: 'sort', type: 'select', label: t('Sort By'), size: 'sm', required: true, className: 'min-w-0 flex-1', options: [...(implicit ? [] : [{ value: '', label: isTree ? t('Manual Order') : t('Default Order') }]), ...sortable.map((c) => ({ value: c.sort!, label: c.label }))] },
        { handle: 'direction', type: 'select', label: t('Direction'), display: 'segmented', required: true, if: { sort: sortable.map((c) => c.sort!) }, options: [{ value: 'asc', icon: 'arrow-up', title: t('Ascending') }, { value: 'desc', icon: 'arrow-down', title: t('Descending') }] },
      ]} values={values} onChange={(h, v) => {
        const column = sortable.find((c) => c.sort === v)
        const next = h === 'sort' ? (column ? (column.descFirst ? `-${v}` : v) : null) : v === 'desc' ? `-${field}` : field
        // Picking the list's own order is no pick.
        onSort(next === implicit ? null : next)
      }} />
    </>}
    {toggles.length > 0 && <>
      <div className={cn('cms-label mb-2', (sorting || dateChoice) && '-mx-3 mt-3 border-t border-border px-3 pt-3')}>{view === 'grid' ? t('On Cards') : t('Columns')}</div>
      <Fields layout="stacked" className="!gap-y-1.5" fields={toggles.map((c) => ({ handle: c.id, type: 'toggle', label: c.label, display: 'checkbox' }))} values={values} onChange={(id, on) => onColumns(all.filter((c) => c.id === id ? !!on : shown.has(c.id)).map((c) => c.id))} />
    </>}
    {/* Only when something differs from how the list starts. */}
    {onReset && <div className={cn((dateChoice || sorting || toggles.length > 0) && '-mx-3 mt-3 border-t border-border px-2 pt-2')}><Button size="xs" variant="ghost" onClick={onReset}>{t('Reset Display')}</Button></div>}
  </Popover>
}

const allViews: OverviewView[] = ['table', 'grid', 'calendar']

/** Only the views a list's records can fill: Grid needs pictures, Calendar dates. */
function ViewSwitcher({ value, onChange, views = allViews }: { value: OverviewView; onChange: (view: OverviewView) => void; views?: OverviewView[] }) {
  const titles: Record<OverviewView, [string, string]> = { table: ['table', t('Table')], grid: ['grid', t('Grid')], calendar: ['calendar', t('Calendar')] }
  if (views.length < 2) return null
  return <Segmented value={value} onChange={onChange} options={views.map((view) => ({ value: view, icon: titles[view][0], title: titles[view][1] }))} />
}

/** Every overview presents the same menu, view choices and reset behavior; `display: false` when there is nothing to set. */
export function OverviewControls({ onView, views, display = true, children, ...options }: ComponentProps<typeof DisplayOptions> & { onView: (view: OverviewView) => void; views?: OverviewView[]; display?: boolean; children?: ReactNode }) {
  if (!children && !display && (views ?? allViews).length < 2) return null
  return <div className="ml-auto flex shrink-0 items-center gap-2">
    {children}
    {display && <DisplayOptions {...options} />}
    <ViewSwitcher value={options.view} onChange={onView} views={views} />
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
