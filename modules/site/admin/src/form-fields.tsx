import { t, type FieldDef } from '@letterncms/sdk'
import { Fields, IconButton, Menu, Segmented } from '@letterncms/ui'
import { useState } from 'react'
import { Disclosure, Group, css } from './design-parts'

/** A property of a part, as the server describes it (FieldStyles::schema). */
export interface FieldProperty {
  type: 'color' | 'length' | 'weight' | 'shadow' | 'opacity' | 'choice'
  variable: string
  default?: string | string[]
  inherits?: string
  hint?: string
  tokens?: string
  unit?: string
  options?: string[]
}
export type FieldSchema = Record<string, Record<string, FieldProperty>>
export type FieldValues = Record<string, Record<string, string | number>>
interface Token {
  path: string
  group: string
  name: string
  value: any
  dark: any
}

/** `var(--x, fallback)` at `start`: the name, the fallback and where it ends. */
function readVar(text: string, start: number): { name: string; fallback: string | null; end: number } | null {
  let depth = 0
  for (let i = start + 4; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')' && depth-- === 0) {
      const inner = text.slice(start + 4, i)
      const comma = inner.indexOf(',')
      return { name: (comma < 0 ? inner : inner.slice(0, comma)).trim(), fallback: comma < 0 ? null : inner.slice(comma + 1).trim(), end: i + 1 }
    }
  }
  return null
}

/**
 * A color as the admin can paint it: the site's tokens (in the mode shown), field properties
 * and the text color worked out, so an empty control's swatch shows what applies.
 */
function paint(text: string, schema: FieldSchema, values: FieldValues, tokens: Token[], dark: boolean, depth = 0): string {
  if (depth > 8) return 'transparent'
  const tokenValue = (path: string) => {
    const token = tokens.find((x) => x.path === path)
    return token ? String(dark && token.dark ? token.dark : token.value) : null
  }
  const variables = new Map(Object.entries(schema).flatMap(([part, properties]) => Object.entries(properties).map(([key, property]) => [property.variable, [part, key]] as const)))
  let out = text.replace(/token:color\.([a-z0-9-]+)(?:\/(\d{1,3}))?/g, (_, name: string, alpha?: string) => {
    const base = tokenValue(`color.${name}`) ?? 'transparent'
    return alpha ? `color-mix(in srgb, ${base} ${alpha}%, transparent)` : base
  })
  for (let at = out.indexOf('var('); at >= 0; at = out.indexOf('var(')) {
    const found = readVar(out, at)
    if (!found) break
    const field = variables.get(found.name)
    const color = found.name.startsWith('--color-') ? tokenValue(`color.${found.name.slice(8)}`) : null
    const value = field ? effective(schema, values, field[0], field[1], tokens) : color ?? found.fallback ?? 'transparent'
    out = out.slice(0, at) + paint(value, schema, values, tokens, dark, depth + 1) + out.slice(found.end)
  }
  if (/^field:/.test(out)) {
    const [part, key] = out.slice(6).split('.')
    return paint(effective(schema, values, part, key, tokens), schema, values, tokens, dark, depth + 1)
  }
  return out.replace(/currentColor/gi, tokenValue('color.foreground') ?? '#161614')
}

type State = 'hover' | 'focus' | 'invalid' | 'disabled'

