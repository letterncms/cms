import { Link, run, t, useConfig } from '@letterncms/sdk'
import { Button, Icon } from '@letterncms/ui'
import { useEffect, useState } from 'react'
import { reasonText } from './reasons'

interface Item { level: number; reason: string }
interface LicenseConfig extends Record<string, unknown> { refreshDue: boolean; level?: number; host?: string; items?: Record<string, Item> }

const KEY = 'cms.license.dismissed'
const WEEK = 7 * 86_400_000

/** Per browser, and a browser may refuse: then the banner just comes back. */
const dismissedAt = (): number => {
  try {
    return Number(localStorage.getItem(KEY) ?? 0)
  } catch {
    return 0
  }
}

/**
 * The most any licence state ever does: a line at the top of the admin, for the people who can
 * act on it. It also asks for a refresh in the background, so no page waits on the licence server.
 */
export function LicenseBanner() {
  const license = useConfig<LicenseConfig>('license')
  const [dismissed, setDismissed] = useState(dismissedAt)
  const level = license.level ?? 0

  useEffect(() => {
    if (license.refreshDue) void run('license/refresh').catch(() => {})
  }, [license.refreshDue])

  if (level < 2 || (level === 2 && Date.now() - dismissed < WEEK)) return null

  const worst = Object.values(license.items ?? {}).sort((a, b) => b.level - a.level)[0]

  return (
    <div role="status" className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2 text-sm text-text">
      <Icon name="warning" size={16} className="shrink-0 text-warning" />
      <span className="min-w-0 flex-1">{worst ? reasonText(worst.reason, license.host ?? '') : ''}</span>
      <Link to="/license" className="shrink-0 font-medium text-text underline">{t('See Licence')}</Link>
      {level === 2 && (
        <Button
          size="xs"
          variant="ghost"
          onClick={() => {
            const now = Date.now()
            setDismissed(now)
            try {
              localStorage.setItem(KEY, String(now))
            } catch {
              // Private window: it stays hidden until the page reloads.
            }
          }}
        >
          {t('Dismiss')}
        </Button>
      )}
    </div>
  )
}
