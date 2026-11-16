import { PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { Pressable } from '../ui/Pressable'
import { DndContext } from '../ui/dnd'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { boot, events, navigate, panelsFor, prefetch, registry, request, t, useLocation, useManifest, type NavItem, type Room } from '@letterncms/sdk'
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Avatar, Icon, IconButton, Menu, Popover, SidebarGroup, SidebarRow, Tooltip, cn, labelled, type SidebarRowAction } from '../ui'
import { SiteMenu } from './SiteMenu'
import { setThemePreference, useThemePreference } from '../ui/theme'
import { isPinned, leaveRoom, movePinned, openRoom, PINNED, remember, setPinned, SETTINGS_SHORTCUT, unpin, wayOut } from './sidebarStore'
import { parentWay, placeAt, roomHome, SETTINGS, subscribeParent, type Way } from '../ui/place'

/** A screen's own state of the sidebar (see `ScreenSidebar`). */
export interface OwnSidebar {
  title: string
  backTo: string
  backLabel: string
}

interface SidebarProps {
  /** On a screen with a state of its own: what to call it, and where its list goes. */
  own?: OwnSidebar | null
  /** Over the screen, on a phone. */
  drawer?: boolean
  onOwnHost?: (element: HTMLElement | null) => void
  onSearch: () => void
  /** Called when a link is followed (the overlay sidebar on narrow screens closes). */
  onNavigate?: () => void
  /** The room the screen on view is in: the sidebar switches with the screen, not ahead of it while the next one loads. */
  room?: Room
}


const customize = () => events.emit('sidebar.customize')

/** How far each state of the sidebar is from the main one. */
const depth = { main: 0, room: 1, screen: 2 } as const

/**
 * The admin's sidebar, in one of two states that follow the screen on view: the main sidebar (what each person
 * pinned, More for the rest) and, on a screen of a room (settings, the design), that room's sidebar with a way back.
 * Same frame, same rows, same footer — only the list changes. A screen's own state (the editor's Outline) is the
 * screen's: its list, no footer.
 */
export function Sidebar({ own, drawer, onOwnHost, onSearch, onNavigate, room }: SidebarProps) {
  const manifest = useManifest()
  const { path, search } = useLocation()
  const state: keyof typeof depth = own ? 'screen' : room ? 'room' : 'main'
  const active = placeAt(manifest.nav, path)?.id

  useEffect(() => remember(manifest, path, search), [manifest, path, search])
  // Switching states moves the list, in from the side it leads to (deeper: a room, then a screen's own) and back from the other; the admin opening does not.
  // From one room to another, it comes in like any deeper state.
  const key = state === 'room' ? `room:${room!.id}` : state
  const previous = useRef({ state, key })
  const direction = useRef<'in' | 'out' | undefined>(undefined)
  if (key !== previous.current.key) {
    direction.current = depth[state] >= depth[previous.current.state] ? 'in' : 'out'
    previous.current = { state, key }
  }

  // A row of a screen's own sidebar is followed like any other: on narrow screens, the overlay goes. (Its rows come through a portal, so listen in the DOM.)
  const aside = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = aside.current
    if (!own || !element || !onNavigate) return
    const follow = (e: MouseEvent) => { if (e.target instanceof Element && e.target.closest('.cms-sidebar-row-main')) onNavigate() }
    element.addEventListener('click', follow)
    return () => element.removeEventListener('click', follow)
  }, [own, onNavigate])

  return (
    <aside ref={aside} className={cn('flex h-full shrink-0 flex-col', drawer ? 'w-[min(320px,86vw)] bg-float shadow-dialog' : 'w-[var(--cms-sidebar-size,248px)] bg-surface pt-2')}>
      <div key={key} data-direction={direction.current} className="cms-sidebar-mode flex min-h-0 flex-1 flex-col">
        {own ? (
          <>
            <StateTitle>{own.title}</StateTitle>
            <div ref={onOwnHost} className="min-h-0 flex-1 overflow-y-auto" />
          </>
        ) : room
          ? <RoomSidebar room={room} onNavigate={onNavigate} active={active} />
          : <MainSidebar onSearch={onSearch} onNavigate={onNavigate} active={active} />}
      </div>
      {/* The admin's own states end with who is signed in; a screen's own (the Outline) gives the screen all the room. */}
      {!own && <Footer room={room} onNavigate={onNavigate} />}
    </aside>
  )
}

