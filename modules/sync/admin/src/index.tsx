import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.icons.set('sync', '<path fill="currentColor" d="M117.66 170.34a8 8 0 0 1 0 11.32l-32 32a8 8 0 0 1-11.32 0l-32-32a8 8 0 0 1 11.32-11.32L72 188.69V48a8 8 0 0 1 16 0v140.69l18.34-18.35a8 8 0 0 1 11.32 0m96-96l-32-32a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 11.32 11.32L168 67.31V208a8 8 0 0 0 16 0V67.31l18.34 18.35a8 8 0 0 0 11.32-11.32"/>')

registry.widgets.set('sync-sites', lazy(() => import('./WidgetSites')))
// The Sync screen is a view (SyncViews.php); these are the pieces of it that run a sync.
registry.components.set('sync/progress', lazy(() => import('./SyncProgress')))
registry.components.set('sync/key', lazy(() => import('./SyncKey')))
registry.components.set('sync/sync', lazy(() => import('./SyncDialog')))
registry.components.set('sync/undo', lazy(() => import('./SyncUndo')))
