import { t, type FieldDef } from '@letterncms/sdk'

type Schema = Record<string, any>

/** The names inputs share, in the person's language. */
const named: Record<string, () => string> = {
  title: () => t('Title'), name: () => t('Name'), email: () => t('Email'), slug: () => t('Slug'), status: () => t('Status'),
  label: () => t('Label'), url: () => t('Link'), menu: () => t('Menu'), roles: () => t('Roles'), password: () => t('Password'),
  collection: () => t('Collection'), query: () => t('Search'), search: () => t('Search'), description: () => t('Description'), code: () => t('Code'),
}

/** `parentId` → "Parent", `perPage` → "Per Page". */
export function words(key: string): string {
  if (named[key]) return named[key]()
  const spaced = key.replace(/Id$/, '').replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase())
}

const types = (schema: Schema): string[] => (Array.isArray(schema.type) ? schema.type : [schema.type]).filter((type: unknown): type is string => typeof type === 'string' && type !== 'null')

/** A value the person can give in a field, rather than one an id, a version or a moment stands for. */
const plain = (schema: Schema) => !schema.pattern && !['ulid', 'date-time', 'uri'].includes(schema.format)

/** A key that names a record by its id: `id`, `entryId`, `ids`. */
const idLike = (key: string) => key === 'id' || key === 'ids' || /Id$/.test(key) || key === 'entry'

/**
 * The choices a property offers, with their words: `enum` with `x-labels` ({value: label}), or
 * `oneOf` of `{const, title}`. A choice without words reads as its value.
 */
export function choices(schema: Schema | undefined): Record<string, string> | null {
  if (!schema) return null
  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0 && schema.oneOf.every((o: Schema) => o && 'const' in o)) {
    return Object.fromEntries(schema.oneOf.map((o: Schema) => [String(o.const), String(o.title ?? o.const)]))
  }
  if (!Array.isArray(schema.enum)) return null
  const labels: Record<string, unknown> = schema['x-labels'] && typeof schema['x-labels'] === 'object' ? schema['x-labels'] : {}
  return Object.fromEntries(schema.enum.map((v: unknown) => [String(v), typeof labels[String(v)] === 'string' && labels[String(v)] !== '' ? String(labels[String(v)]) : String(v)]))
}

/** The record an id-like key of an ability picks: a page or post, or a person. Null when there is no picker for it. */
function pickerFor(ability: string | undefined, key: string): 'entries' | 'users' | null {
  if (['entry', 'entryId', 'parentId', 'originId'].includes(key)) return 'entries'
  if (['userId', 'authorId'].includes(key)) return 'users'
  if (key !== 'id' || !ability) return null
  if (ability.startsWith('entries/')) return 'entries'
  if (ability.startsWith('users/')) return 'users'
  return null
}

/**
 * Whether an ability can be asked for in a form: everything it requires is a value the person can
 * give or pick. One that needs a raw id with nothing to pick it from is left to the places that have it.
 */
export function askable(schema: Schema | undefined, ability?: string, chosen: Record<string, unknown> = {}): boolean {
  const properties: Record<string, Schema> = schema?.properties && typeof schema.properties === 'object' ? schema.properties : {}
  const needed: string[] = Array.isArray(schema?.required) ? schema.required : []
  return needed.every((key) => key in chosen || !idLike(key) || choices(properties[key]) !== null || pickerFor(ability, key) !== null)
}

/**
 * The fields to ask an ability's input with, from its JSON schema: text, a select for a choice (with
 * its words), a switch for yes or no, a number, tags for a list of words, a picker for a page or a
 * person, JSON for anything else. What is required comes first and says so; what is `chosen` already
 * is not asked. `required` asks only for that.
 */
