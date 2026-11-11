import { abilityKey, Link, locale, navigate, registry, run, t, useAbility, useManifest, type SurfaceComponentProps, type ViewAction, type ViewNode } from '@letterncms/sdk'
import { useQueries } from '@tanstack/react-query'
import { Fragment, Suspense, useCallback, useLayoutEffect, useMemo, useState, useSyncExternalStore, type ComponentType, type ReactNode } from 'react'
import { Button } from '../Button'
import { cn } from '../cn'
import { ComponentBoundary } from '../ComponentBoundary'
import { DataTable } from '../DataTable'
import { EmptyState, NoMatches } from '../EmptyState'
import { Icon } from '../Icon'
import { Notice } from '../Notice'
import { Page, ScreenTabs, Section, useScreenTabs } from '../Page'
import { useShortcut } from '../shortcuts'
import { Spinner } from '../Spinner'
import { Stat } from '../Widget'
import { WidgetSlot } from '../WidgetSlot'
import { ActionButton, shown } from './actions'
import { TabContext, useView, ViewContext } from './context'
import { Form, SettingsView } from './Form'
import { formatValue, type FormatOptions } from './formats'
import { Records, type RecordsProps } from './Records'
import { at, fill, input, safeUrl } from './scope'

type Renderer = ComponentType<{ node: ViewNode; path: string }>

/** One node: its catalog component, with its props filled in from where it is drawn. */
export function ViewNodeView({ node, path }: { node: ViewNode; path: string }) {
  const { scope } = useView()
  const Component = builtins[node.type]
  // Templates fill in here, once; bound sources and actions keep theirs for the scope they run in.
  const filled = { ...node, props: fillShown(node.props, scope) }
  if (Component) return <Component node={filled} path={path} />
  if (node.type.startsWith('widget/')) return <RegisteredWidget id={node.type.slice(7)} />
  return <RegisteredComponent node={filled} path={path} />
}

/** Props as shown: words and values filled in, while `source`, actions and dialogs keep their templates for when they run. */
function fillShown(props: Record<string, any>, scope: Record<string, unknown>): Record<string, any> {
  // A list's literal `rows` are values as they were found, never templates. A list's calendar and tree
  // fill in with their month and their rows.
  const kept = new Set(['source', 'rows', 'save', 'actions', 'open', 'action', 'items', 'columns', 'filters', 'bulk', 'empty', 'count', 'calendar', 'tree'])
  return Object.fromEntries(Object.entries(props ?? {}).map(([k, v]) => [k, kept.has(k) ? v : fill(v, scope)]))
}

export function ViewNodes({ nodes, path = 'n' }: { nodes?: ViewNode[]; path?: string }) {
  // An assistant reply's nodes keep their own ids: its buttons report them.
  return <>{(nodes ?? []).map((child, i) => <ViewNodeView key={child.key ?? `${path}.${i}`} node={child} path={child.key ?? `${path}.${i}`} />)}</>
}

const children = (node: ViewNode, path: string) => <ViewNodes nodes={node.children} path={path} />

/** What a page or tab holds, one under another with room between: a notice, then its list. */
const stacked = (nodes: ViewNode[] | undefined, path: string) => (nodes?.length ?? 0) > 1 ? <div className="space-y-6"><ViewNodes nodes={nodes} path={path} /></div> : <ViewNodes nodes={nodes} path={path} />

function Buttons({ actions, size, bar }: { actions?: ViewAction[]; size?: 'sm' | 'md'; bar?: boolean }) {
  const { scope } = useView()
  const list = shown(actions, scope)
  // In a page's bar on a phone, a button with an icon is its icon: the page's name keeps its room.
  return list.length > 0 ? <>{list.map((a, i) => <Fragment key={i}><ActionButton action={a} size={size} compact={bar && !!a.icon} />{bar && a.key && <ActionKey action={a} />}</Fragment>)}</> : null
}

/** A page's action on a key of its own (`c` for a new entry), as the person looking may take it. */
function ActionKey({ action }: { action: ViewAction }) {
  const { act, scope } = useView()
  useShortcut(action.key!, () => void act(action, scope).catch(() => {}))
  return null
}

