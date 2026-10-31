import { registry } from '@letterncms/sdk'
import { Suspense, useSyncExternalStore, type ReactNode } from 'react'
import { ComponentBoundary } from './ComponentBoundary'
import { Widget, WidgetContext, type WidgetMeta } from './Widget'

/** One rendering path for home, chat and any other host of registered widgets. */
export function WidgetSlot({ widget, fallback = null }: { widget: WidgetMeta; fallback?: ReactNode }) {
  useSyncExternalStore(registry.widgets.subscribe, registry.widgets.version)
  const Component = registry.widgets.get(widget.id)
  if (!Component) return fallback
  return (
    <WidgetContext.Provider value={widget}>
      <ComponentBoundary key={widget.id} label={widget.label}>
        <Suspense fallback={<Widget loading />}><Component id={widget.id} /></Suspense>
      </ComponentBoundary>
    </WidgetContext.Provider>
  )
}
