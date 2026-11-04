import './styles.css'
import { getManifest, prefetchAbility, registry, run, t, type ComposerOption, type EntrySummary } from '@letterncms/sdk'
import { lazy } from 'react'
import { TitleField, UriField } from './TitleField'

// Entries of every collection; one sidebar item per collection comes from the server.
registry.routes.set('/content/:collection', { path: '/content/:collection', component: lazy(() => import('./EntriesList')), load: (params, location) => import('./EntriesList').then((m) => m.loadEntriesList(params.collection, location.query)) })
registry.routes.set('/content/:collection/:id', {
  path: '/content/:collection/:id', component: lazy(() => import('./EntryEditor')),
  load: ({ collection, id }) => Promise.all([
    prefetchAbility('collections/get', { handle: collection }),
    ...(id === 'new' ? [] : [prefetchAbility('entries/get', { id }).catch(() => undefined)]),
  ]),
})
registry.fields.set('title', TitleField as any)
registry.fields.set('uri', UriField as any)
registry.widgets.set('recent', lazy(() => import('./WidgetRecent')))

// @ in a chat: any entry, by its title or what it says. Before anything is typed, the latest ones.
const entryOption = (entry: EntrySummary): ComposerOption => {
  const collection = getManifest().collections.find((c) => c.handle === entry.collection)
  return {
    id: `entry:${entry.id}`, kind: 'entry', label: entry.title || t('Untitled'), detail: collection?.singular, icon: collection?.icon ?? 'file',
    to: `/content/${entry.collection}/${entry.id}`, read: () => run('entries/get', { id: entry.id }),
  }
}
registry.composer.set('entries', {
  id: 'entries', trigger: '@', label: t('Content'), order: 10,
  search: async (query) => (query
    ? await run<EntrySummary[]>('content/search', { query, limit: 6 })
    : await run<EntrySummary[]>('content/recent', { limit: 6 })
  ).map(entryOption),
})
