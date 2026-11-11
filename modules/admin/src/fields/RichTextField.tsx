import { fieldControlId } from '../ui/fieldIdentity'
import { registry, t, type FieldDef, type FieldProps } from '@letterncms/sdk'
import { useEffect, useRef, useState } from 'react'
import { Fields, IconButton, Popover, cn } from '../ui'

/**
 * Lightweight rich text (contenteditable). Output is sanitized on the server.
 * Blocks may register a richer editor under the same key.
 */
export function RichTextField({ field, value, onChange, error, disabled }: FieldProps<string | null>) {
  const ref = useRef<HTMLDivElement>(null)
  const inline = !!field.inline
  // Picking a link moves focus away; the selection is kept to link it afterwards.
  const [linking, setLinking] = useState<{ range: Range; url: string } | null>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value ?? '') && document.activeElement !== ref.current) {
      ref.current.innerHTML = value ?? ''
    }
  }, [value])

  const exec = (command: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    onChange(ref.current?.innerHTML ?? '')
  }

  const startLink = () => {
    const selection = window.getSelection()
    if (!selection?.rangeCount || !ref.current?.contains(selection.anchorNode)) return
    const anchor = selection.anchorNode?.parentElement?.closest('a')
    setLinking({ range: selection.getRangeAt(0).cloneRange(), url: anchor?.getAttribute('href') ?? '' })
  }

  const applyLink = (url: string) => {
    if (!linking) return
    ref.current?.focus()
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(linking.range)
    const to = url.trim()
    if (!to) exec('unlink')
    else exec('createLink', /^(https?:|mailto:|tel:|\/|#|\{brand\.)/i.test(to) ? to : `https://${to}`)
    setLinking(null)
  }

  // The link picker (pages, entries, a pasted URL) when it is installed; a URL box otherwise.
  const picker = !!registry.fields.get('link')
  const linkDef: FieldDef = { handle: 'url', type: 'url', label: t('Link'), size: 'sm', autofocus: true, placeholder: t('Paste a link or search pages'), ...(picker ? { component: 'link' } : {}) }
  const tool = (icon: string, label: string, onClick: () => void) => <IconButton icon={icon} label={label} size="xs" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick} />

  return (
    <div aria-invalid={error ? true : undefined} className="cms-input rounded-md focus-within:border-focus focus-within:shadow-focus">
      <div className="flex items-center gap-0.5 border-b border-border px-1 py-1">
        {tool('bold', t('Bold'), () => exec('bold'))}
        {tool('italic', t('Italic'), () => exec('italic'))}
        <Popover
          open={!!linking}
          onOpenChange={(open) => (open ? startLink() : setLinking(null))}
          align="start"
          className="w-72 !p-2"
          trigger={<IconButton icon="link" label={t('Link')} size="xs" disabled={disabled} onMouseDown={(e) => e.preventDefault()} />}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyLink(linking?.url ?? '')
            }}
          >
            <Fields bare fields={[linkDef]} values={{ url: linking?.url ?? '' }} onChange={(_, url) => (picker ? applyLink(url ?? '') : linking && setLinking({ ...linking, url: url ?? '' }))} />
          </form>
        </Popover>
        {!inline && (
          <>
            <span className="mx-1 h-4 w-px bg-border" />
            {tool('heading', t('Heading'), () => exec('formatBlock', 'h3'))}
            {tool('list', t('Bulleted List'), () => exec('insertUnorderedList'))}
            {tool('list-ordered', t('Numbered List'), () => exec('insertOrderedList'))}
            {tool('quote', t('Quote'), () => exec('formatBlock', 'blockquote'))}
          </>
        )}
      </div>
      <div
        ref={ref}
        id={fieldControlId(field)}
        role="textbox"
        aria-multiline={!inline}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? '')}
        onKeyDown={(e) => inline && e.key === 'Enter' && e.preventDefault()}
        className={cn('cms-prose min-h-20 px-3 py-2 !text-sm outline-none', inline && 'min-h-8')}
      />
    </div>
  )
}
