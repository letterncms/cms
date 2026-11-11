import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { plural, t, useManifest, type FieldDef, type FieldProps, type FieldTypeDef } from '@letterncms/sdk'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Badge, Button, EmptyState, FieldError, Fields, Icon, IconButton, List, Popover, Row, cn } from '../ui'

export type RawField = Record<string, any> & { handle?: string; type?: string; label?: string; import?: string }

/**
 * Edit a list of field definitions: add, reorder, configure. Used for
 * blueprints and, nested, for the sub-fields of groups and repeaters.
 */
/** The options every field has, whatever its type. */
function commonOptions(depth: number, renamed: boolean): FieldDef[] {
  return [
    { handle: 'label', type: 'text', label: t('Label'), width: 'half' },
    // Said only once it applies: the handle of a field that already holds values was changed.
    { handle: 'handle', type: 'text', label: t('Handle'), width: 'half', instructions: renamed ? t('Changing it orphans existing values.') : undefined },
    { handle: 'instructions', type: 'text', label: t('Instructions') },
    { handle: 'required', type: 'toggle', label: t('Required'), width: 'third' },
    ...(depth === 0 ? [{ handle: 'property', type: 'toggle', label: t('Show as Property'), width: 'third' as const }] : []),
    { handle: 'width', type: 'select', label: t('Width'), display: 'segmented', width: 'third', options: { full: t('Full'), half: '½', third: '⅓' } },
  ]
}

export function FieldsEditor({ fields, onChange, body, depth = 0, emptyText, addLabel, builtIn = null, errors, path = 'fields', heading = true }: {
  fields: RawField[]; onChange: (fields: RawField[]) => void; body?: string; depth?: number; emptyText?: string; addLabel?: string; builtIn?: string | null
  /** What a refused save said, by the path of the option it is about (`fields.2.handle`, `fields.0.fields.1.type`). */
  errors?: Record<string, string>
  /** Where these fields are in what was saved: `fields`, or `fields.<i>.fields` for a field's sub-fields. */
  path?: string
  /** `false` under a tab that already says "Fields": the row keeps Add Field, without the word again. */
  heading?: boolean
}) {
  const types = useManifest().fieldTypes
  const [open, setOpen] = useState<number | null>(null)
  // The handles these fields had when the editor opened: those are the ones values are stored under.
  const [saved] = useState(() => new Set(fields.map((f) => f.handle).filter(Boolean) as string[]))
  // The first field something is wrong with opens, so its problem is on view.
  const wrong = errors ? fields.findIndex((_, i) => Object.keys(errors).some((key) => key.startsWith(`${path}.${i}.`))) : -1
  useEffect(() => { if (wrong >= 0) setOpen(wrong) }, [wrong, errors])

  const add = (type: FieldTypeDef) => {
    const base = type.key.replace(/[^a-z0-9]/g, '_')
    let handle = base
    for (let i = 2; fields.some((f) => f.handle === handle); i++) handle = `${base}_${i}`
    onChange([...fields, { handle, type: type.key, label: type.label }])
    setOpen(fields.length)
  }

  return (
    <div>
      {depth === 0 ? (
        <div className={cn('mb-3 flex items-center gap-2', heading && 'border-b border-border pb-2')}>
          {heading && <h2 className="m-0 text-sm font-semibold text-ink">{t('Fields')}</h2>}
          {builtIn && <p className="m-0 min-w-0 flex-1 truncate text-xs text-faint">{builtIn}</p>}
          <div className="ml-auto shrink-0">
            <AddField types={types} onAdd={add} />
          </div>
        </div>
      ) : null}
      {fields.length === 0 ? (
        depth === 0 ? <EmptyState icon="field" title={t('No fields yet')} /> : <p className="m-0 mb-2 rounded-md border border-dashed border-border-strong px-3 py-3 text-xs text-faint">{emptyText ?? t('No fields yet.')}</p>
      ) : (
        <FieldList fields={fields} types={types} openIndex={open} onOpen={setOpen} onChange={onChange} body={body} depth={depth} errors={errors} path={path} saved={saved} />
      )}
      {depth > 0 && <div className="mt-2"><AddField types={types} onAdd={add} label={addLabel ?? t('Add Sub-Field')} align="start" nested /></div>}
    </div>
  )
}

/**
 * The `fields` config type (group and repeater sub-fields) as a nested editor. A field's
 * `placeholder` replaces the empty text and `add` the add button (a component's properties).
 */
