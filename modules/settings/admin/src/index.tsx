import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

// /settings opens the first page; each page, /settings/<namespace>, is a view (SettingsModule::view).
registry.routes.set('/settings', { path: '/settings', component: lazy(() => import('./Settings')) })
// The form a screen draws as its Settings tab (see ScreenTabs), for a plugin that keeps its settings with its screen.
registry.panels.set('settings-form', { slot: 'screen.settings', component: lazy(() => import('./Settings').then((m) => ({ default: m.SettingsForm }))) })
