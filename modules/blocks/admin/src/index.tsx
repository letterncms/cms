import './styles.css'
import { registry, t } from '@letterncms/sdk'
import { lazy } from 'react'
import { BlocksField } from './BlocksField'
import { registerFields } from './builder/fields'
import { registerBuilderIcons } from './builder/icons'
import { IconField } from './builder/content/IconField'
import { GalleryCard, MediaCard } from './write/Blocks'
import { blockViews } from './write/WriteEditor'

registerBuilderIcons()
registry.fields.set('blocks', BlocksField)
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

// Write mode shows the media blocks as a plugin's blocks are shown: through `blockViews`.
blockViews.set('audio', MediaCard)
blockViews.set('file', MediaCard)
blockViews.set('gallery', GalleryCard)

// What other modules build on through `@letterncms/blocks` in the import map (a form builder, say),
// and the inspector's browser check mounts.
export { EditorStore, useEditor } from './core/store'
export { Inspector } from './builder/Inspector'
export { EditorProvider, useCatalog, useEditorContext } from './core/context'
export { WriteEditor, blockViews } from './write/WriteEditor'
export type { BlockNode } from './core/types'

// The site's styling and the controls that edit classes, for the design: the same panels edit a block's
// classes, a site class's `@apply` list and an element's style. `styleApi` makes their target from any class list.
export { StylingProvider, loadCompiler, loadEngine, loadTailwindTheme, screenFor, tokensOf, useEngine, useStyling, useThemeTokens } from './core/styling'
export type { Breakpoint, Device, Styling, StylingSource, Tokens } from './core/styling'
export { GRADIENT_MARKERS, SPACING_STEPS, colorGroups, dataStates, gradientOf, gradientUtilities, layerUsed, lightDark, onLayer, partUtility, searchClasses, spacingChoices, splitSiteClasses, styleApi, usedVariants } from './builder/styleApi'
export type { StyleApi, ValueStatus } from './builder/styleApi'
export { STYLE_GROUPS, StylePanels } from './builder/design/DesignPanel'
export type { StylePanelsProps } from './builder/design/DesignPanel'
export { StateMenu, StyleBar, askStyleName, stateLabel } from './builder/design/StyleBar'
export type { StateMenuProps } from './builder/design/StyleBar'
export { ClassChips } from './builder/design/Classes'
export { SCHEME, SchemeTile, schemesOf } from './builder/palette'
export type { Scheme } from './builder/palette'
export { Specimen, styleLabel, styleSample, useSpecimenSheet } from './builder/specimen'
export type { SampleNode } from './builder/specimen'
export { SpacingChips, TokenButton, TokenChip, TokenList } from './builder/fields/tokens'
export { ColorField, ColorPicker, withAlpha } from './builder/color'
export { formatShadows, parseShadows } from './builder/fields/shadows'
export type { Shadow } from './builder/fields/shadows'
export { PanelFields, Section as InspectorSection, Swatch } from './builder/controls'
export { ClassStyle, Engine, arbitrary, everyScreen, layerOf, parseClass, screenVariant, splitClasses, themeReference, withVariants } from '../../tailwind/engine'
export type { Declaration, ParsedClass, Screen, ThemeToken, TokenGroup } from '../../tailwind/engine'
export { ARTICLE, ELEMENTS, FIELDS, Stylesheet, balanced, shownVariable, themeDefaults } from '../../tailwind/stylesheet'
export type { Layer as StyleLayer, StyleRule, Variable } from '../../tailwind/stylesheet'
