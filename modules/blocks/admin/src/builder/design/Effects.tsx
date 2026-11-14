import { t } from '@letterncms/sdk'
import type { Engine } from '../../../../tailwind/engine'
import { useThemeTokens } from '../../core/styling'
import { parseFilters } from '../fields/filters'
import { inner, partUtility, type Scale } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { StyleSection } from './more'
import { StyleFields } from './StyleFields'

const BLEND = ['multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
const CURSORS = ['pointer', 'default', 'text', 'move', 'grab', 'grabbing', 'zoom-in', 'zoom-out', 'not-allowed', 'none', 'crosshair']

/** The functions of a filter, each a class of its own (blur-sm, brightness-50), and how each counts. */
const FILTERS: Record<string, Scale> = { blur: 'px', brightness: 'percent', contrast: 'percent', saturate: 'percent', grayscale: 'percent', 'hue-rotate': 'deg', invert: 'percent', sepia: 'percent' }

const spaces = (value: string) => value.trim().replace(/\s+/g, ' ')

/** A blur the theme names is that name's class: 8px is blur-sm. */
function blurUtility(engine: Engine, root: string, value: string): string | null {
  for (const [variable, entry] of engine.ds.theme.entries()) {
    if (variable.startsWith('--blur-') && entry.value === value) return engine.make(root, variable.slice(7))
  }
  return engine.make(root, value)
}

/** Filters (`prefix` '' for the element, 'backdrop-' for what is behind it) as one CSS value, and written back function by function. */
function filters(s: StyleApi, prefix: string) {
  const marker = (name: string) => `--tw-${prefix}${name}`
  const names = Object.keys(FILTERS)
  const value = names.flatMap((name) => {
    const part = inner(s.value(marker(name)))
    return part === undefined ? [] : [`${name}(${s.engine ? s.engine.resolve(part) : part})`]
  }).join(' ')
  const set = (next: string | null) => {
    const engine = s.engine
    if (!engine) return
    const before = new Map(parseFilters(value).map((part) => [part.name, part.value]))
    const after = new Map(parseFilters(next).map((part) => [part.name, part.value]))
    s.edit((draft) => {
      for (const name of names) {
        if (before.get(name) === after.get(name)) continue
        const to = after.get(name)
        const root = `${prefix}${name}`
        draft.swap(marker(name), to === undefined ? null : name === 'blur' ? blurUtility(engine, root, to) : partUtility(engine, root, to, FILTERS[name]))
      }
    }, `${prefix}filter`)
  }
  return { value: value || undefined, set, markers: names.map(marker) }
}

/** Opacity, shadows, filters (blur, backdrop blur…), clip path, blend mode, cursor and interaction. */
export function Effects({ s }: { s: StyleApi }) {
  const tokens = useThemeTokens()
  const filter = filters(s, '')
  const backdrop = filters(s, 'backdrop-')
  // A shadow of the theme reads as that shadow, by its name: shadow-md.
  const drawn = s.value('--tw-shadow')
  const shadow = drawn && (tokens.of('shadow').find((token) => spaces(token.value) === spaces(drawn))?.ref ?? drawn)
  // Tailwind counts opacity in percent; the control's slider in a fraction.
  const opacity = s.value('opacity')
  const any = ['opacity', '--tw-shadow', 'mixBlendMode', 'cursor', 'pointerEvents', 'clipPath'].some((k) => s.value(k)) || filter.value || backdrop.value

  return (
    <StyleSection s={s} group="effects" title={t('Effects')} empty={!any}>
      <StyleFields
        s={s}
        fields={[
          {
            handle: 'opacity',
            type: 'text',
            component: 'blocks-value',
            label: t('Opacity'),
            percent: true,
            step: 0.05,
            min: 0,
            max: 1,
            placeholder: '100',
            slider: { min: 0, max: 1, step: 0.01, neutral: 1 },
            markers: ['opacity'],
            get: () => (opacity === undefined ? undefined : opacity.endsWith('%') ? String(parseFloat(opacity) / 100) : opacity),
            set: (v) => s.swap('opacity', v === null || v === undefined || v === '' || !s.engine ? null : partUtility(s.engine, 'opacity', `${Math.round(Number(v) * 100)}%`, 'percent')),
          },
        ]}
      />
      <StyleFields s={s} bare fields={[{ handle: 'boxShadow', type: 'text', component: 'blocks-shadows', label: t('Shadows'), group: 'shadow', markers: ['--tw-shadow'], get: () => shadow, set: (v) => s.swap('--tw-shadow', v && s.engine ? partUtility(s.engine, 'shadow', v, 'number') : null) }]} />
      <StyleFields s={s} bare fields={[{ handle: 'filter', type: 'text', component: 'blocks-filters', label: t('Filters'), markers: filter.markers, get: () => filter.value, set: filter.set }]} />
      <StyleFields s={s} bare fields={[{ handle: 'backdropFilter', type: 'text', component: 'blocks-filters', label: t('Backdrop'), markers: backdrop.markers, get: () => backdrop.value, set: backdrop.set }]} />
      <StyleFields
        s={s}
        fields={[
          { handle: 'clipPath', type: 'text', component: 'blocks-clip', label: t('Clip Path'), className: 'items-start py-0.5 [&>label]:leading-6' },
          { handle: 'mixBlendMode', type: 'select', size: 'sm', label: t('Blending'), placeholder: t('Normal'), options: BLEND },
          { handle: 'cursor', type: 'select', size: 'sm', label: t('Cursor'), placeholder: t('Auto'), options: CURSORS },
          { handle: 'pointerEvents', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Clicks'), placeholder: 'auto', options: [{ value: 'auto', label: t('On') }, { value: 'none', label: t('Pass Through') }] },
        ]}
      />
    </StyleSection>
  )
}
