import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'
import DisplayFields from './DisplayFields'
import Archives from './Archives'

// Collections are views (CollectionsViews); a collection's blueprint editor and the new-collection dialog are their catalog components.
registry.components.set('collections/new', lazy(() => import('./NewCollection')))
registry.components.set('collections/blueprint', lazy(() => import('./Blueprint')))
registry.widgets.set('collections-overview', lazy(() => import('./WidgetOverview')))

registry.fields.set('collection-display-fields', DisplayFields)
// A collection's term archives, in its Publishing settings (CollectionRepository::settingsFields names it).
registry.fields.set('collection-archives', Archives)