/** The page: one bar naming it with what can be done there; its tabs under it when it has them. */
function PageNode({ node, path }: { node: ViewNode; path: string }) {
  const { width = 'wide', actions } = node.props
  const tabs = node.children?.length === 1 && node.children[0].type === 'ui/tabs' ? node.children[0] : null
  if (tabs) return <TabbedPage node={node} tabs={tabs} path={path} />
  return (
    <Page width={width} crumbs={crumbs(node)} actions={<Buttons actions={actions} bar />}>
      {stacked(node.children, path)}
    </Page>
  )
}

/** Where the page is: the list it belongs to (`back`), then its own name. */
function crumbs(node: ViewNode) {
  const { back, icon, title } = node.props
  // The icon goes with the place the trail starts from, as on every screen; the name stays words, for the window's title.
  const own = { label: <>{title}<Count node={node} /></> }
  return back ? [{ label: String(back.label), to: String(back.to), icon }, own] : [{ ...own, icon }]
}

/** How many a tab's list holds, from an ability, beside its name. */
function useTabCounts(list: ViewNode[], scope: Record<string, unknown>): Record<string, number | undefined> {
  const queries = useQueries({ queries: list.map((c) => {
    const count = c.props.count
    return { queryKey: abilityKey(count?.source?.ability ?? 'abilities/list', input(count?.source?.input, scope)), queryFn: () => run(count.source.ability, input(count.source.input, scope)), enabled: !!count }
  }) })
  return Object.fromEntries(list.map((c, i) => {
    const n = c.props.count ? at(queries[i].data, c.props.count.at ?? 'total') : undefined
    return [String(c.props.id), typeof n === 'number' ? n : undefined]
  }))
}

/** How many there are beside a page's name, when it counts something. */
function Count({ node }: { node: ViewNode }) {
  const { scope } = useView()
  const { count } = node.props
  const counted = useAbility<unknown>(count?.source?.ability ?? 'abilities/list', input(count?.source?.input, scope), { enabled: !!count, placeholderData: (p: unknown) => p })
  const n = count ? at(counted.data, count.at ?? 'total') : undefined
  return typeof n === 'number' && n > 0 ? <span className="ml-2 font-normal tabular-nums text-faint">{n.toLocaleString(locale())}</span> : null
}

function TabbedPage({ node, tabs, path }: { node: ViewNode; tabs: ViewNode; path: string }) {
  const { width = 'wide', actions } = node.props
  const list = (tabs.children ?? []).filter((c) => c.type === 'ui/tab')
  const [tab, setTab] = useScreenTabs(list.map((c) => String(c.props.id)))
  const current = list.find((c) => c.props.id === tab)
  // A tab once opened stays drawn, hidden, so what was typed or chosen there is still there on the way back.
  const [opened, setOpened] = useState<string[]>([])
  if (current && !opened.includes(tab)) setOpened([...opened, tab])
  const [dirty, setDirty] = useState<Record<string, boolean>>({})
  const { scope } = useView()
  const counts = useTabCounts(list, scope)
  const mark = useCallback((id: string, on: boolean) => setDirty((d) => d[id] === on ? d : { ...d, [id]: on }), [])
  return (
    <Page width={width} crumbs={crumbs(node)} actions={<DirtyScope dirty={!!dirty[tab]}><Buttons actions={current?.props.actions} bar /><Buttons actions={actions} bar /></DirtyScope>}>
      <ScreenTabs value={tab} onChange={setTab} tabs={list.map((c) => ({ value: String(c.props.id), label: String(c.props.label), count: counts[String(c.props.id)], indicator: !!dirty[String(c.props.id)] }))}>
        {list.filter((c) => opened.includes(String(c.props.id))).map((c, i) => (
          <div key={String(c.props.id)} hidden={c.props.id !== tab}>
            <TabProvider id={String(c.props.id)} mark={mark}>{stacked(c.children, `${path}.t${i}`)}</TabProvider>
          </div>
        ))}
      </ScreenTabs>
    </Page>
  )
}

