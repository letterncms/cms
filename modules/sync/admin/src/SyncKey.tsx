import { t, useAbility } from '@letterncms/sdk'
import { Button, IconButton, Input, SettingRow, SettingsPanel, Skeleton, copyText, selectFieldTextOnClick } from '@letterncms/ui'
import { useState } from 'react'
import type { Overview } from './shared'

/** This site's connection key: hidden until shown, and copied in one click to paste on the other site. */
export default function SyncKey() {
  const overview = useAbility<Overview>('sync/overview')
  const [shown, setShown] = useState(false)
  const key = overview.data?.site.key

  const masked = key?.replace(/#.*/, '#' + '•'.repeat(16))
  // Where the clipboard can't be written, the key shows, to copy by hand.
  const copy = async () => {
    if (key && !(await copyText(key, { copied: t('Copied. Paste it under Sync on the other site.'), failed: null }))) setShown(true)
  }

  return (
    <SettingsPanel>
      <SettingRow>
        {key ? (
          <div className="flex items-center gap-2">
            <Input key={shown ? 'shown' : 'masked'} readOnly autoFocus={shown} value={shown ? key : masked} aria-label={t('Connection key')} className="min-w-0 flex-1 font-mono" onFocus={shown ? (e) => e.currentTarget.select() : undefined} onClick={selectFieldTextOnClick} />
            <IconButton size="md" icon={shown ? 'eye-off' : 'eye'} label={shown ? t('Hide') : t('Show')} onClick={() => setShown(!shown)} />
            <Button size="md" icon="copy" onClick={() => void copy()}>{t('Copy')}</Button>
          </div>
        ) : <Skeleton className="h-8" />}
      </SettingRow>
    </SettingsPanel>
  )
}
