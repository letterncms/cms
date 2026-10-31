import { can, invalidate, loadManifest, plural, run, t, useAbility } from '@letterncms/sdk'
import { Badge, Button, confirm, Field, List, Page, Row, Section, Skeleton, Textarea, toast } from '@letterncms/ui'
import { useState } from 'react'
import { noteText, reasonText } from './reasons'

interface Item { edition: string | null; status: string | null; level: number; reason: string; upd: string | null; trm: string | null }
interface Report { host: string; class: 'nonpublic' | 'public'; token: string; lid: string | null; rev: number | null; level: number; items: Record<string, Item>; notes: string[]; domains: string[] }

const tone = (level: number) => (level === 0 ? 'success' : level === 1 ? 'neutral' : 'warning')

/** The licences of this site's paid plugins: what they cover, and a place to put a key. Nothing here touches the public site. */
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

  if (status.isLoading || !report) return <Page width="default" crumbs={[{ label: t('Licence'), icon: 'key' }]}><Skeleton className="h-40" /></Page>

  return (
    <Page width="default" crumbs={[{ label: t('Licence'), icon: 'key' }]}>
      <Section title={report.host || t('This site')} description={report.class === 'nonpublic' ? t('Local and staging hosts never need a licence.') : t('A public site never goes down over its licence. The most any state here does is a line in the admin.')}>
        <List>
          {items.map(([product, item]) => (
            <Row key={product}>
              <span className="w-40 shrink-0 truncate font-medium">{product}</span>
              <span className="min-w-0 flex-1 text-muted">{reasonText(item.reason, report.host)}</span>
              {item.edition && <Badge tone="neutral">{item.edition}</Badge>}
              {item.upd && <span className="shrink-0 text-xs text-muted">{t('Updates until {date}', { date: item.upd })}</span>}
              <Badge tone={tone(item.level)}>{item.level === 0 ? t('Fine') : t('Needs attention')}</Badge>
            </Row>
          ))}
        </List>
        {report.notes.map((note) => <p key={note} className="mt-3 text-sm text-muted">{noteText(note)}</p>)}
      </Section>

      {report.lid && (
        <Section title={t('This licence')} description={report.lid}>
          <p className="m-0 text-sm text-text">{plural(report.domains.length, 'Covers {count} domain, with its subdomains:', 'Covers {count} domains, with their subdomains:')} {report.domains.map((d) => d.replace(/^=/, '')).join(', ')}</p>
        </Section>
      )}

      {manage && (
        <Section title={t('Licence key')} description={t('Paste the key from your account. It is stored in config/license.key, or set CMS_LICENSE in the environment.')}>
          <Field label={t('Key')} htmlFor="license-key">
            <Textarea id="license-key" rows={4} spellCheck={false} value={token} placeholder="v4.public." onChange={(e) => setToken(e.target.value)} />
          </Field>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="primary" loading={busy} disabled={token.trim() === ''} onClick={() => void act('license/install', { token }, t('Licence key saved'))}>{t('Save Key')}</Button>
            {report.token !== 'none' && (
              <Button
                disabled={busy}
                onClick={async () => {
                  if (await confirm({ title: t('Remove the licence key?'), description: t('The site keeps working. This only removes the key.'), confirm: t('Remove Key'), danger: true })) await act('license/clear', {}, t('Licence key removed'))
                }}
              >
                {t('Remove Key')}
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-muted">{t('A check sends the licence id, this site’s URL, and the {brand} and PHP versions, at most once a day while someone is signed in. It never happens on a public page. CMS_LICENSE_OFFLINE=true turns it off.')}</p>
        </Section>
      )}
    </Page>
  )
}
