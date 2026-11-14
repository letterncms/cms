import { t, type FieldProps } from '@letterncms/sdk'
import { Button, fieldControlId, Fields, Icon, IconButton, Popover, cn } from '@letterncms/ui'
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

/* Field components of the Styling page: the controls core fields can't express, a font stack and a
   shadow. Compact like the canvas inspector, whose shadow editor the second one opens. */

/** What a font family falls back to: the system's own fonts of its kind. */
export const FALLBACKS = { sans: ['ui-sans-serif', 'system-ui', 'sans-serif'], serif: ['ui-serif', 'Georgia', 'serif'], mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace'] } as const
export type Fallback = keyof typeof FALLBACKS
const SYSTEM_FONTS = new Set<string>([...Object.values(FALLBACKS).flat(), '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', 'Times New Roman', 'Times', 'Courier New', 'Consolas', 'Monaco', 'cursive', 'fantasy'])

export function fallbackOf(stack: string[]): Fallback {
  if (stack.includes('monospace')) return 'mono'
  return stack.includes('serif') ? 'serif' : 'sans'
}

/** A font stack as a list: `Inter, "Inter Fallback", sans-serif` → ["Inter", "Inter Fallback", "sans-serif"]. */
export function fontStack(value: unknown): string[] {
  return String(value ?? '').split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}

/** A list of families as CSS writes it: a name that is not one plain word stands in quotes. */
export function stackCss(stack: string[]): string {
  return stack.map((name) => (/^[a-zA-Z][\w-]*$/.test(name) ? name : `"${name.replace(/"/g, '')}"`)).join(', ')
}

/** The font a stack uses, when it is one the site serves or names: not a system font, not a fallback face. */
export function familyOf(stack: string[]): string {
  return stack[0] && !SYSTEM_FONTS.has(stack[0]) && !stack[0].endsWith(' Fallback') ? stack[0] : ''
}

/**
 * A stack for a family and a kind of fallback. A family with a fallback face (the local font drawn at its
 * size until it arrives) names it right after itself, as "<Family> Fallback".
 */
export function stackFor(family: string, kind: Fallback, fallbackFace: boolean): string {
  return stackCss([...(family ? [family, ...(fallbackFace ? [`${family} Fallback`] : [])] : []), ...FALLBACKS[kind]])
}

/** A font the site serves, as the picker lists it: its weights (400–600 · Italic), whether it has a fallback face and whether a font of the theme uses it. */
export interface SiteFont {
  family: string
  styles: string
  fallback: boolean
  used: boolean
}

/**
 * A font of the theme (`Inter, "Inter Fallback", ui-sans-serif, system-ui, sans-serif`): the font it uses,
 * picked from the fonts on the site (each shown in itself) or the system's, or added right here from
 * Google Fonts or a .woff2 file. Its kind of fallback stays as it is (the row's menu changes it).
 * `fonts` are the site's fonts; `onAdd(kind)` adds one and resolves to it; `onRemove(family)` deletes a
 * font no font of the theme uses.
 */
export function FontStackField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const [open, setOpen] = useState(false)
  const stack = fontStack(value)
  const first = familyOf(stack)
  const fallback = fallbackOf(stack)
  const fonts = (field.fonts as SiteFont[] | undefined) ?? []
  const use = (family: string, fallbackFace: boolean) => onChange(stackFor(family, fallback, fallbackFace))
  const add = async (kind: 'google' | 'upload') => {
    setOpen(false)
    const font = await (field.onAdd as ((kind: string) => Promise<{ family: string; fallback: boolean } | null>) | undefined)?.(kind)
    if (font) use(font.family, font.fallback)
  }
  const option = (family: string, label: string, aside: string, fallbackFace: boolean, extra?: ReactNode) => (
    <div key={family || 'system'} className="cms-reveal-row flex items-center gap-1 rounded-sm pr-1 hover:bg-hover">
      <Button variant="ghost" onClick={() => { use(family, fallbackFace); setOpen(false) }} className="!h-9 min-w-0 flex-1 shrink !justify-start !gap-2 !bg-transparent !pl-2 !pr-0 text-left !font-normal">
        <span className="min-w-0 flex-1 truncate text-base leading-tight text-ink" style={family ? { fontFamily: `"${family}"` } : undefined}>{label}</span>
        {aside && <span className="shrink-0 text-2xs tabular-nums text-faint">{aside}</span>}
      </Button>
      <span className="grid w-6 shrink-0 place-items-center">{family === first ? <Icon name="check" size={14} className="text-ink" /> : extra}</span>
    </div>
  )
  const action = (icon: string, label: string, onClick: () => void) => (
    <Button variant="ghost" size="md" onClick={onClick} className="w-full !justify-start !gap-2 !rounded-sm !px-2 text-left !text-xs !font-normal">
      <Icon name={icon} size={14} className="shrink-0 text-faint" />
      {label}
    </Button>
  )
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="w-72 !p-1.5"
      trigger={
        <Button variant="ghost" id={fieldControlId(field)} disabled={disabled} className="cms-input w-full min-w-0 shrink !justify-start !gap-2 !pl-2 !pr-1.5 text-left !font-normal">
          <span className="min-w-0 flex-1 truncate" style={first ? { fontFamily: `"${first}"` } : undefined}>{first || t('System Font')}</span>
          <Icon name="chevrons-up-down" size={14} className="shrink-0 text-faint" />
        </Button>
      }
    >
      <div className="max-h-72 overflow-y-auto">
        {option('', t('System Font'), '', false)}
        {/* A font the theme names without serving it (a font of the visitor's own) is still what is chosen. */}
        {first && !fonts.some((font) => font.family === first) && option(first, first, '', stack.includes(`${first} Fallback`))}
        {fonts.map((font) => option(font.family, font.family, font.styles, font.fallback, !font.used && field.onRemove ? (
          <IconButton icon="trash" label={t('Remove {family}', { family: font.family })} size="xs" className="cms-reveal" onClick={() => (field.onRemove as (family: string) => void)(font.family)} />
        ) : undefined))}
      </div>
      {!!field.onAdd && (
        <div className="mt-1 border-t border-border pt-1">
          {action('search', t('Add a Google Font…'), () => void add('google'))}
          {action('upload', t('Upload a .woff2 File…'), () => void add('upload'))}
        </div>
      )}
    </Popover>
  )
}

