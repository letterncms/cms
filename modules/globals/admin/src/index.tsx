import './styles.css'
import { getManifest, registry, run, t } from '@letterncms/sdk'
import { lazy } from 'react'

// Globals are views (GlobalsViews); a set's fields are the blueprint editor, its catalog component.
registry.components.set('globals/fields', lazy(() => import('./Blueprint')))
registry.widgets.set('globals-sets', lazy(() => import('./WidgetGlobals')))

// @ in a chat: a global set, with its values.
registry.composer.set('globals', {
  id: 'globals', trigger: '@', label: t('Globals'), order: 30,
  search: (query) => getManifest().globals.filter((g) => g.title.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map((g) => ({
    id: `global:${g.handle}`, kind: 'global', label: g.title, icon: g.icon, to: `/globals/${g.handle}`,
    read: () => run('globals/get', { handle: g.handle }),
  })),
})
