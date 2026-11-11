import { can, navigate, t, useAbility, type FieldDef } from '@letterncms/sdk'
import { fieldControlId, Button, Fields, IconButton, Tooltip, cn, wideFieldTypes } from '@letterncms/ui'
import { useAnchors } from '../../core/anchors'
import { useEditorContext } from '../../core/context'
import type { ComponentDef } from '../../core/Inserter'
import * as tree from '../../core/tree'
import type { BlockNode } from '../../core/types'
import { AddButton, Body, PanelFields, Section, SubHeading, labelColumn, stacks } from '../controls'
import { pairOp } from '../fields/composite'
import { useDataPaths, type DataPath } from './scope'

type Component = ComponentDef & { id: string | null; props: FieldDef[] }

/** Text-like property types: an empty value shows the label as placeholder. */
const TEXTUAL = ['text', 'textarea', 'richtext', 'markdown']

/** Conditional fields (`if: { tag: 'button' }`), judged against the block's props and defaults. */
const applies = (field: FieldDef, props: Record<string, unknown>) =>
  !field.if || Object.entries(field.if as Record<string, unknown>).every(([handle, expected]) => {
    const value = props[handle] ?? null
    return Array.isArray(expected) ? expected.includes(value) : value === expected
  })

export { useAnchors }

/**
 * One row: the label, the control, and a way to connect it to data instead. The data button sits
 * at the end of the label and shows on hover (or when connected), so every control ends at the
 * panel's edge. Switches have no data button: a fixed on or off is what they are for.
 */
function Prop({ field: given, value, bound, paths, onValue, onBind, extra }: { field: FieldDef; value: unknown; bound?: string; paths: DataPath[]; onValue: (v: unknown) => void; onBind: (path: string | null) => void; extra?: Partial<FieldDef> }) {
  // A label, caption or attribution is one line here (it is written on the canvas), not a rich text box.
  const field: FieldDef = given.type === 'richtext' && given.inline && given.handle !== 'text' && !given.component ? { ...given, component: 'blocks-inline-text' } : given
  // Core's own wide controls (rich text, media…) draw as they do in forms; the rest as inspector rows.
  const core = !bound && wideFieldTypes.includes(field.type) && !field.component
  // The same rule as the Design tab: long choices and long labels put the label above.
  const wide = !bound && stacks(field)
  const toggle = !bound && field.type === 'toggle'
  const def: FieldDef = bound
    ? { handle: field.handle, type: 'text', component: 'blocks-bind', label: field.label, paths }
    // Whether it applies was judged against the block's props already (`applies`): the row only holds this one value.
    : { ...field, if: undefined, size: 'sm', width: 'full', ...(field.type === 'url' && !field.component ? { component: 'link' } : {}), ...(wide && field.display === 'segmented' ? { block: true } : {}), ...extra }
  const values = { [field.handle]: bound ?? value }
  const change = (_: string, v: unknown) => (bound ? onBind(v as string | null) : onValue(v))
  const control = core
    ? <Fields bare fields={[def]} values={values} onChange={change} className="min-w-0" />
    : <PanelFields bare fields={[def]} values={values} onChange={change} className="min-w-0 flex-1" />
  if (toggle) return <div className="flex min-h-7 items-center">{control}</div>
  const connect = (
    <Tooltip content={bound ? t('Disconnect from Data') : t('Connect to Data')}>
      <IconButton
        icon="database"
        size="xs"
        label={bound ? t('Disconnect from Data') : t('Connect to Data')}
        title={undefined}
        onClick={() => onBind(bound ? null : paths[0]?.path ?? 'entry.title')}
        className={cn('overflow-hidden', bound ? '!text-ink' : '!w-0 !text-faint hover:!text-ink focus-visible:!w-6 group-hover/prop:!w-6 [@media(hover:none)]:!w-6')}
      />
    </Tooltip>
  )
  const label = (
    <span className={cn('flex h-7 min-w-0 shrink-0 items-center gap-0.5', !wide && labelColumn)}>
      <label htmlFor={fieldControlId(field)} className={cn('min-w-0 flex-1 truncate text-xs', bound ? 'text-ink' : 'text-muted')} title={field.instructions}>
        {field.label}
      </label>
      {connect}
    </span>
  )

  if (wide) {
    return (
      <div className="group/prop pb-1">
        {label}
        {control}
      </div>
    )
  }

  return (
    <div className="group/prop flex min-h-7 items-center gap-2">
      {label}
      {control}
    </div>
  )
}

