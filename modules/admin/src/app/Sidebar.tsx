import { PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '../ui/dnd'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { boot, events, Link, navigate, panelsFor, registry, request, t, useLocation, useManifest, type ArrangedSection, type NavItem } from '@letterncms/sdk'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Avatar, Icon, IconButton, Menu, Popover, SidebarRow, Tooltip, cn, labelled, type SidebarRowAction } from '../ui'
import { BrandMark } from './Brand'
import { setThemePreference, useThemePreference } from '../ui/theme'
import { isPinned, lastApp, leaveSettings, movePinned, openSettings, remember, setPinned, SETTINGS_SHORTCUT, unpin } from './sidebarStore'
import { inSettings, parentWay, placeAt, subscribeParent, wayBack } from '../ui/place'

/** A screen's own state of the sidebar (see `ScreenSidebar`). */
export interface OwnSidebar {
  title: string
  backTo: string
  backLabel: string
  /** Sections of the screen: under its row in the sidebar, not a sidebar of their own. */
  nested?: boolean
}

interface SidebarProps {
  /** On a screen with a state of its own: what to call it, and where its list goes. */
  own?: OwnSidebar | null
  /** On a screen whose sections go under its row: where they go. */
  nested?: OwnSidebar | null
  /** Over the screen, on a phone. */
  drawer?: boolean
  onOwnHost?: (element: HTMLElement | null) => void
  onSearch: () => void
  /** Called when a link is followed (the overlay sidebar on narrow screens closes). */
  onNavigate?: () => void
}


const customize = () => events.emit('sidebar.customize')

/** How far each state of the sidebar is from the main one. */
const depth = { main: 0, settings: 1, screen: 2 } as const

/**
 * The admin's sidebar, in one of two states that follow the screen on view:
 * the main sidebar (what each person pinned, More for the rest) and, on a settings page, the settings sidebar with a way back. Same frame,
 * same rows, same footer — only the list changes. A screen's own state (the editor's Outline) is the screen's: its list, no footer.
 */
export function Sidebar({ own, nested, drawer, onOwnHost, onSearch, onNavigate }: SidebarProps) {
  const manifest = useManifest()
  const { path, search } = useLocation()
  const settings = inSettings(manifest, path)
  const state = own ? 'screen' : settings ? 'settings' : 'main'
  const active = placeAt(manifest.nav, path)?.id

  useEffect(() => remember(manifest, path, search), [manifest, path, search])
  // Switching states moves the list, in from the side it leads to (deeper: settings, then a screen's own) and back from the other; the admin opening does not.
  const previous = useRef<keyof typeof depth>(state)
  const direction = useRef<'in' | 'out' | undefined>(undefined)
  if (state !== previous.current) {
    direction.current = depth[state] > depth[previous.current] ? 'in' : 'out'
    previous.current = state
  }

  // A row of a screen's own sidebar is followed like any other: on narrow screens, the overlay goes. (Its rows come through a portal, so listen in the DOM.)
  const aside = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = aside.current
    if (!(own || nested) || !element || !onNavigate) return
    const follow = (e: MouseEvent) => { if (e.target instanceof Element && e.target.closest('.cms-sidebar-row-main')) onNavigate() }
    element.addEventListener('click', follow)
    return () => element.removeEventListener('click', follow)
  }, [own, nested, onNavigate])

  return (
    <aside ref={aside} className={cn('flex h-full shrink-0 flex-col', drawer ? 'w-[min(320px,86vw)] bg-float shadow-dialog' : 'w-[248px] bg-surface pt-2')}>
      <div key={state} data-direction={direction.current} className="cms-sidebar-mode flex min-h-0 flex-1 flex-col">
        {own ? (
          <>
            <StateTitle>{own.title}</StateTitle>
            <div ref={onOwnHost} className="min-h-0 flex-1 overflow-y-auto" />
          </>
        ) : settings
          ? <SettingsSidebar onNavigate={onNavigate} active={active} />
          : <MainSidebar onSearch={onSearch} onNavigate={onNavigate} active={active} nest={nested ? onOwnHost : undefined} />}
      </div>
      {/* The admin's own states end with who is signed in; a screen's own (the Outline) gives the screen all the room. */}
      {!own && <Footer settings={settings} onNavigate={onNavigate} />}
    </aside>
  )
}

