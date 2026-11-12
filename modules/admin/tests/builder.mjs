// Build first: ./dev pnpm build
// node modules/admin/tests/builder.mjs --preview
// The blueprint builder over fixture abilities: conditions, a matrix's row types, a collection's blueprints.
import { abilities, boot, collection, manifest, prelude } from './content-kinds.mjs'
import { json, page, serve } from './harness.mjs'

const type = (key, label, icon, config = []) => ({ key, label, icon, description: '', group: 'Basic', component: key, config })
const fieldTypes = [
  type('text', 'Text', 'text'), type('textarea', 'Textarea', 'text'), type('toggle', 'Toggle', 'toggle'), type('url', 'URL', 'link'), type('number', 'Number', 'number'), type('markdown', 'Markdown', 'text'),
  type('select', 'Select', 'list'),
  type('matrix', 'Matrix', 'list', [{ handle: 'types', type: 'json', component: 'matrix-types', label: 'Row Types' }]),
]
const fields = [
  { handle: 'kind', type: 'select', label: 'Kind', options: { text: 'Text', video: 'Video', audio: 'Audio' } },
  { handle: 'featured', type: 'toggle', label: 'Featured' },
  { handle: 'city', type: 'text', label: 'City' },
  { handle: 'teaser', type: 'textarea', label: 'Teaser', if: { kind: ['text', 'video'] }, required_if: { featured: true } },
  { handle: 'note', type: 'text', label: 'Note', if: { city: 'Gent' } },
  { handle: 'plain', type: 'text', label: 'Plain' },
  { handle: 'first', type: 'text', label: 'First', if: { second: 'x' } },
  { handle: 'second', type: 'text', label: 'Second', if: { first: 'x' } },
  { handle: 'sections', type: 'matrix', label: 'Sections', types: [
    { handle: 'quote', label: 'Quote', fields: [{ handle: 'text', type: 'textarea', label: 'Text' }] },
    { handle: 'facts', label: 'Facts', fields: [{ handle: 'title', type: 'text', label: 'Title' }] },
  ] },
]
const settings = [
  { handle: 'title', type: 'text', label: 'Name', required: true }, { handle: 'singular', type: 'text', label: 'Entry Name' },
  // The taxonomies there are to archive by, as the kernel offers them.
  { handle: 'archives', type: 'json', component: 'collection-archives', label: 'Term Archives', options: { topics: 'Topics', authors: 'Authors' } },
]
const definition = { ...collection, fields, resolvedFields: fields, settings, archives: { topics: '/news/topics/{slug}' } }
const own = { ...manifest, fieldTypes }
let saved = null
const api = abilities((ability, input) => {
  if (ability === 'collections/get') return definition
  if (ability === 'collections/save') { saved = input.definition; return { ...definition, ...input.definition } }
  // The stored rows of one kind of a matrix field: seven quotes in two entries, no facts.
  if (ability === 'collections/usage') return input.handle === collection.handle && input.field === 'sections' && input.rowType === 'quote' ? { rows: 7, entries: 2 } : { rows: 0, entries: 0 }
  if (ability === 'entries/list' && input.filters?.[0]?.field === 'blueprint') return { items: [], total: 3, page: 1, perPage: 1, pages: 3 }
  return undefined
})

