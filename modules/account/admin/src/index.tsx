import './styles.css'
import { can, prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/account', { path: '/account', private: true, component: lazy(() => import('./Account')), load: () => Promise.all([prefetchAbility('users/fields'), can('tokens.manage') && prefetchAbility('tokens/list')]) })

// The screen is composed from the `account.sections` slot; plugins add theirs the same way, and to
// API & Agents through `account.api` (letterncms/mcp).
const section = (name: 'Profile' | 'Security' | 'Api') => lazy(() => import('./Account').then((m) => ({ default: m[name] })))
const sections = { profile: ['Profile', 10], security: ['Security', 30], api: ['Api', 60] } as const
for (const [id, [name, order]] of Object.entries(sections)) {
  registry.panels.set(`account-${id}`, { id: `account-${id}`, slot: 'account.sections', component: section(name), order })
}
registry.widgets.set('account-security', lazy(() => import('./WidgetSecurity')))
