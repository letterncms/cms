// Build admin, then run `node modules/admin/tests/command-palette.mjs`
// and open the printed URL. Uses the real shell with delayed search fixtures.
import { body, json, page, serve } from './harness.mjs'

const nav = [
  ['dashboard', 'Dashboard', '/', 'grid', 'main'], ['analytics', 'Analytics', '/analytics', 'chart', 'main'],
  ['pages', 'Pages', '/content/pages', 'file', 'content'], ['posts', 'Posts', '/content/posts', 'article', 'content'], ['media', 'Media', '/media', 'media', 'content'],
  ['components', 'Components', '/content/components', 'blocks', 'design'], ['templates', 'Templates', '/content/templates', 'layout', 'design'],
  ['settings', 'Settings', '/settings', 'settings', 'system'],
].map(([id, label, path, icon, section]) => ({ id, label, path, icon, section }))
const manifest = {
  cms: { version: 'test', debug: false },
  brand: { name: 'Acme', domain: '', product_url: '', docs_url: '', support_email: '', mark: '', wordmark: '' }, site: { name: 'Acme', url: '', locales: ['en'], defaultLocale: 'en', timezone: 'UTC' },
  user: { id: 'test', name: 'Alex Morgan', email: 'alex@example.invalid', initials: 'AM', roles: [], super: true, grants: ['*'], preferences: {}, data: {}, twoFactor: false },
  packages: { active: ['cms/admin', 'fixture'], pending: {} },
  modules: [{ id: 'fixture', url: '/fixture.js' }],
  styles: [], settings: [], collections: [], globals: [], fieldTypes: [], commands: [], widgets: [], dashboard: [], config: {}, nav,
  sidebar: { sections: ['main', 'content', 'design'].map((id) => ({ id, label: id === 'main' ? '' : id[0].toUpperCase() + id.slice(1), items: nav.filter((n) => n.section === id).map((n) => n.id) })), hidden: [], personal: false },
  settingsNav: [{ id: 'system', label: 'System', items: nav.filter((n) => n.section === 'system').map((n) => n.id) }],
}
const boot = { base: '/admin', api: '/api/admin', version: 'test', site: manifest.site, locale: 'en', messages: {}, manifest }
const fixture = `
import { createElement as h } from 'react'
import { registry } from '@letterncms/sdk'
registry.commands.set('agents-command', { label: 'Connect an AI Agent (MCP)', keywords: ['agents'], perform: () => {} })
registry.commands.set('home', { label: 'Customize Home Screen', perform: () => {} })
registry.commands.set('ask', { label: 'New Chat', acceptsQuery: true, perform: q => { window.asked = q } })
registry.commands.set('analytics', { label: 'Open Analytics', keywords: ['metrics'], perform: () => { window.ranAnalytics = true } })
const links = ${JSON.stringify(nav)}
links.forEach(n => registry.routes.set(n.path, { path: n.path, component: () => h('main', { style: { padding: 32 } }, h('h1', null, n.label)) }))
`
const runner = `
import { registry } from '@letterncms/sdk'
const output = document.querySelector('#results'), results = []
const sleep = ms => new Promise(r => setTimeout(r, ms))
const assert = (value, message) => { if (!value) throw new Error(message) }
const wait = async (fn, message) => { const end = Date.now()+7000; while (!fn()) { if(Date.now()>end) throw new Error(message); await sleep(15) } }
const test = async (name, fn) => { await fn(); results.push(name); output.textContent = results.map(x=>'PASS '+x).join('\\n') }
const input = () => document.querySelector('[cmdk-input]')
const items = () => [...document.querySelectorAll('[cmdk-item]')]
const ask = () => items().find(el => el.dataset.value.startsWith('ask '))
const selected = () => document.querySelector('[cmdk-item][aria-selected="true"]')
const set = value => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input(),value); input().dispatchEvent(new Event('input',{bubbles:true})) }
const key = value => input().dispatchEvent(new KeyboardEvent('keydown',{key:value,bubbles:true}))
const content = () => items().filter(el => el.dataset.value.startsWith('entry '))
// Content lands below the commands; the arrow keys reach it.
const choose = async (title) => { for (let i = 0; i < 20 && !selected()?.textContent.startsWith(title); i++) { key('ArrowDown'); await sleep(25) } assert(selected()?.textContent.startsWith(title), title + ' could not be selected') }
// ⌘K on a Mac, Ctrl+K elsewhere: the shortcut is mod+k.
const mac = /Mac|iPhone|iPad/.test(navigator.platform)
const open = async () => { document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',metaKey:mac,ctrlKey:!mac,bubbles:true})); await wait(input,'palette did not open'); await wait(selected,'palette opened without a selection') }
try {
 await wait(()=>document.querySelector('main h1'),'shell did not load'); await open()
 await test('Blank input shows commands without Ask',async()=>{await sleep(50);assert(!ask(),'Ask visible for blank input')})

 await test('Every keystroke selects the first local result',async()=>{
   for (const q of ['h','ho','hom','home']) { set(q); await sleep(35); assert(selected()===items()[0], 'not first for '+q) }
 })
 await test('Content arrives below the matching commands without moving the selection',async()=>{
   await wait(()=>content()[0]?.textContent.includes('Home page'),'home results missing')
   assert(items()[0].textContent.includes('Customize Home Screen'),'the matching command is not first')
   assert(selected()===items()[0],'arriving content moved the selection')
   assert(content().slice(0,3).map(el=>el.textContent.trim()).join('|')==='Home pagepages|Headerpages|Footerpages','server result order changed')
 })
 await test('Arrow navigation remains selected after results settle',async()=>{
   key('ArrowDown');await sleep(40);assert(selected()===items()[1],'ArrowDown failed')
   await sleep(400);assert(selected()===items()[1],'manual selection was reset')
   key('ArrowUp');await sleep(40);assert(selected()===items()[0],'ArrowUp failed')
 })
 await test('Editing and backspacing reset selection to the first row',async()=>{
   key('ArrowDown');await sleep(30)
   for (const q of ['hom','ho','home']) { set(q);await sleep(35);assert(selected()===items()[0],'old selection remained for '+q) }
   await wait(()=>content()[0]?.textContent.includes('Home page'),'cached results missing')
   assert(selected()===items()[0],'cached content moved the selection')
 })
 await test('Late search responses cannot replace the current first result',async()=>{
   set('slowhome');await sleep(220);set('home');await sleep(1100)
   assert(input().value==='home'&&content()[0]?.textContent.includes('Home page')&&!items().some(el=>el.textContent.includes('Late result')),'late results replaced home')
   assert(selected()===items()[0],'late response moved selection')
 })
 await test('Enter opens the content result the arrows select',async()=>{
   await choose('Home page');key('Enter');await wait(()=>location.pathname==='/admin/content/pages/home','Enter did not open Home')
   await open();assert(selected()===items()[0],'reopening lost first selection')
 })
 await test('Matching commands are selected without Ask',async()=>{set('analytics');await sleep(700);assert(!ask(),'Ask visible with match');assert(selected()?.textContent.includes('Analytics'),'analytics not selected')})
 await test('Command keywords suppress Ask and Enter runs the match',async()=>{set('metrics');await sleep(700);assert(!ask(),'Ask visible with keyword');key('Enter');await wait(()=>window.ranAnalytics,'Enter did not run command');await open()})
 await test('No-match query waits for content search, then selects Ask',async()=>{set('zzzzzzzz');await sleep(60);assert(!ask(),'Ask flashed during debounce');await sleep(200);assert(!ask(),'Ask visible before content response');await wait(ask,'Ask did not appear');await wait(()=>selected()===ask(),'Ask was not selected');key('Enter');await wait(()=>window.asked==='zzzzzzzz','Enter did not ask');await open()})
 await test('Delayed content matches suppress Ask and receive keyboard selection',async()=>{set('quuxcontent');await sleep(250);assert(!ask(),'Ask visible while content pending');await wait(()=>items().some(el=>el.textContent.includes('Quux result')),'content missing');assert(!ask(),'Ask visible with content');await wait(()=>selected()?.textContent.includes('Quux result'),'content not selected')})
 await test('Changing query clears stale content before offering Ask',async()=>{set('zzfreshzz');await sleep(50);assert(!items().some(el=>el.textContent.includes('Quux result')),'stale content visible');await wait(ask,'fallback missing for new query');await wait(()=>selected()===ask(),'new fallback not selected')})
 await test('Whitespace clears fallback and content',async()=>{set('   ');await sleep(250);assert(!ask(),'Ask visible for whitespace');assert(!items().some(el=>el.textContent.includes('Quux result')),'stale content visible for whitespace')})
 await test('Exact titles outrank newer body matches, below the matching command',async()=>{
   set('agents');await wait(()=>items().some(el=>el.dataset.value==='entry Agents agents agents'),'Agents result missing')
   assert(content().slice(0,4).map(el=>el.textContent.trim()).join('|')==='Agentspages|Overviewpages|Agents guidepages|Using agentspages','title and slug relevance order is wrong')
   assert(items()[0].textContent.includes('Connect an AI Agent')&&selected()===items()[0],'the matching command is not first')
   assert(!ask(),'Ask appeared beside a matching page')
   await choose('Agents');key('Enter');await wait(()=>location.pathname==='/admin/content/pages/agents','Enter did not open Agents');await open()
 })
 await test('Exact commands outrank body-only content matches',async()=>{
   set('analytics');await sleep(700)
   assert(items().some(el=>el.dataset.value.startsWith('entry ')),'body-match fixture missing')
   assert(items()[0].textContent.trim()==='Analytics'&&selected()===items()[0],'body result displaced the exact navigation match')
 })
 await test('No assistant shows the normal empty state',async()=>{registry.commands.delete('ask');set('unmatchedzz');await sleep(750);assert(!ask(),'Ask present without assistant');assert(document.querySelector('[cmdk-empty]')?.textContent==='No matches','empty state missing')})
 output.textContent+='\\nAll '+results.length+' command palette checks passed.'
 await fetch('/__test/results',{method:'POST',body:JSON.stringify({passed:results})})
} catch(error){output.textContent+='\\nFAIL '+error.message;await fetch('/__test/results',{method:'POST',body:JSON.stringify({passed:results,error:error.stack})})}
`
serve('Command palette', async (req, res, url) => {
  if (url.pathname === '/fixture.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(fixture) }
  if (url.pathname === '/api/admin/abilities/content/search') {
    const input = await body(req)
    await new Promise(r => setTimeout(r, input.query === 'slowhome' ? 850 : 350))
    const term = input.query.toLowerCase()
    const rows = term === 'agents' ? [['home', 'Home'], ['guide', 'Agents guide'], ['using', 'Using agents'], ['overview', 'Overview', 'agents'], ['agents', 'Agents']]
      : term === 'analytics' ? [['home', 'Home']]
      : input.query === 'home' ? [['home', 'Home page'], ['header', 'Header'], ['footer', 'Footer']]
      : input.query === 'quuxcontent' ? [['entry', 'Quux result']] : input.query === 'slowhome' ? [['late', 'Late result']] : []
    return json(res, 200, { data: rows.map(([id, title, slug = id]) => ({ id, title, slug, collection: 'pages', displayStatus: 'draft' })) })
  }
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(page({ title: 'Command palette regression checks', boot, runner: url.searchParams.has('test') && runner }))
}, { links: (base) => [`${base}/admin?test=1`, `${base}/admin`] })
