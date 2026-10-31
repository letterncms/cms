import './styles.css'
import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { TitleField, UriField } from './TitleField'

// Entries of every collection; one sidebar item per collection comes from the server.
registry.routes.set('/content/:collection', { path: '/content/:collection', component: lazy(() => import('./EntriesList')), load: (params, location) => import('./EntriesList').then((m) => m.loadEntriesList(params.collection, location.query)) })
registry.routes.set('/content/:collection/:id', {
  path: '/content/:collection/:id', component: lazy(() => import('./EntryEditor')),
  load: ({ collection, id }) => Promise.all([
    prefetchAbility('collections/get', { handle: collection }),
    ...(id === 'new' ? [] : [prefetchAbility('entries/get', { id })]),
  ]),
})
registry.fields.set('title', TitleField as any)
registry.fields.set('uri', UriField as any)
registry.widgets.set('recent', lazy(() => import('./WidgetRecent')))
