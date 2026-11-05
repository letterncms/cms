// What every browser check needs: the built admin (build it first), its import map, the page that
// boots it, and a server for the built packages and the page's verdict. Each check adds its fixtures.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extname, resolve, sep } from 'node:path'

export const root = fileURLToPath(new URL('../../..', import.meta.url))
export const admin = JSON.parse(await readFile(resolve(root, 'modules/admin/dist/admin.json'), 'utf8'))

/** Where a package's built admin files are, as the CMS serves them: `assets('blocks')` is `/_cms/assets/cms-blocks/`. */
export const assets = (name) => `/_cms/assets/cms-${name}/`
export const assetBase = assets('admin')

/** The admin's import map, with what a check adds (another module's exports, such as `@letterncms/blocks`). */
export const imports = (extra = {}) => ({ ...Object.fromEntries(Object.entries(admin.imports).map(([key, path]) => [key, assetBase + path])), ...extra })

const types = {
  '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
}
export const mime = (path) => types[extname(path)] ?? 'application/octet-stream'

export const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)) }
export const text = async (req) => { let value = ''; for await (const chunk of req) value += chunk; return value }
export const body = async (req) => JSON.parse((await text(req)) || '{}')

/** A file under `directory`, never outside it; false when it isn't there. */
export async function serveFile(res, directory, path) {
  const file = resolve(directory, path)
  if (!file.startsWith(directory + sep)) { json(res, 403, {}); return true }
  let content
  try { content = await readFile(file) } catch { return false }
  res.writeHead(200, { 'Content-Type': mime(file) })
  res.end(content)
  return true
}

/** The results panel a check writes to as it goes. */
export const resultsStyle = 'position:fixed;bottom:8px;right:8px;z-index:9999;max-width:700px;max-height:40vh;overflow:auto;background:white;color:black;border:1px solid #aaa;padding:12px;font-size:10px'

/**
 * The page that boots the built admin: its stylesheets, the import map, `window.__CMS__` (with
 * `setup`, a script run before the admin starts), the entry, then `body` and, to run the checks,
 * the results panel and `runner`, the check's own module. `nonce` goes on every script.
 */
export function page({ title, boot, map = imports(), runner = null, head = '', setup = '', body = '<div id="cms"></div>', results = resultsStyle, nonce }) {
  const n = nonce ? ` nonce="${nonce}"` : ''
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>`
    + admin.css.map((path) => `<link rel="stylesheet" href="${assetBase + path}">`).join('') + head
    + `<script type="importmap"${n}>${JSON.stringify({ imports: map })}</script><script${n}>window.__CMS__=${JSON.stringify(boot)};${setup}</script><script type="module"${n} src="${assetBase + admin.entry}"></script></head>`
    + `<body>${body}${runner ? `${results ? `<pre id="results" style="${results}">Starting checks…</pre>` : ''}<script type="module"${n}>${runner}</script>` : ''}</body></html>`
}

/**
 * A check's server. `/__test/results` takes the page's verdict (a POST of `{passed, error}`): it is
 * printed and the process exits with it, unless `--preview` (or `keepAlive`) keeps the server up to
 * look at; a GET answers the last one. `/_cms/assets/cms-<name>/…` serves that package's build
 * (`folder(name)`: `modules/<name>`, or another folder). Everything else goes to `handle(req, res, url)`.
 * `links(base)` are printed when it listens: the first is the URL that runs the checks. `during()` says
 * where it was when it times out.
 */
export function serve(name, handle, { links, folder = (pkg) => `modules/${pkg}`, keepAlive = process.argv.includes('--preview'), port = 0, during } = {}) {
  let last = null
  const close = (code) => setTimeout(() => { server.closeAllConnections(); server.close(); process.exitCode = code }, 100)
  const timeout = keepAlive ? null : setTimeout(() => { console.error(`${name} browser checks timed out${during ? ` during: ${during()}` : ''}`); close(1) }, 120_000)
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost')
      if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end() }
      if (url.pathname === '/__test/results') {
        if (req.method !== 'POST') return json(res, 200, last)
        last = await body(req)
        last.passed.forEach((check) => console.log('PASS', check))
        if (last.error) console.error('FAIL', last.error)
        if (last.viewport) console.log('Viewport', last.viewport)
        json(res, 200, {})
        if (!keepAlive) { clearTimeout(timeout); close(last.error ? 1 : 0) }
        return
      }
      const asset = url.pathname.match(/^\/_cms\/assets\/cms-([\w-]+)\/(.+)$/)
      if (asset && await serveFile(res, resolve(root, folder(asset[1]), 'dist'), asset[2])) return
      if (asset) return json(res, 404, {})
      await handle(req, res, url)
    } catch (error) {
      console.error(error)
      if (res.headersSent) return res.end()
      json(res, 500, { error: { message: error.message, type: 'failed' } })
    }
  })
  server.listen(port, '127.0.0.1', () => {
    const base = `http://localhost:${server.address().port}`
    const [run, ...more] = links(base)
    console.log(`${name} checks: ${run}`)
    for (const link of more) console.log(`Preview: ${link}`)
  })
  return server
}
