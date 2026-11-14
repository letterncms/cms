import { run, t } from '@letterncms/sdk'
import { Fields, toast } from '@letterncms/ui'
import { useState } from 'react'
import { useThemeTokens } from '../../core/styling'
import { PanelFields } from '../controls'
import { parseGradient } from '../fields/style'
import { GRADIENT_MARKERS, colorGroups, gradientOf, gradientUtilities } from '../styleApi'
import type { StyleApi } from '../useStyle'
import { StyleSection } from './more'
import { StyleFields } from './StyleFields'

const IMAGE = ['backgroundSize', 'backgroundPosition', 'backgroundRepeat', 'backgroundAttachment']

/** An image's address inside url(): quotes and spaces could not stand in a class. */
const address = (image: string | undefined) => image?.match(/^url\(["']?([^"')]*)["']?\)$/)?.[1]

/** An address as a class can hold it: encoded once, whether or not it came encoded. */
function encoded(url: string): string {
  try {
    return encodeURI(decodeURI(url))
  } catch {
    return encodeURI(url)
  }
}

/** Background color, gradient or image, and text clipping (gradient text). */
export function Fill({ s }: { s: StyleApi }) {
  const tokens = useThemeTokens()
  const image = s.value('backgroundImage')
  // A gradient is classes of its own where Tailwind has them (bg-linear-to-r from-… to-…), else one background image.
  const gradient = gradientOf(s.value) ?? (parseGradient(image) ? image : undefined)
  const kind = gradient ? 'gradient' : image ? 'image' : 'none'
  const url = address(image)
  // The file picked here, for as long as the panel shows this block: a class holds only its address.
  const [picked, setPicked] = useState<{ id: string; url: string } | null>(null)
  const any = s.value('backgroundColor') || image || gradient
  const clear = () => s.edit((draft) => {
    draft.swap(GRADIENT_MARKERS, null)
    draft.write(Object.fromEntries(IMAGE.map((key) => [key, null])))
  }, 'fill')

  const setGradient = (css: string | null) => {
    const parsed = parseGradient(css)
    if (!s.engine || !parsed) return clear()
    s.swap(GRADIENT_MARKERS, gradientUtilities(s.engine, parsed), 'gradient')
  }

  const setImage = (next: string | null) => {
    const written = next && s.engine ? s.engine.make('bg', `url(${encoded(next)})`) : null
    s.swap(GRADIENT_MARKERS, written ?? 'bg-none', 'image')
  }

  const choose = async (id: string | undefined) => {
    if (!id) {
      setPicked(null)
      return setImage(null)
    }
    try {
      const { items } = await run<{ items: { id: string; url: string }[] }>('media/get-many', { ids: [id] })
      if (!items[0]?.url) return
      setPicked({ id, url: items[0].url })
      setImage(items[0].url)
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <StyleSection s={s} group="fill" title={t('Fill')} empty={!any}>
      <StyleFields
        s={s}
        fields={[
          { handle: 'backgroundColor', type: 'color', component: 'blocks-color', label: t('Color') },
          {
            handle: 'kind',
            type: 'select',
            display: 'segmented',
            block: true,
            size: 'sm',
            label: t('Image'),
            options: [{ value: 'none', label: t('None') }, { value: 'gradient', icon: 'gradient', title: t('Gradient') }, { value: 'image', icon: 'image', title: t('Image') }],
            keys: ['backgroundImage', '--tw-gradient-from', '--tw-gradient-to'],
            reset: clear,
            get: () => kind,
            set: (v) => {
              // A gradient starts from a colour the site names, fading out.
              const first = colorGroups(tokens.of('color')).own[0]?.ref ?? 'currentColor'
              if (v === 'gradient') setGradient(`linear-gradient(180deg, ${first}, transparent)`)
              else if (v === 'image') s.edit((draft) => {
                draft.swap(GRADIENT_MARKERS, 'bg-none')
                draft.write({ backgroundSize: 'cover', backgroundPosition: 'center' })
              }, 'fill')
              else clear()
            },
          },
        ]}
      />
      {kind === 'gradient' && <StyleFields s={s} bare fields={[{ handle: 'gradient', type: 'text', component: 'blocks-gradient', className: 'items-start', label: t('Gradient'), get: () => gradient, set: setGradient }]} />}
      {kind === 'image' && (
        <div className="space-y-1 rounded-md bg-active/60 p-1.5 text-xs">
          <Fields bare disabled={!s.engine} fields={[{ handle: 'bg', type: 'media', label: t('Image'), max: 1, accept: 'image/*' }]} values={{ bg: picked && picked.url === url ? [picked.id] : [] }} onChange={(_, v: string[]) => void choose(v?.[0])} />
          {/* Any address works, also one that is not in the media library. */}
          <PanelFields bare disabled={!s.engine} fields={[{ handle: 'url', type: 'text', size: 'sm', commit: 'blur', mono: true, label: t('Image Address'), placeholder: '/media/…' }]} values={{ url: url ?? '' }} onChange={(_, v: string) => setImage(v.trim() || null)} />
        </div>
      )}
      <StyleFields
        s={s}
        fields={[
          kind === 'image' && { handle: 'backgroundSize', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Size'), options: [{ value: 'cover', label: t('Cover') }, { value: 'contain', label: t('Contain') }, { value: 'auto', label: t('Original') }] },
          kind === 'image' && { handle: 'backgroundPosition', type: 'json', component: 'blocks-origin', label: t('Position'), className: 'items-start py-0.5 [&>label]:leading-6' },
          kind === 'image' && { handle: 'backgroundRepeat', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Repeat||again'), placeholder: 'repeat', options: [{ value: 'no-repeat', label: t('Once') }, { value: 'repeat', label: t('Tile') }, { value: 'repeat-x', icon: 'spacing', title: t('Tile Across') }, { value: 'repeat-y', icon: 'arrows-out-line-vertical', title: t('Tile Down') }] },
          kind === 'image' && { handle: 'backgroundAttachment', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Scrolling'), options: [{ value: 'scroll', label: t('With Page') }, { value: 'fixed', label: t('Fixed') }], get: () => s.value('backgroundAttachment') ?? 'scroll', set: (v) => s.set('backgroundAttachment', v === 'fixed' ? 'fixed' : null) },
          kind !== 'none' && { handle: 'backgroundClip', type: 'select', display: 'segmented', block: true, size: 'sm', label: t('Clip'), options: [{ value: 'border-box', label: t('Box') }, { value: 'text', label: t('Text') }], get: () => s.value('backgroundClip') ?? 'border-box', set: (v) => s.write({ backgroundClip: v === 'text' ? 'text' : null, color: v === 'text' ? 'transparent' : null }) },
        ]}
      />
    </StyleSection>
  )
}
