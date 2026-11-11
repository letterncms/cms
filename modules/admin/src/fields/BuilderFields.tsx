import { plural, t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { useContext, useEffect, useState } from 'react'
import { Button, Fields, Icon, IconButton, Input, confirm, cn } from '../ui'
import { toast } from '../ui/toast'
import { FieldsEditor, RowUsage, type RawField } from './FieldsEditor'

import type { Sibling } from './conditions'

type Rule = Record<string, unknown>
type Key = 'if' | 'required_if'

const cleanHandle = (text: string) => text.toLowerCase().replace(/[^a-z0-9_]/g, '')

/**
 * A handle being typed: it is the text in the box until the box is left, so it can be emptied and written anew.
 * Leaving it empty, or as one `taken` already, puts back what it was.
 */
export function HandleInput({ value, onCommit, taken = [], disabled, label, size, id }: { value: string; onCommit: (handle: string) => void; taken?: string[]; disabled?: boolean; label: string; size?: 'sm' | 'md'; id?: string }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  const commit = () => {
    const next = cleanHandle(text)
    if (next && next !== value && !taken.includes(next)) onCommit(next)
    else setText(value)
  }
  return <Input id={id} aria-label={label} size={size} className="font-mono" spellCheck={false} value={text} disabled={disabled} onChange={(e) => setText(cleanHandle(e.target.value))} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit() } }} />
}

/** A value typed for a field without choices: kept as typed until the box is left, then read (several separated by commas, a number as a number). */
function TypedValue({ value, type, onCommit, disabled }: { value: unknown; type?: string; onCommit: (value: unknown) => void; disabled?: boolean }) {
  const shown = (Array.isArray(value) ? value : [value]).map((v) => String(v ?? '')).join(', ')
  const [text, setText] = useState(shown)
  useEffect(() => setText(shown), [shown])
  const read = () => {
    const one = (part: string): unknown => {
      const word = part.trim()
      return (type === 'number' || type === 'range') && word !== '' && !Number.isNaN(Number(word)) ? Number(word) : word
    }
    const parts = text.split(',').map(one).filter((v) => v !== '')
    onCommit(parts.length > 1 ? parts : parts[0] ?? '')
  }
  return <Input size="sm" aria-label={t('Value')} placeholder={t('Value')} value={text} disabled={disabled} onChange={(e) => setText(e.target.value)} onBlur={read} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); read() } }} />
}

/**
 * A field's conditions, each read as a sentence: Show (or Require) when <a field beside it> is <one of its
 * values>. `if` and `required_if` of the definition are the two kinds; every condition of a kind must hold.
 */
