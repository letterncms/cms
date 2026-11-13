import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { UpdateRunner } from './UpdateRunner'

// Plugins is a view (PackagesViews); the store and updates are its catalog components.
registry.components.set('packages/store', lazy(() => import('./Store').then((m) => ({ default: m.Store }))))
registry.components.set('packages/updates', lazy(() => import('./Updates').then((m) => ({ default: m.UpdatesPanel }))))
// Store listings have their own page under Plugins or Sites.
const storeDetail = lazy(() => import('./StoreDetail'))
const loadStore = () => prefetchAbility('packages/catalog')
registry.routes.set('/plugins/store/:vendor/:name', { path: '/plugins/store/:vendor/:name', component: storeDetail, load: loadStore })
registry.routes.set('/sites/store', { path: '/sites/store', component: lazy(() => import('./Store').then((m) => ({ default: m.SiteStore }))), load: loadStore })
registry.routes.set('/sites/store/:vendor/:name', { path: '/sites/store/:vendor/:name', component: storeDetail, load: loadStore })
registry.widgets.set('packages-system', lazy(() => import('./WidgetSystem')))
registry.panels.set('packages-updates', { slot: 'shell.banner', component: UpdateRunner })
