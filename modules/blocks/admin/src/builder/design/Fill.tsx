import { t } from '@letterncms/sdk'
import { Fields } from '@letterncms/ui'
import { useDesign } from '../../core/context'
import { Section } from '../controls'
import { parseGradient } from '../fields/style'
import type { StyleApi } from '../useStyle'
import { colorCss } from '../vocab'
import { col, seg, tok } from './fields'
import { StyleFields } from './StyleFields'

const CLEAR = { backgroundImage: null, backgroundSize: null, backgroundPosition: null, backgroundRepeat: null }

/**
 * Color: the scheme first (a section in the brand color, the opposite mode, a quiet band:
 * every color inside resolves again and keeps its contrast), then the background, a
 * gradient of the palette's colors or an image, and a texture.
 */
export function Fill({ s }: { s: StyleApi }) {
  const design = useDesign()
  const r = design.resolved
  const image = s.value('backgroundImage')
  const kind = !image ? 'none' : parseGradient(image) ? 'gradient' : 'image'
  const mediaId = image?.match(/^media:([0-9a-z]{26})$/i)?.[1]
  const scheme = s.value('scheme')
  const schemes = design.names('scheme')
  const base = s.variant === 'base'

  return (
    <Section title={t('Color')} empty={!scheme && !s.value('backgroundColor') && !image && !s.value('texture')}>
      <div className="flex min-h-7 items-center gap-1 pb-1">
        <span className="w-[88px] shrink-0 text-xs text-muted">{t('Scheme')}</span>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1">
          {schemes.map((name) => {
            const sc = r?.schemes[name === 'muted' ? 'muted-light' : name === 'inverse' ? (r.schemes.dark ? 'dark' : 'neutral') : name]
            return (
              <button
                key={name}
                type="button"
                disabled={!base}
                onClick={() => s.set('scheme', scheme === name ? null : name)}
                aria-pressed={scheme === name}
                title={base ? name : t('A scheme is set for every screen size: switch to Desktop to change it.')}
                className={`grid size-7 place-items-center rounded-sm text-[11px] font-semibold ring-1 ring-border disabled:opacity-40 ${scheme === name ? 'outline-2 outline-offset-1 outline-focus' : ''}`}
                style={{ background: sc?.background, color: sc?.foreground }}
              >
                Aa
              </button>
            )
          })}
        </div>
      </div>
      <StyleFields
        s={s}
        fields={[
          col('backgroundColor', t('Background')),
          seg('kind', t('Image'), [{ value: 'none', label: t('None') }, { value: 'gradient', icon: 'b-gradient', title: t('Gradient') }, { value: 'image', icon: 'b-image', title: t('Image') }], {
            keys: ['backgroundImage'],
            reset: () => s.write(CLEAR),
            get: () => kind,
            set: (v) => {
              if (v === 'gradient') s.set('backgroundImage', 'linear(to-b, primary, background)')
              else if (v === 'image') s.write({ backgroundImage: 'none', backgroundSize: 'cover', backgroundPosition: 'center' })
              else s.write(CLEAR)
            },
          }),
        ]}
      />
      {kind === 'gradient' && <StyleFields s={s} bare fields={[{ handle: 'backgroundImage', type: 'text', component: 'blocks-gradient', className: 'items-start', label: t('Gradient') }]} />}
      {kind === 'image' && (
        <div className="rounded-md bg-active/60 p-1.5 text-xs">
          <Fields bare fields={[{ handle: 'bg', type: 'media', label: t('Image'), max: 1, accept: 'image/*' }]} values={{ bg: mediaId ? [mediaId] : [] }} onChange={(_, v: string[]) => s.set('backgroundImage', v?.[0] ? `media:${v[0]}` : 'none')} />
        </div>
      )}
      <StyleFields
        s={s}
        fields={[
          kind === 'image' && seg('backgroundSize', t('Size'), [{ value: 'cover', label: t('Cover') }, { value: 'contain', label: t('Contain') }, { value: 'auto', label: t('Original') }]),
          kind === 'image' && { handle: 'backgroundPosition', type: 'json', component: 'blocks-origin', label: t('Position'), className: 'items-start py-0.5 [&>label]:leading-6' },
          kind === 'image' && seg('backgroundRepeat', t('Repeat'), [{ value: 'no-repeat', label: t('Once') }, { value: 'repeat', label: t('Tile') }]),
          kind === 'image' && seg('backgroundAttachment', t('Scrolling'), [{ value: 'scroll', label: t('With Page') }, { value: 'fixed', label: t('Fixed') }], { get: () => s.value('backgroundAttachment') ?? 'scroll', set: (v) => s.set('backgroundAttachment', v === 'fixed' ? 'fixed' : null) }),
          kind !== 'none' && seg('backgroundClip', t('Clip'), [{ value: 'border-box', label: t('Box') }, { value: 'text', label: t('Text') }], { get: () => s.value('backgroundClip') ?? 'border-box', set: (v) => s.write({ backgroundClip: v === 'text' ? 'text' : null, color: v === 'text' ? 'transparent' : null }) }),
          tok('texture', t('Texture'), { placeholder: t('None'), disabled: !base }),
        ]}
      />
      {scheme && r && <p className="m-0 pl-[88px] text-2xs text-faint" style={{ color: colorCss('foreground-muted', r) }}>{t('Colors inside follow the {scheme} scheme.', { scheme })}</p>}
    </Section>
  )
}
