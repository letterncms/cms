import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'

const loadUsers = () => Promise.all([
  prefetchAbility('users/list', { search: undefined, perPage: 100, page: 1 }),
  prefetchAbility('roles/list'),
  prefetchAbility('users/fields'),
])

registry.routes.set('/users', { path: '/users', private: true, component: lazy(() => import('./Users')), load: loadUsers })
registry.routes.set('/users/:id', { path: '/users/:id', private: true, component: lazy(() => import('./Users')), load: loadUsers })
// Visitor accounts are the Sign-Up tab of Users; their old settings page leads there, at a field when it named one.
registry.routes.set('/settings/accounts', { path: '/settings/accounts', component: lazy(() => import('./Blueprint').then((m) => ({ default: m.SignUpSettings }))) })
registry.routes.set('/users/fields', { path: '/users/fields', component: lazy(() => import('./Blueprint')), load: () => prefetchAbility('users/fields') })
registry.fields.set('roles', lazy(() => import('./RolesField').then((m) => ({ default: m.RolesField }))) as any)
registry.widgets.set('users-team', lazy(() => import('./WidgetTeam')))