/** The Content tab: what the block shows (props, or data it is connected to), and element settings. */
export function ContentPanel({ node }: { node: BlockNode }) {
  const { store, types } = useEditorContext()
  const type = types.get(node.type)
  const paths = useDataPaths(node)
  const anchors = useAnchors().filter((a) => a.id !== (node.anchor ?? node.props?.anchor))
  const bind = node.bind ?? {}
  const props = { ...Object.fromEntries((type?.fields ?? []).map((f) => [f.handle, f.default ?? null])), ...(type?.defaults ?? {}), ...(node.props ?? {}) }
  const setBind = (key: string, path: string | null) => {
    const next = { ...bind }
    if (path) next[key] = path
    else delete next[key]
    store.updateNode(node.id, { bind: Object.keys(next).length ? next : undefined }, `bind:${node.id}:${key}`)
  }
  const setProp = (handle: string, v: unknown) => store.updateProps(node.id, { [handle]: v }, `inspector:${node.id}:${handle}`)

  // A field marked `design` is drawn in the Design tab (Prose, in Typography).
  const all = (type?.fields ?? []).filter((f) => !f.design && !(f.type === 'json' && ['items', 'rows', 'values'].includes(f.handle)))
  // "Open in New Tab" lives in the link picker when the block has both.
  const merged = all.some((f) => f.component === 'link') && all.some((f) => f.handle === 'new_tab')
  const shown = all.filter((f) => !(merged && f.handle === 'new_tab') && applies(f, props))
  // Technical settings (the HTML tag, how an image loads) wait under Advanced.
  const fields = shown.filter((f) => !f.advanced)
  const advanced = shown.filter((f) => f.advanced)
  const prop = (f: FieldDef) => <Prop key={f.handle} field={f} value={node.props?.[f.handle]} bound={bind[f.handle]} paths={paths} onValue={(v) => setProp(f.handle, v)} onBind={(p) => setBind(f.handle, p)} extra={linkExtra(f)} />
  const repeat = node.type === 'repeat'
  const linkExtra = (f: FieldDef): Partial<FieldDef> | undefined =>
    f.component === 'link' || f.type === 'url' ? { anchors, ...(merged ? { newTab: !!node.props?.new_tab, onNewTab: (on: boolean) => setProp('new_tab', on || undefined) } : {}) } : undefined

  return (
    <div>
      {node.type === 'component' ? (
        <ComponentInstance node={node} paths={paths} setBind={setBind} anchors={anchors} />
      ) : repeat ? (
        <RepeatSource node={node} />
      ) : (
        fields.length > 0 && <Body>{fields.map(prop)}</Body>
      )}

      <Section title={t('Visibility')} open={!!(bind.visible || bind.hidden || node.hidden)} empty={!bind.visible && !bind.hidden && !node.hidden}>
        <PanelFields
          fields={[
            { handle: 'shown', type: 'toggle', size: 'sm', label: t('Show on the Site') },
            { handle: 'visible', type: 'text', component: 'blocks-bind', label: t('Only If'), paths, placeholder: t('Always'), status: bind.visible ? 'own' : undefined, reset: () => setBind('visible', null), instructions: t('Shown only when this data has a value') },
            { handle: 'hidden', type: 'text', component: 'blocks-bind', label: t('Hide If'), paths, placeholder: t('Never'), status: bind.hidden ? 'own' : undefined, reset: () => setBind('hidden', null) },
          ]}
          values={{ shown: !node.hidden, visible: bind.visible, hidden: bind.hidden }}
          onChange={(h, v) => (h === 'shown' ? store.updateNode(node.id, { hidden: v ? undefined : true }) : setBind(h, v))}
        />
      </Section>

      <Section title={t('Advanced')} open={false} empty={!node.anchor && !node.attrs && !node.class && !node.persist && !advanced.some((f) => node.props?.[f.handle] !== undefined && node.props?.[f.handle] !== f.default)}>
        {repeat ? <RepeatAdvanced node={node} /> : advanced.map(prop)}
        <PanelFields
          fields={[
            { handle: 'label', type: 'text', size: 'sm', commit: 'blur', label: t('Layer Name'), placeholder: type?.title },
            // A block with an anchor of its own (a heading's, with its # link) has the one field for it.
            ...(advanced.some((f) => f.handle === 'anchor') && !node.anchor ? [] : [{ handle: 'anchor', type: 'text', size: 'sm', commit: 'blur', label: t('Anchor'), placeholder: t('None'), mono: true, instructions: t('Link to it with #anchor') } as FieldDef]),
            { handle: 'class', type: 'text', size: 'sm', commit: 'blur', label: t('Classes'), placeholder: t('None'), mono: true, instructions: t('Extra CSS classes, styled in custom CSS') },
            // The name pages share for an element that lives on when they swap; it carries what runs in it, so it needs the code permission.
            ...(can('site.code') ? [{ handle: 'persist', type: 'text', size: 'sm', commit: 'blur', label: t('Persist As'), placeholder: 'player', mono: true } as FieldDef] : []),
          ]}
          values={{ label: node.label, anchor: node.anchor, class: node.class, persist: node.persist }}
          onChange={(h, v: string) => store.updateNode(node.id, { [h]: (h === 'anchor' ? v.toLowerCase().replace(/[^a-z0-9-]/g, '') : h === 'persist' ? v.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^[^a-z]+/, '').slice(0, 40) : v) || undefined })}
        />
        <SubHeading title={t('Attributes')} action={<AddButton label={t('Add Attribute')} onClick={() => store.updateNode(node.id, { attrs: { ...(node.attrs ?? {}), 'aria-label': '' } })} />} />
        <PanelFields
          bare
          fields={[
            {
              handle: 'attrs',
              type: 'json',
              component: 'blocks-pairs',
              className: 'items-start',
              label: t('Attributes'),
              key: { lower: true },
              item: { handle: 'value', type: 'text', size: 'sm', commit: 'blur', label: t('Value') },
              items: Object.fromEntries(Object.keys(node.attrs ?? {}).filter((name) => bind[`attr:${name}`]).map((name) => [name, { handle: 'bind', type: 'text', component: 'blocks-bind', label: t('Data'), paths }])),
            },
          ]}
          values={{ attrs: Object.fromEntries(Object.entries(node.attrs ?? {}).map(([name, v]) => [name, bind[`attr:${name}`] ?? v])) }}
          onChange={(_, next) => {
            const attrs = node.attrs ?? {}
            const op = pairOp(Object.fromEntries(Object.entries(attrs).map(([name, v]) => [name, bind[`attr:${name}`] ?? v])), next)
            if (op?.op === 'rename') store.updateNode(node.id, { attrs: Object.fromEntries(Object.entries(attrs).map(([k, v]) => (k === op.from ? [op.to, v] : [k, v]))) })
            else if (op?.op === 'set' && bind[`attr:${op.key}`]) setBind(`attr:${op.key}`, (op.value as string | null) ?? null)
            else if (op?.op === 'set') store.updateNode(node.id, { attrs: { ...attrs, [op.key]: (op.value as string) ?? '' } })
            else if (op?.op === 'remove') {
              const rest = { ...attrs }
              delete rest[op.key]
              store.updateNode(node.id, { attrs: Object.keys(rest).length ? rest : undefined })
              setBind(`attr:${op.key}`, null)
            }
          }}
        />
        <SubHeading title={t('States from Data')} action={<AddButton label={t('Add State from Data')} onClick={() => setBind('state:active', paths[0]?.path ?? 'item.active')} />} />
        <PanelFields
          bare
          fields={[
            {
              handle: 'states',
              type: 'json',
              component: 'blocks-pairs',
              className: 'items-start',
              label: t('States from Data'),
              key: { prefix: 'is-', lower: true, strip: '[^a-z0-9-]', className: '!w-[30%] !flex-none' },
              item: { handle: 'path', type: 'text', component: 'blocks-bind', label: t('Data'), paths },
            },
          ]}
          values={{ states: Object.fromEntries(Object.entries(bind).filter(([k]) => k.startsWith('state:')).map(([k, path]) => [k.slice(6), path])) }}
          onChange={(_, next: Record<string, string | null>) => {
            const rest = Object.fromEntries(Object.entries(bind).filter(([k]) => !k.startsWith('state:')))
            const states = Object.fromEntries(Object.entries(next).filter(([, path]) => path).map(([name, path]) => [`state:${name}`, path as string]))
            const all = { ...rest, ...states }
            store.updateNode(node.id, { bind: Object.keys(all).length ? all : undefined }, `bind:${node.id}:states`)
          }}
        />
      </Section>
    </div>
  )
}

