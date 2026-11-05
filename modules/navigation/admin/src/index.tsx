import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { LabelField } from './fields'

registry.fields.set('navigation-label', LabelField)
registry.widgets.set('navigation-menus', lazy(() => import('./WidgetMenus')))
// The places are views (NavigationModule::places); the menu's tree is drawn here.
registry.components.set('navigation/menu', lazy(() => import('./MenuEditor')))
