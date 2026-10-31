import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/audit', { path: '/audit', component: lazy(() => import('./Audit')), load: (_, { query }) => prefetchAbility('audit/list', { page: Number(query.page ?? 1), perPage: 50 }) })
registry.widgets.set('audit-activity', lazy(() => import('./WidgetActivity')))
