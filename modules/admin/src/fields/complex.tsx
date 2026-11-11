import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { t, useAbility, type EntrySummary, type FieldProps } from '@letterncms/sdk'
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Fields, Icon, IconButton, Input, Popover, PersonPicker, fieldControlId, Spinner, StatusDot, cn } from '../ui'

export function TagsField({ field, value, onChange, disabled }: FieldProps<string[]>) {
  const tags = Array.isArray(value) ? value : []
  const [draft, setDraft] = useState('')
  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '')
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && draft === '' && tags.length) onChange(tags.slice(0, -1))
  }
  return (
    <div className="cms-input flex min-h-8 flex-wrap items-center gap-1 rounded-md px-1.5 py-1 focus-within:border-focus focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--cms-focus)_18%,transparent)]">
      {tags.map((tag) => (
        <span key={tag} className="inline-flex h-5 items-center gap-1 rounded-xs bg-active pl-1.5 pr-0.5 text-xs font-medium text-text">
          {tag}
          <button type="button" disabled={disabled} onClick={() => onChange(tags.filter((x) => x !== tag))} className="grid size-4 place-items-center rounded-xs text-faint hover:bg-active hover:text-text" aria-label={t('Remove {tag}', { tag })}>
            <Icon name="close" size={10} />
          </button>
        </span>
      ))}
      <input
        id={fieldControlId(field)}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft && add(draft)}
        placeholder={tags.length ? '' : typeof field.placeholder === 'string' ? field.placeholder : t('Add…')}
        className="h-5 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
      />
    </div>
  )
}

function SortableItem({ id, children, disabled }: { disabled?: boolean; id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const handle = (
    <button type="button" disabled={disabled} {...attributes} {...listeners} className="grid size-6 shrink-0 cursor-grab place-items-center rounded-xs text-faint hover:bg-hover hover:text-text active:cursor-grabbing disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent" aria-label={t('Drag to Reorder')}>
      <Icon name="drag" size={14} />
    </button>
  )
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn(isDragging && 'relative z-10 opacity-80')}>
      {children(handle)}
    </div>
  )
}

