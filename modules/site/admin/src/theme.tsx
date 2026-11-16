import { t, type FieldDef } from '@letterncms/sdk'
import { Button, Icon, IconButton, Menu, NEW_COLOR, Popover, Pressable, Tooltip, cn, copyText, prompt, toast, type MenuItemDef } from '@letterncms/ui'
import { ColorPicker, PaletteGrid, SCHEME, SPACING_STEPS, SchemeTile, Swatch, lightDark, parseClass, schemesOf, useStyling, withVariants, type Engine, type Scheme, type Stylesheet } from '@letterncms/blocks'
import { useState, type ReactNode } from 'react'
import { AnimationSample, ShadowSample, familyOf, fallbackOf, fontStack, stackFor, type Fallback, type SiteFont } from './fields'
import { Changed, Control, Group, NoAction, ROW, Setting, TokenRow, changed, revert, revertItem, rowAction, type Editing } from './parts'

/* The theme sections of the Styling page: every value of the theme, Tailwind's own and the site's, kind by kind.
   The site is the baseline: a change is marked until it is saved, and Revert takes it back to what the site has.
   A value the site added is renamed and deleted like any of its own; one Tailwind or the CMS brings stays. */

export interface Face {
  family: string
  src: string
  weight?: string | number
  style?: string
  preload?: boolean
  fallback?: string | string[]
}

export interface Transition {
  type: 'none' | 'fade' | 'slide' | 'scale'
  duration: number
  navigation: 'document' | 'client'
}

/** The fonts the site serves, and what is done with them at once: they are files of the site. */
export interface FontTools {
  faces: Face[]
  add: (kind: string) => Promise<{ family: string; fallback: boolean } | null>
  remove: (family: string) => void
  preload: (family: string, on: boolean) => void
}

/** One value of the theme as a row shows it. */
export interface Row {
  /** --color-primary */
  name: string
  /** primary */
  key: string
  value: string
  /** Tailwind or the CMS brings it: it can be changed, not renamed or deleted. */
  builtIn: boolean
  /** The site's stylesheet writes it. */
  written: boolean
}

/** The values of one kind, Tailwind's and the CMS's first in their order, then the site's own as it wrote them. */
export function rowsOf(edit: Editing, prefix: string, skip: (key: string) => boolean = () => false): Row[] {
  const fits = (name: string) => {
    if (!name.startsWith(prefix)) return null
    const key = name.slice(prefix.length)
    return key === '' || key.includes('--') || key.includes('*') || skip(key) ? null : key
  }
  const written = new Map(edit.sheet.variables().filter((variable) => fits(variable.name) !== null).map((variable) => [variable.name, variable.value]))
  // `--text-*: initial` takes Tailwind's values of a kind away (`--*: initial` all of them): only the site's are left.
  const cleared = edit.sheet.variable(`${prefix}*`) === 'initial' || edit.sheet.variable('--*') === 'initial'
  const rows: Row[] = []
  for (const [name, value] of cleared ? [] : edit.defaults) {
    const key = fits(name)
    if (key !== null) rows.push({ name, key, value: written.get(name) ?? value, builtIn: true, written: written.has(name) })
  }
  // With Tailwind's taken away, a value of the same name is the site's own.
  for (const [name, value] of written) {
    if (cleared || !edit.defaults.has(name)) rows.push({ name, key: fits(name)!, value, builtIn: false, written: true })
  }
  return rows
}

/** A name as a variable takes it: lowercase letters, numbers and hyphens. */
const clean = (name: unknown) => String(name ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')

async function askName(edit: Editing, prefix: string, title: string, confirm: string, current = '', placeholder = 'md'): Promise<string | null> {
  const asked = await prompt({ title, fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, required: true, placeholder }], values: { name: current }, confirm })
  const next = clean(asked?.name)
  if (!next || next === current) return null
  if (edit.sheet.variable(`${prefix}${next}`) !== undefined || edit.defaults.has(`${prefix}${next}`)) {
    toast.error(t('“{name}” already exists', { name: next }))
    return null
  }
  return next
}

/**
 * A variable under another name, and the classes the stylesheet itself applies it with: `bg-primary` in an
 * @apply becomes `bg-brand`. Only a class that reads exactly this variable is rewritten.
 */
