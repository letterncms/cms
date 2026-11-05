import { t, useAbility } from '@letterncms/sdk'
import { Button, Input, Skeleton, toast } from '@letterncms/ui'
import { useState } from 'react'
import type { Overview } from './shared'

/** This site's connection key: hidden until shown, and copied in one click to paste on the other site. */
export default function SyncKey() {
  const overview = useAbility<Overview>('sync/overview')
  const [shown, setShown] = useState(false)
  const key = overview.data?.site.key

  if (!key) return <Skeleton className="h-8" />

  const masked = key.replace(/#.*/, '#' + '•'.repeat(16))
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(key)
      toast.success(t('Copied. Paste it under Sync on the other site.'))
    } catch {
      setShown(true)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        {shown
          ? <Input readOnly autoFocus value={key} aria-label={t('Connection key')} className="w-full font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
          : <div aria-label={t('Connection key')} className="flex h-8 items-center truncate rounded-sm border border-border bg-bg px-2.5 font-mono text-xs text-muted">{masked}</div>}
      </div>
      <Button icon={shown ? 'eye-off' : 'eye'} onClick={() => setShown(!shown)} aria-label={shown ? t('Hide') : t('Show')} />
      <Button icon="copy" onClick={() => void copy()}>{t('Copy')}</Button>
    </div>
  )
}
