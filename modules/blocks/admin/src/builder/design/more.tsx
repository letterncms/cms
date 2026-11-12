import { t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Button, Fields, Icon, IconButton, Menu, Popover, type MenuItemDef } from '@letterncms/ui'
import { AddRow } from '../controls'
import { useState, type KeyboardEvent, type ReactElement, type ReactNode } from 'react'
import { Section } from '../controls'
import type { StyleApi } from '../useStyle'
import { StyleFields, type StyleField } from './StyleFields'

/** CSS keywords as choices: the value is what the list shows. */
const choice = (label: string, values: string[], placeholder = values[0]): Partial<FieldDef> => ({ label, type: 'select', size: 'sm', placeholder, options: values.map((value) => ({ value, label: value })) })
const length = (label: string, extra: Partial<FieldDef> = {}): Partial<FieldDef> => ({ label, type: 'text', component: 'blocks-value', unit: 'px', units: ['px', 'rem', 'em', '%'], placeholder: '0', ...extra })
const number = (label: string, extra: Partial<FieldDef> = {}): Partial<FieldDef> => ({ label, type: 'text', component: 'blocks-value', unit: '', placeholder: '0', ...extra })
const color = (label: string): Partial<FieldDef> => ({ label, type: 'color', component: 'blocks-color', placeholder: t('None') })
const value = (label: string, placeholder = ''): Partial<FieldDef> => ({ label, type: 'text', size: 'sm', commit: 'blur', mono: true, placeholder })

const BLEND = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']

/**
 * The properties the Design tab's panels have no row of their own for, each with its
 * own control, by the panel it belongs to (`item`: Stack or Grid Item). A section's +
 * adds one. Labels are the properties' own names.
 */