function SortableList<T>({ items, getId, onReorder, render, disabled }: { disabled?: boolean; items: T[]; getId: (item: T, i: number) => string; onReorder: (items: T[]) => void; render: (item: T, index: number, handle: ReactNode) => ReactNode }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const ids = items.map(getId)
  const onDragEnd = (e: DragEndEvent) => {
    if (disabled || !e.over || e.active.id === e.over.id) return
    onReorder(arrayMove(items, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {items.map((item, i) => (
          <SortableItem key={ids[i]} id={ids[i]} disabled={disabled}>
            {(handle) => render(item, i, handle)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}

export function EntriesField({ field, value, onChange, disabled, context }: FieldProps<string[]>) {
  const ids = Array.isArray(value) ? value : []
  const max = (field.max as number) || Infinity
  const collections = (field.collections as string[] | undefined) ?? []
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = useAbility<EntrySummary[]>('entries/get-many', { ids }, { enabled: ids.length > 0 })
  const results = useAbility<EntrySummary[]>('content/search', { query: query || ' ', collections: collections.length ? collections : undefined, limit: 12 }, { enabled: open && query.trim().length > 0 })
  const recent = useAbility<{ items: EntrySummary[] }>('entries/list', { collection: collections[0] ?? '', sort: '-updated_at', perPage: 12 }, { enabled: open && !query && collections.length > 0 })

  const known = new Map<string, EntrySummary>()
  for (const e of [...(selected.data ?? []), ...(results.data ?? []), ...(recent.data?.items ?? [])]) known.set(e.id, e)
  const options = (query ? results.data : recent.data?.items)?.filter((e) => !ids.includes(e.id) && e.id !== context.entry?.id) ?? []

  return (
    <div className="space-y-1.5">
      {ids.length > 0 && (
        <div className="divide-y divide-border rounded-md border border-border">
          <SortableList
            disabled={disabled}
            items={ids}
            getId={(id) => id}
            onReorder={onChange}
            render={(id, _i, handle) => {
              const e = known.get(id)
              return (
                <div className="flex h-9 items-center gap-1.5 bg-bg px-1.5">
                  {handle}
                  <span className="min-w-0 flex-1 truncate text-sm">{e?.title ?? <span className="font-mono text-xs text-faint">{id}</span>}</span>
                  {e && <StatusDot status={e.displayStatus} />}
                  <IconButton icon="close" label={t('Remove')} size="xs" disabled={disabled} onClick={() => onChange(ids.filter((x) => x !== id))} />
                </div>
              )
            }}
          />
        </div>
      )}
      {ids.length < max && (
        <Popover
          open={open}
          onOpenChange={setOpen}
          className="w-80"
          trigger={
            <button type="button" disabled={disabled} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm text-muted hover:bg-hover hover:text-text">
              <Icon name="plus" size={14} /> {t('Link Entry')}
            </button>
          }
        >
          <Input icon="search" size="sm" placeholder={t('Search…')} value={query} onChange={(e) => setQuery(e.target.value)} className="mb-1" />
          {(results.isFetching || recent.isFetching) && <div className="flex justify-center py-3 text-faint"><Spinner /></div>}
          {options.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                onChange([...ids, e.id])
                if (ids.length + 1 >= max) setOpen(false)
              }}
              className="cms-menu-item h-8 w-full"
            >
              <span className="min-w-0 flex-1 truncate">{e.title}</span>
              <span className="text-xs text-faint">{e.collection}</span>
            </button>
          ))}
          {!results.isFetching && !recent.isFetching && options.length === 0 && <div className="px-2 py-3 text-center text-xs text-faint">{query ? t('No matches') : t('Type to search')}</div>}
        </Popover>
      )}
    </div>
  )
}

export function UsersField({ field, value, onChange, disabled }: FieldProps<string[]>) {
  return <PersonPicker aria-describedby={field.describedBy} id={fieldControlId(field)} value={Array.isArray(value) ? value : []} onChange={onChange} disabled={disabled} max={(field.max as number) || Infinity} label={field.label || t('Select people')} size={field.size === 'sm' || field.size === 'xs' ? 'sm' : 'md'} />
}

export function GroupField({ field, value, onChange, disabled, context }: FieldProps<Record<string, any>>) {
  const values = value && typeof value === 'object' ? value : {}
  return (
    <div className="rounded-lg border border-border p-4">
      <Fields fields={(field.fields as any[]) ?? []} values={values} onChange={(h, v) => onChange({ ...values, [h]: v })} context={{ ...context, path: [...(context.path ?? []), field.handle] }} errors={context.errors} disabled={disabled} />
    </div>
  )
}

export function RepeaterField({ field, value, onChange, disabled, context }: FieldProps<Record<string, any>[]>) {
  const items = Array.isArray(value) ? value : []
  const keys = useRef<string[]>([])
  while (keys.current.length < items.length) keys.current.push(Math.random().toString(36).slice(2))
  keys.current.length = items.length
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const fields = (field.fields as any[]) ?? []
  const max = (field.max as number) || Infinity
  const titleOf = (item: Record<string, any>, i: number) => {
    const first = fields.find((f) => ['text', 'textarea'].includes(f.type))
    return (first && item[first.handle]) || t('Item {number}', { number: i + 1 })
  }

  if (field.display === 'table') return <RepeaterTable field={field} items={items} onChange={onChange} disabled={disabled} context={context} max={max} fields={fields} />

  return (
    <div className="space-y-2">
      <SortableList
        disabled={disabled}
        items={items.map((item, i) => ({ item, key: keys.current[i] }))}
        getId={(x) => x.key}
        onReorder={(next) => {
          keys.current = next.map((x) => x.key)
          onChange(next.map((x) => x.item))
        }}
        render={({ item, key }, i, handle) => (
          <div className="rounded-lg border border-border bg-bg">
            <div className="flex h-9 items-center gap-1 pl-1 pr-1.5">
              {handle}
              <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))} className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-sm font-medium">
                <Icon name={collapsed[key] ? 'chevron-right' : 'chevron-down'} size={12} className="text-faint" />
                <span className="truncate">{titleOf(item, i)}</span>
              </button>
              <IconButton
                icon="trash"
                label={t('Remove')}
                size="xs"
                disabled={disabled}
                onClick={() => {
                  keys.current.splice(i, 1)
                  onChange(items.filter((_, j) => j !== i))
                }}
              />
            </div>
            {!collapsed[key] && (
              <div className="border-t border-border p-4">
                <Fields fields={fields} values={item} onChange={(h, v) => onChange(items.map((it, j) => (j === i ? { ...it, [h]: v } : it)))} context={{ ...context, path: [...(context.path ?? []), field.handle, String(i)] }} errors={context.errors} disabled={disabled} />
              </div>
            )}
          </div>
        )}
      />
      {items.length < max && (
        <button type="button" disabled={disabled} onClick={() => onChange([...items, {}])} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm text-muted hover:bg-hover hover:text-text">
          <Icon name="plus" size={14} /> {t('Add Item')}
        </button>
      )}
    </div>
  )
}

