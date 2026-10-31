import './styles.css'
import { prefetchAbility, getManifest, registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/globals', { path: '/globals', component: lazy(() => import('./Globals').then((m) => ({ default: m.GlobalsList }))) })
registry.routes.set('/globals/:handle', { path: '/globals/:handle', component: lazy(() => import('./Globals').then((m) => ({ default: m.GlobalEditor }))), load: ({ handle }) => prefetchAbility('globals/get', { handle, locale: getManifest().site.defaultLocale }) })
registry.routes.set('/globals/:handle/fields', { path: '/globals/:handle/fields', component: lazy(() => import('./Blueprint')), load: ({ handle }) => prefetchAbility('globals/get', { handle }) })
registry.widgets.set('globals-sets', lazy(() => import('./WidgetGlobals')))