export function FieldsConfigField({ field, value, onChange, context }: FieldProps<RawField[]>) {
  const depth = typeof context?.depth === 'number' ? context.depth : 1
  const empty = (field.placeholder as string | undefined) || (context?.values?.type === 'repeater' ? t('Add the fields each item is made of.') : t('Add the fields this group is made of.'))
  return <FieldsEditor fields={Array.isArray(value) ? value : []} onChange={(f) => onChange(f)} depth={Math.max(1, depth)} emptyText={empty} addLabel={field.add as string | undefined}
    errors={context?.errors} path={context?.path ? [...context.path, field.handle].join('.') : undefined} />
}

export function AddField({ types, onAdd, label, align = 'end', nested }: { types: FieldTypeDef[]; onAdd: (type: FieldTypeDef) => void; label?: string; align?: 'start' | 'end'; nested?: boolean }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const groups = useMemo(() => {
    const out = new Map<string, FieldTypeDef[]>()
    for (const type of types.filter((ft) => !q || `${ft.label} ${ft.key} ${ft.description}`.toLowerCase().includes(q.toLowerCase()))) {
      out.set(type.group, [...(out.get(type.group) ?? []), type])
    }
    return [...out.entries()]
  }, [types, q])

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ('') }} side="bottom" align={align} keepSide collisionPadding={8} className="w-[320px] max-w-[calc(100vw-16px)] p-2" trigger={<Button size="sm" icon="plus" variant={nested ? 'ghost' : 'secondary'}>{label ?? t('Add Field')}</Button>}>
      <Fields bare layout="inline" className="mb-2" fields={[{ handle: 'q', type: 'text', label: t('Field Type'), icon: 'search', size: 'sm', placeholder: t('Search') }]} values={{ q }} onChange={(_, v) => setQ(v ?? '')} />
      <div className="max-h-[360px] overflow-y-auto">
        {groups.map(([group, list]) => (
          <div key={group} className="mb-2">
            <div className="cms-label px-2 pb-1">{group}</div>
            <List className="border-y-0! divide-y-0!">
              {list.map((type) => (
                <Row key={type.key} className="items-start rounded-md px-2 py-1.5" onClick={() => { onAdd(type); setOpen(false); setQ('') }}>
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-xs border border-border bg-sunken text-muted"><Icon name={type.icon} size={14} /></span>
                  {/* What a type is for is read whole: a line cut short says less than none. */}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{type.label}</span>
                    {type.description && <span className="block text-xs text-faint">{type.description}</span>}
                  </span>
                </Row>
              ))}
            </List>
          </div>
        ))}
      </div>
    </Popover>
  )
}