/**
 * A repeater as a table (`display: table`): one row per item, one column per field, for short
 * records that are read in a list (redirects, rates). New rows start at the top, with the fields' defaults.
 */
function RepeaterTable({ field, items, onChange, disabled, context, max, fields }: { field: FieldProps['field']; items: Record<string, any>[]; onChange: (items: Record<string, any>[]) => void; disabled?: boolean; context: FieldProps['context']; max: number; fields: any[] }) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.handle, f.default ?? (f.type === 'toggle' ? false : '')]))
  const template = `${fields.map((f) => f.width === 'narrow' || f.type === 'select' || f.type === 'number' || f.type === 'toggle' ? '160px' : 'minmax(160px,1fr)').join(' ')} 32px`
  return (
    <div className="space-y-2">
      {items.length < max && (
        <button type="button" disabled={disabled} onClick={() => onChange([blank(), ...items])} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-sm text-muted hover:bg-hover hover:text-text">
          <Icon name="plus" size={14} /> {(field.add as string) || t('Add Item')}
        </button>
      )}
      {items.length === 0 && typeof field.empty === 'string' && <p className="m-0 py-2 text-sm text-muted">{field.empty}</p>}
      {items.length > 0 && (
        <div role="table" aria-label={field.label} className="overflow-x-auto rounded-lg border border-border">
          <div role="row" className="grid min-w-fit gap-2 border-b border-border bg-sunken px-3 py-2 text-xs font-medium text-muted" style={{ gridTemplateColumns: template }}>
            {fields.map((f) => <span key={f.handle} role="columnheader">{f.label}</span>)}
            <span role="columnheader" className="sr-only">{t('Remove')}</span>
          </div>
          {items.map((item, i) => (
            <div key={i} role="row" className="grid min-w-fit items-center gap-2 px-3 py-1.5 [&+&]:border-t [&+&]:border-border" style={{ gridTemplateColumns: template }}>
              {fields.map((f) => (
                <div key={f.handle} role="cell" className="min-w-0">
                  <Fields bare fields={[{ ...f, size: 'sm' }]} values={item} onChange={(h, v) => onChange(items.map((it, j) => (j === i ? { ...it, [h]: v } : it)))} context={{ ...context, path: [...(context.path ?? []), field.handle, String(i)] }} errors={context.errors} disabled={disabled} />
                </div>
              ))}
              <IconButton icon="trash" label={t('Remove')} size="xs" disabled={disabled} onClick={() => onChange(items.filter((_, j) => j !== i))} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