/** A component instance: which component, its property values (or data for them). */
function ComponentInstance({ node, paths, setBind, anchors }: { node: BlockNode; paths: DataPath[]; setBind: (key: string, path: string | null) => void; anchors: { id: string; label: string }[] }) {
  const { store } = useEditorContext()
  const list = useAbility<Component[]>('components/list', { working: true }, { staleTime: 30_000 })
  const component = list.data?.find((p) => p.handle === node.props?.ref)
  const values = (node.props?.values ?? {}) as Record<string, unknown>
  const bind = node.bind ?? {}

  const detach = () => {
    if (!component) return
    const loc = tree.locate(store.get().nodes, node.id)
    if (!loc) return
    const copies = component.blocks.map((b) => tree.clone(b))
    store.commit(tree.insert(tree.remove(store.get().nodes, node.id), loc.parentId, loc.index, copies))
    store.select(copies[0]?.id ?? null)
  }

  return (
    <Body>
      <PanelFields
        fields={[{ handle: 'ref', type: 'select', size: 'sm', label: t('Component'), required: true, options: (list.data ?? []).filter((p) => p.synced).map((p) => ({ value: p.handle, label: p.title })) }]}
        values={{ ref: node.props?.ref }}
        onChange={(_, ref) => ref && store.updateProps(node.id, { ref, values: {} })}
      />
      {(component?.props ?? []).map((f) => (
        <Prop
          key={f.handle}
          field={{ ...f, placeholder: (f.placeholder as string | undefined) ?? (TEXTUAL.includes(f.type) ? f.label : undefined) }}
          value={values[f.handle] ?? f.default}
          bound={bind[`values.${f.handle}`]}
          paths={paths}
          onValue={(v) => store.updateProps(node.id, { values: { ...values, [f.handle]: v } }, `values:${node.id}:${f.handle}`)}
          onBind={(p) => setBind(`values.${f.handle}`, p)}
          extra={f.type === 'url' ? { component: 'link', reference: true, anchors } : undefined}
        />
      ))}
      <div className="-ml-2 flex gap-1 pt-1">
        {component?.id && <Button size="sm" variant="ghost" icon="edit" onClick={() => navigate(`/content/components/${component.id}`)}>{t('Edit Component')}</Button>}
        <Button size="sm" variant="ghost" icon="scissors" onClick={detach} disabled={!component}>
          {t('Detach')}
        </Button>
      </div>
    </Body>
  )
}

