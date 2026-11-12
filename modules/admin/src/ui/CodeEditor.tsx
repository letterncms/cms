import { t } from '@letterncms/sdk'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { IconButton } from './Button'
import { cn } from './cn'
import { Dialog } from './Dialog'
import type { Editor } from './codemirror'

export interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  /** css, html, javascript (js), typescript (ts) or json; anything else is plain text. */
  language?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  /** The height it starts at, in lines; it grows with what is written. */
  rows?: number
  id?: string
  /** Its name for assistive tech, and the large editor's title. */
  label?: string
  describedBy?: string
  /** Leaves out the button that opens it large. */
  fixed?: boolean
  /** The large editor itself: line numbers, no wrapping, the dialog's height. */
  full?: boolean
}

/** CodeMirror arrives with the first code field, not with the admin. */
let loading: Promise<typeof import('./codemirror')> | null = null
const load = () => (loading ??= import('./codemirror'))

const LINE = 20
const PADDING = 16

/**
 * Source code in a field: highlighted for its language, with brackets that close and match, search,
 * undo and Tab to indent (Escape, then Tab, leaves it). The button at its top right opens it large.
 */
export function CodeEditor({ value, onChange, language, placeholder, disabled = false, invalid = false, rows = 8, id, label, describedBy, fixed = false, full = false }: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const editor = useRef<Editor | null>(null)
  const change = useRef(onChange)
  change.current = onChange
  const latest = useRef(value)
  latest.current = value
  const [focused, setFocused] = useState(false)
  const [ready, setReady] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let gone = false
    void load().then(({ createEditor }) => {
      if (gone || !host.current) return
      editor.current = createEditor({ parent: host.current, value: latest.current, language, placeholder, disabled, full, label, id, describedBy, onChange: (v) => change.current(v), onFocus: setFocused })
      setReady(true)
      if (full) editor.current.focus()
    })
    return () => {
      gone = true
      editor.current?.destroy()
      editor.current = null
    }
    // A new language or placeholder is a new editor; the value and the lock follow below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, placeholder, full, label, id, describedBy])

  useEffect(() => editor.current?.setValue(value), [value, ready])
  useEffect(() => editor.current?.setDisabled(disabled), [disabled, ready])

  return (
    <div className="cms-reveal-row relative min-w-0">
      <div
        aria-invalid={invalid || undefined}
        data-focus={focused || undefined}
        data-disabled={disabled || undefined}
        className={cn('cms-input overflow-hidden rounded-md text-xs', full ? 'h-[60vh] max-sm:h-[70dvh]' : cn('[&_.cm-editor]:max-h-[480px] [&_.cm-scroller]:min-h-(--cms-code-rows)', !fixed && '[&_.cm-line:first-child]:pr-8'))}
        style={full ? undefined : ({ '--cms-code-rows': `${rows * LINE + PADDING}px` } as CSSProperties)}
      >
        <div ref={host} className="h-full" />
        {/* Until it arrives, the code as it will stand, so nothing moves. */}
        {!ready && <pre aria-hidden className="m-0 min-h-(--cms-code-rows) whitespace-pre-wrap break-words px-2.5 py-[7px] font-mono leading-5 text-text">{value || <span className="text-ghost">{placeholder}</span>}</pre>}
      </div>
      {!fixed && !full && (
        <>
          <IconButton icon="maximize" label={t('Expand')} size="xs" onClick={() => setExpanded(true)} className="cms-reveal !absolute right-1 top-1 bg-bg" />
          <Dialog open={expanded} onOpenChange={setExpanded} title={label} size="xl">
            <CodeEditor value={value} onChange={onChange} language={language} placeholder={placeholder} disabled={disabled} invalid={invalid} label={label} full />
          </Dialog>
        </>
      )}
    </div>
  )
}
