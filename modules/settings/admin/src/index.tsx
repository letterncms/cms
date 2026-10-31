import './styles.css'
import { getManifest, prefetchAbility, registry, type RouteDef } from '@letterncms/sdk'
import { lazy } from 'react'

const load: NonNullable<RouteDef['load']> = async (params) => {
  const namespace = params.namespace
  if (!getManifest().settings.some((s) => s.namespace === namespace)) return
  await prefetchAbility('settings/get', { namespace })
}

// Each namespace is a page of the settings sidebar; /settings opens the first.
registry.routes.set('/settings', { path: '/settings', component: lazy(() => import('./Settings')) })
registry.routes.set('/settings/:namespace', { path: '/settings/:namespace', component: lazy(() => import('./Settings')), load })
registry.fields.set('sidebar-default', lazy(() => import('./SidebarDefault').then((m) => ({ default: m.SidebarDefault }))) as any)
registry.widgets.set('settings-setup', lazy(() => import('./WidgetSetup')))
