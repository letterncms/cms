import { can, invalidate, loadManifest, run, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, confirm, Field, Input, List, Row, shortDate, Skeleton, toast } from '@letterncms/ui'
import { useState } from 'react'
import { reasonText } from './reasons'

interface Item { label?: string; edition: string | null; status: string | null; level: number; reason: string; upd: string | null; trm: string | null }
interface Report { host: string; class: 'nonpublic' | 'public'; token: string; lid: string | null; rev: number | null; level: number; items: Record<string, Item>; notes: string[]; domains: string[] }

const tone = (level: number) => (level === 0 ? 'success' : level === 1 ? 'neutral' : 'warning')
// The state in a word: it works, it works with less (updates ended), or something needs doing.
const word = (level: number) => (level === 0 ? t('Active') : level === 1 ? t('Limited') : t('Needs Attention'))
const day = (date: string) => shortDate(`${date}T12:00:00Z`)

const state = (item: Item) =>
  item.reason !== 'ok' ? reasonText(item.reason)
    : item.trm ? t('Licensed until {date}', { date: day(item.trm) })
    : item.upd ? t('Licensed, updates until {date}', { date: day(item.upd) })
    : reasonText('ok')

/** The Licences tab of Plugins: each paid plugin's state, and the key. Nothing here touches the public site. */
export default function License() {
  const status = useAbility<Report>('license/status')
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const report = status.data
  const manage = can('license.manage')
  const items = Object.entries(report?.items ?? {})

  const act = async (ability: string, input: Record<string, unknown>, message: string) => {
    setBusy(true)
    try {
      await run(ability, input)
      setToken('')
      invalidate('license/')
      await Promise.all([status.refetch(), loadManifest()])
      toast.success(message)
    } catch (e) {
      toast.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (status.isLoading || !report) return <Skeleton className="h-40" />

  return (
    <div>
      {items.length > 0 ? (
        <List className="!border-t-0">
          {items.map(([product, item]) => (
            <Row key={product} className="py-2">
              <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3">
                <span className="w-40 max-w-full truncate font-medium">{item.label ?? product}</span>
                <span className="min-w-0 truncate text-muted">{state(item)}</span>
              </span>
              <Badge tone={tone(item.level)}>{word(item.level)}</Badge>
            </Row>
          ))}
        </List>
      ) : (
        <p className="m-0 text-sm text-muted">{t('No paid plugins yet')}</p>
      )}

      {manage && (
        <Field label={t('License Key')} htmlFor="license-key" className="mt-8">
          <div className="flex flex-wrap gap-2">
            <Input id="license-key" className="min-w-40 flex-1 font-mono" spellCheck={false} autoComplete="off" value={token} placeholder="v4.public." onChange={(e) => setToken(e.target.value)} />
            <Button variant="primary" size="md" loading={busy} disabled={token.trim() === ''} onClick={() => void act('license/install', { token }, t('License key saved'))}>{t('Save Key')}</Button>
            {report.token !== 'none' && (
              <Button
                size="md"
                disabled={busy}
                onClick={async () => {
                  if (await confirm({ title: t('Remove the license key?'), description: t('The site keeps working.'), confirm: t('Remove Key'), danger: true })) await act('license/clear', {}, t('License key removed'))
                }}
              >
                {t('Remove Key')}
              </Button>
            )}
          </div>
        </Field>
      )}
    </div>
  )
}
