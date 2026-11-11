// What the blueprint builder does to conditions (`if`, `required_if`) without drawing anything: tested on its own.
type RawField = Record<string, any> & { handle?: string }
type Rule = Record<string, unknown>
type Key = 'if' | 'required_if'

/** A field beside the one being edited: what a condition can name, with its choices when it has them. */
export type Sibling = { handle: string; label: string; type: string; options?: Record<string, string> }

/** The next condition a field can take: shown when a field beside it that it does not depend on yet holds its first value. */
export function nextCondition(field: RawField, siblings: Sibling[]): RawField | null {
  const taken = (field.if && typeof field.if === 'object' ? field.if : {}) as Rule
  const free = siblings.find((s) => !(s.handle in taken))
  if (!free) return null
  return { ...field, if: { ...taken, [free.handle]: free.type === 'toggle' ? true : free.options ? Object.keys(free.options)[0] ?? '' : '' } }
}

/** Renaming a field follows through to the conditions beside it that name it; removing one takes those conditions with it. */
export function followRename(fields: RawField[], from: string, to: string | null): RawField[] {
  return fields.map((field) => {
    let next = field
    for (const key of ['if', 'required_if'] as Key[]) {
      const rule = field[key]
      if (!rule || typeof rule !== 'object' || Array.isArray(rule) || !(from in rule)) continue
      const entries = Object.entries(rule as Rule).flatMap(([handle, value]) => (handle !== from ? [[handle, value]] : to ? [[to, value]] : []))
      const { [key]: _, ...rest } = next
      next = entries.length ? { ...rest, [key]: Object.fromEntries(entries) } : rest
    }
    return next
  })
}

/** The fields whose conditions come back to themselves, through whichever fields: such a field could never show. */
export function conditionCycles(fields: RawField[]): Set<string> {
  const depends = new Map<string, string[]>()
  for (const field of fields) {
    if (!field.handle) continue
    depends.set(field.handle, (['if', 'required_if'] as Key[]).flatMap((key) => (field[key] && typeof field[key] === 'object' && !Array.isArray(field[key]) ? Object.keys(field[key]) : [])))
  }
  const circular = new Set<string>()
  for (const start of depends.keys()) {
    const seen = new Set<string>()
    const next = [start]
    while (next.length) {
      for (const on of depends.get(next.pop()!) ?? []) {
        if (on === start) circular.add(start)
        else if (!seen.has(on)) { seen.add(on); next.push(on) }
      }
    }
  }
  return circular
}