/** The bar's actions know whether the tab on view has unsaved changes: `{dirty}`, to wait for Save. */
function DirtyScope({ dirty, children }: { dirty: boolean; children: ReactNode }) {
  const host = useView()
  const value = useMemo(() => ({ ...host, scope: { ...host.scope, dirty } }), [host, dirty])
  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

function TabProvider({ id, mark, children }: { id: string; mark: (id: string, dirty: boolean) => void; children: ReactNode }) {
  const value = useMemo(() => ({ id, dirty: mark }), [id, mark])
  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

function Detail({ node }: { node: ViewNode }) {
  const { scope } = useView()
  const { items, source, record, raw, rawLabel, empty } = node.props
  const loaded = useAbility<unknown>(source?.ability ?? 'abilities/list', input(source?.input, scope), { enabled: !!source })
  const rows: [string, ReactNode][] = items
    ? (items as { label: string; key?: string; value?: unknown; format?: string; tones?: FormatOptions['tones']; labels?: Record<string, string>; currency?: string }[]).map((i) => {
      const from = loaded.data ?? scope
      return [i.label, formatValue(i.key ? at(from, i.key) : i.value, { format: i.format, tones: i.tones, labels: i.labels, currency: i.currency ? String(at(from, i.currency) ?? i.currency) : undefined })]
    })
    : record && typeof record === 'object' ? summary(record as Record<string, unknown>) : []
  return (
    <div className="flex flex-col gap-5">
      {rows.length > 0 ? (
        <dl className="m-0 grid grid-cols-[minmax(96px,auto)_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
          {rows.map(([label, value], i) => <Fragment key={i}><dt className="text-muted">{label}</dt><dd className="m-0 min-w-0 break-words text-text">{value}</dd></Fragment>)}
        </dl>
      ) : <p className="m-0 text-sm text-muted">{empty ?? t('Nothing else was sent.')}</p>}
      {raw !== undefined && raw !== null && (typeof raw !== 'object' || Object.keys(raw).length > 0) && (
        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs text-muted hover:text-text [&::-webkit-details-marker]:hidden">
            <Icon name="chevron-right" size={12} className="transition-transform group-open:rotate-90" />
            {rawLabel ?? t('Raw Data')}
          </summary>
          <pre className="m-0 mt-2 max-h-[40vh] overflow-auto rounded-sm bg-sunken p-3 font-mono text-xs">{typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}</pre>
        </details>
      )}
    </div>
  )
}

/** `entryId` → "Entry", `prefixDefault` → "Prefix Default". Ids say which; the subject already does. */
const words = (key: string) => key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase())
const isId = (key: string) => key === 'id' || /Id$|_id$/.test(key)

/** Every value of a record, as a short list; nested values (an entry's `data`, a setting's `values`) one level in. */
function summary(record: Record<string, unknown>): [string, ReactNode][] {
  const out: [string, ReactNode][] = []
  for (const [key, value] of Object.entries(record)) {
    if (isId(key)) continue
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [inner, v] of Object.entries(value as Record<string, unknown>)) if (!isId(inner)) out.push([words(inner), formatValue(short(v))])
    } else out.push([words(key), formatValue(short(value))])
  }
  return out
}

const short = (v: unknown) => typeof v === 'string' && v.length > 160 ? `${v.slice(0, 160)}…` : v

/** Before and after, key by key: what changed stands out. */
function Diff({ node }: { node: ViewNode }) {
  const { before, after, label } = node.props
  const object = (v: unknown) => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : { [label ?? t('Value')]: v }
  const a = object(before), b = object(after)
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
  const same = (k: string) => JSON.stringify(a[k]) === JSON.stringify(b[k])
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="grid grid-cols-[minmax(96px,auto)_1fr_1fr] gap-x-4 border-b border-border bg-sunken px-3 py-2 text-xs font-medium text-muted">
        <span />
        <span>{t('Before')}</span>
        <span>{t('After')}</span>
      </div>
      {keys.map((k) => (
        <div key={k} className={cn('grid grid-cols-[minmax(96px,auto)_1fr_1fr] gap-x-4 px-3 py-2 text-sm [&+&]:border-t [&+&]:border-border', same(k) && 'text-muted')}>
          <span className="text-muted">{words(k)}</span>
          <span className={cn('min-w-0 break-words', !same(k) && 'text-danger line-through decoration-danger/40')}>{formatValue(a[k])}</span>
          <span className={cn('min-w-0 break-words', !same(k) && 'text-success')}>{formatValue(b[k])}</span>
        </div>
      ))}
    </div>
  )
}

