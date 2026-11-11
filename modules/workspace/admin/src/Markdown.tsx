import { boot, getManifest, matchPath, navigate, registry } from '@letterncms/sdk'
import type { ReactNode } from 'react'

/**
 * Renders the Markdown an agent writes — paragraphs, headings, lists,
 * quotes, code, tables, links, emphasis — as React elements. Never injects
 * HTML, so model output cannot run script in the admin.
 */
export function Markdown({ text }: { text: string }) {
  return <div className="cms-md space-y-2.5 text-sm leading-[1.6] text-text">{blocks(text)}</div>
}

function blocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i++
      continue
    }

    const fence = line.match(/^\s*(```|~~~)\s*([\w-]*)/)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith(fence[1])) body.push(lines[i++])
      i++
      out.push(
        <pre key={out.length} className="overflow-x-auto rounded-sm border border-border bg-sunken px-3 py-2 font-mono text-xs leading-relaxed text-text">
          <code>{body.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const size = heading[1].length <= 2 ? 'text-base' : 'text-sm'
      out.push(
        <p key={out.length} className={`${size} pt-1 font-semibold tracking-[-0.01em] text-ink`}>
          {inline(heading[2])}
        </p>,
      )
      i++
      continue
    }

    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      const row = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
      const head = row(line)
      const body: string[][] = []
      i += 2
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) body.push(row(lines[i++]))
      out.push(
        <div key={out.length} className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-muted">
              <tr>{head.map((c, j) => <th key={j} className="px-2.5 py-1.5 font-medium">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, k) => (
                <tr key={k} className="border-t border-border">
                  {r.map((c, j) => <td key={j} className="px-2.5 py-1.5 align-top">{inline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (/^\s*>/.test(line)) {
      const body: string[] = []
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''))
      out.push(
        <blockquote key={out.length} className="border-l-2 border-border-strong pl-3 text-muted">
          {blocks(body.join('\n'))}
        </blockquote>,
      )
      continue
    }

    const bullet = /^\s*[-*+]\s+/
    const numbered = /^\s*\d+[.)]\s+/
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line)
      const pattern = ordered ? numbered : bullet
      const entries: string[] = []
      while (i < lines.length && (pattern.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && entries.length))) {
        if (pattern.test(lines[i])) entries.push(lines[i].replace(pattern, ''))
        else entries[entries.length - 1] += `\n${lines[i].trim()}`
        i++
      }
      const List = ordered ? 'ol' : 'ul'
      out.push(
        <List key={out.length} className={`${ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-5 marker:text-faint`}>
          {entries.map((e, j) => <li key={j}>{inline(e)}</li>)}
        </List>,
      )
      continue
    }

    const paragraph: string[] = []
    while (i < lines.length && lines[i].trim() && !/^(\s*(```|~~~|>|[-*+]\s|\d+[.)]\s)|#{1,4}\s)/.test(lines[i])) paragraph.push(lines[i++])
    if (paragraph.length === 0) paragraph.push(lines[i++])
    out.push(<p key={out.length}>{inline(paragraph.join('\n'))}</p>)
  }

  return out
}

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(\[[^\]]+\]\([^)\s]+\))|(\n)/g

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0

  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const [token] = m
    const key = out.length

    if (m[1]) {
      // A place of the admin written as code opens there, like a link.
      const code = <code key={key} className="rounded-xs bg-sunken px-1 py-px font-mono text-xs">{token.slice(1, -1)}</code>
      out.push(adminPlace(token.slice(1, -1)) !== null ? <SafeLink key={key} href={token.slice(1, -1)}>{code}</SafeLink> : code)
    }
    else if (m[2]) out.push(<strong key={key} className="font-semibold text-ink">{inline(token.slice(2, -2))}</strong>)
    else if (m[3]) out.push(<em key={key}>{inline(token.slice(1, -1))}</em>)
    else if (m[4]) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!
      out.push(<SafeLink key={key} href={href}>{inline(label)}</SafeLink>)
    } else out.push(<br key={key} />)

    last = m.index + token.length
  }

  if (last < text.length) out.push(text.slice(last))
  return out
}

/**
 * Where an address leads in the admin, or null: `/admin/…`, or a path of the admin written without
 * it (`/content/pages/…`), known by the admin's own routes. Anything else is a page of the site.
 */
export function adminPlace(href: string): string | null {
  const value = href.trim()
  if (value.startsWith(`${boot.base}/`) || value === boot.base) return value.slice(boot.base.length) || '/'
  if (!/^\/(?!\/)[^\s]*$/.test(value) || value.includes('..')) return null
  const path = value.split(/[?#]/)[0]
  const routes = [...registry.routes.all().map((r) => r.path), ...(getManifest().views ?? []).map((v) => v.path)].filter((p) => p !== '/' && !p.includes('*'))
  return routes.some((route) => matchPath(route, path)) ? value : null
}

function SafeLink({ href, children }: { href: string; children: ReactNode }) {
  const place = adminPlace(href)
  const internal = place !== null
  const allowed = internal || /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(href)

  if (!allowed) return <>{children}</>

  return (
    <a
      href={internal ? boot.base + (place === '/' ? '' : place) : href}
      target={internal ? undefined : '_blank'}
      rel={internal ? undefined : 'noopener noreferrer'}
      className="text-ink underline decoration-border-strong underline-offset-2 hover:decoration-ink"
      onClick={(e) => {
        if (!internal || e.metaKey || e.ctrlKey) return
        e.preventDefault()
        // In the admin, without a reload; from a full-size thread, the page comes back beside it.
        navigate(place)
      }}
    >
      {children}
    </a>
  )
}
