import { navigate, t, useManifest } from '@letterncms/sdk'
import { useLayoutEffect } from 'react'
import { EmptyState, Page, SettingsView } from '@letterncms/ui'

/**
 * /settings: the first page of the settings sidebar. Each page, /settings/<namespace>, is a view
 * (SettingsModule::view): its form as the Settings tab, and what plugins add to it as data.
 */
export default function Settings() {
  const manifest = useManifest()
  const first = manifest.settings.find((s) => !s.home)?.namespace

  useLayoutEffect(() => {
    if (first) navigate(`/settings/${first}`, { replace: true })
  }, [first])

  return first ? null : (
    <Page crumbs={[{ label: t('Settings'), icon: 'settings' }]}>
      <EmptyState icon="settings" title={t('Nothing to set up')} />
    </Page>
  )
}

/**
 * A namespace's form: its fields in their sections, and the save bar while there are
 * changes. The same on a settings page and on a screen's Settings tab (the
 * `screen.settings` slot that `ScreenTabs` draws), and in a view as `ui/settings`.
 */
export function SettingsForm({ namespace, onDirty }: { namespace: string; onDirty?: (dirty: boolean) => void }) {
  return <SettingsView namespace={namespace} onDirty={onDirty} />
}
