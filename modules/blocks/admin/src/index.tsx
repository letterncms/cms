import './styles.css'
import { registry, t } from '@letterncms/sdk'
import { ColorField } from './builder/color'
import { lazy } from 'react'
import { BlocksField } from './BlocksField'
import { registerFields } from './builder/fields'
import { registerBuilderIcons } from './builder/icons'
import { IconField } from './builder/content/IconField'

registerBuilderIcons()
registry.fields.set('blocks', BlocksField)
// Color fields in content pick from the theme's colors, like the builder's.
registry.fields.set('color', ColorField)
registerFields()
registry.fields.set('blocks-icon', IconField)

// Every explicit blocks body mounts the same workspace.
registry.panels.set('blocks-editor', {
  slot: 'entry.editor',
  label: t('Block Editor'),
  icon: 'layout',
  component: lazy(() => import('./BlocksWorkspace').then((m) => ({ default: m.BlocksWorkspace }))),
  when: (props) => props.bodyField.type === 'blocks',
})
registry.widgets.set('blocks-design', lazy(() => import('./WidgetDesign')))

// What other modules build on through `@letterncms/blocks` in the import map (a form builder, say),
// and the inspector's browser check mounts.
export { EditorStore, useEditor } from './core/store'
export { Inspector } from './builder/Inspector'
export { EditorProvider, useCatalog, useDesign, useEditorContext } from './core/context'
export { WriteEditor, blockViews } from './write/WriteEditor'
export type { BlockNode } from './core/types'
