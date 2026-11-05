/**
 * What a view's strings are filled in from where it is drawn: the route's `params`, the
 * address's `query`, the signed-in `user`, and the `row` an action or dialog belongs to.
 */
export type Scope = Record<string, unknown>

/** A value at a dotted path: `row.user.name`. */
export function at(value: unknown, path: string | undefined): unknown {
  if (!path) return value
  let current: unknown = value
  for (const key of path.split('.')) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

const WHOLE = /^\{([a-zA-Z_][\w.]*)\}$/
const PART = /\{([a-zA-Z_][\w.]*)\}/g

/**
 * Templates filled in: a string that is one `{path}` is the value itself (an object, a list, a
 * number); otherwise every `{path}` in it is written in. Objects and lists are filled throughout.
 */
export function fill<T>(value: T, scope: Scope): T {
  if (typeof value === 'string') {
    const whole = value.match(WHOLE)
    if (whole) return at(scope, whole[1]) as T
    // `{{word}}` is the words `{word}`, written as they are: "Use {{form}} in the subject."
    return value.split(/(\{\{[^{}]*\}\})/).map((part) => part.startsWith('{{') && part.endsWith('}}') ? part.slice(1, -1) : part.replace(PART, (_, path: string) => {
      const found = at(scope, path)
      return found === null || found === undefined ? '' : String(found)
    })).join('') as T
  }
  if (Array.isArray(value)) return value.map((item) => fill(item, scope)) as T
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v, scope)])) as T
  return value
}

/** Input for an ability: filled in, and without the keys that came out empty (no filter, no search). */
export function input(value: Record<string, unknown> | unknown[] | undefined, scope: Scope): Record<string, unknown> {
  // An empty input can arrive as a list (PHP's `[]`): it is no input.
  if (!value || Array.isArray(value)) return {}
  return Object.fromEntries(Object.entries(fill(value ?? {}, scope)).filter(([, v]) => v !== '' && v !== undefined && v !== null))
}

/**
 * Whether a `when` holds: a template that comes out as something (not empty, false, 0 or an empty
 * list), or one that compares: `{row.status} is draft, changed`, `{row.status} is not published`.
 */
export function holds(template: string | undefined, scope: Scope): boolean {
  if (template === undefined) return true
  const compare = /^(\{[a-zA-Z_][\w.]*\}) is (not )?(.+)$/.exec(template)
  if (compare) {
    const found = at(scope, compare[1].slice(1, -1))
    const among = compare[3].split(',').map((word) => word.trim())
    return among.includes(found === null || found === undefined ? '' : String(found)) !== !!compare[2]
  }
  const value: unknown = fill<unknown>(template, scope)
  return !(value === undefined || value === null || value === '' || value === false || value === 0 || value === '0' || value === 'false' || (Array.isArray(value) && value.length === 0))
}

/** A link to open: a web address or one of the site's own, never a script (`javascript:`) a value could carry. */
export function safeUrl(value: unknown): string | null {
  const url = String(value ?? '').trim()
  if (url === '') return null
  if (url.startsWith('/') && !url.startsWith('//')) return url
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:' ? parsed.href : null
  } catch {
    return null
  }
}