const runner = `${prelude}
// What a person types: the box takes each letter, and says so to the form.
const type = async (input, text) => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  input.focus()
  for (let i = 0; i <= text.length; i++) { set.call(input, text.slice(0, i)); input.dispatchEvent(new Event('input', { bubbles: true })); await pause() }
}
const leave = async (input) => { input.blur(); input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); await pause() }
const row = (label) => [...document.querySelectorAll('button[aria-expanded]')].find((b) => b.textContent.trim().startsWith(label))
const open = async (label) => { const button = await until(() => row(label), 'No field ' + label); if (button.getAttribute('aria-expanded') !== 'true') button.click(); await pause(); return button.closest('.rounded-lg') }
const close = async (label) => { const button = row(label); if (button?.getAttribute('aria-expanded') === 'true') button.click(); await pause() }
const press = (text, within = document) => [...within.querySelectorAll('button')].find((b) => b.textContent.trim() === text || b.getAttribute('aria-label') === text)
const savedDefinition = async () => { (await until(() => press('Save'), 'No save bar')).click(); for (let i = 0; i < 100; i++) { const got = await (await fetch('/__test/saved')).json(); if (got) return got; await pause() } throw new Error('Nothing was saved') }
try {
  // Conditions read as sentences, with the choices of the field they name; a field without one has no empty chrome for them.
  let box = await open('Teaser')
  const sentences = [...box.querySelectorAll('[data-condition]')].map((line) => line.textContent.replace(/\\s+/g, ' ').trim())
  assert(sentences.length === 2 && /when.*Kind.*is/.test(sentences[0]) && /when.*Featured.*is/.test(sentences[1]), 'Conditions do not read as sentences: ' + sentences.join(' / '))
  assert(/Text/.test(sentences[0]) && /Video/.test(sentences[0]), 'The values are not the choices of the field named: ' + sentences[0])
  assert(!document.querySelector('#cms').textContent.includes('Show When') && !document.querySelector('#cms').textContent.includes('Required When'), 'The two empty lists are back')
  assert([...box.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Add Condition').length === 1, 'There is not exactly one Add Condition')
  await close('Teaser')
  box = await open('Plain')
  assert(!box.querySelector('[data-conditions]') && press('Add Condition', box), 'A field without a condition shows more than the button that adds one')
  await close('Plain')
  check('Conditions are sentences, and a field without one has only Add Condition')

  // A value is typed as it is written: spaces, commas and decimal points stay while typing.
  box = await open('Note')
  let value = box.querySelector('[data-condition] input[aria-label="Value"]')
  for (const text of ['New York', '1.5', 'text, video']) {
    await type(value, text)
    assert(value.value === text, 'Typing “' + text + '” left “' + value.value + '”')
  }
  await type(value, 'New York')
  await leave(value)
  assert(box.querySelector('[data-condition] input[aria-label="Value"]').value === 'New York', 'The value did not stay once the box was left')
  await close('Note')
  check('A condition\\'s value can be typed with spaces, commas and points')

  // Conditions that come back to their own field are said at the field.
  box = await open('First')
  assert(box.textContent.includes('depend on this field itself'), 'A circle of conditions is not said at the field')
  await close('First')
  check('A circle of conditions is refused at the field')

  // Renaming a field is followed by the conditions that name it; removing one takes them with it.
  box = await open('City')
  const handle = [...box.querySelectorAll('input')].find((input) => input.value === 'city')
  await type(handle, 'town')
  await leave(handle)
  await close('City')
  box = await open('Kind')
  press('Remove Field', box).click()
  await pause()
  let definition = await savedDefinition()
  const by = Object.fromEntries(definition.fields.map((f) => [f.handle, f]))
  assert(JSON.stringify(by.note.if) === JSON.stringify({ town: 'New York' }), 'The condition did not follow the new handle: ' + JSON.stringify(by.note.if))
  assert(!('if' in by.teaser) && JSON.stringify(by.teaser.required_if) === JSON.stringify({ featured: true }), 'The removed field is still named: ' + JSON.stringify(by.teaser))
  check('Conditions follow a renamed field and go with a removed one')

  // A matrix lists its row types like fields: a row each, not a box in a box.
  box = await open('Sections')
  const kinds = [...box.querySelectorAll('[data-matrix-type]')]
  assert(kinds.length === 2 && !box.querySelector('[data-matrix-type] [data-matrix-type]'), 'Row types are not two rows')
  assert(!kinds[0].querySelector('input'), 'A row type is open before it is asked for')
  kinds[0].querySelector('button[aria-expanded]').click()
  await until(() => [...kinds[0].querySelectorAll('input')].some((input) => input.value === 'quote'), 'A row type does not open on its name and handle')
  assert(kinds[0].textContent.includes('Text'), 'A row type does not show its fields')
  check('Row types of a matrix are rows that open')

  // Taking away a row type rows were made with says how many first; one without rows only asks.
  press('Remove Row Type', kinds[0]).click()
  let rowsQuestion = await until(() => document.querySelector('[role="alertdialog"]'), 'Removing a row type asks nothing')
  assert(rowsQuestion.textContent.includes('7 rows were made with it'), 'The question does not say how many rows: ' + rowsQuestion.textContent)
  press('Cancel', rowsQuestion).click()
  await until(() => !document.querySelector('[role="alertdialog"]'), 'The question stayed')
  assert(box.querySelectorAll('[data-matrix-type]').length === 2, 'Cancel removed the row type')
  const facts = box.querySelectorAll('[data-matrix-type]')[1]
  facts.querySelector('button[aria-expanded]').click()
  ;(await until(() => press('Remove Row Type', facts), 'The second row type does not open')).click()
  rowsQuestion = await until(() => document.querySelector('[role="alertdialog"]'), 'Removing a row type without rows asks nothing')
  assert(!/rows? (was|were) made/.test(rowsQuestion.textContent) && !rowsQuestion.textContent.includes('keep their values'), 'A row type without rows is said to have some: ' + rowsQuestion.textContent)
  press('Cancel', rowsQuestion).click()
  await until(() => !document.querySelector('[role="alertdialog"]'), 'The question stayed')
  await close('Sections')
  check('Removing a row type says how many rows were made with it')

  // Blueprints are a menu at the start of the Add Field row: the collection's own fields, then each blueprint, over the same editor.
  const trigger = () => document.querySelector('[data-blueprints]')
  const items = () => [...document.querySelectorAll('[role="menuitem"]')]
  const menu = async () => { (await until(() => trigger(), 'The Add Field row has no blueprint menu')).click(); return until(() => items().length && items(), 'The blueprint menu does not open') }
  const shut = async () => { document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await until(() => !items().length, 'The blueprint menu stays open') }
  const choose = async (label) => { const item = (await menu()).find((i) => i.textContent.trim() === label); assert(item, 'The blueprint menu has no ' + label); item.click(); await until(() => !items().length, 'The blueprint menu stays open after ' + label); await pause() }
  const kindsOf = async () => { const labels = (await menu()).map((i) => i.textContent.trim()).filter((label) => !label.endsWith(' Blueprint')); await shut(); return labels }
  let blueprintNames = await kindsOf()
  assert(blueprintNames.join('|') === 'Article|Video', "The menu does not list the collection's own fields and its blueprints: " + blueprintNames.join('|'))
  await choose('Video')
  assert(trigger().textContent.includes('Video'), 'The menu does not name the blueprint on view: ' + trigger().textContent)
  box = await open('Video Address')
  assert(box.textContent.includes('Show as Property'), "A blueprint's field has fewer options than the collection's")
  await close('Video Address')
  // Taking away a blueprint entries were made with says how many first.
  await choose('Remove Blueprint')
  const question = await until(() => document.querySelector('[role="alertdialog"]'), 'Removing a blueprint with entries asks nothing')
  assert(question.textContent.includes('3 entries were made with it'), 'The question does not say how many entries: ' + question.textContent)
  press('Cancel', question).click()
  await until(() => !document.querySelector('[role="alertdialog"]'), 'The question stayed')
  assert((await kindsOf()).length === 2, 'Cancel removed the blueprint')
  // Rename Blueprint writes its handle anew, and says what that does to entries made with it.
  await choose('Rename Blueprint')
  const renaming = await until(() => document.querySelector('[role="dialog"]'), 'Rename Blueprint asks nothing')
  const name = await until(() => [...renaming.querySelectorAll('input')].find((input) => input.value === 'video'), 'No handle for the blueprint')
  assert(renaming.textContent.includes('Changing it orphans existing values.'), "Changing a saved blueprint's handle does not warn")
  await type(name, '')
  assert(name.value === '', 'The last letter of a handle cannot be deleted')
  await type(name, 'clip')
  await leave(name)
  assert(name.value === 'clip', 'The handle did not take what was typed: ' + name.value)
  press('Rename Blueprint', renaming).click()
  await until(() => !document.querySelector('[role="dialog"]'), 'Rename Blueprint stays open')
  definition = await savedDefinition()
  assert(Object.keys(definition.blueprints).join() === 'clip' && !('resolvedBlueprints' in definition), 'The blueprint was not saved under its new handle: ' + Object.keys(definition.blueprints ?? {}).join())
  check('Blueprints are edited in the same editor, and their handle can be rewritten')

  // Adding one asks for its name; one nobody saved goes without a question.
  await choose('Add Blueprint')
  const adding = await until(() => document.querySelector('[role="dialog"]'), 'Add Blueprint asks nothing')
  await type(adding.querySelector('input'), 'Gallery')
  press('Add Blueprint', adding).click()
  await until(() => !document.querySelector('[role="dialog"]'), 'Add Blueprint stays open')
  blueprintNames = await kindsOf()
  assert(blueprintNames.join('|') === 'Article|Video|Gallery', 'No blueprint was added: ' + blueprintNames.join('|'))
  assert(trigger().textContent.includes('Gallery'), 'The new blueprint is not the one on view')
  await choose('Remove Blueprint')
  assert(!document.querySelector('[role="alertdialog"]'), 'A blueprint nobody saved was asked about')
  assert((await kindsOf()).length === 2, 'A blueprint nobody saved was not removed')
  check('A new blueprint goes without a question')

  // A collection's term archives are rows in its settings: a taxonomy and an address each.
  ;[...document.querySelectorAll('[role="tab"]')].find((tab) => tab.textContent.trim() === 'Settings').click()
  const archives = await until(() => document.querySelector('[data-archives]'), 'The settings have no term archives')
  const routes = () => [...archives.querySelectorAll('input')].map((input) => input.value).filter((value) => value.startsWith('/'))
  assert(routes().join() === '/news/topics/{slug}', 'The archive the collection has is not a row: ' + routes().join())
  press('Add Archive', archives).click()
  await until(() => routes().length === 2, 'Add Archive added no row')
  assert(routes()[1] === '/news/authors/{slug}' && !press('Add Archive', archives), 'The new row is not the taxonomy that was free, or one is still offered: ' + routes().join())
  press('Remove Archive', archives).click()
  await until(() => routes().length === 1, 'Remove Archive removed no row')
  definition = await savedDefinition()
  assert(JSON.stringify(definition.archives) === JSON.stringify({ authors: '/news/authors/{slug}' }), 'The archives were not saved as they are written: ' + JSON.stringify(definition.archives))
  check('Term archives are rows in the settings of a collection')
  await report()
} catch (error) {
  output.textContent += '\\nFAIL ' + error.message
  await report(error)
}
`
serve('Builder', async (req, res, url) => {
  if (url.pathname === '/__test/saved') { const got = saved; saved = null; return json(res, 200, got) }
  if (await api(req, res, url) !== false) return
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page({ title: 'Builder', boot: { ...boot, manifest: own }, runner }))
}, { links: (base) => [`${base}/admin/collections/news`] })
