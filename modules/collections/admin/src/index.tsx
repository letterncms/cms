import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import DisplayFields from './DisplayFields'

registry.routes.set('/collections', { path: '/collections', component: lazy(() => import('./Collections')), load: () => prefetchAbility('collections/list') })
registry.routes.set('/collections/:handle', { path: '/collections/:handle', component: lazy(() => import('./Blueprint')), load: ({ handle }) => handle === 'new' ? prefetchAbility('collections/list') : prefetchAbility('collections/get', { handle }) })
registry.widgets.set('collections-overview', lazy(() => import('./WidgetOverview')))

registry.fields.set('collection-display-fields', DisplayFields)
