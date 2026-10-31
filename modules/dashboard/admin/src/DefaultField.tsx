import { navigate, t, type Arrangement, type FieldProps } from '@letterncms/sdk'
import { Button, Icon } from '@letterncms/ui'

/**
 * Settings → Admin → Home screen: the default everyone starts with. It is arranged
 * on the home screen itself (Customize → Save as Default); here it can
 * only be opened or returned to what the modules and plugins register.
 */
export function DefaultField({ value, onChange, disabled }: FieldProps<Arrangement | null>) {
  const custom = value !== null && value !== undefined

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <Icon name="layout" size={15} className="text-faint" />
      <span className="min-w-0 flex-1 text-sm text-text">{custom ? t('Arranged by an admin') : t('Widgets that are on by default')}</span>
      {custom && (
        <Button size="sm" variant="ghost" icon="undo" disabled={disabled} onClick={() => onChange(null)}>
          {t('Reset')}
        </Button>
      )}
      <Button size="sm" iconRight="arrow-right" onClick={() => navigate('/?customize=1')}>
        {t('Arrange on Home Screen')}
      </Button>
    </div>
  )
}
