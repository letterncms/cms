import { prefetchAbility, registry } from '@letterncms/sdk'
import { lazy } from 'react'
import { LicenseBanner } from './Banner'

registry.routes.set('/license', { path: '/license', component: lazy(() => import('./License')), load: () => prefetchAbility('license/status') })
registry.panels.set('license-banner', { id: 'license-banner', slot: 'shell.banner', component: LicenseBanner })
