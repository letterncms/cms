import { t, useAbility } from '@letterncms/sdk'
import { Button, IconButton, Input, SettingRow, SettingsPanel, Skeleton, copyText } from '@letterncms/ui'
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
            <div className="min-w-0 flex-1">
              {shown
                ? <Input readOnly autoFocus value={key} aria-label={t('Connection key')} className="w-full font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
                : <div aria-label={t('Connection key')} className="flex h-8 items-center truncate rounded-sm border border-border bg-bg px-2.5 font-mono text-xs"><span className="truncate">{masked}</span></div>}
            </div>
            <IconButton icon={shown ? 'eye-off' : 'eye'} label={shown ? t('Hide') : t('Show')} onClick={() => setShown(!shown)} />
            <Button icon="copy" onClick={() => void copy()}>{t('Copy')}</Button>
          </div>
        ) : <Skeleton className="h-8" />}
      </SettingRow>
    </SettingsPanel>
  )
}