export function Conditions({ field, siblings, onChange, disabled }: { field: RawField; siblings: Sibling[]; onChange: (field: RawField) => void; disabled?: boolean }) {
  const rule = (key: Key): Rule => (field[key] && typeof field[key] === 'object' && !Array.isArray(field[key]) ? field[key] : {})
  const lines = (['if', 'required_if'] as Key[]).flatMap((key) => Object.entries(rule(key)).map(([handle, value]) => ({ key, handle, value })))
  const write = (key: Key, next: Rule) => {
    const { [key]: _, ...rest } = field
    onChange(Object.keys(next).length ? { ...rest, [key]: next } : rest)
  }
  const replace = (line: { key: Key; handle: string }, key: Key, handle: string, value: unknown) => {
    const { [line.handle]: _, ...kept } = rule(line.key)
    if (key === line.key) return write(key, Object.fromEntries(Object.entries(rule(key)).map(([h, v]) => (h === line.handle ? [handle, value] : [h, v]))))
    const { [key]: __, [line.key]: ___, ...rest } = field
    onChange({ ...rest, ...(Object.keys(kept).length ? { [line.key]: kept } : {}), [key]: { ...rule(key), [handle]: value } })
  }
  const first = (sibling?: Sibling): unknown => (sibling?.type === 'toggle' ? true : sibling?.options ? Object.keys(sibling.options)[0] ?? '' : '')

  return (
    <div className="space-y-2" data-conditions>
      {lines.map((line) => {
        const sibling = siblings.find((s) => s.handle === line.handle)
        // A field named here that is no longer beside this one: said, and removable.
        const names = Object.fromEntries([...siblings.filter((s) => s.handle === line.handle || !(s.handle in rule(line.key))).map((s) => [s.handle, s.label]), ...(sibling ? [] : [[line.handle, line.handle]])])
        const values = (Array.isArray(line.value) ? line.value : [line.value]).map(String)
        return (
          <div key={`${line.key}.${line.handle}`} className="flex flex-wrap items-center gap-x-2 gap-y-1" data-condition>
            <Fields bare className="w-28 shrink-0" fields={[{ handle: 'kind', type: 'select', label: t('Condition'), size: 'sm', options: { if: t('Show'), required_if: t('Require') } }]} values={{ kind: line.key }} disabled={disabled}
              onChange={(_, kind) => kind !== line.key && !(line.handle in rule(kind as Key)) && replace(line, kind as Key, line.handle, line.value)} />
            <span className="text-sm text-muted">{t('when')}</span>
            <Fields bare className="min-w-36 flex-1" fields={[{ handle: 'field', type: 'select', label: t('Field'), size: 'sm', options: names }]} values={{ field: line.handle }} disabled={disabled}
              onChange={(_, handle) => handle !== line.handle && replace(line, line.key, String(handle), first(siblings.find((s) => s.handle === handle)))} />
            <span className="text-sm text-muted">{t('is')}</span>
            <div className="min-w-36 flex-1">
              {sibling?.type === 'toggle' ? (
                <Fields bare fields={[{ handle: 'value', type: 'select', label: t('Value'), size: 'sm', options: { true: t('On'), false: t('Off') } }]} values={{ value: String(line.value === true) }} disabled={disabled} onChange={(_, v) => replace(line, line.key, line.handle, v === 'true')} />
              ) : sibling?.options ? (
                <Fields bare fields={[{ handle: 'value', type: 'select', multiple: true, label: t('Value'), size: 'sm', options: sibling.options }]} values={{ value: values }} disabled={disabled}
                  onChange={(_, v) => { const chosen = Array.isArray(v) ? v : [v]; replace(line, line.key, line.handle, chosen.length === 1 ? chosen[0] : chosen) }} />
              ) : (
                <TypedValue value={line.value} type={sibling?.type} disabled={disabled} onCommit={(v) => replace(line, line.key, line.handle, v)} />
              )}
            </div>
            <IconButton icon="close" label={t('Remove Condition')} size="xs" disabled={disabled} onClick={() => { const { [line.handle]: _, ...kept } = rule(line.key); write(line.key, kept) }} />
          </div>
        )
      })}
    </div>
  )
}

type Kind = { handle?: string; label?: string; fields?: RawField[] }

/**
 * `matrix-types` — the kinds of row of a matrix, listed like fields: a row each, open on its name, its handle
 * and its own fields. Taking away a kind that was saved, or changing its handle, leaves the rows made with it
 * without their fields: said before it is done.
 */
