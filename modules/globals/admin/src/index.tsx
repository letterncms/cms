import './styles.css'
import { getManifest, registry, run, t } from '@letterncms/sdk'
import { lazy } from 'react'

// Globals are views (GlobalsViews); a global's fields are the blueprint editor, its catalog component.
registry.components.set('globals/fields', lazy(() => import('./Blueprint')))
registry.widgets.set('globals', lazy(() => import('./WidgetGlobals')))

// @ in a chat: a global, with its values.
registry.composer.set('globals', {
  trigger: '@', label: t('Globals'), order: 30,
  search: (query) => getManifest().globals.filter((g) => g.title.toLowerCase().includes(query.toLowerCase())).slice(0, 4).map((g) => ({
    id: `global:${g.handle}`, kind: 'global', label: g.title, icon: g.icon, to: `/globals/${g.handle}`,
    read: () => run('globals/get', { handle: g.handle }),
  })),
})
