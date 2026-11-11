import { t } from '@letterncms/sdk'
import { Button, Icon, IconButton, Menu, cn, prompt } from '@letterncms/ui'
import { useEditorContext } from '../../core/context'
import { useEditor } from '../../core/store'
import * as tree from '../../core/tree'
import type { BlockNode } from '../../core/types'

const BASE_STATES = () => [
  { value: '', label: t('Default') },
  { value: 'hover', label: t('Hover') },
  { value: 'active', label: t('Pressed') },
  { value: 'focus-visible', label: t('Focus') },
]

const MORE = () => [
  { value: 'before', label: t('Before') },
  { value: 'after', label: t('After') },
  { value: 'placeholder', label: t('Placeholder') },
  { value: 'first', label: t('First Item') },
  { value: 'last', label: t('Last Item') },
  { value: 'odd', label: t('Odd Items') },
  { value: 'even', label: t('Even Items') },
  { value: 'current', label: t('Current Page') },
  { value: 'group-hover', label: t('Hover on Hover Group') },
  { value: 'dark', label: t('Dark Mode') },
  { value: 'open', label: t('When Open') },
]

/**
 * Which state the Design panel edits. Custom states come from scripts (is-open…)
 * on this element, and ancestors' states (in-open: "while the header is open").
 */
export function StateBar({ node }: { node: BlockNode }) {
  const { store } = useEditorContext()
  const state = useEditor(store, (s) => s.state)
  const breakpoint = useEditor(store, (s) => s.breakpoint)
  const ancestors = useEditor(store, (s) => tree.ancestors(s.nodes, node.id))

  const own = new Set<string>([
    ...Object.keys(node.logic?.states ?? {}).map((s) => `is-${s}`),
    ...Object.keys(node.bind ?? {}).filter((k) => k.startsWith('state:')).map((k) => `is-${k.slice(6)}`),
    ...(node.logic?.behaviors?.scroll ? ['is-scrolled', ...(node.logic.behaviors.scroll.hide ? ['is-hidden'] : [])] : []),
    ...Object.keys(node.style ?? {}).map((v) => v.split(':').pop()!).filter((v) => v.startsWith('is-') || v.startsWith('in-')),
  ])
  const inherited = new Set<string>()
  for (const a of ancestors) {
    Object.keys(a.logic?.states ?? {}).forEach((s) => inherited.add(`in-${s}`))
    if (a.logic?.behaviors?.scroll) inherited.add('in-scrolled')
  }
  const custom = [...own, ...inherited].filter((v, i, all) => all.indexOf(v) === i)
  const label = (v: string) => (v.startsWith('is-') ? v.slice(3) : v.startsWith('in-') ? t('in {state}', { state: v.slice(3) }) : [...BASE_STATES(), ...MORE()].find((m) => m.value === v)?.label ?? v)
  const set = (v: string) => store.setStyleState(v)
  const used = (v: string) => Object.keys(node.style ?? {}).some((k) => k === v || k.endsWith(`:${v}`))
  const name = async () => {
    const values = await prompt({
      title: t('Custom State'),
      description: t('A state a script, behavior or data sets (is-open). Style it here, set it in Interact → States.'),
      fields: [{ handle: 'name', type: 'text', label: t('Name'), placeholder: 'open, active…', mono: true }],
      confirm: t('Style It'),
    })
    const clean = String(values?.name ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (clean) set(`is-${clean}`)
  }

  const states = [...BASE_STATES(), ...custom.map((v) => ({ value: v, label: label(v) })), ...(state && !BASE_STATES().some((b) => b.value === state) && !custom.includes(state) ? [{ value: state, label: label(state) }] : [])]
  // Styles for a smaller screen reach every screen smaller still.
  const where = breakpoint === 'tablet' ? t('Tablet and Phone') : breakpoint === 'mobile' ? t('Phone') : breakpoint

  return (
    <div className="space-y-2 border-b border-border px-4 py-3">
      <div className="flex items-start gap-1">
        {/* A track like a segmented control: the state being styled lies on it; one with styles of its own carries a dot. */}
        <div data-wrap className="flex min-w-0 flex-1 flex-wrap gap-0.5 rounded-md bg-active p-0.5" role="radiogroup" aria-label={t('State')}>
          {states.map((st) => (
            <Button
              key={st.value || 'default'}
              variant="ghost"
              size="xs"
              role="radio"
              aria-checked={state === st.value}
              onClick={() => set(st.value)}
              className={cn('relative flex-[1_0_auto] !rounded-sm !px-1.5', state === st.value ? '!bg-float !text-ink shadow-raise dark:!bg-fill' : '!bg-transparent !text-muted hover:!text-text')}
            >
              <span>{st.label}</span>
              {st.value && used(st.value) && state !== st.value && <span className="size-1 shrink-0 rounded-full bg-current opacity-70" aria-hidden />}
            </Button>
          ))}
        </div>
        <Menu
          align="end"
          trigger={
            <IconButton icon="plus" label={t('More States')} />
          }
          items={[
            ...MORE().map((m) => ({ label: m.label, onSelect: () => set(m.value), checked: state === m.value })),
            { separator: true, label: '' },
            { label: t('Custom State…'), onSelect: () => void name() },
          ]}
        />
      </div>
      {/* The state is the track above; this line only says which screens a breakpoint's styles reach. */}
      {breakpoint !== 'base' && (
        <div className="flex h-7 items-center gap-2 rounded-sm bg-bg px-2 text-xs text-text">
          <Icon name={breakpoint === 'mobile' ? 'phone' : 'tablet'} size={14} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate">{where}</span>
          <Button variant="ghost" size="xs" onClick={() => store.setBreakpoint('base')} className="!px-1 !font-normal !text-muted hover:!text-ink">{t('Back to Desktop')}</Button>
        </div>
      )}
    </div>
  )
}
