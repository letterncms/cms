import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'

const loadUsers = () => Promise.all([
  prefetchAbility('users/list', { search: undefined, perPage: 100, page: 1 }),
  prefetchAbility('roles/list'),
  prefetchAbility('users/fields'),
])

registry.routes.set('/users', { path: '/users', component: lazy(() => import('./Users')), load: loadUsers })
registry.routes.set('/users/:id', { path: '/users/:id', component: lazy(() => import('./Users')), load: loadUsers })
registry.routes.set('/users/fields', { path: '/users/fields', component: lazy(() => import('./Blueprint')), load: () => prefetchAbility('users/fields') })
registry.fields.set('roles', lazy(() => import('./RolesField').then((m) => ({ default: m.RolesField }))) as any)
registry.widgets.set('users-team', lazy(() => import('./WidgetTeam')))
