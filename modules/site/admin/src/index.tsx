import './styles.css'
import { events, prefetchAbility, registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { AnimationField, FontStackField, ShadowField, SizeField } from './fields'
import { PreviewDialog } from './PreviewDialog'
import { TemplateField } from './TemplateField'

registry.fields.set('site-template', TemplateField)
registry.fields.set('site-font-stack', FontStackField)
registry.fields.set('site-shadow', ShadowField)
registry.fields.set('site-size', SizeField)
registry.fields.set('site-animation', AnimationField)
registry.widgets.set('site-status', lazy(() => import('./WidgetSite')))
registry.panels.set('site-preview', { slot: 'entry.toolbar', component: PreviewDialog, order: 10 })
registry.entryActions.set('site-preview', {
  label: t('Preview'), icon: 'eye', order: 10,
  // A live page with nothing unpublished is seen on the site itself (the editor's View on Site).
  when: ({ collection, entry }) => !!(collection.route || collection.resolvedFields.some((field) => field.body))
    && !(entry?.uri && entry.status === 'published' && entry.displayStatus !== 'scheduled' && !entry.hasDraft),
  perform: () => events.emit('entry.preview'),
})
registry.routes.set('/design', { path: '/design', component: lazy(() => import('./Design')) })
registry.routes.set('/styling', { path: '/styling', component: lazy(() => import('./Styling')), load: () => Promise.all([prefetchAbility('styling/get'), prefetchAbility('styling/source')]) })
registry.routes.set('/code', { path: '/code', component: lazy(() => import('./Code')), load: () => prefetchAbility('styling/get') })
registry.routes.set('/sites', { path: '/sites', component: lazy(() => import('./Sites')), load: () => prefetchAbility('sites/list') })

