import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { UpdateRunner } from './UpdateRunner'

// Plugins is a view (PackagesViews); the store and updates are its catalog components.
registry.components.set('packages/store', lazy(() => import('./Store').then((m) => ({ default: m.Store }))))
registry.components.set('packages/updates', lazy(() => import('./Updates').then((m) => ({ default: m.UpdatesPanel }))))
registry.widgets.set('packages-system', lazy(() => import('./WidgetSystem')))
registry.panels.set('packages-updates', { slot: 'shell.banner', component: UpdateRunner })
