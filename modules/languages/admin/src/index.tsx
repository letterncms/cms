import './styles.css'
import { registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { LanguageMenu } from './LanguageMenu'

registry.widgets.set('languages-coverage', lazy(() => import('./WidgetCoverage')))
registry.panels.set('languages-menu', { slot: 'entry.toolbar', component: LanguageMenu, order: 5 })
// The Languages page is a view (LanguagesModule::view): adding a language is its one piece of its own.
registry.components.set('languages/add-language', lazy(() => import('./AddLanguage')))
