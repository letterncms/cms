import './styles.css'
import { can, registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { LicenseBanner } from './Banner'

// The licences of paid plugins are a tab of Plugins, beside the plugins they cover.
registry.panels.set('license', { id: 'licenses', slot: 'plugins.tabs', label: t('Licenses'), component: lazy(() => import('./License')), order: 40, when: () => can('license.view') })
registry.panels.set('license-banner', { id: 'license-banner', slot: 'shell.banner', component: LicenseBanner })
