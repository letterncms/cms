import './styles.css'
import { getManifest, prefetchAbility, registry, type RouteDef } from '@letterncms/sdk'
import { lazy } from 'react'

const load: NonNullable<RouteDef['load']> = async (params) => {
  const namespace = params.namespace
  const current = getManifest().settings.find((s) => s.namespace === namespace)
  if (!current || current.home) return
  await prefetchAbility('settings/get', { namespace })
}

// Each namespace is a page of the settings sidebar; /settings opens the first.
registry.routes.set('/settings', { path: '/settings', component: lazy(() => import('./Settings')) })
registry.routes.set('/settings/:namespace', { path: '/settings/:namespace', component: lazy(() => import('./Settings')), load })
// The form a screen draws as its Settings tab (see ScreenTabs), for a plugin that keeps its settings with its screen.
registry.panels.set('settings-form', { id: 'settings-form', slot: 'screen.settings', component: lazy(() => import('./Settings').then((m) => ({ default: m.SettingsForm }))) })
registry.widgets.set('settings-setup', lazy(() => import('./WidgetSetup')))
