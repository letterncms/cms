import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { boot, can, events, navigate, request, t, useLocation, useManifest, type ArrangedSection, type NavItem } from '@letterncms/sdk'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Avatar, Icon, IconButton, Menu, MenuButton, Popover, SidebarRow, Tooltip, cn, type SidebarRowAction } from '../ui'
import { BrandMark } from './Brand'
import { getThemePreference, setThemePreference, type ThemePreference } from '../ui/theme'
import { inSettings, isPinned, itemAt, lastApp, leaveSettings, movePinned, openSettings, remember, setPinned, SETTINGS_SHORTCUT, unpin } from './sidebarStore'

/** A screen's own state of the sidebar (see `ScreenSidebar`). */
export interface OwnSidebar {
  title: string
  backTo: string
  backLabel: string
}

interface SidebarProps {
  /** On a screen with a state of its own: what to call it, and where its list goes. */
  own?: OwnSidebar | null
  onOwnHost?: (element: HTMLElement | null) => void
  onHide: () => void
  onSearch: () => void
  /** Called when a link is followed (the overlay sidebar on narrow screens closes). */
  onNavigate?: () => void
}

const rowClass = 'relative flex h-8 w-full items-center gap-2.5 rounded-md px-2 text-sm no-underline outline-offset-[-2px]'
const rowState = (on: boolean) => (on ? 'bg-active text-ink' : 'text-muted hover:bg-hover hover:text-text')

const customize = () => events.emit('sidebar.customize')

/**
 * The admin's sidebar, in one of two states that follow the screen on view:
 * the main sidebar (what each person pinned, More for the rest) and, on a settings page, the settings sidebar with a way back. Same frame,
 * same rows, same footer — only the list changes.
 */
export function Sidebar({ own, onOwnHost, onHide, onSearch, onNavigate }: SidebarProps) {
  const manifest = useManifest()
  const { path, search } = useLocation()
  const settings = inSettings(manifest, path)
  const state = own ? 'screen' : settings ? 'settings' : 'main'
  const active = itemAt(manifest.nav, path)?.id

  useEffect(() => remember(manifest, path, search), [manifest, path, search])
  // Switching states moves the list; the admin opening does not.
  const initial = useRef(state)
  const switched = useRef(false)
  if (state !== initial.current) switched.current = true

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col bg-surface">
      <div key={state} data-mode={switched.current ? state : undefined} className="cms-sidebar-mode flex min-h-0 flex-1 flex-col">
        {own ? (
          <>
            <StateHeader title={own.title} back={own.backLabel} onBack={() => { navigate(own.backTo); onNavigate?.() }} onHide={onHide} />
            <div ref={onOwnHost} className="min-h-0 flex-1 overflow-y-auto" />
          </>
        ) : settings
          ? <SettingsSidebar onHide={onHide} onNavigate={onNavigate} active={active} />
          : <MainSidebar onHide={onHide} onSearch={onSearch} onNavigate={onNavigate} active={active} />}
      </div>
      <Footer settings={settings} onNavigate={onNavigate} />
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

/** Every row of the main sidebar ends its menu here. */
const customizeAction = (): SidebarRowAction => ({ label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: customize })

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="flex h-7 items-center px-2 text-xs font-medium text-muted">{children}</div>
}

/** Pinned items, section by section, More after the first section. */
function MainSidebar({ onHide, onSearch, onNavigate, active }: { onHide: () => void; onSearch: () => void; onNavigate?: () => void; active?: string }) {
  const manifest = useManifest()
  const layout = manifest.sidebar
  const items = new Map(manifest.nav.map((n) => [n.id, n]))
  const sections = layout.sections.map((s) => ({ ...s, items: s.items.filter((id) => items.has(id) && isPinned(layout, id)) }))
  const more = layout.sections.map((s) => ({ ...s, items: s.items.filter((id) => items.has(id) && !isPinned(layout, id)) })).filter((s) => s.items.length > 0)

  return (
    <>
      <div className="flex h-12 shrink-0 items-center gap-1 px-3">
        <Menu
          align="start"
          trigger={
            <button type="button" aria-label={manifest.site.name} className="-ml-1 flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-1 text-left hover:bg-hover">
              <BrandMark size={22} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{manifest.site.name}</span>
              <Icon name="chevrons-up-down" size={12} className="shrink-0 text-faint" />
            </button>
          }
          items={[
            { label: t('Open Site'), icon: 'external', onSelect: () => window.open(manifest.site.url || '/', '_blank', 'noopener') },
            can('settings.manage') && { label: t('Site Settings'), icon: 'settings', onSelect: () => navigate('/settings/site') },
            { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: customize },
          ]}
        />
        <Tooltip content={t('Search')} shortcut="mod+k" side="bottom">
          <IconButton icon="search" label={t('Search')} title={undefined} size="sm" onClick={onSearch} />
        </Tooltip>
        <Tooltip content={t('Hide Sidebar')} shortcut="mod+\\" side="bottom">
          <IconButton icon="sidebar" label={t('Hide Sidebar')} title={undefined} size="sm" onClick={onHide} className="-mr-1" />
        </Tooltip>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={t('Main')}>
        {sections.map((section, index) => (index === 0 || section.items.length > 0) && (
          <div key={section.id} className={cn('space-y-px', index > 0 && 'mt-4')}>
            {section.label && section.items.length > 0 && <SectionLabel>{section.label}</SectionLabel>}
            <Pinned section={section} items={items} active={active} onNavigate={onNavigate} />
            {index === 0 && <More groups={more} items={items} active={active} onNavigate={onNavigate} />}
          </div>
        ))}
      </nav>
    </>
  )
}