/** The rows of the editor, in the order people look for them; each shows its own part of the specimen. */
function sections(): { key: string; label: string; parts: string[]; specimen: string }[] {
  return [
    { key: 'field', label: t('All Fields'), parts: ['field'], specimen: 'field' },
    { key: 'states', label: t('States'), parts: ['hover', 'focus', 'invalid', 'disabled'], specimen: 'states' },
    { key: 'label', label: t('Labels and Help'), parts: ['label', 'help'], specimen: 'labels' },
    { key: 'spacing', label: t('Spacing'), parts: ['spacing'], specimen: 'overview' },
    { key: 'select', label: t('Dropdowns'), parts: ['select'], specimen: 'select' },
    { key: 'textarea', label: t('Text Areas'), parts: ['textarea'], specimen: 'textarea' },
    { key: 'checkbox', label: t('Checkboxes'), parts: ['checkbox'], specimen: 'checkbox' },
    { key: 'radio', label: t('Radio Buttons'), parts: ['radio'], specimen: 'radio' },
    { key: 'switch', label: t('Switches'), parts: ['switch'], specimen: 'switch' },
    { key: 'slider', label: t('Sliders'), parts: ['slider'], specimen: 'slider' },
    { key: 'tags', label: t('Tag Fields'), parts: ['tags'], specimen: 'tags' },
    { key: 'chips', label: t('Chips'), parts: ['chips'], specimen: 'chips' },
    { key: 'file', label: t('File Pickers'), parts: ['file'], specimen: 'file' },
  ]
}

/** What each property is called; a few read differently in their part. */
function label(part: string, key: string): string {
  const own: Record<string, string> = {
    'invalid.color': t('Color'), 'invalid.ringColor': t('Ring'), 'label.color': t('Color'), 'help.color': t('Color'), 'label.fontSize': t('Size'), 'help.fontSize': t('Size'),
    'label.fontWeight': t('Weight'), 'checkbox.background': t('Fill'), 'checkbox.borderColor': t('Border'), 'slider.fill': t('Filled Track'), 'tags.background': t('Tag Fill'),
    'tags.color': t('Tag Text'), 'tags.radius': t('Tag Radius'), 'tags.height': t('Tag Height'), 'file.background': t('Button Fill'), 'file.color': t('Button Text'), 'file.radius': t('Button Radius'),
    'spacing.label': t('Label to Field'), 'switch.knobShadow': t('Shadow'), 'slider.thumbShadow': t('Shadow'), 'switch.radius': t('Radius'), 'chips.background': t('Fill'), 'chips.borderColor': t('Border'),
  }
  const common: Record<string, string> = {
    height: t('Height'), paddingX: t('Padding'), background: t('Fill'), borderWidth: t('Border Width'), borderColor: t('Border'), radius: t('Radius'), color: t('Text'),
    fontSize: t('Text Size'), fontWeight: t('Weight'), placeholder: t('Placeholder'), shadow: t('Shadow'), ringWidth: t('Ring Width'), ringColor: t('Ring'), opacity: t('Opacity'),
    required: t('Required Mark'), fields: t('Between Fields'), list: t('Between Options'), choice: t('Box to Text'), arrowColor: t('Arrow'), arrowSize: t('Arrow Size'),
    minHeight: t('Minimum Height'), resize: t('Resize'), size: t('Size'), checked: t('Checked'), markColor: t('Mark'), mark: t('Mark Shape'), markWeight: t('Mark Weight'),
    markSize: t('Mark Size'), style: t('Style'), dotColor: t('Dot'), dotSize: t('Dot Size'), width: t('Width'), off: t('Off'), on: t('On'), knob: t('Knob'), inset: t('Knob Inset'),
    knobShadow: t('Knob Shadow'), trackHeight: t('Track Height'), track: t('Track'), thumbSize: t('Thumb Size'), thumb: t('Thumb'), thumbBorder: t('Thumb Border'),
    thumbShadow: t('Thumb Shadow'), selected: t('Selected'), selectedText: t('Selected Text'),
  }
  return own[`${part}.${key}`] ?? common[key] ?? key
}

function optionLabel(option: string): string {
  const names: Record<string, string> = {
    vertical: t('Vertical'), none: t('Fixed'), check: t('Check'), square: t('Square'), dot: t('Dot'), light: t('Light'), regular: t('Regular'), bold: t('Bold'), ring: t('Ring'),
  }
  return names[option] ?? option
}

function stateLabel(state: State): string {
  return { hover: t('Hover'), focus: t('Focus'), invalid: t('Invalid'), disabled: t('Disabled') }[state]
}

/**
 * The value a property has when the site leaves it empty: its default, through the property it
 * follows (`inherits`) and the first token of a chain the site has.
 */
