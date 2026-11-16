import { t } from '@letterncms/sdk'
import { useState } from 'react'
import { sides } from '../css'
import { Section } from '../controls'
import { partUtility } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { StyleFields, changed, shownStatus, statusOf } from './StyleFields'
import { setHere } from './more'

const CORNERS = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'] as const

/**
 * A border is three classes, as people write it: its width (`border`, `border-t-2`), its colour (`border-primary`)
 * and its style (`border-dashed`, one for every side). Each side names the root of its classes and what they set.
 */
const EDGES = {
  all: { root: 'border', width: 'border-width', color: 'border-color' },
  top: { root: 'border-t', width: 'border-top-width', color: 'border-top-color' },
  right: { root: 'border-r', width: 'border-right-width', color: 'border-right-color' },
  bottom: { root: 'border-b', width: 'border-bottom-width', color: 'border-bottom-color' },
  left: { root: 'border-l', width: 'border-left-width', color: 'border-left-color' },
} as const
type Edge = keyof typeof EDGES
const STYLE = '--tw-border-style'
const OUTLINE_STYLE = '--tw-outline-style'
const RING = '--tw-ring-shadow'

const styleOptions = () => [
  { value: 'solid', label: t('Solid') },
  { value: 'dashed', label: t('Dashed') },
  { value: 'dotted', label: t('Dotted') },
  { value: 'double', label: t('Double') },
  { value: 'none', label: t('None') },
]

