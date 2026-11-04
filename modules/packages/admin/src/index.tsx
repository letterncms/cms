import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { UpdateRunner } from './UpdateRunner'

registry.routes.set('/plugins', { path: '/plugins', component: lazy(() => import('./Plugins')), load: () => prefetchAbility('packages/list', { type: 'all' }) })
registry.widgets.set('packages-system', lazy(() => import('./WidgetSystem')))
registry.panels.set('packages-updates', { id: 'packages-updates', slot: 'shell.banner', component: UpdateRunner })