export function schemaFields(schema: Schema | undefined, chosen: Record<string, unknown> = {}, required = false, ability?: string): FieldDef[] {
  const properties: Record<string, Schema> = schema?.properties && typeof schema.properties === 'object' && !Array.isArray(schema.properties) ? schema.properties : {}
  const needed: string[] = Array.isArray(schema?.required) ? schema.required : []
  const order = [...needed.filter((key) => key in properties), ...Object.keys(properties).filter((key) => !needed.includes(key))]
  const fields: FieldDef[] = []
  let optional = 0

  for (const handle of order) {
    if (handle in chosen) continue
    const property = properties[handle] ?? {}
    const must = needed.includes(handle)
    const [type] = types(property)
    const options = choices(property)
    const picker = idLike(handle) && !options ? pickerFor(ability, handle) : null
    if (!must) {
      // Beyond what it needs, only the simple values it takes, and a few of them.
      if (required || optional >= 6 || (!plain(property) && !options) || !['string', 'boolean', 'integer', 'number'].includes(type ?? '')) continue
      optional++
    }
    const field: FieldDef = { handle, type: 'text', label: property.title ?? (picker === 'entries' ? t('Page') : picker === 'users' ? t('Person') : words(handle)), ...(must ? { required: true } : {}), ...(property.default !== undefined ? { default: property.default } : {}) }
    // One record by its id, picked by name: the value goes back as the id itself.
    if (picker) fields.push({ ...field, type: picker, max: 1, single: true })
    else if (options) fields.push({ ...field, type: 'select', options, display: 'dropdown' })
    else if (type === 'boolean') fields.push({ ...field, type: 'toggle' })
    else if (type === 'integer' || type === 'number') fields.push({ ...field, type: 'number', ...(property.minimum !== undefined ? { min: property.minimum } : {}), ...(property.maximum !== undefined ? { max: property.maximum } : {}), ...(type === 'integer' ? { step: 1 } : {}) })
    else if (type === 'array' && choices(property.items)) fields.push({ ...field, type: 'select', multiple: true, options: choices(property.items)! })
    else if (type === 'array' && types(property.items ?? {})[0] === 'string') fields.push({ ...field, type: 'tags' })
    else if (type === 'object' || type === 'array') fields.push({ ...field, type: 'json' })
    else fields.push({ ...field, ...(property.format === 'email' ? { type: 'email' } : {}), ...(property.maxLength && property.maxLength > 2000 ? { type: 'textarea' } : {}), ...(/pass(word)?|secret|token|key$/i.test(handle) ? { secret: true } : {}) })
  }
  return fields
}

/** Answers as the ability takes them: a single pick is its id, not a list of one. */
export function answers(fields: FieldDef[], values: Record<string, unknown>): Record<string, unknown> {
  const single = new Set(fields.filter((f) => f.single).map((f) => f.handle))
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, single.has(key) && Array.isArray(value) ? value[0] : value]))
}

/** What the form gives the ability: what was chosen, and every answer that says something (under `into`, all of them). */
export function commandInput(chosen: Record<string, unknown>, values: Record<string, unknown>, into?: string): Record<string, unknown> {
  if (into) return { ...chosen, [into]: values }
  return { ...chosen, ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0))) }
}

/** What was chosen, in the words the form showed: "Footer", not "footer"; a switch by its name. For the turn's bubble. */
export function chosenWords(fields: FieldDef[], values: Record<string, unknown>): string {
  const said: string[] = []
  for (const field of fields) {
    const value = values[field.handle]
    if (value === undefined || value === null || value === '' || field.secret || field.single) continue
    const options = field.options && typeof field.options === 'object' && !Array.isArray(field.options) ? field.options as Record<string, string> : null
    if (options) said.push((Array.isArray(value) ? value : [value]).map((v) => options[String(v)] ?? String(v)).join(', '))
    else if (field.type === 'toggle') { if (value === true) said.push(field.label) }
    else if (typeof value === 'string' || typeof value === 'number') said.push(String(value))
    else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) said.push(value.join(', '))
  }
  return said.filter((s) => s.length < 80).slice(0, 3).join(' · ')
}

/** Whether an ability with this schema can run with what is chosen, without asking anything. */
export function ready(schema: Schema | undefined, chosen: Record<string, unknown> = {}): boolean {
  const needed: string[] = Array.isArray(schema?.required) ? schema.required : []
  return needed.every((key) => key in chosen)
}
