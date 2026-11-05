import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.widgets.set('sync-sites', lazy(() => import('./WidgetSites')))
// The Sync screen is a view (SyncViews.php); these are the pieces of it that run a sync.
registry.components.set('sync/progress', lazy(() => import('./SyncProgress')))
registry.components.set('sync/key', lazy(() => import('./SyncKey')))
registry.components.set('sync/sync', lazy(() => import('./SyncDialog')))
registry.components.set('sync/undo', lazy(() => import('./SyncUndo')))
