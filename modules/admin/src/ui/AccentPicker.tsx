import { t } from '@letterncms/sdk'
import { useState } from 'react'
import { ACCENTS, DEFAULT_ACCENT, accentInk, normalizeAccent } from './accent'
import { Button } from './Button'
import { cn } from './cn'
import { ColorInput } from './ColorInput'
import { Icon } from './Icon'
import { Pressable } from './Pressable'
import { Tooltip } from './Tooltip'

/**
 * The admin's accent, chosen: a row of swatches (the brand's yellow first) and any colour beside them. The
 * check is on the colour the admin wears. Nothing chosen (null) is the brand's yellow, or with `inherit` (a
 * person's own choice) what is chosen for everyone, and then "Use Admin Default" goes back to following it.
 */
export function AccentPicker({ value, onChange, inherit, disabled, id }: { value: string | null | undefined; onChange: (value: string | null) => void; inherit?: string | null; disabled?: boolean; id?: string }) {
  const current = normalizeAccent(value)
  const personal = inherit !== undefined
  const worn = current ?? (personal ? normalizeAccent(inherit) : null) ?? DEFAULT_ACCENT
  const accents = ACCENTS()
  const custom = !accents.some((accent) => accent.value === worn)
  // What is being typed, until it is a colour: only a whole one is chosen.
  const [draft, setDraft] = useState<string | null>(null)
  const type = (text: string | null) => {
    setDraft(text ?? '')
    const hex = normalizeAccent(text)
    if (hex) onChange(hex)
  }
  // Where nothing is followed, the brand's yellow is kept as nothing, so it follows the brand.
  const pick = (hex: string) => onChange(!personal && hex === DEFAULT_ACCENT ? null : hex)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div role="radiogroup" aria-label={t('Accent')} className="flex items-center gap-1.5">
        {accents.map((accent) => {
          const on = accent.value === worn
          return (
            <Tooltip key={accent.value} content={accent.label} side="bottom">
              <Pressable
                role="radio"
                aria-checked={on}
                aria-label={accent.label}
                disabled={disabled}
                onClick={() => pick(accent.value)}
                className={cn('flex size-7 items-center justify-center rounded-full shadow-raise ring-1 ring-inset ring-border-strong transition-[box-shadow] duration-fast ease-out hover:ring-2', on && 'ring-2 ring-ink')}
                style={{ background: accent.value, color: accentInk(accent.value) }}
              >
                {on && <Icon name="check" size={14} />}
              </Pressable>
            </Tooltip>
          )
        })}
      </div>
      <ColorInput id={id} size="sm" value={draft ?? (custom ? worn : null)} onChange={type} onBlur={() => setDraft(null)} disabled={disabled} aria-label={t('Any Color')} />
      {personal && current !== null && <Button variant="ghost" size="sm" onClick={() => { setDraft(null); onChange(null) }} disabled={disabled}>{t('Use Admin Default')}</Button>}
    </div>
  )
}