function rename(sheet: Stylesheet, engine: Engine | null, from: Row, key: string): Stylesheet {
  const to = from.name.slice(0, from.name.length - from.key.length) + key
  const pattern = new RegExp(`^(!?.*-)${from.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}((?:/[^!]+)?!?)$`)
  const swap = (raw: string): string => {
    const { variants, utility } = parseClass(raw)
    const match = pattern.exec(utility)
    if (!match || !engine?.declarations(utility.replace(/^!|!$/g, ''))?.some((declaration) => declaration.value.includes(`var(${from.name})`))) return raw
    return withVariants(variants, `${match[1]}${key}${match[2]}`)
  }
  let next = sheet
  for (const rule of sheet.utilities()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setUtility(rule.name, classes)
  }
  for (const rule of sheet.elements()) {
    const classes = rule.classes.map(swap)
    if (classes.some((name, i) => name !== rule.classes[i])) next = next.setElement(rule.name, classes)
  }
  return next.renameVariable(from.name, to)
}

/** A value and what belongs to it (a text size's line height) out of the site's stylesheet. */
const unset = (sheet: Stylesheet, name: string) => sheet.variables().filter((other) => other.name === name || other.name.startsWith(`${name}--`)).reduce((next, other) => next.setVariable(other.name, null), sheet)

interface Kind {
  prefix: string
  title: string
  /** What the button says ("Add Radius") and what its dialog is called ("New Radius"). */
  add: string
  fresh: string
  /** What a new one starts as, and a name to suggest. */
  start: string
  placeholder: string
  skip?: (key: string) => boolean
}

/** What a row's menu offers: Revert for a change not yet saved, Rename and Delete for the site's own values. */
function useRowMenu(edit: Editing, kind: Kind) {
  const { engine } = useStyling()
  return (row: Row, extra: MenuItemDef[] = []): MenuItemDef[] => {
    if (edit.readOnly) return []
    const back = changed(edit, row.name) ? [revertItem(() => revert(edit, row.name))] : []
    if (row.builtIn) return [...extra, ...(back.length && extra.length ? [{ separator: true, label: '' }] : []), ...back]
    return [
      ...back,
      {
        label: t('Rename…'), icon: 'edit', onSelect: async () => {
          const key = await askName(edit, kind.prefix, t('Rename'), t('Rename'), row.key, kind.placeholder)
          if (key) edit.change((sheet) => rename(sheet, engine, row, key))
        },
      },
      ...extra,
      { separator: true, label: '' },
      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => edit.change((sheet) => unset(sheet, row.name)) },
    ]
  }
}

/** The values of one kind as rows, with the way to add one of the site's own. */
function Tokens({ edit, kind, row }: { edit: Editing; kind: Kind; row: (row: Row, set: (value: string | null) => void, menu: (extra?: MenuItemDef[]) => MenuItemDef[]) => ReactNode }) {
  const menu = useRowMenu(edit, kind)
  const add = async () => {
    const key = await askName(edit, kind.prefix, kind.fresh, kind.add, '', kind.placeholder)
    if (key) edit.change((sheet) => sheet.setVariable(`${kind.prefix}${key}`, kind.start))
  }
  return (
    <Group title={kind.title} onAdd={edit.readOnly ? undefined : () => void add()} addLabel={kind.add}>
      {/* A value taken out of its control keeps what it was: a variable without a value is no CSS. */}
      {rowsOf(edit, kind.prefix, kind.skip).map((variable) => row(variable, (value) => value !== null && edit.change((sheet) => sheet.setVariable(variable.name, value)), (extra) => menu(variable, extra)))}
    </Group>
  )
}

/** The inspector's value control: a number with its unit. */
const number = (unit: string, extra: Partial<FieldDef> = {}): Partial<FieldDef> => ({ component: 'blocks-value', unit, ...extra })
/** A size that may grow with the screen. */
const SIZE: Partial<FieldDef> = { component: 'site-size' }
const LENGTH = number('rem', { units: ['rem', 'px', 'em'], step: 0.125, min: 0 })

/** A colour of Tailwind's palette: red-500 is the family red, shade 500. */
const SHADE = /^(.+)-(\d{2,3})$/

/**
 * One colour as a swatch that opens the picker: what it draws as, the theme's variables worked out. Empty, it
 * shows `same` (the colour it follows, the light one for dark mode) faded, and the picker's Clear goes back to it.
 */
