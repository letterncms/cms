import { t, useManifest } from '@letterncms/sdk'
import type { CSSProperties } from 'react'
import { DEFAULT_ACCENT, accents } from './accent'
import { Button } from './Button'
import { Icon } from './Icon'
import { Pressable } from './Pressable'
import { Tooltip } from './Tooltip'
import { useTheme } from './theme'

/**
 * The admin's accent, chosen from the set made to be read (see accent.ts): a row of swatches with a check on
 * the one the admin wears. Nothing chosen (null) is amber, or with `inherit` (a person's own
 * choice) what is chosen for everyone, and then "Use Admin Default" goes back to following it.
 */
export function AccentPicker({ value, onChange, inherit, disabled }: { value: string | null | undefined; onChange: (value: string | null) => void; inherit?: string | null; disabled?: boolean }) {
  const set = accents(useManifest())
  const dark = useTheme() === 'dark'
  const known = (name: string | null | undefined) => (name && set.some((a) => a.name === name) ? name : null)
  const current = known(value)
  const personal = inherit !== undefined
  const worn = current ?? (personal ? known(inherit) : null) ?? DEFAULT_ACCENT
  // Where nothing is followed, the brand's own is kept as nothing, so it follows the brand.
  const pick = (name: string) => onChange(!personal && name === DEFAULT_ACCENT ? null : name)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div role="radiogroup" aria-label={t('Theme Color')} className="flex min-w-0 flex-wrap items-center gap-2 [@media(pointer:coarse)]:gap-4 [@media(pointer:coarse)]:py-2">
        {set.map((accent) => {
          const on = accent.name === worn
          // Monochrome is the admin's ink: shown as it is in this theme.
          const { fill, ink } = dark && accent.dark ? accent.dark : accent
          return (
            <Tooltip key={accent.name} content={accent.label} side="bottom">
              <Pressable
                role="radio"
                aria-checked={on}
                aria-label={accent.label}
                disabled={disabled}
                onClick={() => pick(accent.name)}
                className="cms-swatch flex size-7 items-center justify-center rounded-full"
                style={{ '--swatch': fill, color: ink } as CSSProperties}
              >
                {on && <Icon name="check" size={14} />}
              </Pressable>
            </Tooltip>
          )
        })}
      </div>
      {personal && current !== null && <Button variant="ghost" size="sm" onClick={() => onChange(null)} disabled={disabled}>{t('Use Admin Default')}</Button>}
    </div>
  )
}
