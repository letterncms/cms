import { t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { Fields, Icon, IconButton, Popover, cn } from '@letterncms/ui'
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
      gridTemplateAreas: value(t('Grid Template Areas'), '"a b" "c c"'),
      gridAutoColumns: value(t('Grid Auto Columns'), 'auto'),
      gridAutoRows: value(t('Grid Auto Rows'), 'auto'),
      columns: number(t('Columns'), { placeholder: t('Auto'), min: 1 }),
      columnRule: value(t('Column Rule'), '1px solid'),
      boxSizing: choice(t('Box Sizing'), ['border-box', 'content-box']),
      float: choice(t('Float'), ['none', 'left', 'right']),
      clear: choice(t('Clear'), ['none', 'left', 'right', 'both']),
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
      overscrollBehavior: choice(t('Overscroll Behavior'), ['auto', 'contain', 'none']),
      scrollSnapType: choice(t('Scroll Snap Type'), ['none', 'x mandatory', 'x proximity', 'y mandatory', 'y proximity', 'both mandatory']),
      scrollSnapAlign: choice(t('Scroll Snap Align'), ['none', 'start', 'center', 'end']),
      scrollMarginTop: length(t('Scroll Margin Top')),
      scrollPadding: length(t('Scroll Padding')),
      scrollbarWidth: choice(t('Scrollbar Width'), ['auto', 'thin', 'none']),
    }),
    ...of('typography', {
      textDecorationColor: color(t('Text Decoration Color')),
      textDecorationThickness: length(t('Text Decoration Thickness'), { placeholder: t('Auto') }),
      textUnderlineOffset: length(t('Text Underline Offset'), { unit: 'em', units: ['em', 'px'], step: 0.05, placeholder: t('Auto') }),
      whiteSpace: choice(t('White Space'), ['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'break-spaces']),
      wordBreak: choice(t('Word Break'), ['normal', 'break-all', 'keep-all', 'break-word']),
      overflowWrap: choice(t('Overflow Wrap'), ['normal', 'anywhere', 'break-word']),
      hyphens: choice(t('Hyphens'), ['manual', 'auto', 'none']),
      textIndent: length(t('Text Indent'), { unit: 'em', units: ['em', 'px', 'rem'] }),
      textOverflow: choice(t('Text Overflow'), ['clip', 'ellipsis']),
      fontVariantNumeric: choice(t('Font Variant Numeric'), ['normal', 'tabular-nums', 'proportional-nums', 'lining-nums', 'oldstyle-nums', 'slashed-zero']),
      fontFeatureSettings: value(t('Font Feature Settings'), '"ss01"'),
      fontVariationSettings: value(t('Font Variation Settings'), '"wght" 500'),
      listStyle: choice(t('List Style'), ['none', 'disc', 'circle', 'square', 'decimal', 'decimal-leading-zero', 'lower-alpha', 'upper-alpha', 'lower-roman', 'upper-roman']),
      verticalAlign: choice(t('Vertical Align'), ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super']),
    }),
    ...of('fill', {
      background: value(t('Background'), 'none'),
      backgroundBlendMode: choice(t('Background Blend Mode'), BLEND),
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
      perspectiveOrigin: value(t('Perspective Origin'), 'center'),
      transformStyle: choice(t('Transform Style'), ['flat', 'preserve-3d']),
      backfaceVisibility: choice(t('Backface Visibility'), ['visible', 'hidden']),
    }),
    ...of('transition', {
      transitionProperty: value(t('Transition Property'), 'all'),
      transitionDuration: value(t('Transition Duration'), '200ms'),
      transitionTimingFunction: value(t('Transition Timing Function'), 'ease'),
      transitionDelay: value(t('Transition Delay'), '0ms'),
      willChange: value(t('Will Change'), 'auto'),
    }),
  }
}

/** Properties the inspector has rows for, as the Design System offers them for an element's or a button's style. */
function designStyles(): Record<string, Partial<FieldDef>> {
  return {
    display: choice(t('Display'), ['block', 'inline', 'inline-block', 'flex', 'grid', 'none']),
    width: length(t('Width'), { unit: 'rem', units: ['rem', 'px', '%', 'ch'], placeholder: t('Auto') }),
    maxWidth: length(t('Max Width'), { unit: 'rem', units: ['rem', 'px', '%', 'ch'], placeholder: t('None') }),
    textAlign: choice(t('Text Align'), ['left', 'center', 'right', 'justify']),
    fontStyle: choice(t('Font Style'), ['normal', 'italic']),
    textTransform: choice(t('Text Transform'), ['none', 'uppercase', 'lowercase', 'capitalize']),
    textDecoration: choice(t('Text Decoration'), ['none', 'underline', 'line-through', 'overline']),
    textWrap: choice(t('Text Wrap'), ['wrap', 'balance', 'pretty', 'nowrap']),
    textShadow: value(t('Text Shadow'), '0 1px 2px rgb(0 0 0 / 0.2)'),
    boxShadow: value(t('Box Shadow'), '0 4px 16px rgb(0 0 0 / 0.1)'),
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

/** The + that adds one of `properties` (by its name), searched as you type. */
export function AddStyle({ properties, onPick, label = t('Add a Property'), children }: { properties: string[]; onPick: (property: string) => void; label?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const more = moreStyles()
  const q = query.trim().toLowerCase()
  const options = properties.map((property) => ({ property, label: String(fieldOf(property, more).label) })).filter((o) => !q || o.label.toLowerCase().includes(q)).sort((a, b) => a.label.localeCompare(b.label))
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
      trigger={(children as ReactElement | undefined) ?? <IconButton icon="b-plus" size="xs" label={label} />}
    >
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <Icon name="search" size={14} className="shrink-0 text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0) }}
          onKeyDown={onKey}
          placeholder={t('Search…')}
          aria-label={t('Search…')}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-text outline-none"
        />
      </div>
      <div role="listbox" aria-label={label} className="max-h-64 overflow-y-auto overscroll-contain p-1">
        {options.length === 0 && <p className="m-0 px-2 py-3 text-sm text-muted">{t('No matches')}</p>}
        {options.map((o, i) => (
          <button key={o.property} type="button" role="option" aria-selected={i === active} tabIndex={-1} onMouseEnter={() => setActive(i)} onClick={() => pick(o.property)} className={cn('flex h-7 w-full items-center rounded-xs px-2 text-left text-sm text-text', i === active && 'bg-hover text-ink')}>
            {o.label}
          </button>
        ))}
      </div>
    </Popover>
  )
}

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
    <Section title={title} open={open} empty={empty && shown.length === 0} actions={<AddStyle properties={mine.filter((key) => !shown.includes(key))} onPick={setAdding} />}>
      {children}
      {shown.length > 0 && <StyleFields s={s} fields={shown.map((key) => ({ ...fieldOf(key, more), set: (v: unknown) => { if (key === adding) setAdding(null); s.set(key, v as string) } }) as StyleField)} />}
    </Section>
  )
}

/**
 * `blocks-more` — the properties of a style no control above it covers (`hidden`), each with
 * its own control, and a + that adds one of `properties`. The value is the declarations.
 */
export function MoreStylesField({ field, value, onChange, disabled }: FieldProps<Record<string, string | number> | null>) {
  const decl = value ?? {}
  const [adding, setAdding] = useState<string | null>(null)
  const hidden = new Set((field.hidden as string[] | undefined) ?? [])
  const shown = [...Object.keys(decl).filter((key) => !hidden.has(key)), ...(adding && !(adding in decl) ? [adding] : [])]
  const more = moreStyles()
  // A style of the Design System can take what has no control there: the panels' extra properties, and these the inspector has rows for.
  const offered = [...Object.keys(more).filter((key) => more[key].group !== 'item' && more[key].group !== 'layout'), ...Object.keys(designStyles())].filter((key) => !hidden.has(key) && !shown.includes(key))
  return (
    <>
      {shown.map((key) => {
        const def = { ...fieldOf(key, more), status: key in decl ? 'own' : undefined, reset: () => { setAdding(null); onChange(Object.fromEntries(Object.entries(decl).filter(([k]) => k !== key))) } } as FieldDef
        return (
          <Fields
            key={key}
            // A name longer than the label column sits above its control, whole.
            layout={String(def.label).length > 14 ? undefined : 'inline'}
            className={String(def.label).length > 14 ? 'py-1' : undefined}
            disabled={disabled}
            fields={[def]}
            values={{ [key]: decl[key] ?? null }}
            onChange={(_, v) => {
              if (key === adding) setAdding(null)
              onChange(v === null || v === undefined || v === '' ? Object.fromEntries(Object.entries(decl).filter(([k]) => k !== key)) : { ...decl, [key]: v as string })
            }}
          />
        )
      })}
      {!disabled && offered.length > 0 && (
        <div className="flex h-8 items-center">
          <AddStyle properties={offered} onPick={setAdding}>
            <button type="button" className="flex h-7 items-center gap-1.5 rounded-sm px-1.5 -ml-1.5 text-xs text-muted hover:bg-hover hover:text-ink">
              <Icon name="b-plus" size={12} />
              {t('Add a Property')}
            </button>
          </AddStyle>
        </div>
      )}
    </>
  )
}
