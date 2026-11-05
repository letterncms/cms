import { getManifest, prefetchAbility, setQuery, t, useAbility, useLocation, useManifest, type RouteDef, type ViewAction, type ViewDocument, type ViewNode } from '@letterncms/sdk'
import { useCallback, useEffect, useMemo, type ComponentType } from 'react'
import { Button } from '../Button'
import { EmptyState } from '../EmptyState'
import { Page } from '../Page'
import { Spinner } from '../Spinner'
import { useActions, type ActionAsker, type ActionRunner } from './actions'
import { ViewContext } from './context'
import { recordsLoad, type RecordsProps } from './Records'
import { ViewNodeView } from './render'
import { fill, input, type Scope } from './scope'

/**
 * Draws a view's tree for the person looking: its lists and forms load through their abilities, its buttons run theirs.
 * `embedded`: drawn inside something else (a thread's answer), not as the place on view: the address is the page's.
 * `run`: how its buttons run their abilities, when not directly (a thread runs them as turns of its own);
 * `ask`: how a button's `form` asks, in place of a dialog.
 */
export function View({ root, params = {}, embedded = false, run, ask }: { root: ViewNode; params?: Record<string, string>; embedded?: boolean; run?: ActionRunner; ask?: ActionAsker }) {
  const { query: address, path } = useLocation()
  const query = embedded ? NONE : address
  const manifest = useManifest()
  const scope: Scope = useMemo(() => ({ params, query, user: manifest.user, origin: window.location.origin }), [params, query, manifest.user])
  const refresh = useCallback(() => {}, [])
  const { act, layer } = useActions(scope, refresh, run, ask)
  // `?do=<name>` opens one of the place's named actions, once: a link to "New Form" from elsewhere.
  const wanted = embedded ? undefined : query.do
  useEffect(() => {
    if (!wanted) return
    const action = named(root, wanted)
    setQuery({ do: null })
    if (action) void act(action, {}).catch(() => {})
  }, [wanted, root, act])
  return (
    <ViewContext.Provider value={{ scope, refresh, act, disabled: false, at: embedded ? path : undefined }}>
      <ViewNodeView node={root} path="root" />
      {layer}
    </ViewContext.Provider>
  )
}

const NONE: Record<string, string> = {}

/** The action of a view with this `name`: in the page's bar, a tab's, a section's, or a row of buttons. */
function named(node: ViewNode, name: string): ViewAction | undefined {
  for (const key of ['actions', 'items']) {
    const found = (Array.isArray(node.props?.[key]) ? node.props[key] as ViewAction[] : []).find((a) => a && a.name === name)
    if (found) return found
  }
  for (const child of node.children ?? []) {
    const found = named(child, name)
    if (found) return found
  }
  return undefined
}

/** A place of the admin drawn from its view: loaded by id with the route's params. */
function ViewScreen({ id, params }: { id: string; params: Record<string, string> }) {
  const view = useAbility<ViewDocument>('views/get', { id, params }, { refetchOnWindowFocus: false })
  if (view.isError) {
    return (
      <Page crumbs={[{ label: t('Not Found') }]}>
        <EmptyState icon="warning" title={view.error.type === 'forbidden' ? t('You are not allowed to do this.') : t('Something went wrong')} description={view.error.message} action={<Button onClick={() => void view.refetch()}>{t('Try Again')}</Button>} />
      </Page>
    )
  }
  if (!view.data) return <div className="grid h-full place-items-center text-faint"><Spinner /></div>
  return <View key={`${id}:${JSON.stringify(params)}`} root={view.data.root} params={params} />
}

const screens = new Map<string, ComponentType<{ params: Record<string, string> }>>()

/** The route for a view: drawn by `ViewScreen`, its view loaded before it shows. */
export function viewRoute(id: string, path: string, options: { private?: boolean } = {}): RouteDef {
  let screen = screens.get(id)
  if (!screen) {
    screen = ({ params }) => <ViewScreen id={id} params={params} />
    screen.displayName = `View(${id})`
    screens.set(id, screen)
  }
  return {
    path, component: screen, private: options.private,
    // The place appears whole: its view, then what its tab on view loads, before it shows.
    load: async (params, location) => {
      const view = await prefetchAbility<ViewDocument>('views/get', { id, params })
      const scope = { params, query: location.query, user: getManifest().user, origin: window.location.origin }
      await Promise.all(loads(view.root, location.query.tab).map(([ability, input]) => prefetchAbility(ability, input).catch(() => undefined)))
      function loads(node: ViewNode, tab: string | undefined): [string, Record<string, unknown>][] {
        const p = node.props ?? {}
        const own: [string, Record<string, unknown>][] = []
        if (node.type === 'ui/settings') own.push(['settings/get', { namespace: String(fill(p.namespace, scope)) }])
        if (node.type === 'ui/form' && p.source) own.push([p.source.ability, input(p.source.input, scope)])
        const records = node.type === 'ui/records' ? recordsLoad(p as RecordsProps, scope, location.query) : null
        if (records) own.push(records)
        if (node.type === 'ui/page' && p.count) own.push([p.count.source.ability, input(p.count.source.input, scope)])
        // Of a page's tabs, only the one that opens.
        const children = node.type === 'ui/tabs' ? [(node.children ?? []).find((c) => c.props.id === tab) ?? node.children?.[0]].filter((c): c is ViewNode => !!c) : node.children ?? []
        return [...own, ...children.flatMap((c) => loads(c, tab))]
      }
    },
  }
}
