import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

// Account is a view (AccountViews); these are the pieces of it the catalog doesn't draw.
const part = (name: 'Profile' | 'TwoFactor' | 'NewToken' | 'Connect') => lazy(() => import('./Account').then((m) => ({ default: m[name] })))
registry.components.set('account/profile', part('Profile'))
registry.components.set('account/two-factor', part('TwoFactor'))
registry.components.set('account/new-token', part('NewToken'))
registry.components.set('account/connect', part('Connect'))
registry.widgets.set('account-security', lazy(() => import('./WidgetSecurity')))
