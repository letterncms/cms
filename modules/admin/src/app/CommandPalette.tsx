import { Command, defaultFilter } from 'cmdk'
import { can, events, loadManifest, navigate, prefetch, registry, run, t, useAbility, useManifest, type EntrySummary } from '@letterncms/sdk'
import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Dialog as Base } from '@base-ui/react/dialog'
import { Fields, Icon, Kbd, NoMatches, Spinner, StatusDot, toast } from '../ui'
import { setThemePreference } from '../ui/theme'
import { openSettings, SETTINGS_SHORTCUT } from './sidebarStore'

function useDebounced<T>(value: T, ms = 180): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setV(value), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return v
}

const itemClass =
  'flex h-9 cursor-default select-none items-center gap-2.5 rounded-sm px-2.5 text-sm text-text outline-none data-[selected=true]:bg-hover'

function matchScore(title: string, query: string, keywords = '', slug = ''): number {
  if (!query) return 1
  const term = query.toLowerCase()
  const name = title.trim().toLowerCase()
  const handle = slug.toLowerCase()
  if (name === term) return 7
  if (handle === term) return 6
  if (name.startsWith(term)) return 5
  if (name.includes(term)) return 4
  if (handle.startsWith(term)) return 3
  if (handle.includes(term)) return 2
  const fuzzy = Math.max(defaultFilter(title, query), defaultFilter(keywords, query))
  return fuzzy > 0 ? 1 + fuzzy / 2 : 0
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const manifest = useManifest()
  const [query, setQuery] = useState('')
  const [selection, setSelection] = useState({ query: '', value: '' })
  const debounced = useDebounced(query.trim())
  useSyncExternalStore(registry.commands.subscribe, registry.commands.version)
  const search = useAbility<EntrySummary[]>('content/search', { query: debounced, limit: 8 }, { enabled: open && debounced.length > 1 })

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelection({ query: '', value: '' })
    }
  }, [open])

  const go = (fn: () => void) => {
    onOpenChange(false)
    fn()
  }

  const pages = useMemo(
    () => [
      ...manifest.nav.filter((n) => !n.home || n.id.startsWith('settings.')).map((n) => ({ id: n.id, label: n.home && n.id.startsWith('settings.') ? t('{name} Settings', { name: manifest.nav.find((h) => h.id === n.home)?.label ?? n.label }) : n.label, icon: n.icon, path: n.path })),
      ...manifest.globals.map((g) => ({ id: `g-${g.handle}`, label: g.title, icon: g.icon, path: `/globals/${g.handle}` })),
    ],
    [manifest],
  )
  const commands = registry.commands.all()
  const queryCommands = commands.filter((c) => c.acceptsQuery)
  const trimmedQuery = query.trim()
  const entries = trimmedQuery === debounced && trimmedQuery.length > 1 ? search.data ?? [] : []
  const isSearching = trimmedQuery.length > 1 && (trimmedQuery !== debounced || search.isFetching)
  type Item = { value: string; icon: string; label: ReactNode; trailing?: ReactNode; path?: string; score?: number; perform: () => void }
  type Group = { heading: string; items: Item[] }
  const localGroups: Group[] = [
    { heading: t('Jump To'), items: pages.map((p) => ({
      value: `go ${p.label}`, icon: p.icon, label: p.label, path: p.path, perform: () => navigate(p.path),
    })) },
    { heading: t('New'), items: manifest.collections.filter((c) => c.can.create && !c.within).map((c) => ({
      value: `new ${c.singular} create`, icon: 'plus', label: c.newLabel, perform: () => navigate(`/content/${c.handle}/new`),
    })) },
    { heading: t('Commands'), items: [
      { value: 'customize sidebar pin unpin reorder navigation menu more', icon: 'sidebar', label: t('Customize Sidebar…'), perform: () => events.emit('sidebar.customize') },
      { value: 'open settings preferences configure', icon: 'settings', label: t('Open Settings'), trailing: <Kbd keys={SETTINGS_SHORTCUT} />, perform: openSettings },
      ...commands.filter((c) => !c.acceptsQuery).map((c) => ({
        value: `${c.label} ${(c.keywords ?? []).join(' ')}`.trim(), icon: c.icon ?? 'command', label: c.label,
        trailing: c.shortcut ? <Kbd keys={c.shortcut} /> : undefined, perform: () => void c.perform(),
      })),
      ...manifest.commands.map((c) => ({
        value: `${c.label} ${(c.keywords ?? []).join(' ')}`.trim(), icon: c.icon, label: c.label,
        perform: () => {
          if (c.path) navigate(c.path)
          else if (c.ability) void run(c.ability, c.input ?? {}).then(() => toast.success(t('Done: {label}', { label: c.label })), toast.error)
        },
      })),
    ] },
    { heading: t('Appearance'), items: (['light', 'dark', 'system'] as const).map((scheme) => ({
      value: `theme ${scheme} mode appearance`, icon: scheme === 'light' ? 'sun' : scheme === 'dark' ? 'moon' : 'monitor',
      label: scheme === 'system' ? t('Match System Appearance') : scheme === 'dark' ? t('Switch to Dark Mode') : t('Switch to Light Mode'),
      perform: () => setThemePreference(scheme),
    })) },
    { heading: t('Maintenance'), items: can('packages.manage') && manifest.packages && Object.keys(manifest.packages.pending).length > 0 ? [{
      value: 'run pending upgrades migrations database update', icon: 'database', label: t('Update the Database'),
      perform: () => void run('packages/migrate').then(() => loadManifest()).then(() => toast.success(t('Database is up to date')), toast.error),
    }] : [] },
  ]
  // Own the ordering for both local and async results; cmdk handles keyboard navigation.
  const matchedGroups = localGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, score: matchScore(String(item.label), trimmedQuery, item.value) }))
      .filter((item) => item.score > 0).sort((a, b) => b.score - a.score),
  })).filter((group) => group.items.length > 0)
  // Content arrives a moment after the commands: it goes below them, so nothing already shown moves.
  const groups: Group[] = [
    ...matchedGroups.sort((a, b) => (b.items[0].score ?? 1) - (a.items[0].score ?? 1)),
    ...(entries.length > 0 ? [{ heading: t('Content'), items: entries.map((e) => ({
      value: `entry ${e.title} ${e.slug} ${e.id}`, icon: manifest.collections.find((c) => c.handle === e.collection)?.icon ?? 'file', label: e.title,
      // Body-only matches stay useful, below title, slug and command matches.
      score: matchScore(e.title, trimmedQuery, '', e.slug) || 1,
      trailing: <><span className="text-xs text-faint">{e.uri ?? e.collection}</span><StatusDot status={e.displayStatus} label="" /></>,
      perform: () => navigate(`/content/${e.collection}/${e.id}`),
    })).sort((a, b) => b.score - a.score) }] : []),
  ]
  if (trimmedQuery && groups.length === 0 && !isSearching && queryCommands.length > 0) {
    groups.push({ heading: t('Ask'), items: queryCommands.map((c) => ({
      value: `ask ${c.id} ${trimmedQuery}`, icon: c.icon ?? 'sparkle',
      label: <>{c.label} <span className="text-muted">“{trimmedQuery}”</span></>, trailing: <Kbd keys="enter" />,
      perform: () => void c.perform(trimmedQuery),
    })) })
  }
  const firstValue = groups[0]?.items[0]?.value ?? ''
  // A new query highlights its first result, in the same render; results that arrive later keep the highlight where it is.
  const selected = selection.query === query && groups.some((group) => group.items.some((item) => item.value === selection.value))
    ? selection.value : firstValue

  return (
    <Base.Root open={open} onOpenChange={(o) => onOpenChange(o)}>
      <Base.Portal>
        <Base.Backdrop className="fixed inset-0 z-overlay bg-overlay transition-opacity duration-move data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Base.Popup className="fixed left-1/2 top-[14vh] z-overlay w-[calc(100vw-32px)] max-w-[620px] -translate-x-1/2 overflow-hidden rounded-xl border border-border-modal bg-bg shadow-dialog outline-none transition-[opacity,transform] duration-move ease-out data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0">
          <Base.Title className="sr-only">{t('Command Palette')}</Base.Title>
          <Command label={t('Command Palette')} loop shouldFilter={false} value={selected} onValueChange={(value) => {
            setSelection({ query, value: value ?? '' })
            const item = groups.flatMap((group) => group.items).find((item) => item.value === value)
            if (item?.path) prefetch(item.path)
          }} className="flex flex-col">
            <div className="flex h-12 items-center gap-2.5 border-b border-border px-4">
              <Icon name="search" size={16} className="text-faint" />
              <Fields bare layout="inline" className="flex-1" fields={[{ handle: 'query', type: 'text', label: t('Search'), component: 'command-query', placeholder: queryCommands.length > 0 ? t('Search or Ask {brand}') : t('Search'), autofocus: true }]} values={{ query }} onChange={(_, v) => setQuery(v ?? '')} />
              {isSearching && <Spinner size={14} className="text-faint" />}
              <Kbd keys="esc" />
            </div>
            <Command.List className="max-h-[min(440px,60vh)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:cms-label [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2">
              {groups.length === 0 && !isSearching && <Command.Empty><NoMatches className="py-8" /></Command.Empty>}
              {groups.map((group) => (
                <Command.Group key={group.heading} heading={group.heading}>
                  {group.items.map((item) => (
                    <Command.Item key={item.value} value={item.value} onSelect={() => go(item.perform)} className={itemClass}>
                      <Icon name={item.icon} size={15} className="text-muted" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.trailing}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Base.Popup>
      </Base.Portal>
    </Base.Root>
  )
}