function ColorSwatch({ label, value, same, onChange, disabled, size = 'md' }: { label: string; value: string | null; same?: string; onChange: (value: string | null) => void; disabled?: boolean; size?: 'sm' | 'md' }) {
  const { engine } = useStyling()
  const [open, setOpen] = useState(false)
  const drawn = (color: string) => lightDark(engine ? engine.resolve(color) : color).light
  const shown = value ?? same ?? 'transparent'
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      className="!p-0"
      trigger={
        <Pressable compact aria-label={label} title={`${label} · ${value ?? t('Same')}`} disabled={disabled} className={cn('relative shrink-0 rounded-sm outline-offset-2 data-[popup-open]:ring-2 data-[popup-open]:ring-focus', size === 'md' ? 'size-7' : 'size-6')}>
          <Swatch color={drawn(shown)} className={cn('!size-full !rounded-sm', value === null && 'opacity-35')} />
        </Pressable>
      }
    >
      <ColorPicker label={label} value={value ?? undefined} onChange={onChange} />
    </Popover>
  )
}

/** One shade of the palette, a swatch that opens its colour; a shade changed and not yet saved carries a dot. */
function PaletteSwatch({ edit, row }: { edit: Editing; row: Row }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      className="!p-0"
      trigger={
        <Pressable compact aria-label={row.key} title={row.key} disabled={edit.readOnly} className="relative h-6 rounded-xs outline-offset-1 hover:z-raised hover:ring-2 hover:ring-float data-[popup-open]:z-raised data-[popup-open]:ring-2 data-[popup-open]:ring-focus" style={{ background: lightDark(row.value).light }}>
          <span className="cms-swatch-edge" />
          {changed(edit, row.name) && <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-edge" aria-hidden />}
        </Pressable>
      }
    >
      <ColorPicker label={row.key} value={row.value} onChange={(value) => (value === null ? revert(edit, row.name) : edit.change((sheet) => sheet.setVariable(row.name, value)))} />
    </Popover>
  )
}

/** A scheme written whole: its two colours, and the kernel's `scheme`, which makes everything inside follow them. */
const writeScheme = (sheet: Stylesheet, name: string, background: string, text: string) => sheet.writeUtility(name, [{ name: '--scheme', value: background }, { name: '--scheme-text', value: text }], ['scheme'])

/**
 * Colour schemes: a section, a box or a card in colours of its own, its text, lines and buttons following. Each is a
 * card in its colours, with its background and its text to change; a block takes one under Add Style, where the
 * same tile stands beside its name.
 */
