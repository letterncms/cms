import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/account', { path: '/account', private: true, component: lazy(() => import('./Account')), load: () => Promise.all([prefetchAbility('users/fields'), prefetchAbility('tokens/list')]) })

// The screen is composed from the `account.sections` slot; plugins add theirs the same way (letterncms/mcp).
const section = (name: 'Profile' | 'Password' | 'TwoFactor' | 'Appearance' | 'Tokens') => lazy(() => import('./Account').then((m) => ({ default: m[name] })))
const sections = { profile: ['Profile', 10], password: ['Password', 20], 'two-factor': ['TwoFactor', 30], appearance: ['Appearance', 40], tokens: ['Tokens', 60] } as const
for (const [id, [name, order]] of Object.entries(sections)) {
  registry.panels.set(`account-${id}`, { id: `account-${id}`, slot: 'account.sections', component: section(name), order })
}
registry.routes.set('/account-pages', { path: '/account-pages', component: lazy(() => import('./AccountPages')), load: () => prefetchAbility('accounts/screens') })
registry.widgets.set('account-security', lazy(() => import('./WidgetSecurity')))