/** A ring's width, from the shadow Tailwind draws it as. */
const ringWidth = (shadow: string | undefined) => shadow?.match(/0 0 0 calc\(([\d.]+px) \+/)?.[1]

/** Border on every side or one side (width, style, color), corner radius (linked or per corner), outline and ring. */
export function Border({ s }: { s: StyleApi }) {
  const sidesOf = Object.keys(EDGES) as Edge[]
  const [edge, setEdge] = useState<Edge>(() => sidesOf.find((k) => k !== 'all' && s.value(EDGES[k].width)) ?? 'all')
  const at = EDGES[edge]
  const line = { width: s.value(at.width), style: s.value(STYLE), color: s.value(at.color) }
  const radii = CORNERS.map((c) => s.value(c))
  const corner = (i: number) => s.value(CORNERS[i]) ?? sides(s.value('borderRadius'))?.[i]
  const outline = { width: s.value('outlineWidth'), style: s.value(OUTLINE_STYLE), color: s.value('outlineColor') }
  const ring = { width: ringWidth(s.value(RING)), color: s.value('--tw-ring-color') }
  const any = sidesOf.some((k) => s.value(EDGES[k].width) || s.value(EDGES[k].color)) || line.style || s.value('borderRadius') || radii.some(Boolean) || outline.width || outline.style || ring.width
  const status = (k: Edge) => statusOf(s, [EDGES[k].width, EDGES[k].color])
  const part = (root: string, value: string | null | undefined, scale: 'px' | 'number') => (value && s.engine ? partUtility(s.engine, root, value, scale) : null)

  const sideOption = (k: Edge, icon: string, title: string) => ({ value: k, icon, title: status(k) ? `${title} · ${status(k) === 'own' ? t('set') : t('inherited')}` : title })

  return (
    <Section title={t('Border')} empty={!any} own={setHere(s, 'border')}>
      <StyleFields
        s={s}
        fields={[
          {
            handle: 'edge',
            type: 'select',
            display: 'segmented',
            block: true,
            required: true,
            size: 'sm',
            label: t('Sides'),
            keys: [],
            get: () => edge,
            set: (v) => v && setEdge(v),
            options: [sideOption('all', 'b-side-all', t('All Sides')), sideOption('top', 'b-side-top', t('Top')), sideOption('right', 'b-side-right', t('Right')), sideOption('bottom', 'b-side-bottom', t('Bottom')), sideOption('left', 'b-side-left', t('Left'))],
          },
          {
            handle: 'line',
            type: 'group',
            component: 'blocks-group',
            label: t('Width'),
            markers: [at.width, STYLE],
            get: () => ({ width: line.width, style: line.style }),
            set: (v) => {
              const next = changed({ width: line.width, style: line.style }, v)
              if ('width' in next) s.swap(at.width, part(at.root, next.width, 'px'))
              else if ('style' in next) s.swap(STYLE, next.style ? `border-${next.style}` : null)
            },
            fields: [
              { handle: 'width', type: 'text', component: 'blocks-value', label: t('Width'), placeholder: '0', min: 0, prefixIcon: 'square' },
              { handle: 'style', type: 'select', size: 'sm', label: t('Style'), options: styleOptions(), placeholder: t('Solid') },
            ],
          },
          {
            handle: 'lineColor',
            type: 'color',
            component: 'blocks-color',
            label: t('Color'),
            placeholder: t('Text Color'),
            markers: [at.color],
            get: () => line.color,
            set: (v) => s.swap(at.color, part(at.root, v, 'number')),
          },
          {
            handle: 'radius',
            type: 'group',
            component: 'blocks-group',
            label: t('Radius'),
            status: s.status('borderRadius') === 'own' || CORNERS.some((c) => s.status(c) === 'own') ? 'own' : shownStatus(s.status('borderRadius')),
            keys: ['borderRadius', ...CORNERS],
            columns: 2,
            split: radii.some(Boolean),
            splitLabel: t('Each Corner'),
            joinLabel: t('Same radius for every corner'),
            link: { handle: 'borderRadius', type: 'text', component: 'blocks-value', label: t('Radius'), group: 'radius', prefixIcon: 'frame', placeholder: '0', min: 0 },
            fields: CORNERS.map((c, i) => ({ handle: c, type: 'text', component: 'blocks-value', label: [t('Top Left'), t('Top Right'), t('Bottom Right'), t('Bottom Left')][i], title: [t('Top Left'), t('Top Right'), t('Bottom Right'), t('Bottom Left')][i], group: 'radius', prefix: ['◜', '◝', '◞', '◟'][i], placeholder: '0', min: 0 })),
            get: () => ({ borderRadius: s.value('borderRadius'), ...Object.fromEntries(CORNERS.map((c, i) => [c, corner(i)])) }),
            set: (v) => {
              if (v.borderRadius !== s.value('borderRadius')) return s.set('borderRadius', v.borderRadius)
              s.write({ borderRadius: null, ...Object.fromEntries(CORNERS.map((c) => [c, v[c] ?? null])) })
            },
          },
        ]}
      />
      <div className="!mt-3 border-t border-border pt-2">
        <StyleFields
          s={s}
          fields={[
            {
              handle: 'outlineLine',
              type: 'group',
              component: 'blocks-group',
              label: t('Outline'),
              markers: ['outline-width', OUTLINE_STYLE],
              get: () => ({ width: outline.width, style: outline.style }),
              set: (v) => {
                const next = changed({ width: outline.width, style: outline.style }, v)
                if ('width' in next) s.swap('outline-width', part('outline', next.width, 'px'))
                else if ('style' in next) s.swap(OUTLINE_STYLE, next.style ? (next.style === 'solid' ? 'outline-solid' : `outline-${next.style}`) : null)
              },
              fields: [
                { handle: 'width', type: 'text', component: 'blocks-value', label: t('Width'), placeholder: '0', min: 0, prefixIcon: 'selection' },
                { handle: 'style', type: 'select', size: 'sm', label: t('Style'), options: styleOptions(), placeholder: t('Solid') },
              ],
            },
            outline.width || outline.style
              ? { handle: 'outlineColor', type: 'color', component: 'blocks-color', label: t('Outline Color'), placeholder: t('Text Color'), markers: ['outline-color'], get: () => outline.color, set: (v) => s.swap('outline-color', part('outline', v, 'number')) }
              : null,
            outline.width || outline.style || s.value('outlineOffset')
              ? { handle: 'outlineOffset', type: 'text', component: 'blocks-value', label: t('Offset'), placeholder: '0', prefixIcon: 'arrows-out-simple', markers: ['outline-offset'], get: () => s.value('outlineOffset'), set: (v) => s.swap('outline-offset', part('outline-offset', v, 'px')) }
              : null,
            // A ring: a line drawn as a shadow, outside the box and following its corners.
            { handle: 'ringWidth', type: 'text', component: 'blocks-value', label: t('Ring'), placeholder: '0', min: 0, prefixIcon: 'circle', markers: [RING], get: () => ring.width, set: (v) => s.swap(RING, part('ring', v, 'px')) },
            ring.width
              ? { handle: 'ringColor', type: 'color', component: 'blocks-color', label: t('Ring Color'), placeholder: t('Text Color'), markers: ['--tw-ring-color'], get: () => ring.color, set: (v) => s.swap('--tw-ring-color', part('ring', v, 'number')) }
              : null,
          ]}
        />
      </div>
    </Section>
  )
}
