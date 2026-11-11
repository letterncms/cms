import { invalidate, loadManifest, run, t, useAbility, type SurfaceComponentProps } from '@letterncms/sdk'
import { Dialog, Input, NoMatches, Spinner, toast } from '@letterncms/ui'
import { useRef, useState, type KeyboardEvent } from 'react'
import { COMMON, localName, nativeName } from './names'

/** xx or xx-YY, however it was typed: "pt-br" is pt-BR. */
function typedCode(text: string): string | null {
  const m = text.trim().match(/^([a-z]{2})(?:-([a-z]{2}))?$/i)
  return m ? (m[2] ? `${m[1].toLowerCase()}-${m[2].toUpperCase()}` : m[1].toLowerCase()) : null
}

/**
 * Adding a language, opened from the Languages page (LanguagesModule::view): a searchable list, each
 * language named once in the admin's language, chosen with the keyboard; any other xx-YY code works too.
 */
export default function AddLanguage({ close }: SurfaceComponentProps) {
  const data = useAbility<{ languages: { code: string }[] }>('languages/list')
  const exclude = (data.data?.languages ?? []).map((l) => l.code)
  const [search, setSearch] = useState('')
  const [index, setIndex] = useState(0)
  // The language being added: its row says so, and nothing else can be chosen meanwhile.
  const [adding, setAdding] = useState<string | null>(null)
  const busy = adding !== null
  const list = useRef<HTMLDivElement>(null)
  const query = search.trim().toLowerCase()
  const options = COMMON.filter((c) => !exclude.includes(c))
    .map((code) => ({ code, name: localName(code), native: nativeName(code) }))
    .filter((o) => !query || `${o.name} ${o.native} ${o.code}`.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
  const typed = typedCode(search)
  const own = typed && !exclude.includes(typed) && !options.some((o) => o.code === typed) ? typed : null
  const choices = own ? [...options, { code: own, name: localName(own), native: nativeName(own) }] : options

  const choose = async (code: string) => {
    if (busy) return
    setAdding(code)
    try {
      await run('languages/create', { code })
      invalidate('languages/', 'entries/', 'translations/')
      // The admin's language filters read the manifest.
      await loadManifest()
      toast.success(t('{language} added', { language: localName(code) }))
      close?.()
    } catch (e) {
      toast.error(e)
      setAdding(null)
    }
  }

  const keys = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(0, Math.min(choices.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)))
      setIndex(next)
      list.current?.children[next]?.scrollIntoView({ block: 'nearest' })
    } else if (e.key === 'Enter' && choices[index]) {
      e.preventDefault()
      void choose(choices[index].code)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && close?.()} size="sm" title={t('Add Language')}>
      <Input size="sm" icon="search" autoFocus aria-label={t('Search Languages')} placeholder={t('Search Languages')} value={search} disabled={busy}
        onChange={(e) => { setSearch(e.target.value); setIndex(0) }} onKeyDown={keys}
        role="combobox" aria-expanded aria-controls="add-language-options" aria-activedescendant={choices[index] ? `add-language-${choices[index].code}` : undefined} />
      {choices.length === 0 ? <NoMatches className="py-6" onClear={() => setSearch('')} /> : (
        // A listbox the search field steers: the options are not stops of their own, the field names the one the keys are on.
        <div ref={list} id="add-language-options" role="listbox" aria-label={t('Languages')} aria-busy={busy} className="-mx-1 mt-2 max-h-72 overflow-y-auto" inert={busy}>
          {choices.map((o, i) => (
            <div key={o.code} id={`add-language-${o.code}`} role="option" aria-selected={i === index} onMouseEnter={() => setIndex(i)} onClick={() => void choose(o.code)}
              className="flex min-h-10 cursor-default items-center gap-3 rounded-xs px-2 text-sm text-text transition-colors duration-base aria-selected:bg-active max-sm:min-h-11">
              <span className="min-w-0 flex-1 truncate">{o.name}{o.native !== o.name && <span className="text-muted"> · {o.native}</span>}</span>
              {adding === o.code ? <Spinner size={14} /> : <code className="shrink-0 text-xs text-faint">{o.code}</code>}
            </div>
          ))}
        </div>
      )}
    </Dialog>
  )
}
