import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

// Users is a view (UsersViews); a person's dialog and the profile fields editor are its catalog components.
registry.components.set('users/person', lazy(() => import('./Person')))
registry.components.set('users/profile-fields', lazy(() => import('./ProfileFields')))
registry.fields.set('roles', lazy(() => import('./RolesField').then((m) => ({ default: m.RolesField }))) as any)
registry.widgets.set('users-team', lazy(() => import('./WidgetTeam')))
