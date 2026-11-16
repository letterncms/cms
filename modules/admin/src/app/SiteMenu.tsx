import { events, navigate, t, useManifest } from '@letterncms/sdk'
import { useState } from 'react'
import { Icon, Menu, Pressable, Tooltip } from '../ui'
import { BrandMark } from './Brand'

/** The site's own mark: its favicon, and the product's until it has one (or the one it has doesn't load). */
function SiteMark({ size = 22 }: { size?: number }) {
  const { favicon } = useManifest().site
  const [broken, setBroken] = useState<string | null>(null)

  return favicon && broken !== favicon
    ? <img src={favicon} width={size} height={size} alt="" onError={() => setBroken(favicon)} className="shrink-0 rounded-sm object-contain" />
    : <BrandMark size={size} />
}

/**
 * The site at the top of the sidebar: its name opens the site, the arrow beside it opens the way around: the dashboard,
 * the site itself, and the arranging of the sidebar, always one menu away. Switching to another site is under Design › Sites.
 */
export function SiteMenu() {
  const { site } = useManifest()

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <Tooltip content={t('Open Site')} side="bottom">
        <a href={site.url || '/'} target="_blank" rel="noopener" className="group flex h-8 min-w-0 flex-1 items-center gap-2 rounded-sm px-1 text-left no-underline outline-offset-[-2px] hover:bg-hover">
          <SiteMark />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-[-0.01em] text-ink">{site.name}</span>
          <Icon name="external" size={12} className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
        </a>
      </Tooltip>
      <Menu
        align="start"
        side="bottom"
        trigger={
          <Pressable aria-label={t('Site Menu')} className="flex h-8 w-6 shrink-0 items-center justify-center rounded-sm text-faint outline-offset-[-2px] hover:bg-hover hover:text-text">
            <Icon name="chevrons-up-down" size={14} />
          </Pressable>
        }
        items={[
          { label: t('Dashboard'), icon: 'gauge', onSelect: () => navigate('/') },
          { label: t('Open Site'), icon: 'external', onSelect: () => window.open(site.url || '/', '_blank', 'noopener') },
          { separator: true, label: '' },
          { label: t('Customize Sidebar…'), icon: 'sidebar', onSelect: () => events.emit('sidebar.customize') },
        ]}
      />
    </div>
  )
}
