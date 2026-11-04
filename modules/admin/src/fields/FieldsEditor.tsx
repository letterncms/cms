import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { plural, t, useManifest, type FieldDef, type FieldProps, type FieldTypeDef } from '@letterncms/sdk'
import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Button, EmptyState, Fields, Icon, IconButton, Popover, cn } from '../ui'

export type RawField = Record<string, any> & { handle?: string; type?: string; label?: string; import?: string }

/**
 * Edit a list of field definitions: add, reorder, configure. Used for
 * blueprints and, nested, for the sub-fields of groups and repeaters.
 */
/** The options every field has, whatever its type. */
function commonOptions(depth: number): FieldDef[] {
  return [
    { handle: 'label', type: 'text', label: t('Label'), width: 'half' },
    { handle: 'handle', type: 'text', label: t('Handle'), width: 'half', instructions: t('Changing it orphans existing values.') },
    { handle: 'instructions', type: 'text', label: t('Instructions'), placeholder: t('Shown under the field') },
    { handle: 'required', type: 'toggle', label: t('Required'), width: 'third' },
    ...(depth === 0 ? [{ handle: 'property', type: 'toggle', label: t('Show as Property'), width: 'third' as const }] : []),
    { handle: 'width', type: 'select', label: t('Width'), display: 'segmented', width: 'third', options: { full: t('Full'), half: '½', third: '⅓' } },
  ]
}

export function FieldsEditor({ fields, onChange, body, depth = 0, emptyText, addLabel, builtIn = null }: { fields: RawField[]; onChange: (fields: RawField[]) => void; body?: string; depth?: number; emptyText?: string; addLabel?: string; builtIn?: string | null }) {
  const types = useManifest().fieldTypes
  const [open, setOpen] = useState<number | null>(null)

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
        <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
          <h2 className="m-0 text-sm font-semibold text-ink">{t('Fields')}</h2>
          {builtIn && <p className="m-0 min-w-0 flex-1 truncate text-xs text-faint">{builtIn}</p>}
          <div className="ml-auto shrink-0">
            <AddField types={types} onAdd={add} />
          </div>
        </div>
      ) : null}
      {fields.length === 0 ? (
        depth === 0 ? <EmptyState icon="field" title={t('No fields yet')} description={emptyText ?? t('Add fields for everything else.')} /> : <p className="m-0 mb-2 rounded-md border border-dashed border-border-strong px-3 py-3 text-xs text-faint">{emptyText ?? t('No fields yet.')}</p>
      ) : (
        <FieldList fields={fields} types={types} openIndex={open} onOpen={setOpen} onChange={onChange} body={body} depth={depth} />
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
  return <FieldsEditor fields={Array.isArray(value) ? value : []} onChange={(f) => onChange(f)} depth={Math.max(1, depth)} emptyText={empty} addLabel={field.add as string | undefined} />
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
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ('') }} side="bottom" align={align} keepSide collisionPadding={8} className="w-[288px] max-w-[calc(100vw-16px)] p-2" trigger={<Button size="sm" icon="plus" variant={nested ? 'ghost' : 'secondary'}>{label ?? t('Add Field')}</Button>}>
      <Fields bare layout="inline" className="mb-2" fields={[{ handle: 'q', type: 'text', label: t('Field Type'), icon: 'search', size: 'sm', placeholder: t('Search…') }]} values={{ q }} onChange={(_, v) => setQ(v ?? '')} />
      <div className="max-h-[360px] overflow-y-auto">
        {groups.map(([group, list]) => (
          <div key={group} className="mb-2">
            <div className="cms-label px-2 pb-1">{group}</div>
            {list.map((type) => (
              <button
                key={type.key}
                type="button"
                onClick={() => {
                  onAdd(type)
                  setOpen(false)
                  setQ('')
                }}
                className="flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors duration-120 hover:bg-hover"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-xs border border-border bg-sunken text-muted"><Icon name={type.icon} size={14} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{type.label}</span>
                  {type.description && <span className="block truncate text-xs text-faint">{type.description}</span>}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </Popover>
  )
}

function FieldList({ fields, types, openIndex, onOpen, onChange, body, depth }: { fields: RawField[]; types: FieldTypeDef[]; openIndex: number | null; onOpen: (i: number | null) => void; onChange: (f: RawField[]) => void; body?: string; depth: number }) {
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
        <button type="button" {...attributes} {...listeners} className="grid size-6 shrink-0 cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing" aria-label={t('Drag to Reorder')}>
          <Icon name="drag" size={14} />
        </button>,
      )}
    </div>
  )
}

function FieldRow({ field, type, open, isBody, depth, dragHandle, onToggle, onChange, onRemove, onDuplicate }: { field: RawField; type?: FieldTypeDef; open: boolean; isBody: boolean; depth: number; dragHandle: ReactNode; onToggle: () => void; onChange: (f: RawField) => void; onRemove: () => void; onDuplicate: () => void }) {
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
    <div className={cn('rounded-lg border bg-bg transition-shadow', open ? 'border-border-strong shadow-pop' : 'border-border')}>
      <div className="flex h-11 items-center gap-2 px-2">
        {dragHandle}
        <span className="grid size-6 shrink-0 place-items-center rounded-xs bg-active text-muted"><Icon name={type?.icon ?? 'field'} size={14} /></span>
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <span className="truncate text-sm font-medium">{field.label || field.handle}</span>
          <span className="truncate font-mono text-xs text-faint">{field.handle}</span>
        </button>
        {isBody && <Badge>{t('Body')}</Badge>}
        {field.required && <Badge>{t('Required')}</Badge>}
        {field.section === 'sidebar' && <Badge>{t('Property')}</Badge>}
        {Array.isArray(field.fields) && <span className="text-xs text-faint">{plural(field.fields.length, '{count} field', '{count} fields')}</span>}
        {!type && <Badge tone="warning">{t('Missing type: {type}', { type: field.type })}</Badge>}
        <span className="w-20 text-right text-xs text-faint">{type?.label ?? field.type}</span>
        <IconButton icon={open ? 'chevron-up' : 'chevron-down'} label={open ? t('Collapse') : t('Edit')} size="xs" onClick={onToggle} />
      </div>
      {open && (
        <div className="space-y-5 border-t border-border p-4">
          {/* What every field has, edited with fields like everything else. */}
          <Fields
            fields={commonOptions(depth)}
            values={{ ...field, width: field.width ?? 'full', property: field.section === 'sidebar' }}
            onChange={(h, v) => {
              if (h === 'handle') onChange({ ...field, handle: String(v ?? '').toLowerCase().replace(/[^a-z0-9_]/g, '') })
              else if (h === 'property') set('section', v ? 'sidebar' : undefined)
              else if (h === 'width') set('width', v === 'full' ? undefined : v)
              else set(h, v)
            }}
          />
          {type && type.config.length > 0 && (
            <div className="border-t border-border pt-4">
              <div className="cms-label mb-3">{t('{type} options', { type: type.label })}</div>
              <Fields fields={type.config.map((c) => ({ ...c, width: c.type === 'json' || c.type === 'fields' ? 'full' : 'half' }))} values={field} onChange={(h, v) => set(h, v)} context={{ depth: depth + 1 }} />
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3">
            <Button size="sm" variant="ghost" icon="copy" onClick={onDuplicate}>{t('Duplicate')}</Button>
            <Button size="sm" variant="ghost" icon="trash" className="text-danger hover:bg-danger-soft" onClick={onRemove}>{t('Remove Field')}</Button>
          </div>
        </div>
      )}
    </div>
  )
}
