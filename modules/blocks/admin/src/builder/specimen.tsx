import { cn } from '@letterncms/ui'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/* Samples of the site's text, buttons and styles, drawn by the site's own CSS: the draft compiled by Tailwind,
   one stylesheet every sample on the page adopts, each sample in a shadow root of its own so the admin's CSS
   and the site's never meet. */

type Compiler = { build: (candidates: string[]) => string }

/** The draft's CSS as one stylesheet for every sample of the page, for the classes they show. */
export function useSpecimenSheet(compiler: Compiler | null, candidates: string[]): CSSStyleSheet | null {
  const [sheet] = useState(() => (typeof CSSStyleSheet !== 'undefined' ? new CSSStyleSheet() : null))
  const [ready, setReady] = useState(false)
  const key = candidates.join(' ')
  useEffect(() => {
    if (!sheet || !compiler) return
    try {
      sheet.replaceSync(compiler.build(candidates))
      setReady(true)
    } catch (error) {
      // A class Tailwind can't build leaves the samples as they were.
      console.error(error)
    }
  }, [sheet, compiler, key])
  return ready ? sheet : null
}

/** What a sample shows: an element with its text, and the classes and attributes it carries. */
export interface SampleNode {
  tag: string
  text: string
  className?: string
  attributes?: Record<string, string>
  /** Markup of our own in place of one element: a form's label, field and choices. Never content. */
  markup?: string
}

/**
 * One sample, drawn at its own size and scaled down to fit the box when it is larger (a display heading). On the
 * page's colours and in its type, light or dark as the preview is.
 */
export function Specimen({ sheet, node, page, mode, className, align = 'start' }: { sheet: CSSStyleSheet | null; node: SampleNode; page: string; mode: 'light' | 'dark'; className?: string; align?: 'start' | 'center' }) {
  const host = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = host.current
    if (!el) return
    const root = el.shadowRoot ?? el.attachShadow({ mode: 'open' })
    root.adoptedStyleSheets = sheet ? [sheet] : []
    const frame = document.createElement('div')
    frame.className = page
    frame.setAttribute('data-size', 'md')
    // A section of the page in the preview's mode: what the site sets for every section (its form fields) reaches here too.
    frame.setAttribute('data-theme', mode)
    frame.style.cssText = `color-scheme:${mode};background:var(--color-background);color:var(--color-foreground);padding:0 10px;box-sizing:border-box;display:flex;align-items:center;justify-content:${align === 'center' ? 'center' : 'flex-start'};height:100%;overflow:hidden;min-height:0;margin:0`
    const inner = document.createElement('div')
    inner.style.cssText = `transform-origin:${align === 'center' ? 'center' : 'left'} center;flex:none;max-width:none;${node.markup ? 'width:min(100%,22rem)' : 'white-space:nowrap'}`
    if (node.markup) inner.innerHTML = node.markup
    else {
      const sample = document.createElement(node.tag)
      sample.textContent = node.text
      if (node.className) sample.className = node.className
      for (const [name, value] of Object.entries(node.attributes ?? {})) sample.setAttribute(name, value)
      // A heading's own margins are no part of its look here.
      sample.style.margin = '0'
      inner.appendChild(sample)
    }
    frame.appendChild(inner)
    root.replaceChildren(frame)
    const fit = () => {
      inner.style.transform = ''
      const box = el.getBoundingClientRect()
      const drawn = inner.getBoundingClientRect()
      // Markup wider than its box (a row of choices) counts whole. The frame keeps 10px on either side.
      const scale = Math.min(1, (box.width - 20) / Math.max(1, drawn.width, inner.scrollWidth), box.height / Math.max(1, drawn.height, inner.scrollHeight))
      if (scale < 1) inner.style.transform = `scale(${scale})`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    // A font that arrives later draws the text at another size.
    void document.fonts?.ready.then(fit)
    return () => observer.disconnect()
  }, [sheet, node.tag, node.text, node.className, node.markup, JSON.stringify(node.attributes), page, mode, align])
  return <div ref={host} aria-hidden="true" className={cn('min-w-0 overflow-hidden', className)} />
}

/** A style of the site as people call it, in words: lede is "Lede", btn-on-brand is "On Brand", scheme-tide "Tide". */
export const styleLabel = (name: string) => name.replace(/^(btn|scheme)-/, '').split('-').filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

/** The sample of a style of the site: a button for a button's look, a block in its colours for a scheme, its own name in it for any other. */
export function styleSample(name: string): SampleNode {
  if (name.startsWith('btn-')) return { tag: 'span', text: styleLabel(name), className: `cms-button ${name}` }
  if (name.startsWith('scheme-')) return { tag: 'span', text: styleLabel(name), className: `${name} inline-block rounded-md px-4 py-2` }
  return { tag: 'span', text: styleLabel(name), className: name }
}
