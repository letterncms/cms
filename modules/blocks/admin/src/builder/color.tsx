import { t, type FieldProps } from '@letterncms/sdk'
import { Icon, Popover, cn, fieldControlId } from '@letterncms/ui'
import { useState } from 'react'
import { useDesign } from '../core/context'
import { colorCss } from './vocab'

/* `blocks-color` — a color of the design vocabulary: a role of the scheme the element sits
   in (foreground-muted, border…), a palette's role (primary, on-primary, primary-soft,
   primary-text), a shade for decoration, with an opacity step. Roles keep their contrast in
   every scheme; that's why they come first. */

const ALPHAS = ['', '90', '75', '50', '25', '10', '5']

const ROLE_ORDER = ['background', 'background-muted', 'background-emphasis', 'surface', 'foreground', 'foreground-muted', 'foreground-subtle', 'border', 'border-strong']

export function ColorField({ field, value, onChange }: FieldProps) {
  const design = useDesign()
  const r = design.resolved
  const [open, setOpen] = useState(false)
  const current = typeof value === 'string' && value !== '' ? value : null
  const [name, alpha = ''] = (current ?? '').split('/')
  const palettes = design.catalog?.collections.palettes ?? []
  const set = (next: string | null, a = alpha) => onChange(next ? (a ? `${next}/${a}` : next) : null)

  const chip = (n: string, label?: string) => (
    <button
      key={n}
      type="button"
      onClick={() => set(n)}
      title={n}
      aria-pressed={name === n}
      className={cn('flex h-7 min-w-0 items-center gap-1.5 rounded-xs px-1.5 text-left text-2xs hover:bg-hover', name === n && 'bg-active text-ink')}
    >
      <span className="size-3.5 shrink-0 rounded-full ring-1 ring-border" style={{ background: colorCss(n, r) }} />
      <span className="min-w-0 truncate">{label ?? n}</span>
    </button>
  )

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      className="w-72 !p-2"
      trigger={
        <button type="button" id={fieldControlId(field)} className={cn('flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-sm bg-active/60 px-2 text-left text-xs hover:bg-active', !current && 'text-faint')}>
          <span className="size-3.5 shrink-0 rounded-full ring-1 ring-border" style={{ background: current ? colorCss(current, r) : 'transparent' }} />
          <span className={cn('min-w-0 truncate', current && 'font-medium text-ink')}>{current ? name : ((field.placeholder as string) ?? t('Inherit'))}</span>
          {alpha && <span className="ml-auto shrink-0 text-2xs text-faint">{alpha}%</span>}
        </button>
      }
    >
      <p className="m-0 px-1 pb-1 text-2xs font-medium text-faint">{t('This scheme')}</p>
      <div className="grid grid-cols-2 gap-px">{ROLE_ORDER.map((n) => chip(n))}</div>
      <p className="m-0 px-1 pb-1 pt-2 text-2xs font-medium text-faint">{t('Palettes')}</p>
      <div className="space-y-1.5">
        {palettes.map((p) => (
          <div key={p}>
            <div className="grid grid-cols-4 gap-px">
              {chip(p, p)}
              {chip(`on-${p}`, t('on'))}
              {chip(`${p}-soft`, t('soft'))}
              {chip(`${p}-text`, t('text'))}
            </div>
            <div className="mt-0.5 grid grid-cols-11 overflow-hidden rounded-xs">
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((s) => (
                <button
                  key={s}
                  type="button"
                  title={`${p}-${s}`}
                  aria-label={`${p}-${s}`}
                  onClick={() => set(`${p}-${s}`)}
                  className={cn('h-3.5 hover:scale-y-150 transition-transform', name === `${p}-${s}` && 'outline-2 -outline-offset-2 outline-focus')}
                  style={{ background: r?.palettes[p]?.shades[s] }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-px border-t border-border pt-2">{['white', 'black', 'transparent', 'current'].map((n) => chip(n))}</div>
      <p className="m-0 px-1 pb-1 pt-2 text-2xs font-medium text-faint">{t('Opacity')}</p>
      <div className="flex gap-px">
        {ALPHAS.map((a) => (
          <button
            key={a || '100'}
            type="button"
            disabled={!current}
            onClick={() => set(name, a)}
            aria-pressed={alpha === a}
            className={cn('h-6 flex-1 rounded-xs text-2xs hover:bg-hover disabled:opacity-40', alpha === a && 'bg-active text-ink')}
          >
            {a || '100'}
          </button>
        ))}
      </div>
      {current && (
        <button type="button" onClick={() => { onChange(null); setOpen(false) }} className="mt-2 flex h-7 w-full items-center gap-2 rounded-xs border-t border-border px-1 text-xs text-muted hover:bg-hover hover:text-text">
          <Icon name="b-x" size={12} />
          {t('Clear')}
        </button>
      )}
    </Popover>
  )
}
