// Build @letterncms/admin and @letterncms/module-blocks, run this file, then open the printed URL.
// Exercises real built components with in-memory documents; never writes site content.
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { assets, json, page, root, serve } from './harness.mjs'

const translations = Object.assign({}, ...await Promise.all(['modules/admin/lang/nl.json', 'modules/blocks/lang/nl.json'].map(async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8')))))
const runner = `
import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { registry, queryClient, abilityKey, setManifest, setLocale } from '@letterncms/sdk'
import { Fields, TooltipProvider } from '@letterncms/ui'
import { Inspector, EditorProvider, EditorStore, useEditor } from '${assets('blocks')}admin.js'

const h = React.createElement
const pause = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
const assert = (condition, message) => { if (!condition) throw new Error(message) }
const results = []
const output = document.querySelector('#results')
const preview = document.querySelector('#preview')
const mount = createRoot(preview)
const catalog = { blocks: [], styles: {}, aliases: {}, states: [], breakpoints: {}, sources: [], motion: { triggers: [], properties: {} }, logic: { events: [], mods: [], actions: [], transitions: [], merges: [] } }
const type = { name: 'button', title: 'Button', icon: 'square', category: 'basic', fields: [] }
const themeAction = { do: 'theme', mode: 'toggle' }
const node = { id: 'example', type: 'button', props: {}, logic: { on: [{ event: 'click', actions: [themeAction, { do: 'play', node: 'example' }, { do: 'if', test: 'open', then: [{ do: 'if', test: 'ready', then: [themeAction] }], else: [themeAction] }] }] } }
const store = new EditorStore([node], () => {})
queryClient.setQueryData(abilityKey('design/get', {}), { tokens: [], breakpoints: {}, templates: {} })
sessionStorage.setItem('cms.block.tab', 'interact')

function Example() {
  const current = useEditor(store, (s) => s.nodes[0])
  return h(Inspector, { node: current })
}
function render(extra) {
  mount.render(h(QueryClientProvider, { client: queryClient }, h(TooltipProvider, null,
    h(EditorProvider, { value: { store, types: new Map([['button', type]]), catalog, entryId: null, fieldHandle: 'body', allowed: [], getValues: () => ({}), title: 'Inspector test' } }, extra ?? h(Example)))))
}
const check = (name) => { results.push(name); output.textContent = results.map((s) => 'PASS ' + s).join('\\n') }
const field = (handle, options, more = {}) => ({ handle, type: 'select', label: handle, size: 'xs', display: 'segmented', block: true, options, ...more })
try {
  for (let tries = 0; !registry.fields.get('select') && tries < 200; tries++) await new Promise((r) => setTimeout(r, 20))
  assert(registry.fields.get('select'), 'Core fields did not register')
  setManifest({ user: { super: true, grants: ['*'] }, packages: { active: [] }, fieldTypes: [], collections: [], globals: [], config: {} })
  for (const locale of ['en', 'nl']) {
    setLocale(locale, locale === 'nl' ? ${JSON.stringify(translations)} : {})
    for (const theme of ['light', 'dark']) {
      document.documentElement.dataset.theme = theme
      for (const width of [300, 240, 200]) {
        preview.style.width = width + 'px'
        render(h(Example, { key: locale + theme + width }))
        await pause()
        const groups = [...preview.querySelectorAll('[role="radiogroup"]')]
        assert(groups.length >= 4, 'Missing action groups')
        for (const group of groups) {
          const bounds = group.getBoundingClientRect()
          assert(group.scrollWidth <= group.clientWidth + 1, 'Group overflow: ' + group.textContent)
          for (const button of group.querySelectorAll('button')) {
            const b = button.getBoundingClientRect()
            assert(b.left >= bounds.left - 1 && b.right <= bounds.right + 1, 'Option escaped: ' + button.textContent)
            assert(button.scrollWidth <= button.clientWidth + 1, 'Option text clipped: ' + button.textContent)
          }
        }
        // A sidebar's scroll area must not quietly become horizontally scrollable.
        const scroll = preview.querySelector('.overflow-y-auto')
        assert(scroll.scrollWidth <= scroll.clientWidth + 1, 'Inspector has horizontal overflow')
        check(locale + ' / ' + theme + ' / ' + width + 'px: nested action layout')
      }
    }
  }
  setLocale('en', {})
  render()
  await pause()
  preview.querySelector('[role="radio"][aria-label="Light"]').click()
  await pause()
  assert(store.get().nodes[0].logic.on[0].actions[0].mode === 'light', 'Theme selection did not persist in editor store')
  check('Theme options update the real editor store')
  render(h(Fields, { layout: 'inline', fields: [field('Empty', ['First', 'Second']), field('Disabled', ['First', 'Second']), field('Long choices', [{ value: 'a', label: 'Use the operating system appearance' }, { value: 'b', label: 'AReallyLongUnbrokenTranslatedOptionName' }, { value: 'c', label: 'Dark appearance' }])], values: {}, onChange: () => {}, disabled: true }))
  await pause()
  assert([...preview.querySelectorAll('[role="radio"]')].every((b) => b.disabled), 'Disabled field is interactive')
  for (const group of preview.querySelectorAll('[role="radiogroup"]')) assert(group.scrollWidth <= group.clientWidth + 1, 'Long translated option overflow')
  check('Disabled fields and long translated options')
  render(h(Fields, { layout: 'inline', fields: [field('Empty', ['First', 'Second'])], values: {}, onChange: () => {} }))
  await pause()
  const first = preview.querySelector('[role="radio"]')
  assert(first.tabIndex === 0, 'Empty control has no keyboard entry point')
  first.focus()
  first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  assert(document.activeElement === preview.querySelectorAll('[role="radio"]')[1], 'Arrow key did not move focus')
  check('Empty fields support keyboard entry and arrow navigation')
  preview.style.width = '300px'
  document.documentElement.dataset.theme = 'dark'
  render()
  await pause()
  document.querySelector('#state').textContent = 'PASS'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results }) })
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  document.querySelector('#state').textContent = 'FAIL'
  await fetch('/__test/results', { method: 'POST', body: JSON.stringify({ passed: results, error: error.stack }) })
}
`
const body = `<div id="cms" hidden></div><div style="padding:24px"><h1 style="font-size:18px;margin-bottom:16px">Inspector regression checks · <span id="state">Running</span></h1><div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap"><div id="preview" style="width:300px;border:1px solid var(--cms-border);border-radius:8px;background:var(--cms-bg)"></div><pre id="results" style="font-size:12px;line-height:1.8;white-space:pre-wrap">Starting…</pre></div></div>`
serve('Inspector', (req, res, url) => {
  if (url.pathname === '/api/admin/auth/session') return json(res, 200, { authenticated: false })
  if (url.pathname !== '/') return json(res, 404, {})
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(page({ title: 'Inspector regression checks', boot: { base: '/admin', api: '/api/admin', site: { name: 'Fixture' }, locale: 'en', messages: {} }, head: `<link rel="stylesheet" href="${assets('blocks')}admin.css">`, body, runner, results: false }))
}, { links: (base) => [`${base}/`] })
