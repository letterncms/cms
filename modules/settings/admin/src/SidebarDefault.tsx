import { events, t, type Arrangement, type FieldProps } from '@letterncms/sdk'
import { Button, Icon } from '@letterncms/ui'

/**
 * Settings → Admin → Sidebar: the sidebar everyone starts with until they pin
 * their own. It is arranged in the sidebar itself (Customize Sidebar → Save as
 * Default); here it can only be opened or returned to what the
 * modules and plugins pin.
 */
export function SidebarDefault({ value, onChange, disabled }: FieldProps<Arrangement | null>) {
  const custom = value !== null && value !== undefined

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <Icon name="sidebar" size={15} className="text-faint" />
      <span className="min-w-0 flex-1 text-sm text-text">{custom ? t('Arranged by an admin') : t('Items that are pinned by default')}</span>
      {custom && (
        <Button size="sm" variant="ghost" icon="undo" disabled={disabled} onClick={() => onChange(null)}>
          {t('Reset')}
        </Button>
      )}
      <Button size="sm" iconRight="arrow-right" onClick={() => events.emit('sidebar.customize')}>
        {t('Customize Sidebar')}
      </Button>
    </div>
  )
}