function Schemes({ edit }: { edit: Editing }) {
  const { engine } = useStyling()
  const schemes = schemesOf(edit.sheet)
  const drawn = (value: string) => {
    const sides = lightDark(engine ? engine.resolve(value) : value)
    return edit.mode === 'dark' ? sides.dark ?? sides.light : sides.light
  }
  const add = async () => {
    const asked = await prompt({ title: t('New Scheme'), fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, required: true, placeholder: 'ocean' }], confirm: t('Add Scheme') })
    const key = clean(asked?.name)
    if (!key) return
    if (schemes.some((scheme) => scheme.key === key)) return void toast.error(t('“{name}” already exists', { name: key }))
    edit.change((sheet) => writeScheme(sheet, `${SCHEME}${key}`, 'var(--color-foreground)', 'var(--color-background)'))
  }
  const rename = async (scheme: Scheme) => {
    const asked = await prompt({ title: t('Rename'), fields: [{ handle: 'name', type: 'text', label: t('Name'), mono: true, autofocus: true, required: true }], values: { name: scheme.key }, confirm: t('Rename') })
    const key = clean(asked?.name)
    if (!key || key === scheme.key) return
    if (schemes.some((other) => other.key === key)) return void toast.error(t('“{name}” already exists', { name: key }))
    edit.change((sheet) => sheet.renameUtility(scheme.name, `${SCHEME}${key}`))
  }
  return (
    <Group plain title={t('Schemes')} onAdd={edit.readOnly ? undefined : () => void add()} addLabel={t('Add Scheme')}>
      {schemes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {schemes.map((scheme) => (
            <div key={scheme.name} className="cms-reveal-row group min-w-0">
              <SchemeTile size="card" background={drawn(scheme.background)} text={drawn(scheme.text)} />
              <div className="flex h-9 items-center gap-1.5">
                <Tooltip content={t('Copy Name')}>
                  <Button variant="ghost" size="xs" onClick={() => void copyText(scheme.name, { copied: t('Copied {reference}', { reference: scheme.name }) })} className="min-w-0 flex-1 shrink !justify-start !bg-transparent !px-0 !text-sm !font-normal !text-text hover:!text-ink">
                    <span className="truncate">{scheme.key}</span>
                  </Button>
                </Tooltip>
                <Changed on={(edit.sheet.utilityProperties(scheme.name).map((p) => p.value).join() !== edit.saved.utilityProperties(scheme.name).map((p) => p.value).join())} />
                <ColorSwatch size="sm" label={t('{name} Background', { name: scheme.key })} value={scheme.background} disabled={edit.readOnly} onChange={(value) => value && edit.change((sheet) => writeScheme(sheet, scheme.name, value, scheme.text))} />
                <ColorSwatch size="sm" label={t('{name} Text', { name: scheme.key })} value={scheme.text} disabled={edit.readOnly} onChange={(value) => value && edit.change((sheet) => writeScheme(sheet, scheme.name, scheme.background, value))} />
                {edit.readOnly ? <NoAction /> : (
                  <Menu
                    trigger={<IconButton icon="more" label={t('Actions')} size="xs" className={rowAction} />}
                    items={[
                      { label: t('Rename…'), icon: 'edit', onSelect: () => void rename(scheme) },
                      { separator: true, label: '' },
                      { label: t('Delete'), icon: 'trash', danger: true, onSelect: () => edit.change((sheet) => sheet.removeUtility(scheme.name)) },
                    ]}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Group>
  )
}

/**
 * The site's colours, each a swatch for light mode and one for dark (written light-dark(light, dark): a site with
 * one follows the visitor's light or dark mode), then its schemes, then Tailwind's palette, shade by shade.
 */
export function Colors({ edit }: { edit: Editing }) {
  const kind: Kind = { prefix: '--color-', title: t('Site Colors'), add: t('Add Color'), fresh: t('New Color'), start: NEW_COLOR, placeholder: 'brand' }
  const menu = useRowMenu(edit, kind)
  const all = rowsOf(edit, kind.prefix)
  // Tailwind's palette, shade by shade: what the CMS brings and the site's own come first.
  const palette = (row: Row) => row.builtIn && edit.palette.has(row.name)
  const own = all.filter((row) => !palette(row))
  const families = new Map<string, Row[]>()
  for (const row of all.filter(palette)) {
    const family = SHADE.exec(row.key)?.[1]
    if (family) families.set(family, [...(families.get(family) ?? []), row])
  }
  const add = async () => {
    const key = await askName(edit, kind.prefix, kind.fresh, kind.add, '', kind.placeholder)
    if (key) edit.change((sheet) => sheet.setVariable(`${kind.prefix}${key}`, kind.start))
  }
  const write = (row: Row, light: string, dark: string | undefined) => edit.change((sheet) => sheet.setVariable(row.name, dark && dark !== light ? `light-dark(${light}, ${dark})` : light))
  return (
    <>
      {/* The head names the columns, light and dark, over the swatches; the + stands over the rows' menus. */}
      <Group
        title={kind.title}
        action={<>
          <span className="grid w-7 place-items-center text-faint" title={t('Light')}><Icon name="sun" size={13} /></span>
          <span className="grid w-7 place-items-center text-faint" title={t('Dark')}><Icon name="moon" size={13} /></span>
          {edit.readOnly && <NoAction />}
        </>}
        onAdd={edit.readOnly ? undefined : () => void add()}
        addLabel={kind.add}
      >
        {own.map((row) => {
          const { light, dark } = lightDark(row.value)
          return (
            <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} wide menu={menu(row)}>
              <ColorSwatch label={t('{name} in Light Mode', { name: row.key })} value={light} disabled={edit.readOnly} onChange={(value) => value && write(row, value, dark)} />
              <ColorSwatch label={t('{name} in Dark Mode', { name: row.key })} value={dark ?? null} same={light} disabled={edit.readOnly} onChange={(value) => write(row, light, value ?? undefined)} />
            </TokenRow>
          )
        })}
      </Group>
      <Schemes edit={edit} />
      {families.size > 0 && (
        <Group plain title={t('Palette')}>
          <PaletteGrid head className="pb-3" families={[...families].map(([name, shades]) => ({ name, shades }))} cell={(row) => <PaletteSwatch key={row.name} edit={edit} row={row} />} />
        </Group>
      )}
    </>
  )
}

/** The weights a family's files cover, short: 400, 400–700, 100–900; and Italic when it has italics. */
function styles(files: Face[]): string {
  const weights = files.flatMap((font) => String(font.weight ?? '400').split(/\s+/).map(Number)).filter((n) => n > 0)
  const low = Math.min(...weights)
  const high = Math.max(...weights)
  const range = weights.length === 0 ? '400' : low === high ? String(low) : `${low}–${high}`
  return files.some((font) => font.style === 'italic') ? `${range} · ${t('Italic')}` : range
}

/** A sample line of a size, up to what the column can show. */
const sizeSample = (value: string, font: string | undefined) => <p className="m-0 truncate pb-2.5 text-ink" style={{ fontSize: `min(${value}, 2.75rem)`, lineHeight: 1.1, fontFamily: font }}>{t('Ship It')}</p>

/** The fonts of the theme, each picking or adding the font it uses; then every scale of type. */
export function Typography({ edit, fonts }: { edit: Editing; fonts: FontTools }) {
  const families = [...new Set(fonts.faces.map((font) => font.family))]
  const used = new Set(rowsOf(edit, '--font-', (key) => key.startsWith('weight-')).map((row) => familyOf(fontStack(row.value))))
  const served: SiteFont[] = families.map((family) => {
    const files = fonts.faces.filter((font) => font.family === family)
    return { family, styles: styles(files), fallback: files.some((font) => (Array.isArray(font.fallback) ? font.fallback.length > 0 : !!font.fallback)), used: used.has(family) }
  })
  const system = stackFor('', 'sans', false)
  const display = edit.sheet.variable('--font-sans') ?? edit.defaults.get('--font-sans')
  const fallbacks = (): [Fallback, string][] => [['sans', t('Sans')], ['serif', t('Serif')], ['mono', t('Mono')]]
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--font-', title: t('Fonts'), add: t('Add Font Family'), fresh: t('New Font Family'), start: system, placeholder: 'display', skip: (key) => key.startsWith('weight-') }}
        row={(row, set, menu) => {
          const stack = fontStack(row.value)
          const family = familyOf(stack)
          const files = fonts.faces.filter((font) => font.family === family)
          const preloaded = files.some((font) => font.preload)
          return (
            <TokenRow
              key={row.name}
              name={row.key}
              changed={changed(edit, row.name)}
              sample={<span className="block max-w-7 overflow-hidden whitespace-nowrap text-center text-lg leading-none text-ink" style={{ fontFamily: row.value }}>Aa</span>}
              menu={menu([
                { heading: true, label: t('Fallback') },
                ...fallbacks().map(([value, label]) => ({ label, checked: fallbackOf(stack) === value, onSelect: () => set(stackFor(family, value, stack.includes(`${family} Fallback`))) })),
                // A font the first screen is written in is fetched with the page instead of when the CSS asks for it.
                ...(files.length ? [{ separator: true, label: '' }, { label: t('Preload'), checked: preloaded, onSelect: () => fonts.preload(family, !preloaded) }] : []),
              ])}
            >
              <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={{ component: 'site-font-stack', fonts: served, ...(edit.readOnly ? {} : { onAdd: fonts.add, onRemove: fonts.remove }) }} onChange={set} />
            </TokenRow>
          )
        }}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--text-', title: t('Text Sizes'), add: t('Add Text Size'), fresh: t('New Text Size'), start: '1.25rem', placeholder: 'lead', skip: (key) => key.startsWith('shadow-') }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} below={sizeSample(row.value, display)}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={SIZE} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--leading-', title: t('Line Heights'), add: t('Add Line Height'), fresh: t('New Line Height'), start: '1.5', placeholder: 'airy' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<span className="flex w-4 flex-col" style={{ gap: `${Math.max(1, (Number(row.value) - 0.8) * 6)}px` }}>{[0, 1, 2].map((i) => <span key={i} className={cn('h-0.5 rounded-full bg-muted', i === 2 && 'w-2/3')} />)}</span>}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={number('', { step: 0.05, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--tracking-', title: t('Letter Spacing'), add: t('Add Letter Spacing'), fresh: t('New Letter Spacing'), start: '0em', placeholder: 'loose' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<span className="text-xs font-medium text-ink" style={{ letterSpacing: row.value }}>Aa</span>}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={number('em', { units: ['em', 'px'], step: 0.005 })} onChange={set} />
          </TokenRow>
        )}
      />
    </>
  )
}

/** A length row of the theme: a size that may grow with the screen. */
const sizeRow = (edit: Editing, field: Partial<FieldDef> = SIZE) => (row: Row, set: (value: string | null) => void, menu: (extra?: MenuItemDef[]) => MenuItemDef[]) => (
  <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()}>
    <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={field} onChange={set} />
  </TokenRow>
)

/** The three sizes buttons and fields share, each a height, the room inside it and the size of its text. */
function ControlSizes({ edit }: { edit: Editing }) {
  const sizes: [string, string][] = [['sm', t('Small')], ['md', t('Medium')], ['lg', t('Large')]]
  const parts: [string, string][] = [['height', t('Height')], ['padding', t('Padding')], ['text', t('Text')]]
  const value = (name: string) => edit.sheet.variable(name) ?? edit.defaults.get(name) ?? null
  const cell = 'w-24 shrink-0 max-sm:min-w-0 max-sm:flex-1'
  return (
    <Group title={t('Buttons and Fields')}>
      <div className="flex min-h-8 items-center gap-2 px-3 text-2xs text-faint">
        <span className="min-w-0 flex-1" />
        {parts.map(([part, label]) => <span key={part} className={cell}>{label}</span>)}
        <span className="size-6 shrink-0" />
      </div>
      {sizes.map(([size, label]) => {
        const names = parts.map(([part]) => `--control-${size}-${part}`)
        const unsaved = changed(edit, ...names)
        return (
          <div key={size} className={cn(ROW, 'flex min-h-10 items-center gap-2 py-1.5')}>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm text-text"><span className="truncate">{label}</span><Changed on={unsaved} /></span>
            {parts.map(([part, partLabel], i) => (
              <div key={part} className={cell}>
                <Control handle={names[i]} label={`${label} ${partLabel}`} value={value(names[i])} disabled={edit.readOnly} field={number('rem', { units: ['rem', 'px'], step: 0.125, min: 0 })} onChange={(next) => next !== null && edit.change((sheet) => sheet.setVariable(names[i], next))} />
              </div>
            ))}
            {unsaved && !edit.readOnly ? (
              <Tooltip content={t('Revert')}>
                <IconButton icon="undo" size="xs" label={t('Revert')} title={undefined} className="shrink-0" onClick={() => revert(edit, ...names)} />
              </Tooltip>
            ) : <NoAction />}
          </div>
        )
      })}
    </Group>
  )
}

/** A length in pixels, at the browser's 16px root: what the spacing control shows. */
function pixels(value: string): number | null {
  const m = /^(-?[\d.]+)(rem|px)$/.exec(value.trim())
  return m ? Number(m[1]) * (m[2] === 'rem' ? 16 : 1) : null
}

/** The scale the step makes, as the spacing control offers it: each step's size, drawn and in pixels. */
function SpacingScale({ step }: { step: string }) {
  const base = pixels(step)
  if (base === null) return null
  return (
    <div className="flex items-end gap-1.5 pb-3 pt-1" aria-hidden>
      {SPACING_STEPS.filter((n) => n > 0).map((n) => {
        const px = +(base * n).toFixed(2)
        return (
          <span key={n} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={`${n} · ${px}px`}>
            <span className="w-full rounded-xs bg-active" style={{ height: Math.max(2, Math.min(px, 128) / 2) }} />
            <span className="text-2xs tabular-nums text-faint">{px}</span>
          </span>
        )
      })}
    </div>
  )
}

/** Spacing (one step of Tailwind's scale, and the spaces the site names), the widths of containers, the screen sizes, and the sizes buttons and fields share. */
export function Layout({ edit }: { edit: Editing }) {
  const spacing: Kind = { prefix: '--spacing-', title: t('Spacing'), add: t('Add Spacing'), fresh: t('New Spacing'), start: '2rem', placeholder: 'gutter' }
  const menu = useRowMenu(edit, spacing)
  const step = edit.sheet.variable('--spacing')
  const add = async () => {
    const key = await askName(edit, spacing.prefix, spacing.fresh, spacing.add, '', spacing.placeholder)
    if (key) edit.change((sheet) => sheet.setVariable(`${spacing.prefix}${key}`, spacing.start))
  }
  // Tailwind's scale is counted in steps (p-4 is four of them): the step is its row "1".
  const scale: Row = { name: '--spacing', key: '1', value: step ?? edit.defaults.get('--spacing') ?? '0.25rem', builtIn: true, written: step !== undefined }
  return (
    <>
      <Group title={spacing.title} onAdd={edit.readOnly ? undefined : () => void add()} addLabel={spacing.add}>
        <TokenRow name={scale.key} copy={scale.name} changed={changed(edit, scale.name)} menu={menu(scale)} below={<SpacingScale step={scale.value} />}>
          <Control handle="--spacing" label={scale.key} value={scale.value} disabled={edit.readOnly} field={SIZE} onChange={(value) => value !== null && edit.change((sheet) => sheet.setVariable('--spacing', value))} />
        </TokenRow>
        {rowsOf(edit, spacing.prefix).map((row) => sizeRow(edit)(row, (value) => value !== null && edit.change((sheet) => sheet.setVariable(row.name, value)), (extra) => menu(row, extra)))}
      </Group>
      <Tokens edit={edit} kind={{ prefix: '--container-', title: t('Containers'), add: t('Add Container'), fresh: t('New Container'), start: '72rem', placeholder: 'content' }} row={sizeRow(edit)} />
      <Tokens edit={edit} kind={{ prefix: '--breakpoint-', title: t('Breakpoints'), add: t('Add Breakpoint'), fresh: t('New Breakpoint'), start: '120rem', placeholder: '3xl' }} row={sizeRow(edit, LENGTH)} />
      <ControlSizes edit={edit} />
    </>
  )
}

/** Corners, shadows of every kind, blur and perspective. */
export function Effects({ edit }: { edit: Editing }) {
  const shadow = (kind: string) => (row: Row, set: (value: string | null) => void, menu: (extra?: MenuItemDef[]) => MenuItemDef[]) => (
    <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<ShadowSample value={row.value} kind={kind} />}>
      <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={{ component: 'site-shadow', kind }} onChange={set} />
    </TokenRow>
  )
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--radius-', title: t('Corners'), add: t('Add Radius'), fresh: t('New Radius'), start: '0.5rem', placeholder: 'card' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<span className="size-5 translate-x-0.5 translate-y-0.5 border-l-[1.5px] border-t-[1.5px] border-muted" style={{ borderTopLeftRadius: `min(${row.value}, 20px)` }} />}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={number('rem', { units: ['rem', 'px', '%'], step: 0.125, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens edit={edit} kind={{ prefix: '--shadow-', title: t('Shadows'), add: t('Add Shadow'), fresh: t('New Shadow'), start: '0 4px 16px -4px rgb(0 0 0 / 0.12)', placeholder: 'card' }} row={shadow('box')} />
      <Tokens edit={edit} kind={{ prefix: '--inset-shadow-', title: t('Inset Shadows'), add: t('Add Inset Shadow'), fresh: t('New Inset Shadow'), start: 'inset 0 2px 4px rgb(0 0 0 / 0.08)', placeholder: 'well' }} row={shadow('box')} />
      <Tokens edit={edit} kind={{ prefix: '--drop-shadow-', title: t('Drop Shadows'), add: t('Add Drop Shadow'), fresh: t('New Drop Shadow'), start: '0 4px 8px rgb(0 0 0 / 0.12)', placeholder: 'lifted' }} row={shadow('drop')} />
      <Tokens edit={edit} kind={{ prefix: '--text-shadow-', title: t('Text Shadows'), add: t('Add Text Shadow'), fresh: t('New Text Shadow'), start: '0 1px 2px rgb(0 0 0 / 0.2)', placeholder: 'glow' }} row={shadow('text')} />
      <Tokens
        edit={edit}
        kind={{ prefix: '--blur-', title: t('Blur'), add: t('Add Blur'), fresh: t('New Blur'), start: '6px', placeholder: 'soft' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<span className="size-3 rounded-full bg-muted" style={{ filter: `blur(min(${row.value}, 6px))` }} />}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={number('px', { units: ['px', 'rem'], step: 1, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens edit={edit} kind={{ prefix: '--perspective-', title: t('Perspective'), add: t('Add Perspective'), fresh: t('New Perspective'), start: '800px', placeholder: 'deep' }} row={sizeRow(edit, number('px', { units: ['px', 'rem'], step: 10, min: 0 }))} />
    </>
  )
}

/** A duration typed in the inspector's control (`250ms`, `0.3s`) in seconds, as the page transition stores it. */
function seconds(value: unknown, fallback: number): number {
  const m = String(value ?? '').trim().match(/^(\d*\.?\d+)\s*(ms|s)?$/)
  if (!m) return fallback
  const n = m[2] === 's' ? Number(m[1]) : Number(m[1]) / 1000
  return Math.min(2, Math.max(0.05, Math.round(n * 1000) / 1000))
}

/** Easing curves and animations, what a transition takes when a class says nothing else, and how one page gives way to the next. */
export function Motion({ edit, transition, saved, onTransition }: { edit: Editing; transition: Transition; saved: Transition; onTransition: (transition: Transition) => void }) {
  const setting = (name: string, value: string | null) => edit.change((sheet) => sheet.setVariable(name, value))
  const fallback = (name: string) => edit.sheet.variable(name) ?? edit.defaults.get(name) ?? null
  const back = (name: string) => (changed(edit, name) && !edit.readOnly ? <Tooltip content={t('Revert')}><IconButton icon="undo" size="xs" label={t('Revert')} title={undefined} onClick={() => revert(edit, name)} /></Tooltip> : undefined)
  return (
    <>
      <Tokens
        edit={edit}
        kind={{ prefix: '--ease-', title: t('Easings'), add: t('Add Easing'), fresh: t('New Easing'), start: 'cubic-bezier(0.2, 0.8, 0.2, 1)', placeholder: 'snap' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={{ component: 'ease' }} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--duration-', title: t('Durations'), add: t('Add Duration'), fresh: t('New Duration'), start: '300ms', placeholder: 'slow' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={number('ms', { units: ['ms', 's'], step: 50, min: 0 })} onChange={set} />
          </TokenRow>
        )}
      />
      <Tokens
        edit={edit}
        kind={{ prefix: '--animate-', title: t('Animations'), add: t('Add Animation'), fresh: t('New Animation'), start: 'spin 2s linear infinite', placeholder: 'float' }}
        row={(row, set, menu) => (
          <TokenRow key={row.name} name={row.key} changed={changed(edit, row.name)} menu={menu()} sample={<AnimationSample value={row.value} keyframes={edit.keyframes} />}>
            <Control handle={row.name} label={row.key} value={row.value} disabled={edit.readOnly} field={{ component: 'site-animation', keyframes: edit.keyframes }} onChange={set} />
          </TokenRow>
        )}
      />
      <Group title={t('Transitions')}>
        <Setting label={t('Duration')} changed={changed(edit, '--default-transition-duration')} action={back('--default-transition-duration')}>
          <Control handle="--default-transition-duration" label={t('Duration')} value={fallback('--default-transition-duration')} disabled={edit.readOnly} field={number('ms', { units: ['ms', 's'], step: 10, min: 0 })} onChange={(value) => value && setting('--default-transition-duration', value)} />
        </Setting>
        <Setting label={t('Easing')} changed={changed(edit, '--default-transition-timing-function')} action={back('--default-transition-timing-function')}>
          <Control handle="--default-transition-timing-function" label={t('Easing')} value={fallback('--default-transition-timing-function')} disabled={edit.readOnly} field={{ component: 'ease' }} onChange={(value) => value && setting('--default-transition-timing-function', value)} />
        </Setting>
      </Group>
      <Group title={t('Page Transition')}>
        <Setting label={t('Effect')} changed={transition.type !== saved.type}>
          <Control handle="type" label={t('Effect')} value={transition.type} disabled={edit.readOnly} field={{ type: 'select', mono: false, required: true, options: { none: t('None'), fade: t('Fade'), slide: t('Slide'), scale: t('Scale') } }} onChange={(value) => onTransition({ ...transition, type: (value ?? 'none') as Transition['type'] })} />
        </Setting>
        {transition.type !== 'none' && (
          <Setting label={t('Duration')} changed={transition.duration !== saved.duration}>
            <Control handle="duration" label={t('Duration')} value={`${Math.round(transition.duration * 1000)}ms`} disabled={edit.readOnly} field={number('ms', { units: ['ms'], step: 10, min: 50, max: 2000 })} onChange={(value) => onTransition({ ...transition, duration: seconds(value, transition.duration) })} />
          </Setting>
        )}
        <Setting label={t('Page Loads')} changed={transition.navigation !== saved.navigation}>
          <Control handle="navigation" label={t('Page Loads')} value={transition.navigation} disabled={edit.readOnly} field={{ type: 'select', mono: false, required: true, options: { document: t('Full Page'), client: t('Instant') } }} onChange={(value) => onTransition({ ...transition, navigation: value === 'client' ? 'client' : 'document' })} />
        </Setting>
      </Group>
    </>
  )
}