function effective(schema: FieldSchema, values: FieldValues, part: string, key: string, tokens: Token[], seen = 0): string {
  const own = values[part]?.[key]
  if (own !== undefined && own !== '') return String(own)
  const property = schema[part]?.[key]
  if (!property || seen > 5) return ''
  if (property.inherits) {
    const [p, k] = property.inherits.split('.')
    return effective(schema, values, p, k, tokens, seen + 1)
  }
  const fallback = property.default
  if (Array.isArray(fallback)) return fallback.find((item) => !item.startsWith('token:') || tokens.some((token) => `token:${token.path}` === item)) ?? fallback[fallback.length - 1]
  return fallback ?? ''
}

/** Words for an empty control: the token it falls back to, or what its default does (through the property it follows). */
function placeholder(schema: FieldSchema, values: FieldValues, part: string, key: string, tokens: Token[]): string {
  if (schema[part][key].type === 'choice') return ''
  let [p, k] = [part, key]
  for (let i = 0; i < 6 && schema[p]?.[k]?.inherits && values[p]?.[k] === undefined; i++) [p, k] = schema[p][k].inherits!.split('.')
  const property = schema[p]?.[k]
  const own = values[p]?.[k]
  const value = effective(schema, values, p, k, tokens)
  const token = value.match(/^token:[a-z]+\.([a-z0-9-]+)$/)
  if (token) return token[1]
  if (own === undefined && property?.hint) return { border: t('From border'), darker: t('Darker'), faint: t('Faint') }[property.hint] ?? property.hint
  if (value === 'currentColor') return t('Text color')
  if (value === '0 0 #0000') return t('None')
  if (schema[part][key].type === 'shadow') return t('Soft')
  if (value === '999px') return t('Round')
  return value
}

/** Field definitions for a part's properties, drawn with the inspector's own controls. */
function controls(schema: FieldSchema, values: FieldValues, part: string, tokens: Token[], dark: boolean): FieldDef[] {
  const weights = tokens.filter((token) => token.group === 'weight')
  return Object.entries(schema[part] ?? {}).map(([key, property]) => {
    const base = { handle: key, label: label(part, key), placeholder: placeholder(schema, values, part, key, tokens) }
    switch (property.type) {
      case 'color':
        return { ...base, type: 'color', component: 'blocks-color', swatch: paint(effective(schema, values, part, key, tokens), schema, values, tokens, dark) }
      case 'weight':
        return { ...base, type: 'select', size: 'sm', options: [...weights.map((token) => ({ value: `token:${token.path}`, label: `${token.name} · ${token.value}` })), ...['300', '400', '500', '600', '700'].map((w) => ({ value: w, label: w }))] }
      case 'shadow':
        return { ...base, type: 'text', component: 'blocks-shadows', group: 'shadow' }
      case 'opacity':
        return { ...base, type: 'text', component: 'blocks-value', percent: true, step: 0.05, min: 0, max: 1 }
      case 'choice':
        return { ...base, type: 'select', component: 'select', display: 'segmented', required: true, default: property.default, options: (property.options ?? []).map((option) => ({ value: option, label: optionLabel(option) })) }
      default: {
        const unit = property.unit ?? (/(Width|inset|Size)$/.test(key) && !/^(size|thumbSize|arrowSize)$/.test(key) ? 'px' : key === 'radius' || property.tokens === 'radius' ? 'px' : 'rem')
        return { ...base, type: 'text', component: 'blocks-value', unit, units: unit === '%' ? ['%'] : ['rem', 'px', 'em'], group: property.tokens, min: 0, step: unit === 'rem' ? 0.125 : 1 }
      }
    }
  }) as FieldDef[]
}

/** Custom properties for the values set here, so a dragged value shows at once (choices wait for the compiled stylesheet). */
export function fieldVars(schema: FieldSchema, values: FieldValues): string {
  const out: string[] = []
  for (const [part, properties] of Object.entries(values)) {
    for (const [key, value] of Object.entries(properties)) {
      const property = schema[part]?.[key]
      if (!property || property.type === 'choice' || value === '' || value === null) continue
      const text = String(value)
      const ref = text.match(/^field:([a-z]+)\.([a-zA-Z]+)$/)
      out.push(`${property.variable}:${ref ? `var(${schema[ref[1]]?.[ref[2]]?.variable})` : typeof value === 'number' && property.type === 'length' && value !== 0 ? `${value}px` : css('', text)}`)
    }
  }
  return out.join(';')
}

