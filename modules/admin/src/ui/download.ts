/**
 * A file an ability answered with, saved where the browser keeps downloads: `{name, type, content}`, the content
 * as text, or as base64 with `encoding: "base64"` (a zip). Nothing happens for an answer that is no file.
 */
export function download(result: unknown) {
  const file = result as { name?: string; type?: string; content?: string; encoding?: string } | null
  if (!file || typeof file.content !== 'string') return
  const body = file.encoding === 'base64' ? Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0)) : file.content
  const url = URL.createObjectURL(new Blob([body], { type: file.type ?? 'application/octet-stream' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: file.name ?? 'download' })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