/** A nav item as a sidebar row: what it is, where it leads (a room's door, into the room), what can be done with it. */
function Row({ item, active, sortable, actions, onNavigate }: { item: NavItem; active: boolean; sortable?: boolean; actions?: (SidebarRowAction | false)[]; onNavigate?: () => void }) {
  return (
    <SidebarRow
      label={item.label}
      icon={item.icon}
      to={item.path}
      opens={!!item.room}
      onClick={() => onNavigate?.()}
      active={active}
      badge={item.badge || undefined}
      shortcut={item.shortcut}
      actions={actions}
      sortable={sortable}
    />
  )
}

/** Where everyone starts (the home screens, a row into each room), then what this person pinned from the rooms. */
function MainSidebar({ onSearch, onNavigate, active }: { onSearch: () => void; onNavigate?: () => void; active?: string }) {
  const manifest = useManifest()
  const up = useWayUp({}) !== null
  const layout = manifest.sidebar
  const items = new Map(manifest.nav.map((n) => [n.id, n]))
  const main = layout.sections.find((s) => s.id !== PINNED)?.items.filter((id) => items.has(id)) ?? []
  const pinned = (layout.sections.find((s) => s.id === PINNED)?.items ?? []).filter((id) => items.has(id) && isPinned(layout, id))
  // What was unpinned and has no room to stay in waits under More; a room's screen is in its room.
  const inRooms = new Set(manifest.rooms.flatMap((room) => room.sections.flatMap((section) => section.items)))
  const more = layout.hidden.filter((id) => items.has(id) && !inRooms.has(id))

  return (
    <>
      {/* The shell's sidebar button holds the first place in the row, in every state. */}
      <div className="flex h-12 shrink-0 items-center gap-1 pl-10 pr-2">
        {/* Below the top, the way back holds this place (see StateBack). */}
        {up ? <span className="flex-1" /> : <SiteMenu />}
        <Tooltip content={t('Search')} shortcut="mod+k" side="bottom">
          <IconButton icon="search" label={t('Search')} title={undefined} size="sm" onClick={onSearch} />
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label={t('Main')}>
        <SidebarGroup>
          <SidebarStart onNavigate={onNavigate} />
          {main.map((id) => <Row key={id} item={items.get(id)!} active={active === id} onNavigate={onNavigate} />)}
        </SidebarGroup>
        {(pinned.length > 0 || more.length > 0) && (
          <SidebarGroup title={t('Pinned')}>
            <Pinned ids={pinned} items={items} active={active} onNavigate={onNavigate} />
            {more.length > 0 && <More ids={more} items={items} active={active} onNavigate={onNavigate} />}
          </SidebarGroup>
        )}
      </nav>
    </>
  )
}

/** Rows a plugin puts at the top of the main sidebar, above the dashboard: the `sidebar.start` slot. */
function SidebarStart({ onNavigate }: { onNavigate?: () => void }) {
  useSyncExternalStore(registry.panels.subscribe, registry.panels.version)
  const rows = panelsFor('sidebar.start', { onNavigate })
  return rows.map(({ id, component: Row }) => <Row key={id} onNavigate={onNavigate} />)
}