/** Repeat: which list it loops over, and that source's settings. */
function RepeatSource({ node }: { node: BlockNode }) {
  const { store, catalog } = useEditorContext()
  const source = catalog.sources?.find((s) => s.name === node.props?.source)
  const set = (handle: string, v: unknown) => store.updateProps(node.id, { [handle]: v }, `repeat:${node.id}:${handle}`)

  return (
    <Body>
      <PanelFields
        fields={[{ handle: 'source', type: 'select', size: 'sm', label: t('List'), required: true, options: (catalog.sources ?? []).map((s) => ({ value: s.name, label: s.label })), instructions: source?.description }]}
        values={{ source: node.props?.source }}
        onChange={(_, v) => v && set('source', v)}
      />
      <PanelFields
        fields={(source?.fields ?? []).map((f) => ({ ...f, size: 'sm' as const, width: 'full' as const }))}
        values={Object.fromEntries((source?.fields ?? []).map((f) => [f.handle, node.props?.[f.handle]]))}
        onChange={(h, v) => set(h, v)}
      />
      <PanelFields
        fields={[{ handle: 'empty', type: 'text', size: 'sm', commit: 'blur', label: t('When Empty'), placeholder: t('Show Nothing') }]}
        values={{ empty: node.props?.empty }}
        onChange={(h, v) => set(h, v || undefined)}
      />
    </Body>
  )
}

/** A Repeat's technical settings: the HTML tag, and the name its blocks read each item by. */
function RepeatAdvanced({ node }: { node: BlockNode }) {
  const { store } = useEditorContext()
  const set = (handle: string, v: unknown) => store.updateProps(node.id, { [handle]: v }, `repeat:${node.id}:${handle}`)
  return (
    <PanelFields
      fields={[
        { handle: 'tag', type: 'select', size: 'sm', label: t('HTML Tag'), required: true, options: ['div', 'ul', 'ol', 'section', 'nav'] },
        { handle: 'as', type: 'text', size: 'sm', commit: 'blur', label: t('Item Name'), placeholder: 'item', mono: true },
      ]}
      values={{ tag: node.props?.tag ?? 'div', as: node.props?.as }}
      onChange={(h, v) => set(h, h === 'tag' ? v ?? 'div' : String(v ?? '').replace(/[^a-z_]/gi, '') || undefined)}
    />
  )
}