/**
 * The form fields of the design system: one row for what every field shares, then each
 * state and each kind of field, each opening on its controls. `onShow` says which part of
 * the specimen to draw: the open row's, or all of it.
 */
export function FieldEditor({ schema, value, onChange, tokens, dark, open, onOpen }: { schema: FieldSchema; value: FieldValues; onChange: (next: FieldValues) => void; tokens: Token[]; dark: boolean; open: string | null; onOpen: (key: string | null) => void }) {
  const [state, setState] = useState<State>('focus')
  const write = (part: string, next: Record<string, unknown>) => {
    const own = Object.fromEntries(Object.entries(next).filter(([, v]) => v !== null && v !== undefined && v !== ''))
    const rest = Object.fromEntries(Object.entries(value).filter(([key]) => key !== part))
    onChange(Object.keys(own).length ? { ...rest, [part]: own as Record<string, string | number> } : rest)
  }
  const block = (part: string, title?: string) => {
    const defs = controls(schema, value, part, tokens, dark).map((field) => ({ ...field, status: value[part]?.[field.handle] !== undefined ? 'own' : undefined, reset: () => write(part, { ...value[part], [field.handle]: null }) }))
    return (
      <div key={part} className={title ? 'mt-3 first:mt-0' : undefined}>
        {title && <h4 className="m-0 mb-1 text-2xs font-medium uppercase tracking-wide text-faint">{title}</h4>}
        <Fields layout="inline" fields={defs.filter((field) => field.component !== 'blocks-shadows') as FieldDef[]} values={value[part] ?? {}} onChange={(handle, v) => write(part, { ...value[part], [handle]: v })} />
        {/* A shadow list brings its own label and add button. */}
        {defs.filter((field) => field.component === 'blocks-shadows').map((field) => (
          <Fields key={field.handle} bare fields={[field as FieldDef]} values={value[part] ?? {}} onChange={(handle, v) => write(part, { ...value[part], [handle]: v })} />
        ))}
      </div>
    )
  }
  const edited = (parts: string[]) => parts.some((part) => Object.keys(value[part] ?? {}).length > 0)

  return (
    <Group title={t('Form Fields')}>
      {sections().map((section) => (
        <Disclosure
          key={section.key}
          open={open === section.key}
          onToggle={() => onOpen(open === section.key ? null : section.key)}
          label={section.label}
          aside={edited(section.parts) ? <span className="size-1.5 shrink-0 rounded-full bg-focus" title={t('Changed')} /> : undefined}
          menu={
            edited(section.parts) ? (
              <Menu
                trigger={<IconButton icon="more" label={t('Section Actions')} size="xs" className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100" />}
                items={[{ label: t('Reset to Defaults'), icon: 'undo', onSelect: () => onChange(Object.fromEntries(Object.entries(value).filter(([key]) => !section.parts.includes(key)))) }]}
              />
            ) : undefined
          }
        >
          {section.key === 'states' ? (
            <>
              <div className="mb-2">
                <Segmented size="xs" block aria-label={t('State')} value={state} onChange={setState} options={(['hover', 'focus', 'invalid', 'disabled'] as const).map((s) => ({ value: s, label: stateLabel(s) }))} />
              </div>
              {block(state)}
            </>
          ) : section.key === 'label' ? (
            <>
              {block('label', t('Label'))}
              {block('help', t('Help Text'))}
            </>
          ) : (
            block(section.parts[0])
          )}
        </Disclosure>
      ))}
    </Group>
  )
}

/** The part of the specimen a row shows. */
export function specimenPart(open: string | null): string | null {
  return sections().find((section) => section.key === open)?.specimen ?? null
}
