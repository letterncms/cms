import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { UpdateRunner } from './UpdateRunner'

// Plugins is a view (PackagesViews); the store and updates are its catalog components.
registry.components.set('packages/store', lazy(() => import('./Store').then((m) => ({ default: m.Store }))))
registry.components.set('packages/updates', lazy(() => import('./Updates').then((m) => ({ default: m.UpdatesPanel }))))
// A plugin's own page in the store, behind its list: /plugins/store/<vendor>/<name>.
registry.routes.set('/plugins/store/:vendor/:name', { path: '/plugins/store/:vendor/:name', component: lazy(() => import('./StoreDetail')), load: (_, { query }) => prefetchAbility('packages/catalog', { store: query.store || 'default' }) })
registry.widgets.set('packages-system', lazy(() => import('./WidgetSystem')))
registry.panels.set('packages-updates', { slot: 'shell.banner', component: UpdateRunner })
