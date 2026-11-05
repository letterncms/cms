import './styles.css'
import { events, prefetchAbility, registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { DeclarationsField, FileField, FontStackField, ShadowField, SizeField } from './fields'
import { PreviewDialog } from './PreviewDialog'
import { TemplateField } from './TemplateField'

registry.fields.set('site-template', TemplateField)
registry.fields.set('site-size', SizeField)
registry.fields.set('site-font-stack', FontStackField)
registry.fields.set('site-declarations', DeclarationsField)
registry.fields.set('site-file', FileField)
registry.fields.set('site-shadow', ShadowField)
registry.widgets.set('site-status', lazy(() => import('./WidgetSite')))
registry.panels.set('site-preview', { slot: 'entry.toolbar', component: PreviewDialog, order: 10 })
registry.entryActions.set('site-preview', {
  label: t('Preview'), icon: 'eye', order: 10,
  // A live page with nothing unpublished is seen on the site itself (the editor's View on Site).
  when: ({ collection, entry }) => !!(collection.route || collection.body)
    && !(entry?.uri && entry.status === 'published' && entry.displayStatus !== 'scheduled' && !entry.hasDraft),
  perform: () => events.emit('entry.preview'),
})
registry.routes.set('/design', { path: '/design', component: lazy(() => import('./DesignTokens')), load: () => prefetchAbility('design/get') })
