import { JSONUIProvider, Renderer, type ComponentRegistry, type ComponentRenderProps } from '@json-render/react'
import { registry, t, useManifest, type SurfaceAction, type SurfaceComponentProps, type SurfaceDocument } from '@letterncms/sdk'
import { createContext, Suspense, useContext, useId, useMemo, useSyncExternalStore } from 'react'
import { Button } from './Button'
import { ComponentBoundary } from './ComponentBoundary'
import { DataTable } from './DataTable'
import { Stat, Widget, WidgetMessage } from './Widget'
import { WidgetSlot } from './WidgetSlot'

const Host = createContext({ disabled: false })

const builtins: ComponentRegistry = {
  'ui/stack': ({ children }) => <div className="space-y-4">{children}</div>,
  'ui/grid': ({ element, children }) => <div className={`grid min-w-0 gap-4 ${element.props.columns === 3 ? '@lg:grid-cols-3' : element.props.columns === 1 ? 'grid-cols-1' : '@md:grid-cols-2'}`}>{children}</div>,
  'ui/text': ({ element }) => <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-text">{element.props.text}</p>,
  'ui/stat': ({ element }) => <Stat {...element.props} />,
  'ui/table': ({ element }) => <SurfaceTable columns={element.props.columns} rows={element.props.rows} />,
  'ui/action': function Action({ element, emit }) {
    const { disabled } = useContext(Host)
    return <Button size="sm" disabled={disabled} onClick={() => emit('submit')}>{element.props.label}</Button>
  },
}

/** A native json-render spec, backed by the current CMS registry and design system. */
export interface SurfaceProps {
  document: SurfaceDocument
  disabled?: boolean
  onAction?: (action: SurfaceAction) => void
}

export function Surface({ document, disabled = false, onAction }: SurfaceProps) {
  const manifest = useManifest()
  const titleId = useId()
  const components = useMemo(() => {
    const result: ComponentRegistry = { ...builtins }
    for (const widget of manifest.widgets) {
      result[`widget/${widget.id}`] = RegisteredWidget
    }
    for (const info of manifest.components ?? []) {
      result[info.id] = RegisteredComponent
    }
    return result
  }, [manifest.widgets, manifest.components])

  // Use json-render's event dispatcher while sending only stored element/event identifiers
  // to the server. No generated ability input or browser state is trusted on click.
  const spec = useMemo(() => document.version !== 1 ? null : ({
    ...document.spec,
    elements: Object.fromEntries(Object.entries(document.spec.elements).map(([id, element]) => [id, {
      ...element,
      on: Object.fromEntries(Object.keys(element.on ?? {}).map((name) => [name, { action: 'cms', params: { node: id, name } }])),
    }])),
  }), [document])
  const handlers = useMemo(() => ({ cms: (params: Record<string, unknown>) => {
    if (!disabled && onAction) onAction({ node: String(params.node), name: String(params.name) })
  } }), [disabled, onAction])

  if (!spec) return <Unavailable />
  return (
    <section aria-labelledby={titleId} className="@container min-w-0 rounded-lg border border-border bg-surface p-4">
      <h2 id={titleId} className="m-0 mb-4 text-sm font-semibold text-ink">{document.title}</h2>
      <Host.Provider value={{ disabled: disabled || !onAction }}>
        <JSONUIProvider registry={components} handlers={handlers}>
          <Renderer spec={spec} registry={components} fallback={Unavailable} />
        </JSONUIProvider>
      </Host.Provider>
    </section>
  )
}

// Subscribe at the mounted slot: json-render memoizes its catalog components, while
// The CMS can replace or withdraw a plugin implementation without changing the spec.
function RegisteredComponent({ element, children, emit }: ComponentRenderProps) {
  const manifest = useManifest()
  useSyncExternalStore(registry.components.subscribe, registry.components.version)
  const info = manifest.components?.find((c) => c.id === element.type)
  const Component = info && registry.components.get(info.id)
  const { disabled } = useContext(Host)
  if (!Component || !info) return <Unavailable />
  const props: SurfaceComponentProps = { props: element.props, children, disabled, onAction: emit }
  return <ComponentBoundary label={info.label}><Suspense fallback={<Widget title={info.label} loading />}><Component {...props} /></Suspense></ComponentBoundary>
}

function RegisteredWidget({ element }: ComponentRenderProps) {
  const widget = useManifest().widgets.find((w) => `widget/${w.id}` === element.type)
  return widget ? <WidgetSlot widget={widget} fallback={<Unavailable />} /> : <Unavailable />
}

function Unavailable() {
  return <WidgetMessage icon="box" title={t('This component is no longer available.')} description={t('Ask {brand} for a fresh view.')} />
}

function SurfaceTable({ columns, rows }: { columns: string[]; rows: (string | number | boolean | null)[][] }) {
  const items = rows.map((values, id) => ({ id: String(id), values }))
  return <DataTable<(typeof items)[number]> label={t('Results')} items={items} rowKey={(row) => row.id} columns={columns.map((label, i) => ({
    id: String(i), label, width: 'minmax(120px,1fr)', render: (row) => row.values[i] === null ? '—' : String(row.values[i]),
  }))} state={!rows.length && <p className="py-3 text-center text-xs text-muted">{t('No results')}</p>} />
}