function Chart({ node }: { node: ViewNode }) {
  const { scope } = useView()
  const { label, kind = 'line', points, source, at: path, x = 'x', y = 'y' } = node.props
  const loaded = useAbility<unknown>(source?.ability ?? 'abilities/list', input(source?.input, scope), { enabled: !!source })
  const list = (points ?? (Array.isArray(at(loaded.data, path)) ? (at(loaded.data, path) as Record<string, unknown>[]).map((p) => ({ x: at(p, x), y: Number(at(p, y)) || 0 })) : [])) as { x: string | number; y: number }[]
  const max = Math.max(1, ...list.map((p) => p.y))
  const w = 600, h = 160
  const step = list.length > 1 ? w / (list.length - 1) : w
  return (
    <figure className="m-0">
      <figcaption className="mb-2 text-sm font-medium text-ink">{label}</figcaption>
      {list.length === 0 ? <p className="m-0 py-6 text-center text-xs text-muted">{t('No data yet')}</p> : (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full text-ink" role="img" aria-label={label} preserveAspectRatio="none">
          {kind === 'bar'
            ? list.map((p, i) => { const bw = w / list.length; const bh = (p.y / max) * (h - 4); return <rect key={i} x={i * bw + bw * 0.15} y={h - bh} width={bw * 0.7} height={bh} rx={2} className="fill-current opacity-80"><title>{`${p.x}: ${p.y}`}</title></rect> })
            : <polyline fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" points={list.map((p, i) => `${i * step},${h - 2 - (p.y / max) * (h - 4)}`).join(' ')} />}
        </svg>
      )}
    </figure>
  )
}

function StatNode({ node }: { node: ViewNode }) {
  const { scope } = useView()
  const { label, value, delta, trend, source, at: path, format } = node.props
  const loaded = useAbility<unknown>(source?.ability ?? 'abilities/list', input(source?.input, scope), { enabled: !!source })
  const shownValue = source ? formatValue(at(loaded.data, path), { format } as FormatOptions) : value
  return <Stat label={label} value={shownValue} delta={delta} trend={trend} />
}

function NoticeNode({ node }: { node: ViewNode }) {
  const { tone = 'info', title, text, action } = node.props
  return <Notice tone={tone} title={title} action={action && <ActionButton action={action} size="sm" />}>{text}</Notice>
}

function LiteralTable({ node }: { node: ViewNode }) {
  const { columns, rows } = node.props as { columns: string[]; rows: (string | number | boolean | null)[][] }
  const items = rows.map((values, id) => ({ id: String(id), values }))
  return <DataTable<(typeof items)[number]> label={t('Results')} items={items} rowKey={(row) => row.id} columns={columns.map((label, i) => ({
    id: String(i), label, width: 'minmax(120px,1fr)', render: (row) => row.values[i] === null ? '—' : String(row.values[i]),
  }))} state={!rows.length && <NoMatches className="py-3" />} />
}

/** An assistant reply's button: reports itself, and the server runs what it stands for through approvals. */
function SurfaceAction({ node, path }: { node: ViewNode; path: string }) {
  const { emit, disabled } = useView()
  return <Button size="sm" disabled={disabled || !emit} onClick={() => emit?.(path, 'submit')}>{node.props.label}</Button>
}

/** A short list of places, each a line that opens where it leads: its icon, its name, and what it is, cut short with an ellipsis. */
function Links({ node }: { node: ViewNode }) {
  const items = (Array.isArray(node.props.items) ? node.props.items : []) as { label: string; detail?: string; icon?: string; to: string }[]
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {items.map((item, i) => {
        const to = typeof item.to === 'string' && item.to.startsWith('/') && !item.to.startsWith('//') ? item.to : null
        const line = <>
          <Icon name={item.icon ?? 'file'} size={15} className="shrink-0 text-muted" />
          <span className="min-w-0 shrink truncate font-medium text-ink">{item.label}</span>
          {item.detail && <span className="min-w-0 flex-1 truncate text-muted">{item.detail}</span>}
        </>
        return (
          <li key={i}>
            {to
              ? <Link to={to} className="cms-view-link -mx-2 flex min-h-9 min-w-0 items-center gap-2 rounded-sm px-2 text-sm no-underline hover:bg-hover">{line}</Link>
              : <span className="flex min-h-9 min-w-0 items-center gap-2 text-sm">{line}</span>}
          </li>
        )
      })}
    </ul>
  )
}