/** A nav item as a sidebar row: what it is, where it leads, what can be done with it. */
function Row({ item, active, sortable, actions, onNavigate }: { item: NavItem; active: boolean; sortable?: boolean; actions?: (SidebarRowAction | false)[]; onNavigate?: () => void }) {
  return (
    <SidebarRow
      label={item.label}
      icon={item.icon}
      to={item.path}
      onClick={() => onNavigate?.()}
      active={active}
      badge={item.badge || undefined}
      shortcut={item.shortcut}
      actions={actions}
      sortable={sortable}
    />
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="cms-label flex h-7 items-center px-2">{children}</div>
}

/** Pinned items, section by section; More after the first section, once someone has unpinned something. */
function MainSidebar({ onSearch, onNavigate, active, nest }: { onSearch: () => void; onNavigate?: () => void; active?: string; nest?: (element: HTMLElement | null) => void }) {
  const manifest = useManifest()
  const layout = manifest.sidebar
  const items = new Map(manifest.nav.map((n) => [n.id, n]))
  const sections = layout.sections.map((s) => ({ ...s, items: s.items.filter((id) => items.has(id) && isPinned(layout, id)) }))
  const more = layout.sections.map((s) => ({ ...s, items: s.items.filter((id) => items.has(id) && !isPinned(layout, id)) })).filter((s) => s.items.length > 0)

  return (
    <>
      {/* The shell's sidebar button holds the first place in the row, in every state. */}
      <div className="flex h-12 shrink-0 items-center gap-1 pl-10 pr-2">
        {/* One site, so no switcher: the name opens it. */}
        <Tooltip content={t('Open Site')} side="bottom">
          <a href={manifest.site.url || '/'} target="_blank" rel="noopener" className="group flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-1 text-left no-underline outline-offset-[-2px] hover:bg-hover">
            <BrandMark size={22} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{manifest.site.name}</span>
            <Icon name="external" size={12} className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          </a>
        </Tooltip>
        <Tooltip content={t('Search')} shortcut="mod+k" side="bottom">
          <IconButton icon="search" label={t('Search')} title={undefined} size="sm" onClick={onSearch} />
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label={t('Main')}>
        <SidebarStart onNavigate={onNavigate} />
        {sections.map((section, index) => (index === 0 || section.items.length > 0) && (
          <div key={section.id} className={cn('space-y-px', index > 0 && 'mt-4')}>
            {section.label && section.items.length > 0 && <SectionLabel>{section.label}</SectionLabel>}
            <Pinned section={section} items={items} active={active} onNavigate={onNavigate} nest={nest} />
            {/* Only what someone unpinned: nothing is put away by default. */}
            {index === 0 && more.length > 0 && <More groups={more} items={items} active={active} onNavigate={onNavigate} />}
          </div>
        ))}
      </nav>
    </>
  )
}

/** Rows a module puts at the top of the main sidebar, above what is pinned (the workspace's New Chat): the `sidebar.start` slot. */
function SidebarStart({ onNavigate }: { onNavigate?: () => void }) {
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const rows = panelsFor('sidebar.start', { onNavigate })
  if (rows.length === 0) return null
  return <div className="mb-4 space-y-px">{rows.map(({ id, component: Row }) => <Row key={id} onNavigate={onNavigate} />)}</div>
}

/** A section's pinned items: drag to reorder, right-click for the rest. */
function Pinned({ section, items, active, onNavigate, nest }: { section: ArrangedSection; items: Map<string, NavItem>; active?: string; onNavigate?: () => void; nest?: (element: HTMLElement | null) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  // The pointer is let go over the link it dragged: that is not a click.
  const dragged = useRef(false)

  const end = ({ active: moved, over }: DragEndEvent) => {
    setTimeout(() => { dragged.current = false })
    if (over && moved.id !== over.id) movePinned(section.id, String(moved.id), section.items.indexOf(String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => { dragged.current = true }} onDragEnd={end} onDragCancel={() => { dragged.current = false }}>
      <SortableContext items={section.items} strategy={verticalListSortingStrategy}>
        {section.items.map((id, index) => (
          <PinnedRow
            key={id}
            item={items.get(id)!}
            section={section.id}
            index={index}
            last={index === section.items.length - 1}
            active={active === id}
            dragged={dragged}
            onNavigate={onNavigate}
            nest={active === id ? nest : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

/** A pinned row; the one on view holds its screen's sections under it, when it has some (`nest`). */
function PinnedRow({ item, section, index, last, active, dragged, onNavigate, nest }: { item: NavItem; section: string; index: number; last: boolean; active: boolean; dragged: { current: boolean }; onNavigate?: () => void; nest?: (element: HTMLElement | null) => void }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      className={cn('relative', isDragging && 'z-drag cursor-grabbing opacity-90')}
      onClickCapture={(e) => {
        if (!dragged.current) return
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {/* Open, with its sections under it: the section on view is the place you are, not the row above it. */}
      <Row
        item={item}
        active={active && !nest}
        sortable
        onNavigate={onNavigate}
        actions={[
          { label: t('Move Up'), icon: 'arrow-up', disabled: index === 0, onSelect: () => movePinned(section, item.id, index - 1) },
          { label: t('Move Down'), icon: 'arrow-down', disabled: last, onSelect: () => movePinned(section, item.id, index + 1) },
          { label: t('Unpin'), icon: 'pin-off', quick: true, onSelect: () => unpin(item.id) },
          { separator: true, label: '' },
          { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: customize },
        ]}
      />
      {nest && <div ref={nest} className="cms-sidebar-nested" onPointerDown={(e) => e.stopPropagation()} />}
    </div>
  )
}

/** Everything that is not pinned, one click away, each with a pin. */
function More({ groups, items, active, onNavigate }: { groups: ArrangedSection[]; items: Map<string, NavItem>; active?: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  // The screen on view is under More: More says so, the way a pinned row would.
  const here = groups.some((g) => active !== undefined && g.items.includes(active))

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="right"
      align="start"
      className="w-60"
      trigger={
        <button type="button" className={cn('cms-sidebar-row w-full', here && 'cms-sidebar-row-active')} data-popup-open={open || undefined}>
          <span className="cms-sidebar-row-main">
            <Icon name="more" size={16} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">{t('More')}</span>
            <Icon name="chevron-right" size={12} className="shrink-0 text-faint" />
          </span>
        </button>
      }
    >
      {groups.length === 0 && <p className="m-0 px-2 py-1.5 text-sm text-muted">{t('Everything is pinned')}</p>}
      {groups.map((group) => (
        <div key={group.id} role="group" aria-label={group.label || undefined} className="space-y-px">
          {group.label && <div className="cms-label px-2 pb-1 pt-2">{group.label}</div>}
          {group.items.map((id) => {
            const item = items.get(id)!
            return (
              <Row
                key={id}
                item={item}
                active={active === id}
                onNavigate={() => { setOpen(false); onNavigate?.() }}
                actions={[
                  { label: t('Pin to Sidebar'), icon: 'pin', quick: true, onSelect: () => setPinned(id, true) },
                ]}
              />
            )
          })}
        </div>
      ))}
      <div className="my-1 h-px bg-border" />
      {/* A row like the others above it: the one place to arrange the sidebar. */}
      <SidebarRow label={t('Customize Sidebar…')} icon="sidebar" onClick={() => { setOpen(false); customize() }} />
    </Popover>
  )
}

/** What a state of the sidebar other than the main one is, under the row with the sidebar button and the way back. */
function StateTitle({ children }: { children: ReactNode }) {
  return <h2 className="m-0 shrink-0 truncate px-4 pb-2 pt-12 text-sm font-semibold tracking-[-0.01em] text-ink">{children}</h2>
}

/**
 * The way back from a state of the sidebar. It sits by the sidebar button, in the same place with the sidebar in or out,
 * where the main state has the site's name. It returns to where you came from: out of settings, the last screen before
 * them; from a screen's own sidebar, the screen it was opened from (else the one it names, its list).
 */
export function StateBack({ own, onNavigate, drawer }: Pick<SidebarProps, 'own' | 'onNavigate' | 'drawer'>) {
  const manifest = useManifest()
  const { path } = useLocation()
  // On a phone the top bar shows the screen's own crumb only: back is then one screen up, to the crumb before it.
  const parent = useSyncExternalStore(subscribeParent, parentWay)
  if (!own && !inSettings(manifest, path)) return null
  const way = own ? wayBack(manifest, { to: own.backTo, label: own.backLabel }) : { to: lastApp(), label: placeAt(manifest.nav, lastApp().split('?')[0])?.label ?? t('Dashboard') }
  const label = way.label
  const back = () => {
    if (own) navigate(way.to)
    else leaveSettings()
    onNavigate?.()
  }
  const up = parent && !drawer ? parent : null
  const button = 'cms-touch flex h-7 min-w-0 items-center gap-1 rounded-sm pl-1 pr-2 text-sm text-muted outline-offset-[-2px] transition-colors hover:bg-hover hover:text-text'
  return (
    <>
      <Tooltip content={t('Back to {label}', { label })} shortcut={own ? undefined : 'esc'} side="bottom">
        <button type="button" aria-label={t('Back to {label}', { label })} onClick={back} className={cn(button, up && 'max-sm:hidden')}>
          <Icon name="chevron-left" size={14} className={cn('shrink-0', !drawer && 'max-sm:size-4')} />
          <span className={cn('truncate', !drawer && 'max-sm:hidden')}>{label}</span>
        </button>
      </Tooltip>
      {up && (
        <Link to={up.to} aria-label={t('Back to {label}', { label: up.label })} className="cms-touch flex size-7 shrink-0 items-center justify-center rounded-sm text-muted no-underline outline-offset-[-2px] transition-colors hover:bg-hover hover:text-ink sm:hidden">
          {/* The weight of the sidebar button beside it. */}
          <Icon name="chevron-left" size={16} />
        </Link>
      )}
    </>
  )
}

/** Settings pages, section by section, under a way back to where you were. */
function SettingsSidebar({ onNavigate, active }: { onNavigate?: () => void; active?: string }) {
  const manifest = useManifest()
  const items = new Map(manifest.nav.map((n) => [n.id, n]))

  return (
    <>
      <StateTitle>{t('Settings')}</StateTitle>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label={t('Settings')}>
        {manifest.settingsNav.map((section, index) => (
          <div key={section.id} className={cn('space-y-px', index > 0 && 'mt-4')}>
            {section.label && <SectionLabel>{section.label}</SectionLabel>}
            {section.items.map((id) => items.get(id)).filter((item): item is NavItem => !!item).map((item) => (
              <Row key={item.id} item={item} active={active === item.id} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>
    </>
  )
}

/** Who is signed in, their menu, and the way into settings — the same in both states. */
function Footer({ settings, onNavigate }: { settings: boolean; onNavigate?: () => void }) {
  const manifest = useManifest()
  const theme = useThemePreference()

  const signOut = async () => {
    await request('POST', 'auth/logout')
    window.location.href = boot.base
  }

  const chooseTheme = setThemePreference

  const toggleSettings = () => {
    if (settings) leaveSettings()
    else openSettings()
    onNavigate?.()
  }

  return (
    <div className="flex shrink-0 items-center gap-1 p-2">
      <Menu
        align="start"
        side="top"
        trigger={
          <button type="button" className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 text-left outline-offset-[-2px] hover:bg-hover">
            <Avatar name={manifest.user.name} initials={manifest.user.initials} src={manifest.user.avatar} size={24} />
            <span className="min-w-0 flex-1">
              {/* Named by what it shows, with what it is in front: a label of its own would hide the name from voice control. */}
              <span className="sr-only">{labelled(t('Account'), '')}</span>
              <span className="block truncate text-sm font-medium leading-4 text-text">{manifest.user.name}</span>
              <span className="block truncate text-xs text-faint">{manifest.user.email}</span>
            </span>
          </button>
        }
        items={[
          { label: t('Account'), icon: 'user', onSelect: () => navigate('/account') },
          { separator: true, label: '' },
          { label: t('Appearance'), heading: true },
          { label: t('System'), icon: 'monitor', checked: theme === 'system', onSelect: () => chooseTheme('system') },
          { label: t('Light'), icon: 'sun', checked: theme === 'light', onSelect: () => chooseTheme('light') },
          { label: t('Dark'), icon: 'moon', checked: theme === 'dark', onSelect: () => chooseTheme('dark') },
          { separator: true, label: '' },
          { label: t('Sign Out'), icon: 'logout', onSelect: signOut },
        ]}
      />
      <Tooltip content={settings ? t('Close Settings') : t('Settings')} shortcut={SETTINGS_SHORTCUT} side="top">
        <IconButton icon="settings" label={settings ? t('Close Settings') : t('Settings')} title={undefined} size="sm" active={settings} onClick={toggleSettings} />
      </Tooltip>
    </div>
  )
}
