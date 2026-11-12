import { t } from '@letterncms/sdk'
import { cn } from './cn'
import { controlSizes } from './controlSize'
import { Input, type InputProps } from './Input'

/** What the system's picker starts on when the value is no hex colour (a token, a named colour, nothing): it needs one. */
const PICKER_START = '#000000'
/** A new colour, before anyone chose one (a design token just added), and the shape a typed hex colour takes: black. */
export const NEW_COLOR = PICKER_START
/** What a colour looks like when typed, as the field's hint. */
const EXAMPLE = '#ff5a1f'

/**
 * A colour, typed or picked: a swatch that opens the system's picker beside the value as text. Any CSS colour
 * shows as itself; a token reference or nothing shows a checkerboard. The value is what was typed, or null.
 * Colours as data live here, in the kit: a screen never writes one.
 */
export function ColorInput({ value, onChange, size = 'md', placeholder, className, ...props }: Omit<InputProps, 'value' | 'onChange'> & { value: string | null | undefined; onChange: (value: string | null) => void }) {
  const small = size === 'sm' || size === 'xs'
  const hex = value && /^#[0-9a-f]{6}$/i.test(value) ? value : PICKER_START
  const swatch = value && typeof CSS !== 'undefined' && CSS.supports('color', value) ? value : 'repeating-conic-gradient(var(--cms-sunken) 0 25%, var(--cms-bg) 0 50%) 0 0/8px 8px'
  return (
    <div className={cn('flex items-center gap-2', !small && 'max-w-60', className)}>
      <label className={cn('relative aspect-square shrink-0 overflow-hidden border border-border-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus', controlSizes[size])} style={{ background: swatch }}>
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} disabled={props.disabled} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t('Pick a Color')} />
      </label>
      <Input {...props} size={size} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} placeholder={placeholder || EXAMPLE} className="font-mono" />
    </div>
  )
}
