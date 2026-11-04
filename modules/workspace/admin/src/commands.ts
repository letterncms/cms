import { getManifest, navigate, onManifest, registry, run, t, type ComposerOption, type FieldDef } from '@letterncms/sdk'
import { askable } from './schema'
import { agent, panel } from './store'

/** An ability the person may run from a thread, as `workspace/commands` lists it. */
export interface Runnable {
  name: string
  label: string
  group: string
  icon: string
  input: Record<string, unknown>
  destructive: boolean
  readOnly: boolean
}

let listed: Promise<Runnable[]> | null = null
/** What / offers changes with the packages and permissions: listed again after the manifest is. */
onManifest(() => { listed = null })
export const runnable = () => (listed ??= run<Runnable[]>('workspace/commands').catch(() => { listed = null; return [] }))

/** Every word typed is in one of its names: "new page" finds New Page by its English words and its handle. */
const matches = (query: string, ...words: (string | undefined)[]) => {
  const said = words.filter(Boolean).join(' ').toLowerCase()
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean).every((term) => said.includes(term))
}

// With an agent, Enter asks it; `/` and words search the admin instead, without it. (Without one, Enter searches.)
registry.composer.set('workspace-search', {
  id: 'workspace-search', trigger: '/', label: t('Search'), order: 90,
  search: (query) => agent() && query.trim().length > 1 ? [{ id: 'search', label: t('Search for “{query}”', { query: query.trim() }), icon: 'search', perform: () => panel.search(query) }] : [],
})

// `/` in a thread: making things first, then the places to go, what the admin's screens offer, and every ability the person may run.
registry.composer.set('workspace-create', {
  id: 'workspace-create', trigger: '/', label: t('Create'), order: 20,
  search: async (query) => {
    const create = (await runnable()).find((ability) => ability.name === 'entries/create')
    if (!create) return []
    return getManifest().collections.filter((c) => c.can.create && !c.within && matches(query, c.newLabel, c.title, c.singular, c.handle, `new ${c.singular}`, 'create')).map((c) => ({
      id: `create:${c.handle}`, label: c.newLabel, icon: 'plus',
      command: { ability: 'entries/create', input: { collection: c.handle }, schema: create.input, required: true },
    }))
  },
})

registry.composer.set('workspace-places', {
  id: 'workspace-places', trigger: '/', label: t('Go To'), order: 30,
  search: (query) => {
    const nav = getManifest().nav.filter((n) => !n.home && matches(query, n.label))
    return nav.slice(0, query ? 8 : 6).map((n) => ({ id: `go:${n.id}`, label: n.label, icon: n.icon, perform: () => navigate(n.path) }))
  },
})

registry.composer.set('workspace-commands', {
  id: 'workspace-commands', trigger: '/', label: t('Commands'), order: 40,
  search: async (query) => {
    const abilities = await runnable()
    return [
      ...registry.commands.all().filter((c) => c.id !== 'workspace' && !c.acceptsQuery && matches(query, c.label, ...(c.keywords ?? []))).map((c): ComposerOption => ({
        id: `command:${c.id}`, label: c.label, icon: c.icon ?? 'command', perform: () => void c.perform(),
      })),
      // One with an ability runs in the thread, asking for what it needs (Invite User), even when ⌘K opens a screen for it.
      ...getManifest().commands.filter((c) => matches(query, c.label, ...(c.keywords ?? []))).map((c): ComposerOption => {
        const ability = c.ability ? abilities.find((a) => a.name === c.ability) : undefined
        return c.ability && (ability || !c.path)
          ? { id: `ability:${c.id}`, label: c.label, icon: c.icon, command: { ability: c.ability, input: c.input ?? {}, schema: ability?.input, required: true } }
          : { id: `go:${c.id}`, label: c.label, icon: c.icon, perform: () => c.path && navigate(c.path) }
      }),
    ]
  },
})

// A settings page, asked right in the thread with what it holds now.
registry.composer.set('workspace-settings', {
  id: 'workspace-settings', trigger: '/', label: t('Settings'), order: 50,
  search: (query) => getManifest().settings.filter((s) => matches(query, s.label, s.namespace, 'settings')).slice(0, query ? 8 : 4).map((s) => ({
    id: `settings:${s.namespace}`, label: t('{name} Settings', { name: s.label }), icon: s.icon,
    command: {
      ability: 'settings/update', input: { namespace: s.namespace }, into: 'values',
      load: () => run<{ fields: FieldDef[]; values: Record<string, unknown> }>('settings/get', { namespace: s.namespace }),
    },
  })),
})

// Every ability the person may run, once something is typed: a bare / stays short. One that needs a raw id is left to the places that have it.
registry.composer.set('workspace-abilities', {
  id: 'workspace-abilities', trigger: '/', label: t('Abilities'), order: 60,
  search: async (query) => query.trim() === '' ? [] : (await runnable())
    .filter((ability) => matches(query, ability.label, ability.group, ability.name) && askable(ability.input, ability.name))
    .map((ability) => ({
      id: `run:${ability.name}`, label: ability.label, group: ability.group, icon: ability.icon,
      command: { ability: ability.name, schema: ability.input, destructive: ability.destructive },
    })),
})
