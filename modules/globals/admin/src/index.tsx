import './styles.css'
import { prefetchAbility, getManifest, registry, run, t } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/globals', { path: '/globals', component: lazy(() => import('./Globals').then((m) => ({ default: m.GlobalsList }))) })
registry.routes.set('/globals/:handle', { path: '/globals/:handle', component: lazy(() => import('./Globals').then((m) => ({ default: m.GlobalEditor }))), load: ({ handle }) => prefetchAbility('globals/get', { handle, locale: getManifest().site.defaultLocale }) })
registry.routes.set('/globals/:handle/fields', { path: '/globals/:handle/fields', component: lazy(() => import('./Blueprint')), load: ({ handle }) => prefetchAbility('globals/get', { handle }) })
registry.widgets.set('globals-sets', lazy(() => import('./WidgetGlobals')))

// @ in a chat: a global set, with its values.
registry.composer.set('globals', {
  id: 'globals', trigger: '@', label: t('Globals'), order: 30,
  search: (query) => getManifest().globals.filter((g) => g.title.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map((g) => ({
    id: `global:${g.handle}`, kind: 'global', label: g.title, icon: g.icon, to: `/globals/${g.handle}`,
    read: () => run('globals/get', { handle: g.handle }),
  })),
})
