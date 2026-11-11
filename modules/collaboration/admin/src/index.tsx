import './styles.css'
import { registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { CommentsPanel } from './CommentsPanel'
import { ComposerField } from './fields'
import { HoldNotice, PresenceBar } from './PresenceBar'

registry.fields.set('collaboration-composer', ComposerField)
registry.panels.set('collaboration-presence', { slot: 'entry.toolbar', component: PresenceBar, order: 1 })
registry.panels.set('collaboration-hold', { slot: 'entry.notice', component: HoldNotice, order: 1 })
registry.panels.set('collaboration-comments', { slot: 'entry.sidebar', label: t('Comments'), icon: 'comment', component: CommentsPanel, order: 30, when: (p) => !!p.entry })
registry.widgets.set('comments-inbox', lazy(() => import('./WidgetComments')))
