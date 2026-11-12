import { navigate, t, useManifest } from '@letterncms/sdk'
import { useState } from 'react'
import { Icon, Menu, Pressable, Spinner, Tooltip, cn, switchKit } from '../ui'
import { BrandMark } from './Brand'

/** The site's own mark: its favicon, and the product's until it has one (or the one it has doesn't load). */
function SiteMark({ size = 22 }: { size?: number }) {
  const { favicon } = useManifest().site
  const [broken, setBroken] = useState<string | null>(null)

  return favicon && broken !== favicon
    ? <img src={favicon} width={size} height={size} alt="" onError={() => setBroken(favicon)} className="shrink-0 rounded-[5px] object-contain" />
    : <BrandMark size={size} />
}

/**
 * The site at the top of the sidebar: its name opens the site, the arrow beside it opens the way around: the dashboard, the
 * site's kits to switch between (each keeps what you did to it), and the screen that manages them.
 */
export function SiteSwitcher() {
  const { site } = useManifest()
  const kits = site.kits ?? []
  const [busy, setBusy] = useState(false)

  const choose = async (kit: { handle: string; name: string }) => {
    setBusy(true)
    await switchKit(kit)
    setBusy(false)
  }

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <Tooltip content={t('Open Site')} side="bottom">
        <a href={site.url || '/'} target="_blank" rel="noopener" className="group flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-1 text-left no-underline outline-offset-[-2px] hover:bg-hover">
          {busy ? <Spinner size={22} className="text-muted" /> : <SiteMark />}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{site.name}</span>
          <Icon name="external" size={12} className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </a>
      </Tooltip>
      <Menu
        align="start"
        side="bottom"
        trigger={
          <Pressable aria-label={t('Site Menu')} disabled={busy} className={cn('flex h-8 w-6 shrink-0 items-center justify-center rounded-sm text-faint outline-offset-[-2px] hover:bg-hover hover:text-text', busy && 'opacity-50')}>
            <Icon name="chevrons-up-down" size={14} />
          </Pressable>
        }
        items={[
          { label: t('Dashboard'), icon: 'home', onSelect: () => navigate('/') },
          { label: t('Open Site'), icon: 'external', onSelect: () => window.open(site.url || '/', '_blank', 'noopener') },
          kits.length > 0 && { separator: true, label: '' },
          kits.length > 0 && { label: t('Site Kits'), heading: true },
          ...kits.map((kit) => ({ label: kit.name, checked: kit.active, onSelect: () => (kit.active ? undefined : void choose(kit)) })),
          kits.length > 0 && { separator: true, label: '' },
          kits.length > 0 && { label: t('Manage Kits'), icon: 'box', onSelect: () => navigate('/kits') },
        ]}
      />
    </div>
  )
}
