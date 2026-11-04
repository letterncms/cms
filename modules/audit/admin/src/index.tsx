import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

// The Audit Log itself is a view (AuditModule::view), drawn by the admin.
registry.widgets.set('audit-activity', lazy(() => import('./WidgetActivity')))
