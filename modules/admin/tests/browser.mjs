// Runs the browser fixture checks headless: each starts its own server with the built admin
// and fixture APIs, prints the URL to open, and exits when the page reports its results.
//   node modules/admin/tests/browser.mjs [chat command-palette …]   (CHROME=path for another browser)
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))
const all = ['navigation', 'command-palette', 'overviews', 'chat', 'inspector', 'content-workflow']
const chosen = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const chrome = [process.env.CHROME, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((path) => path && existsSync(path))
if (!chrome) {
  console.error('No Chrome found. Set CHROME to its path.')
  process.exit(1)
}

function run(name) {
  return new Promise((resolve) => {
    const server = spawn(process.execPath, [join(here, `${name}.mjs`)], { stdio: ['ignore', 'pipe', 'pipe'] })
    let browser = null
    let profile = null
    let output = ''
    const done = async (code) => {
      if (browser && browser.exitCode === null) {
        const closed = new Promise((r) => browser.once('exit', r))
        browser.kill()
        await closed
      }
      if (profile) {
        try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch {}
      }
      resolve({ name, code, output })
    }
    const read = (chunk) => {
      output += chunk
      // The first URL a check prints is the one that runs it.
      const url = !browser && output.match(/http:\/\/localhost:\d+\/\S*/)?.[0]
      if (!url) return
      profile = mkdtempSync(join(tmpdir(), 'cms-checks-'))
      browser = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,900', `--user-data-dir=${profile}`, url], { stdio: 'ignore' })
    }
    server.stdout.on('data', read)
    server.stderr.on('data', (chunk) => { output += chunk })
    server.on('exit', done)
  })
}

let failed = 0
for (const name of chosen.length ? chosen : all) {
  const { code, output } = await run(name)
  const lines = output.trim().split('\n').filter((line) => !/^(Open |Preview: |\w[\w ]* checks: )/.test(line))
  console.log(`${code === 0 ? 'ok' : 'FAIL'}  ${name}`)
  if (code !== 0) {
    failed++
    console.log(lines.map((line) => `      ${line}`).join('\n'))
  }
}
process.exit(failed ? 1 : 0)
