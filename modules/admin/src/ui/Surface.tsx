import { t, useLocation, useManifest, type SurfaceAction, type SurfaceDocument, type ViewNode } from '@letterncms/sdk'
import { useId, useMemo } from 'react'
import { ViewContext } from './view/context'
import { ViewNodeView } from './view/render'
import { WidgetMessage } from './Widget'

/**
 * An assistant reply drawn from the same catalog and renderer as the admin's views. Its
 * buttons send only the element and event they belong to; the server runs what the
 * reply stored for them, through the assistant's approvals. Nothing the browser holds is trusted.
 */
export interface SurfaceProps {
  document: SurfaceDocument
  disabled?: boolean
  onAction?: (action: SurfaceAction) => void
}

export function Surface({ document, disabled = false, onAction }: SurfaceProps) {
  const manifest = useManifest()
  const { query } = useLocation()
  const titleId = useId()
  const root = useMemo(() => document.version === 1 ? tree(document.spec) : null, [document])
  const host = useMemo(() => ({
    scope: { query, user: manifest.user },
    refresh: () => {},
    act: async () => {},
    disabled: disabled || !onAction,
    emit: (node: string, name: string) => { if (!disabled && onAction) onAction({ node, name }) },
  }), [query, manifest.user, disabled, onAction])

  if (!root) return <Unavailable />
  return (
    <section aria-labelledby={titleId} className="@container min-w-0 rounded-lg border border-border bg-surface p-4">
      <h2 id={titleId} className="m-0 mb-4 text-sm font-semibold text-ink">{document.title}</h2>
      <ViewContext.Provider value={host}>
        <ViewNodeView node={root} path={root.key ?? 'root'} />
      </ViewContext.Provider>
    </section>
  )
}

/** A reply's flat elements as the tree the renderer draws, each keeping its id. */
function tree(spec: SurfaceDocument['spec']): ViewNode | null {
  const seen = new Set<string>()
  const build = (id: string): ViewNode | null => {
    const element = spec.elements[id]
    if (!element || seen.has(id)) return null
    seen.add(id)
    return { key: id, type: element.type, props: element.props ?? {}, children: (element.children ?? []).map(build).filter((n): n is ViewNode => n !== null) }
  }
  return build(spec.root)
}

function Unavailable() {
  return <WidgetMessage icon="box" title={t('This component is no longer available.')} description={t('Ask {brand} for a fresh view.')} />
}