/** What is pinned: drag to reorder, right-click for the rest. */
function Pinned({ ids, items, active, onNavigate }: { ids: string[]; items: Map<string, NavItem>; active?: string; onNavigate?: () => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  // The pointer is let go over the link it dragged: that is not a click.
  const dragged = useRef(false)

  const end = ({ active: moved, over }: DragEndEvent) => {
    setTimeout(() => { dragged.current = false })
    if (over && moved.id !== over.id) movePinned(String(moved.id), ids.indexOf(String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => { dragged.current = true }} onDragEnd={end} onDragCancel={() => { dragged.current = false }}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {ids.map((id, index) => (
          <PinnedRow
            key={id}
            item={items.get(id)!}
            index={index}
            last={index === ids.length - 1}
            active={active === id}
            dragged={dragged}
            onNavigate={onNavigate}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

/** A pinned row: dragged into place, its menu on a right-click. */
function PinnedRow({ item, index, last, active, dragged, onNavigate }: { item: NavItem; index: number; last: boolean; active: boolean; dragged: { current: boolean }; onNavigate?: () => void }) {
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
      <Row
        item={item}
        active={active}
        sortable
        onNavigate={onNavigate}
        actions={[
          { label: t('Move Up'), icon: 'arrow-up', disabled: index === 0, onSelect: () => movePinned(item.id, index - 1) },
          { label: t('Move Down'), icon: 'arrow-down', disabled: last, onSelect: () => movePinned(item.id, index + 1) },
          { label: t('Unpin'), icon: 'pin-off', quick: true, onSelect: () => unpin(item.id) },
          { separator: true, label: '' },
          { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: customize },
        ]}
      />
    </div>
  )
}

/** What was unpinned, one click away, each with a pin. */
function More({ ids, items, active, onNavigate }: { ids: string[]; items: Map<string, NavItem>; active?: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(false)
  // The screen on view is under More: More says so, the way a pinned row would.
  const here = active !== undefined && ids.includes(active)

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="right"
      align="start"
      className="w-60"
      trigger={
        <Pressable compact className={cn('cms-sidebar-row w-full', here && 'cms-sidebar-row-active')} data-popup-open={open || undefined}>
          <span className="cms-sidebar-row-main">
            <Icon name="more" size={16} className="shrink-0" />
            <span className="min-w-0 flex-1 truncate text-left">{t('More')}</span>
            <Icon name="chevron-right" size={12} className="shrink-0 text-faint" />
          </span>
        </Pressable>
      }
    >
      <div className="space-y-px">
        {ids.map((id) => (
          <Row
            key={id}
            item={items.get(id)!}
            active={active === id}
            onNavigate={() => { setOpen(false); onNavigate?.() }}
            actions={[
              { label: t('Pin to Sidebar'), icon: 'pin', quick: true, onSelect: () => setPinned(id, true) },
              { separator: true, label: '' },
              { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: () => { setOpen(false); customize() } },
            ]}
          />
        ))}
      </div>
    </Popover>
  )
}

/** What a state of the sidebar other than the main one is, under the row with the sidebar button and the way back. */
function StateTitle({ children }: { children: ReactNode }) {
  return <h2 className="m-0 shrink-0 truncate px-4 pb-2 pt-12 text-sm font-semibold tracking-[-0.01em] text-ink">{children}</h2>
}

/**
 * The level above the screen on view, where the admin's one way back leads: the level before it in its top bar's
 * trail (a page's editor: its list; a class: its group), or what a screen's own sidebar names; from the first level
 * of a room, out of the room, to the last place before it. Never by history: one level up, always. None at the top.
 */
export function useWayUp({ own, room }: Pick<SidebarProps, 'own' | 'room'>): Way | null {
  const manifest = useManifest()
  const parent = useSyncExternalStore(subscribeParent, parentWay)
  if (own) return { to: own.backTo, label: own.backLabel }
  if (parent) return parent
  if (!room) return null
  const out = wayOut(room.id)
  return { to: out, label: placeAt(manifest.nav, out.split('?')[0])?.label ?? t('Dashboard') }
}

/**
 * The admin's one way back, beside the sidebar button, in the same place with the sidebar in or out, on every screen
 * with a level above it. It always goes up one level, and always says "Back": the tooltip says where.
 */
export function StateBack({ own, onNavigate, drawer, room }: Pick<SidebarProps, 'own' | 'onNavigate' | 'drawer' | 'room'>) {
  const way = useWayUp({ own, room })
  if (!way) return null
  const label = t('Back to {label}', { label: way.label })
  return (
    <Tooltip content={label} shortcut={own ? undefined : 'esc'} side="bottom">
      <Pressable
        aria-label={label}
        onClick={() => { navigate(way.to); onNavigate?.() }}
        className="cms-touch flex h-7 min-w-0 items-center gap-1 rounded-sm pl-1 pr-2 text-sm text-muted outline-offset-[-2px] transition-colors hover:bg-hover hover:text-text"
      >
        <Icon name="chevron-left" size={14} className={cn('shrink-0', !drawer && 'max-sm:size-4')} />
        <span className={cn('truncate', !drawer && 'max-sm:hidden')}>{t('Back')}</span>
      </Pressable>
    </Tooltip>
  )
}

/** A room's screens, section by section, under its name. */
function RoomSidebar({ room, onNavigate, active }: { room: Room; onNavigate?: () => void; active?: string }) {
  const manifest = useManifest()
  const items = new Map(manifest.nav.map((n) => [n.id, n]))

  return (
    <>
      <StateTitle>{room.label}</StateTitle>

      <nav className="flex-1 overflow-y-auto px-2 pb-4" aria-label={room.label}>
        {room.sections.map((section) => (
          <SidebarGroup key={section.id} title={section.label}>
            {section.items.map((id) => items.get(id)).filter((item): item is NavItem => !!item).map((item) => {
              // A screen of a room is a click away from the main sidebar once it is pinned there; settings are set up once, and not pinned.
              const pinned = isPinned(manifest.sidebar, item.id)
              return (
                <Row
                  key={item.id}
                  item={item}
                  active={active === item.id}
                  onNavigate={onNavigate}
                  actions={room.id === SETTINGS ? undefined : [
                    pinned
                      ? { label: t('Unpin'), icon: 'pin-off', quick: true, onSelect: () => unpin(item.id) }
                      : { label: t('Pin to Sidebar'), icon: 'pin', quick: true, onSelect: () => setPinned(item.id, true) },
                    { separator: true, label: '' },
                    { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: customize },
                  ]}
                />
              )
            })}
          </SidebarGroup>
        ))}
      </nav>
    </>
  )
}

/** Who is signed in, their menu, and the way into settings — the same in the main sidebar and every room. */
function Footer({ room, onNavigate }: { room?: Room; onNavigate?: () => void }) {
  const manifest = useManifest()
  const theme = useThemePreference()
  const settings = room?.id === SETTINGS

  const signOut = async () => {
    await request('POST', 'auth/logout')
    window.location.href = boot.base
  }

  const chooseTheme = setThemePreference

  // Settings' first page is ready by the time the button is pressed, so the screen and the sidebar switch together.
  const warmSettings = () => {
    const to = roomHome(manifest, SETTINGS)
    if (!settings && to) prefetch(to)
  }

  const toggleSettings = () => {
    if (settings) leaveRoom()
    else openRoom(SETTINGS)
    onNavigate?.()
  }
  return (
    <div className="flex shrink-0 items-center gap-1 p-2">
      <Menu
        align="start"
        side="top"
        trigger={
          <Pressable className="flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 text-left outline-offset-[-2px] hover:bg-hover">
            <span aria-hidden="true" className="flex shrink-0">
              <Avatar name={manifest.user.name} initials={manifest.user.initials} src={manifest.user.avatar} size={24} tone="accent" />
            </span>
            {/* Keep the visible name in the button's accessible name. */}
            <span className="sr-only">{labelled(t('Account'), '')}</span>
            <span className="min-w-0 truncate text-sm font-medium text-text">{manifest.user.name}</span>
          </Pressable>
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
        <IconButton icon="settings" label={settings ? t('Close Settings') : t('Settings')} title={undefined} size="sm" active={settings} onClick={toggleSettings} onPointerEnter={warmSettings} onFocus={warmSettings} />
      </Tooltip>
    </div>
  )
}
