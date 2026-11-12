import { cn } from '@letterncms/ui'
import { useEffect, useRef, useState } from 'react'
import { FileTile } from './kinds'
import type { MediaItem } from './upload'

type Document = Pick<MediaItem, 'url' | 'mime' | 'kind' | 'filename' | 'name' | 'size'>

const TEXT = ['text/plain', 'text/csv', 'text/markdown']

/** A file the library can show the inside of: a PDF's pages, or the start of a text, CSV or Markdown file. */
export const hasDocumentPreview = (item: Pick<MediaItem, 'mime'>) => item.mime === 'application/pdf' || TEXT.includes(item.mime)

/** Previews are made once per file and kept while the library is open: a grid redraws its tiles often. */
const made = new Map<string, Promise<unknown>>()
function once<T>(key: string, make: () => Promise<T>): Promise<T> {
  let found = made.get(key) as Promise<T> | undefined
  if (!found) {
    if (made.size > 120) made.delete(made.keys().next().value as string)
    found = make()
    found.catch(() => made.delete(key))
    made.set(key, found)
  }
  return found
}

/**
 * pdf.js is only fetched when a PDF is first shown. Its worker is loaded as a module and run on the page: the
 * admin's security policy allows no worker from a data: or blob: address, and a first page is quick to read.
 */
let pdfjs: Promise<typeof import('pdfjs-dist')> | undefined
const library = () => pdfjs ??= import('pdfjs-dist/build/pdf.worker.min.mjs').then(() => import('pdfjs-dist'))

/** The first `count` pages of a PDF as pictures, `width` px wide. */
const pages = (url: string, count: number, width: number) => once(`pdf|${url}|${count}|${width}`, async () => {
  const lib = await library()
  const task = lib.getDocument({ url })
  const doc = await task.promise
  try {
    const out: string[] = []
    for (let n = 1; n <= Math.min(count, doc.numPages); n++) {
      const page = await doc.getPage(n)
      const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport, background: 'white' }).promise
      out.push(canvas.toDataURL('image/jpeg', 0.85))
      page.cleanup()
    }
    return out
  } finally {
    void task.destroy()
  }
})

/** The start of a text file: the first `limit` bytes, never the whole of a large one. */
const start = (url: string, limit: number) => once(`text|${url}|${limit}`, async () => {
  const response = await fetch(url, { headers: { Range: `bytes=0-${limit - 1}` } })
  if (!response.ok) throw new Error(String(response.status))
  return (await response.text()).replace(/^﻿/, '').slice(0, limit)
})

/** Markdown as a quiet excerpt: its marks left out, its words kept. */
const words = (markdown: string) => markdown
  .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/(\*\*|__|`|~~)/g, '')

/** True once the element has come near the screen: a library of sixty files fetches what is in view. */
function useSeen() {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    const watch = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) setSeen(true) }, { rootMargin: '200px' })
    watch.observe(element)
    return () => watch.disconnect()
  }, [seen])
  return [ref, seen] as const
}

/**
 * What a document looks like: a PDF's first page, or the start of its text. In a tile (`panel` off) it fills
 * the tile; in a file's details (`panel`) it is a scrolling sheet of up to five pages or the first lines.
 * Until it is ready, and when it can't be made (an encrypted PDF), it is the file's own tile.
 */
export function DocumentPreview({ item, panel = false }: { item: Document; panel?: boolean }) {
  const [ref, seen] = useSeen()
  const pdf = item.mime === 'application/pdf'
  const [shown, setShown] = useState<{ pages: string[] } | { text: string } | null>(null)
  const limit = panel ? 20000 : 1200

  useEffect(() => {
    if (!seen) return
    let current = true
    setShown(null)
    const work = pdf
      ? pages(item.url, panel ? 5 : 1, panel ? 720 : 480).then((list) => list.length ? { pages: list } : null)
      : start(item.url, limit).then((text) => ({ text }))
    work.then((next) => { if (current) setShown(next) }, () => { if (current) setShown(null) })
    return () => { current = false }
  }, [seen, item.url, item.mime, pdf, panel, limit])

  const text = shown && 'text' in shown ? shown.text : ''
  const more = item.size > limit ? '…' : ''

  if (!panel) {
    return (
      <div ref={ref} className="absolute inset-0 overflow-hidden">
        {shown && 'pages' in shown
          ? <img src={shown.pages[0]} alt="" className="w-full bg-white object-cover object-top" />
          : shown ? <pre className={cn('m-0 size-full overflow-hidden whitespace-pre-wrap break-words p-3 text-2xs leading-snug text-muted', item.mime !== 'text/markdown' && 'font-mono')}>{(item.mime === 'text/markdown' ? words(text) : text) + more}</pre>
          : <FileTile item={item} />}
      </div>
    )
  }

  return (
    <div ref={ref}>
      {shown && 'pages' in shown
        ? <div className="max-h-[44vh] space-y-2 overflow-y-auto rounded-md bg-sunken p-2">{shown.pages.map((page, n) => <img key={n} src={page} alt={n === 0 ? item.name : ''} className="block w-full rounded-xs bg-white" />)}</div>
        : shown ? <pre className="m-0 max-h-[44vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-sunken p-3 font-mono text-xs leading-relaxed">{text + more}</pre>
        : <FileTile item={item} size={28} className="h-32 rounded-md bg-sunken" />}
    </div>
  )
}
