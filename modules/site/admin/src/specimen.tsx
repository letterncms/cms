import { locale, t } from '@letterncms/sdk'
import { cn } from '@letterncms/ui'
import { useEffect, useRef, useState } from 'react'

/**
 * A page of the site with the draft design on it: the compiled draft stylesheet in place of
 * the saved one (so cascade layers keep their order), and values that change while dragged
 * as custom properties on top, in light or dark.
 */
export function applyDraft(doc: Document | null | undefined, draft: { compiled: string | null; vars: string; mode: 'light' | 'dark' }) {
  if (!doc?.head) return
  const link = doc.querySelector<HTMLLinkElement>('link[rel="stylesheet"][href*="/_cms/site/design-"]')
  let style = doc.getElementById('cms-design-preview') as HTMLStyleElement | null
  if (draft.compiled !== null) {
    if (!style) {
      style = doc.createElement('style')
      style.id = 'cms-design-preview'
      link ? link.after(style) : doc.head.appendChild(style)
    }
    if (style.textContent !== draft.compiled) style.textContent = draft.compiled
    if (link) link.disabled = true
  } else {
    style?.remove()
    if (link) link.disabled = false
  }
  let vars = doc.getElementById('cms-token-preview') as HTMLStyleElement | null
  if (!vars) {
    vars = doc.createElement('style')
    vars.id = 'cms-token-preview'
    doc.head.appendChild(vars)
  }
  const text = draft.vars ? `:root:root:root{${draft.vars}}` : ''
  if (vars.textContent !== text) vars.textContent = text
  if (doc.documentElement.dataset.theme !== draft.mode) doc.documentElement.dataset.theme = draft.mode
}

/**
 * Every form field or every button, in each of its states, drawn by the site's own stylesheet
 * with the draft on it: the part being edited (`show`), or all of them. It takes the height
 * its content needs; what's in it can be clicked and typed into.
 */
export function Specimen({ kind, show, draft, className }: { kind: 'fields' | 'buttons'; show: string | null; draft: { compiled: string | null; vars: string; mode: 'light' | 'dark' }; className?: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const apply = () => {
    const doc = frame.current?.contentDocument
    if (!doc?.body) return
    applyDraft(doc, draft)
    if (show) doc.body.dataset.show = show
    else delete doc.body.dataset.show
  }
  useEffect(apply)

  useEffect(() => {
    const doc = frame.current?.contentDocument
    if (!loaded || !doc?.body) return
    const measure = () => setHeight(Math.ceil(doc.body.getBoundingClientRect().height))
    const observer = new ResizeObserver(measure)
    observer.observe(doc.body)
    measure()
    return () => observer.disconnect()
  }, [loaded])

  return (
    <div className={cn('overflow-hidden rounded-sm border border-border', !loaded && 'animate-pulse bg-surface', className)}>
      <iframe
        ref={frame}
        title={kind === 'buttons' ? t('Button Specimen') : t('Form Field Specimen')}
        src={`/__specimen/${kind}?lang=${encodeURIComponent(locale())}`}
        onLoad={() => {
          apply()
          setLoaded(true)
        }}
        className={cn('block w-full border-0 transition-opacity duration-150', loaded ? 'opacity-100' : 'opacity-0')}
        style={{ height: height || 160 }}
      />
    </div>
  )
}
