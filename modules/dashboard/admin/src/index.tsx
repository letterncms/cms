import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { DefaultField } from './DefaultField'

registry.routes.set('/', { path: '/', component: lazy(() => import('./Dashboard')) })
registry.widgets.set('shortcuts', lazy(() => import('./Shortcuts')))
registry.fields.set('dashboard-default', DefaultField)