/** A trigger that looks like the inspector's inputs: what is chosen, a chevron. (A popover's trigger: it takes the props and ref it is given.) */
const PickerButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>(function PickerButton({ label, children, className, ...props }, ref) {
  return (
    <Button ref={ref} variant="ghost" aria-label={label} {...props} className={cn('cms-input w-full min-w-0 shrink !justify-start !gap-1.5 !pl-2 !pr-1.5 text-left !font-normal data-[popup-open]:border-focus', className)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <Icon name="chevrons-up-down" size={11} className="shrink-0 text-faint" />
    </Button>
  )
})

const SHADOW: FieldProps['field'] = { handle: 'shadow', type: 'text', component: 'blocks-shadows', label: 'Shadow' }

const shadows = (): { label: string; value: string }[] => [
  { label: t('None'), value: 'none' },
  { label: t('Small'), value: '0 1px 2px rgb(0 0 0 / 0.06)' },
  { label: t('Medium'), value: '0 4px 16px -4px rgb(0 0 0 / 0.12)' },
  { label: t('Large'), value: '0 24px 48px -16px rgb(0 0 0 / 0.2)' },
]

const ShadowSample = ({ value }: { value: string | null }) => <span className="size-3.5 shrink-0 rounded-xs border border-border bg-bg" style={{ boxShadow: value ?? undefined }} />

/** A box-shadow: a named preset, or a custom one made in the canvas's shadow editor (offsets, blur, spread, color). */
export function ShadowField({ field, value, onChange, disabled }: FieldProps<string | null>) {
  const preset = shadows().find((p) => p.value === value?.replace(/\s+/g, ' ').trim())
  return (
    <Popover
      align="start"
      className="w-72 p-1"
      trigger={
        <PickerButton id={fieldControlId(field)} disabled={disabled} label={field.label}>
          {preset?.label ?? t('Custom||shadow')}
        </PickerButton>
      }
    >
      <div className="space-y-px">
        {shadows().map((option) => (
          <Button key={option.value} variant="ghost" onClick={() => onChange(option.value)} data-active={option.value === preset?.value || undefined} className="w-full !justify-start !gap-2 !rounded-xs !px-2 text-left !text-xs !font-normal">
            <ShadowSample value={option.value} />
            <span className="flex-1">{option.label}</span>
            {option.value === preset?.value && <Icon name="check" size={12} className="text-muted" />}
          </Button>
        ))}
      </div>
      <div className="mt-1 border-t border-border px-1 pb-1 pt-2">
        <p className="m-0 mb-1 text-2xs font-medium text-muted">{t('Custom||shadow')}</p>
        <Fields bare fields={[SHADOW]} values={{ shadow: value && value !== 'none' ? value : '0 4px 16px 0 rgb(0 0 0 / 12%)' }} onChange={(_, v) => onChange(v ?? 'none')} />
        <Button variant="ghost" size="xs" onClick={() => onChange(`${value && value !== 'none' ? `${value}, ` : ''}0 2px 8px 0 rgb(0 0 0 / 10%)`)} className="mt-1.5 w-full !text-2xs !font-normal !text-muted hover:!text-text">
          <Icon name="plus" size={11} />
          {t('Add Layer')}
        </Button>
      </div>
    </Popover>
  )
}
