import './styles.css'
import { registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { CommentsPanel } from './CommentsPanel'
import { ComposerField } from './fields'
import { PresenceBar } from './PresenceBar'

registry.fields.set('collaboration-composer', ComposerField as any)
registry.panels.set('collaboration-presence', { id: 'collaboration-presence', slot: 'entry.toolbar', component: PresenceBar, order: 1 })
registry.panels.set('collaboration-comments', { id: 'collaboration-comments', slot: 'entry.sidebar', label: t('Comments'), icon: 'comment', component: CommentsPanel, order: 30, when: (p: any) => !!p.entry })
registry.widgets.set('comments-inbox', lazy(() => import('./WidgetComments')))