/** A titled group; without a title or anything to do, no heading at all. */
function SectionNode({ node, path }: { node: ViewNode; path: string }) {
  const { scope } = useView()
  const actions = shown(node.props.actions, scope)
  return <Section title={node.props.title} actions={actions.length > 0 ? <Buttons actions={actions} size="sm" /> : undefined}>{children(node, path)}</Section>
}

/** A place that moved: whoever opens it goes on to where it is now, leaving no step in the history. */
function Redirect({ node }: { node: ViewNode }) {
  useLayoutEffect(() => { navigate(String(node.props.to), { replace: true }) }, [node.props.to])
  return null
}

const builtins: Record<string, Renderer> = {
  'ui/page': PageNode,
  // Tabs outside a page's bar are drawn as their children, one after the other.
  'ui/tabs': ({ node, path }) => children(node, path),
  'ui/tab': ({ node, path }) => children(node, path),
  'ui/section': SectionNode,
  'ui/stack': ({ node, path }) => <div className="space-y-4">{children(node, path)}</div>,
  'ui/grid': ({ node, path }) => <div className={cn('grid min-w-0 gap-4', { 1: 'grid-cols-1', 2: '@md:grid-cols-2 md:grid-cols-2', 3: '@lg:grid-cols-3 lg:grid-cols-3', 4: '@lg:grid-cols-4 lg:grid-cols-4' }[Number(node.props.columns ?? 2)])}>{children(node, path)}</div>,
  'ui/text': ({ node }) => <p className={cn('m-0 whitespace-pre-wrap text-sm leading-relaxed', node.props.muted ? 'text-muted' : 'text-text')}>{node.props.text}</p>,
  'ui/notice': NoticeNode,
  'ui/stat': StatNode,
  'ui/chart': Chart,
  'ui/table': LiteralTable,
  'ui/detail': Detail,
  'ui/diff': Diff,
  'ui/preview': ({ node }) => safeUrl(node.props.url) ? <iframe src={safeUrl(node.props.url)!} title={node.props.title ?? t('Preview')} sandbox="allow-same-origin allow-scripts allow-forms" className="w-full rounded-lg border border-border bg-white" style={{ height: node.props.height ?? 480 }} /> : null,
  'ui/redirect': Redirect,
  'ui/empty': ({ node }) => node.props.size === 'sm'
    ? <p className="m-0 py-3 text-sm text-muted">{node.props.title ?? t('Nothing here yet')}</p>
    : <EmptyState icon={node.props.icon ?? 'inbox'} title={node.props.title ?? t('Nothing here yet')} description={node.props.text} action={node.props.action && <ActionButton action={node.props.action} />} />,
  'ui/action': SurfaceAction,
  'ui/links': Links,
  'ui/actions': ({ node }) => <div className="flex flex-wrap items-center gap-2"><Buttons actions={node.props.items} /></div>,
  // `key` names the rows' key, which React would take as its own.
  'ui/records': ({ node }) => { const { key, ...props } = node.props as RecordsProps; return <Records {...props} rowKey={key} /> },
  'ui/form': ({ node }) => <Form {...(node.props as any)} />,
  'ui/settings': ({ node }) => <SettingsView namespace={String(node.props.namespace)} />,
}

// Subscribe at the mounted slot: the CMS can replace or withdraw a plugin implementation without changing the view.
function RegisteredComponent({ node, path }: { node: ViewNode; path: string }) {
  const { disabled, emit, scope } = useView()
  useSyncExternalStore(registry.components.subscribe, registry.components.version)
  const Component = registry.components.get(node.type) as ComponentType<SurfaceComponentProps> | undefined
  if (!Component) return <Unavailable />
  return (
    <ComponentBoundary label={node.type}>
      <Suspense fallback={<div className="grid place-items-center py-10 text-faint"><Spinner /></div>}>
        <Component props={node.props} disabled={disabled} onAction={(name) => emit?.(path, name)} scope={scope}>{children(node, path)}</Component>
      </Suspense>
    </ComponentBoundary>
  )
}

function RegisteredWidget({ id }: { id: string }) {
  const widget = useManifest().widgets.find((w) => w.id === id)
  return widget ? <WidgetSlot widget={widget} fallback={<Unavailable />} /> : <Unavailable />
}

export function Unavailable() {
  return <EmptyState compact icon="box" title={t('This component is no longer available')} />
}