function FieldList({ fields, types, openIndex, onOpen, onChange, body, depth, errors, path, saved }: { fields: RawField[]; types: FieldTypeDef[]; openIndex: number | null; onOpen: (i: number | null) => void; onChange: (f: RawField[]) => void; body?: string; depth: number; errors?: Record<string, string>; path: string; saved: Set<string> }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const ids = fields.map((f, i) => f.handle ?? `import-${f.import}-${i}`)
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    onChange(arrayMove(fields, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
    onOpen(null)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {fields.map((field, i) => (
            <Sortable key={ids[i]} id={ids[i]}>
              {(handle) => (
                <FieldRow
                  field={field}
                  type={types.find((ft) => ft.key === field.type)}
                  open={openIndex === i}
                  isBody={field.handle === body}
                  depth={depth}
                  errors={errors}
                  path={`${path}.${i}`}
                  // A handle that was not there when the editor opened, while one that was is gone: this field was renamed.
                  renamed={depth === 0 && !!field.handle && !saved.has(field.handle) && [...saved].some((h) => !fields.some((f) => f.handle === h))}
                  dragHandle={handle}
                  onToggle={() => onOpen(openIndex === i ? null : i)}
                  onChange={(f) => onChange(fields.map((x, j) => (j === i ? f : x)))}
                  onRemove={() => {
                    onChange(fields.filter((_, j) => j !== i))
                    onOpen(null)
                  }}
                  onDuplicate={() => onChange([...fields.slice(0, i + 1), { ...field, handle: `${field.handle}_copy`, label: t('{label} copy', { label: field.label ?? field.handle }) }, ...fields.slice(i + 1)])}
                />
              )}
            </Sortable>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function Sortable({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'relative z-10')}>
      {children(
        <IconButton icon="drag" size="xs" label={t('Drag to Reorder')} className="cursor-grab text-faint active:cursor-grabbing" {...attributes} {...listeners} />,
      )}
    </div>
  )
}

function FieldRow({ field, type, open, isBody, depth, errors, path, renamed, dragHandle, onToggle, onChange, onRemove, onDuplicate }: { field: RawField; type?: FieldTypeDef; open: boolean; isBody: boolean; depth: number; errors?: Record<string, string>; path: string; renamed?: boolean; dragHandle: ReactNode; onToggle: () => void; onChange: (f: RawField) => void; onRemove: () => void; onDuplicate: () => void }) {
  // What the last save refused about this field itself; its sub-fields show their own.
  const problem = (key: string) => errors?.[`${path}.${key}`]
  const refused = !!errors && Object.keys(errors).some((key) => key.startsWith(`${path}.`))
  if (field.import) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-lg border border-dashed border-border-strong bg-sunken px-2">
        {dragHandle}
        <Icon name="stack" size={15} className="text-muted" />
        <span className="flex-1 text-sm">{t('Imports fieldset {handle}').split('{handle}').map((part, i) => (i === 0 ? part : [<span key={i} className="font-mono">{field.import}</span>, part]))}</span>
        <IconButton icon="trash" label={t('Remove')} size="xs" onClick={onRemove} />
      </div>
    )
  }

  const set = (key: string, value: any) => {
    const next = { ...field }
    if (value === undefined || value === null || value === '' || value === false) delete next[key]
    else next[key] = value
    onChange(next)
  }

  return (
    <div className={cn('rounded-lg border bg-bg transition-shadow', refused ? 'border-danger' : open ? 'border-border-strong' : 'border-border', open && 'shadow-pop')}>
      <div className="flex h-11 items-center gap-2 px-2">
        {dragHandle}
        <span className="grid size-6 shrink-0 place-items-center rounded-xs bg-active text-muted"><Icon name={type?.icon ?? 'field'} size={14} /></span>
        <Button variant="ghost" size="sm" aria-expanded={open} onClick={onToggle} className="-mx-1 h-8 min-w-0 flex-1 justify-start gap-2 px-1 text-left hover:bg-transparent">
          {/* The name wins the room: on a phone the handle steps aside for it. */}
          <span className="min-w-[4ch] truncate text-sm font-medium text-text">{field.label || field.handle}</span>
          <span className="truncate font-mono text-xs font-normal text-faint max-sm:hidden">{field.handle}</span>
        </Button>
        {isBody && <Badge>{t('Body')}</Badge>}
        {field.required && <Badge>{t('Required')}</Badge>}
        {field.section === 'sidebar' && <Badge>{t('Property')}</Badge>}
        {Array.isArray(field.fields) && <span className="text-xs text-faint">{plural(field.fields.length, '{count} field', '{count} fields')}</span>}
        {/* Which type is said beside it, once. */}
        {!type && <Badge tone="warning">{t('Missing Type')}</Badge>}
        <span className="w-20 text-right text-xs text-faint">{type?.label ?? field.type}</span>
        <IconButton icon={open ? 'chevron-up' : 'chevron-down'} label={open ? t('Collapse') : t('Edit')} size="xs" onClick={onToggle} />
      </div>
      {open && (
        <div className="space-y-5 border-t border-border p-4">
          {/* What every field has, edited with fields like everything else. */}
          <Fields
            fields={commonOptions(depth, !!renamed)}
            values={{ ...field, width: field.width ?? 'full', property: field.section === 'sidebar' }}
            errors={errors}
            context={{ path: path.split('.') }}
            onChange={(h, v) => {
              if (h === 'handle') onChange({ ...field, handle: String(v ?? '').toLowerCase().replace(/[^a-z0-9_]/g, '') })
              else if (h === 'property') set('section', v ? 'sidebar' : undefined)
              else if (h === 'width') set('width', v === 'full' ? undefined : v)
              else set(h, v)
            }}
          />
          {problem('type') && <FieldError className="mt-0">{problem('type')}</FieldError>}
          {type && type.config.length > 0 && (
            <div className="border-t border-border pt-4">
              <div className="cms-label mb-3">{t('{type} Options', { type: type.label })}</div>
              <Fields fields={type.config.map((c) => ({ ...c, width: c.type === 'json' || c.type === 'fields' ? 'full' : 'half' }))} values={field} onChange={(h, v) => set(h, v)} errors={errors} context={{ depth: depth + 1, path: path.split('.') }} />
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3">
            <Button size="sm" variant="ghost" icon="copy" onClick={onDuplicate}>{t('Duplicate')}</Button>
            <Button size="sm" variant="destructive" icon="trash" onClick={onRemove}>{t('Remove Field')}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