export function MatrixTypesField({ field, value, onChange, disabled, context }: FieldProps<Kind[]>) {
  const kinds = Array.isArray(value) ? value : []
  const depth = typeof context?.depth === 'number' ? context.depth : 1
  const base = context?.path ? [...context.path, field.handle].join('.') : undefined
  const [open, setOpen] = useState<number | null>(null)
  const usage = useContext(RowUsage)
  // The handles these kinds had when the editor opened: rows are stored under those.
  const [saved] = useState(() => new Set(kinds.map((k) => k.handle).filter(Boolean) as string[]))
  const change = (i: number, patch: Kind) => onChange(kinds.map((kind, j) => (j === i ? { ...kind, ...patch } : kind)))
  const add = () => {
    let handle = 'row'
    for (let n = 2; kinds.some((k) => k.handle === handle); n++) handle = `row_${n}`
    onChange([...kinds, { handle, label: t('Row'), fields: [] }])
    setOpen(kinds.length)
  }
  const remove = async (i: number) => {
    const kind = kinds[i]
    if (kind.handle && saved.has(kind.handle)) {
      // What was made with it stays, without these fields: said with how many rows there are.
      let description: string | undefined = t('Rows made with it keep their values, without these fields.')
      const matrix = typeof context?.values?.handle === 'string' ? context.values.handle : ''
      if (usage && matrix) {
        let count = 0
        try { count = await usage(matrix, kind.handle) } catch (e) { toast.error(e); return }
        description = count > 0 ? plural(count, '{count} row was made with it. It keeps its values, without these fields.', '{count} rows were made with it. They keep their values, without these fields.') : undefined
      }
      if (!(await confirm({ title: t('Remove “{title}”?', { title: kind.label || kind.handle }), description, confirm: t('Remove Row Type'), danger: true }))) return
    }
    onChange(kinds.filter((_, j) => j !== i))
    setOpen(null)
  }

  return (
    <div data-matrix-types>
      <div className="space-y-1.5">
        {kinds.map((kind, i) => {
          const renamed = !!kind.handle && !saved.has(kind.handle) && [...saved].some((h) => !kinds.some((k) => k.handle === h))
          return (
            <div key={i} className={cn('rounded-lg border bg-bg', open === i ? 'border-border-strong' : 'border-border')} data-matrix-type>
              <div className="flex h-11 items-center gap-2 px-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-xs bg-active text-muted"><Icon name="rows" size={14} /></span>
                <Button variant="ghost" size="sm" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="-mx-1 h-8 min-w-0 flex-1 justify-start gap-2 px-1 text-left hover:bg-transparent">
                  <span className="min-w-[4ch] truncate text-sm font-medium text-text">{kind.label || kind.handle}</span>
                  <span className="truncate font-mono text-xs font-normal text-faint max-sm:hidden">{kind.handle}</span>
                </Button>
                <span className="text-xs text-faint">{plural((kind.fields ?? []).length, '{count} field', '{count} fields')}</span>
                <IconButton icon={open === i ? 'chevron-up' : 'chevron-down'} label={open === i ? t('Collapse') : t('Edit')} size="xs" onClick={() => setOpen(open === i ? null : i)} />
              </div>
              {open === i && (
                <div className="space-y-4 border-t border-border p-4">
                  <PartName name={kind.label ?? ''} handle={kind.handle ?? ''} taken={kinds.filter((_, j) => j !== i).map((k) => k.handle ?? '')} renamed={renamed} disabled={disabled} onName={(label) => change(i, { label })} onHandle={(handle) => change(i, { handle })} />
                  <FieldsEditor fields={kind.fields ?? []} onChange={(fields) => change(i, { fields })} depth={Math.max(1, depth)} addLabel={t('Add Field')} errors={context?.errors} path={base ? `${base}.${i}.fields` : undefined} />
                  <div className="flex justify-end border-t border-border pt-3">
                    <Button size="sm" variant="destructive" icon="trash" disabled={disabled} onClick={() => void remove(i)}>{t('Remove Row Type')}</Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Button variant="ghost" icon="plus" className="mt-2" disabled={disabled} onClick={add}>{t('Add Row Type')}</Button>
    </div>
  )
}

/** The name and handle of a part of a definition (a kind of row, a blueprint). The handle warns, as a field's does, once one that holds values was changed. */
export function PartName({ name, handle, taken, renamed, disabled, onName, onHandle }: { name: string; handle: string; taken: string[]; renamed: boolean; disabled?: boolean; onName: (name: string) => void; onHandle: (handle: string) => void }) {
  const fields: FieldDef[] = [
    { handle: 'name', type: 'text', label: t('Name'), width: 'half' },
    { handle: 'handle', type: 'text', component: 'handle-input', label: t('Handle'), width: 'half', taken, instructions: renamed ? t('Changing it orphans existing values.') : undefined },
  ]
  return <Fields fields={fields} values={{ name, handle }} disabled={disabled} onChange={(key, v) => (key === 'name' ? onName(String(v ?? '')) : onHandle(String(v ?? '')))} />
}

/** `handle-input` — HandleInput as a field of a form. */
export function HandleField({ field, value, onChange, disabled }: FieldProps<string>) {
  return <HandleInput id={field.id as string | undefined} label={field.label ?? t('Handle')} value={value ?? ''} taken={(field.taken as string[] | undefined) ?? []} disabled={disabled} onCommit={onChange} />
}