/** A section's pinned items: drag to reorder, right-click for the rest. */
function Pinned({ section, items, active, onNavigate }: { section: ArrangedSection; items: Map<string, NavItem>; active?: string; onNavigate?: () => void }) {
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
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}

function PinnedRow({ item, section, index, last, active, dragged, onNavigate }: { item: NavItem; section: string; index: number; last: boolean; active: boolean; dragged: { current: boolean }; onNavigate?: () => void }) {
  const { setNodeRef, listeners, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      className={cn('relative', isDragging && 'z-10 cursor-grabbing opacity-90')}
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
          { label: t('Move Up'), icon: 'arrow-up', disabled: index === 0, onSelect: () => movePinned(section, item.id, index - 1) },
          { label: t('Move Down'), icon: 'arrow-down', disabled: last, onSelect: () => movePinned(section, item.id, index + 1) },
          { label: t('Unpin'), icon: 'pin-off', quick: true, onSelect: () => unpin(item.id) },
          { separator: true, label: '' },
          customizeAction(),
        ]}
      />
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
        <button type="button" className={cn(rowClass, 'group', rowState(here || open))}>
          <Icon name="more" size={16} className={cn('shrink-0', here || open ? 'text-ink' : 'text-muted group-hover:text-text')} />
          <span className="min-w-0 flex-1 truncate text-left">{t('More')}</span>
          <Icon name="chevron-right" size={12} className="shrink-0 text-faint" />
        </button>
      }
    >
      {groups.length === 0 && <p className="m-0 px-2 py-1.5 text-sm text-muted">{t('Everything is pinned.')}</p>}
      {groups.map((group) => (
        <div key={group.id} role="group" aria-label={group.label || undefined} className="space-y-px">
          {group.label && <div className="cms-caps px-2 pb-1 pt-2">{group.label}</div>}
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
                  { separator: true, label: '' },
                  customizeAction(),
                ]}
              />
            )
          })}
        </div>
      ))}
      <div className="my-1 h-px bg-border" />
      <MenuButton icon="sidebar" label={t('Customize Sidebar…')} onClick={() => { setOpen(false); customize() }} />
    </Popover>
  )
}

/** The top of a state of the sidebar other than the main one: a way back that says where to, then what this state is. */
function StateHeader({ title, back, shortcut, onBack, onHide }: { title: string; back: string; shortcut?: string; onBack: () => void; onHide: () => void }) {
  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between gap-1 px-3">
        <Tooltip content={t('Back to {label}', { label: back })} shortcut={shortcut} side="bottom">
          <button type="button" onClick={onBack} className="-ml-1 flex h-7 min-w-0 items-center gap-1 rounded-sm pl-1 pr-2 text-sm text-muted outline-offset-[-2px] transition-colors hover:bg-hover hover:text-text">
            <Icon name="chevron-left" size={14} className="shrink-0" />
            <span className="truncate">{back}</span>
          </button>
        </Tooltip>
        <Tooltip content={t('Hide Sidebar')} shortcut="mod+\\" side="bottom">
          <IconButton icon="sidebar" label={t('Hide Sidebar')} title={undefined} size="sm" onClick={onHide} className="-mr-1" />
        </Tooltip>
      </div>
      <h2 className="m-0 shrink-0 truncate px-5 pb-2 text-sm font-semibold tracking-[-0.01em] text-ink">{title}</h2>
    </>
  )
}

/** Settings pages, section by section, under a way back to where you were. */
function SettingsSidebar({ onHide, onNavigate, active }: { onHide: () => void; onNavigate?: () => void; active?: string }) {
  const manifest = useManifest()
  const items = new Map(manifest.nav.map((n) => [n.id, n]))
  const back = itemAt(manifest.nav, lastApp().split('?')[0])?.label

  return (
    <>
      <StateHeader title={t('Settings')} back={back ?? t('Back')} shortcut="esc" onBack={() => { leaveSettings(); onNavigate?.() }} onHide={onHide} />

      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label={t('Settings')}>
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
  const [theme, setTheme] = useState<ThemePreference>(getThemePreference())

  const signOut = async () => {
    await request('POST', 'auth/logout')
    window.location.href = boot.base
  }

  const chooseTheme = (value: ThemePreference) => {
    setThemePreference(value)
    setTheme(value)
  }

  const toggleSettings = () => {
    if (settings) leaveSettings()
    else openSettings()
    onNavigate?.()
  }

  return (
    <div className="flex shrink-0 items-center gap-1 border-t border-border p-2">
      <Menu
        align="start"
        side="top"
        trigger={
          <button type="button" aria-label={t('Account')} className="flex min-w-0 flex-1 items-center gap-2 rounded-sm p-1 text-left hover:bg-hover">
            <Avatar name={manifest.user.name} initials={manifest.user.initials} src={manifest.user.avatar} size={24} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-4 text-text">{manifest.user.name}</span>
              <span className="block truncate text-xs text-faint">{manifest.user.email}</span>
            </span>
          </button>
        }
        items={[
          { label: t('Account'), icon: 'user', onSelect: () => navigate('/account') },
          { label: t('Settings'), icon: 'settings', shortcut: SETTINGS_SHORTCUT, onSelect: openSettings },
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