export function moreStyles(): Record<string, { group: string; field: Partial<FieldDef> }> {
  const of = (group: string, fields: Record<string, Partial<FieldDef>>) => Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, { group, field }]))
  return {
    ...of('layout', {
      alignContent: choice(t('Align Content'), ['normal', 'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly', 'stretch']),
      placeItems: value(t('Place Items'), 'center'),
      placeContent: value(t('Place Content'), 'center'),
      gridTemplateAreas: value(t('Grid Areas'), '"a b" "c c"'),
      gridAutoColumns: value(t('Auto Columns'), 'auto'),
      gridAutoRows: value(t('Auto Rows'), 'auto'),
      columns: number(t('Columns'), { placeholder: t('Auto'), min: 1 }),
      columnRule: value(t('Column Rule'), '1px solid'),
      boxSizing: choice(t('Box Sizing'), ['border-box', 'content-box']),
      float: choice(t('Float||CSS property'), ['none', 'left', 'right']),
      clear: choice(t('Clear||CSS property'), ['none', 'left', 'right', 'both']),
      containerType: choice(t('Container Type'), ['normal', 'inline-size', 'size']),
    }),
    ...of('item', {
      justifySelf: choice(t('Justify Self'), ['auto', 'start', 'center', 'end', 'stretch']),
      placeSelf: value(t('Place Self'), 'center'),
      gridArea: value(t('Grid Area'), 'a'),
      flexGrow: number(t('Flex Grow'), { min: 0 }),
      flexShrink: number(t('Flex Shrink'), { placeholder: '1', min: 0 }),
      flexBasis: length(t('Flex Basis'), { placeholder: t('Auto') }),
    }),
    ...of('position', {
      inset: length(t('Inset'), { placeholder: t('Auto') }),
    }),
    ...of('size', {
      overflowX: choice(t('Overflow X'), ['visible', 'hidden', 'clip', 'scroll', 'auto']),
      overflowY: choice(t('Overflow Y'), ['visible', 'hidden', 'clip', 'scroll', 'auto']),
      overscrollBehavior: choice(t('Overscroll'), ['auto', 'contain', 'none']),
      scrollSnapType: choice(t('Snap Type'), ['none', 'x mandatory', 'x proximity', 'y mandatory', 'y proximity', 'both mandatory']),
      scrollSnapAlign: choice(t('Snap Align'), ['none', 'start', 'center', 'end']),
      scrollMarginTop: length(t('Scroll Margin')),
      scrollPadding: length(t('Scroll Padding')),
      scrollbarWidth: choice(t('Scrollbar'), ['auto', 'thin', 'none']),
    }),
    ...of('typography', {
      textDecorationColor: color(t('Decoration Color')),
      textDecorationThickness: length(t('Line Thickness'), { placeholder: t('Auto') }),
      textUnderlineOffset: length(t('Underline Offset'), { unit: 'em', units: ['em', 'px'], step: 0.05, placeholder: t('Auto') }),
      whiteSpace: choice(t('White Space'), ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces']),
      wordBreak: choice(t('Word Break'), ['normal', 'break-all', 'keep-all', 'break-word']),
      overflowWrap: choice(t('Overflow Wrap'), ['normal', 'anywhere', 'break-word']),
      hyphens: choice(t('Hyphens'), ['manual', 'auto', 'none']),
      textIndent: length(t('Indent'), { unit: 'em', units: ['em', 'px', 'rem'] }),
      textOverflow: choice(t('Text Overflow'), ['clip', 'ellipsis']),
      fontVariantNumeric: choice(t('Numbers'), ['normal', 'tabular-nums', 'proportional-nums', 'lining-nums', 'oldstyle-nums', 'slashed-zero']),
      fontFeatureSettings: value(t('Font Features'), '"ss01"'),
      fontVariationSettings: value(t('Font Variations'), '"wght" 500'),
      listStyle: choice(t('List Style'), ['none', 'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman']),
      verticalAlign: choice(t('Vertical Align'), ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super']),
    }),
    ...of('fill', {
      background: value(t('Background'), 'none'),
      backgroundBlendMode: choice(t('Blend Mode'), BLEND),
    }),
    ...of('effects', {
      userSelect: choice(t('User Select'), ['auto', 'none', 'text', 'all']),
      visibility: choice(t('Visibility'), ['visible', 'hidden', 'collapse']),
      maskImage: value(t('Mask Image'), 'linear-gradient(black, transparent)'),
      accentColor: color(t('Accent Color')),
      fill: color(t('Fill')),
      stroke: color(t('Stroke')),
      strokeWidth: length(t('Stroke Width')),
      content: value(t('Content'), '""'),
    }),
    ...of('transform', {
      perspectiveOrigin: value(t('Vanishing Point'), 'center'),
      transformStyle: choice(t('Transform Style'), ['flat', 'preserve-3d']),
      backfaceVisibility: choice(t('Backface'), ['visible', 'hidden']),
    }),
    ...of('transition', {
      transitionProperty: value(t('Property'), 'all'),
      transitionDuration: value(t('Duration'), '200ms'),
      transitionTimingFunction: value(t('Easing'), 'ease'),
      transitionDelay: value(t('Delay'), '0ms'),
      willChange: value(t('Will Change'), 'auto'),
    }),
  }
}

/** Properties the inspector has rows for, as the Design offers them for an element's or a button's style. */
function designStyles(): Record<string, Partial<FieldDef>> {
  return {
    display: choice(t('Display'), ['block', 'inline', 'inline-block', 'flex', 'grid', 'none']),
    width: length(t('Width'), { unit: 'rem', units: ['rem', 'px', '%', 'ch'], placeholder: t('Auto') }),
    maxWidth: length(t('Max Width'), { unit: 'rem', units: ['rem', 'px', '%', 'ch'], placeholder: t('None') }),
    textAlign: choice(t('Align'), ['left', 'center', 'right', 'justify']),
    fontStyle: choice(t('Style'), ['normal', 'italic']),
    textTransform: choice(t('Case'), ['none', 'uppercase', 'lowercase', 'capitalize']),
    textDecoration: choice(t('Decoration'), ['none', 'underline', 'line-through', 'overline']),
    textWrap: choice(t('Wrap'), ['wrap', 'balance', 'pretty', 'nowrap']),
    textShadow: value(t('Text Shadow'), '0 1px 2px rgb(0 0 0 / 0.2)'),
    boxShadow: value(t('Shadow'), '0 4px 16px rgb(0 0 0 / 0.1)'),
    opacity: number(t('Opacity'), { percent: true, step: 0.05, min: 0, max: 1, placeholder: '100' }),
    borderStyle: choice(t('Border Style'), ['solid', 'dashed', 'dotted', 'double', 'none']),
    borderTop: value(t('Border Top'), '1px solid'),
    borderRight: value(t('Border Right'), '1px solid'),
    borderBottom: value(t('Border Bottom'), '1px solid'),
    borderLeft: value(t('Border Left'), '1px solid'),
    paddingTop: length(t('Padding Top'), { unit: 'rem' }),
    paddingRight: length(t('Padding Right'), { unit: 'rem' }),
    paddingBottom: length(t('Padding Bottom'), { unit: 'rem' }),
    paddingLeft: length(t('Padding Left'), { unit: 'rem' }),
    marginBlock: length(t('Margin Block'), { unit: 'rem' }),
    marginInline: length(t('Margin Inline'), { unit: 'rem' }),
  }
}

/** A property's control: its own, or a plain value for one stored that has none. */
function fieldOf(property: string, more = moreStyles()): FieldDef {
  const words = property.replace(/([A-Z])/g, ' $1')
  return { handle: property, type: 'text', size: 'sm', commit: 'blur', mono: true, label: words.charAt(0).toUpperCase() + words.slice(1), ...(more[property]?.field ?? designStyles()[property]) } as FieldDef
}

/** The + that adds one of `properties` (by its name, or its label in `labels`), in their order, searched as you type. */
export function AddStyle({ properties, labels = {}, onPick, label = t('Add a Property'), children }: { properties: string[]; labels?: Record<string, string>; onPick: (property: string) => void; label?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const more = moreStyles()
  const q = query.trim().toLowerCase()
  const options = properties.map((property) => ({ property, label: labels[property] ?? String(fieldOf(property, more).label) })).filter((o) => !q || o.label.toLowerCase().includes(q) || o.property.toLowerCase().includes(q.replace(/[\s-]/g, '')))
  const pick = (property: string | undefined) => {
    if (!property) return
    setOpen(false)
    onPick(property)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, Math.min(options.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      pick(options[active]?.property)
    }
  }
  if (properties.length === 0) return null
  return (
    <Popover
      open={open}
      onOpenChange={(next) => { setOpen(next); setQuery(''); setActive(0) }}
      align="end"
      className="flex w-60 flex-col overflow-hidden !p-0"
      trigger={(children as ReactElement | undefined) ?? <IconButton icon="plus" size="xs" label={label} />}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <Icon name="search" size={14} className="shrink-0 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKey}
          placeholder={t('Search')}
          aria-label={t('Search')}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
        />
      </div>
      <div role="listbox" aria-label={label} className="max-h-64 overflow-y-auto overscroll-contain p-1">
        {options.length === 0 && <p className="m-0 px-2 py-3 text-sm text-muted">{t('No matches')}</p>}
        {options.map((o, i) => (
          <Button key={o.property} variant="ghost" role="option" aria-selected={i === active} tabIndex={-1} onMouseEnter={() => setActive(i)} onClick={() => pick(o.property)} data-active={i === active || undefined} className="w-full !justify-start !rounded-xs !px-2 text-left !font-normal">
            {o.label}
          </Button>
        ))}
      </div>
    </Popover>
  )
}

/** Properties in the order of their names. */
const byLabel = (properties: string[], more = moreStyles()) => [...properties].sort((a, b) => String(fieldOf(a, more).label).localeCompare(String(fieldOf(b, more).label)))

/**
 * A Design tab panel: its own rows, then the rest of its group's properties that are set
 * (or just added), each with its control. Its + adds one; clicking a row's label clears it.
 */
export function StyleSection({ s, group, title, open, empty, children }: { s: StyleApi; group: string; title: string; open?: boolean; empty?: boolean; children: ReactNode }) {
  const [adding, setAdding] = useState<string | null>(null)
  const more = moreStyles()
  const mine = Object.keys(more).filter((key) => more[key].group === group)
  const shown = mine.filter((key) => s.value(key) !== undefined || key === adding)
  return (
    <Section title={title} open={open} empty={empty && shown.length === 0} fields actions={<AddStyle properties={byLabel(mine.filter((key) => !shown.includes(key)), more)} onPick={setAdding} />}>
      {children}
      {shown.length > 0 && <StyleFields s={s} fields={shown.map((key) => ({ ...fieldOf(key, more), set: (v: unknown) => { if (key === adding) setAdding(null); s.set(key, v as string) } }) as StyleField)} />}
    </Section>
  )
}

/**
 * One row of a style in the Design: its field, inline, and a ⋯ menu at the end
 * (shown on hover) with what can be done to it. Every row keeps the menu's place, so
 * controls line up whether or not a row has one.
 */
export function StyleRow({ field, value, onChange, actions, disabled, bare }: { field: FieldDef; value: unknown; onChange: (value: unknown) => void; actions: MenuItemDef[]; disabled?: boolean; bare?: boolean }) {
  // A shadow list (`bare`) brings its own label and add button.
  return (
    <div className="group/row flex items-start gap-1">
      {/* The Design's label column, as its other rows (Page Transition, Prose spacing) have it. */}
      <Fields bare={bare} layout={bare ? undefined : 'inline'} labelWidth={120} className="min-w-0 flex-1" disabled={disabled} fields={[field]} values={{ [field.handle]: value ?? null }} onChange={(_, v) => onChange(v)} />
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center">
        {actions.length > 0 && !disabled && (
          <Menu
            trigger={<IconButton icon="more" label={t('Property Actions')} size="xs" className="opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100" />}
            items={actions}
          />
        )}
      </span>
    </div>
  )
}

/**
 * `blocks-more` — a style of the Design: only what it sets, row by row, each with
 * its control and a ⋯ menu to remove it, and a + that adds a property, its `controls`
 * (Font, Size, Margin…) first and then every other one. A new style starts empty.
 * `hidden` are properties drawn elsewhere. The value is the declarations.
 */
export function MoreStylesField({ field, value, onChange, disabled }: FieldProps<Record<string, string | number> | null>) {
  const decl = value ?? {}
  const [adding, setAdding] = useState<string | null>(null)
  const controls = (field.controls as FieldDef[] | undefined) ?? []
  const keysOf = (f: FieldDef) => ((f.fields as FieldDef[] | undefined) ?? [f]).map((sub) => sub.handle)
  const hidden = new Set([...((field.hidden as string[] | undefined) ?? []), ...controls.flatMap(keysOf)])
  const more = moreStyles()
  const write = (patch: Record<string, unknown>) => {
    const next: Record<string, string | number> = { ...decl }
    for (const [key, v] of Object.entries(patch)) {
      if (v === null || v === undefined || v === '') delete next[key]
      else next[key] = v as string | number
    }
    onChange(next)
  }
  // A control is a row while it sets something, or since it was just added.
  const setControls = controls.filter((control) => keysOf(control).some((key) => key in decl) || control.handle === adding)
  const extras = [...Object.keys(decl).filter((key) => !hidden.has(key)), ...(adding && !(adding in decl) && !controls.some((c) => c.handle === adding) ? [adding] : [])]
  // A style of the Design can take what has no control there: the panels' extra properties, and these the inspector has rows for.
  const others = [...Object.keys(more).filter((key) => more[key].group !== 'item' && more[key].group !== 'layout'), ...Object.keys(designStyles())].filter((key) => !hidden.has(key) && !extras.includes(key))
  const offered = [...controls.filter((control) => !setControls.includes(control)).map((control) => control.handle), ...byLabel(others, more)]
  const labels = Object.fromEntries(controls.map((control) => [control.handle, String(control.label)]))
  const removeAction = (keys: string[], handle: string): MenuItemDef[] => [{ label: t('Remove'), icon: 'trash', danger: true, onSelect: () => { if (handle === adding) setAdding(null); write(Object.fromEntries(keys.map((key) => [key, null]))) } }]
  return (
    <div className="space-y-1">
      {setControls.map((control) => {
        const keys = keysOf(control)
        const current = control.fields ? Object.fromEntries(keys.map((key) => [key, decl[key] ?? null])) : decl[control.handle]
        const change = (v: unknown) => {
          if (control.handle === adding) setAdding(null)
          write(control.fields ? Object.fromEntries(keys.map((key) => [key, (v as Record<string, unknown> | null)?.[key] ?? null])) : { [control.handle]: v })
        }
        const set = keys.some((key) => key in decl)
        return <StyleRow key={control.handle} field={{ ...control, status: set ? 'own' : undefined, reset: () => write(Object.fromEntries(keys.map((key) => [key, null]))) } as FieldDef} value={current} disabled={disabled} actions={removeAction(keys, control.handle)} bare={control.component === 'blocks-shadows'} onChange={change} />
      })}
      {extras.map((key) => (
        <StyleRow
          key={key}
          field={{ ...fieldOf(key, more), status: key in decl ? 'own' : undefined, reset: () => write({ [key]: null }) } as FieldDef}
          value={decl[key]}
          disabled={disabled}
          actions={removeAction([key], key)}
          onChange={(v) => {
            if (key === adding) setAdding(null)
            write({ [key]: v })
          }}
        />
      ))}
      {!disabled && offered.length > 0 && (
        <div className="flex h-8 items-center">
          <AddStyle properties={offered} labels={labels} onPick={setAdding}>
            <AddRow className="-ml-1.5 !w-auto">{t('Add a Property')}</AddRow>
          </AddStyle>
        </div>
      )}
    </div>
  )
}
