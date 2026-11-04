import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'

registry.routes.set('/', { path: '/', component: lazy(() => import('./Dashboard')) })
registry.widgets.set('shortcuts', lazy(() => import('./Shortcuts')))
