import './styles.css'
import { registry } from '@letterncms/sdk'
import { LicenseBanner } from './Banner'

// The licences of paid plugins are a tab of Plugins (LicenseViews), beside the plugins they cover.
registry.panels.set('license-banner', { id: 'license-banner', slot: 'shell.banner', component: LicenseBanner })
