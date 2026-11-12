import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fill, holds, input, placeQuery, safeUrl } from '../src/ui/view/scope.ts'

const scope = { params: { id: '7' }, query: { locale: '' }, row: { id: 'a1', name: 'Ada', tags: ['x'], user: { name: 'Bea' }, to: null } }

test('a template is filled in, and one that is a whole reference stands for the value', () => {
  assert.equal(fill('/things/{params.id}', scope), '/things/7')
  assert.equal(fill('Remove {row.name}?', scope), 'Remove Ada?')
  assert.deepEqual(fill('{row.tags}', scope), ['x'])
  assert.equal(fill('{row.user.name}', scope), 'Bea')
  assert.deepEqual(fill({ id: '{row.id}', list: ['{params.id}'] }, scope), { id: 'a1', list: ['7'] })
  assert.equal(fill('Missing: {row.nothing}', scope), 'Missing: ')
})

test('ability input leaves out what came out empty', () => {
  assert.deepEqual(input({ id: '{row.id}', locale: '{query.locale}', userId: '{row.to}', perPage: 1, fields: [] }, scope), { id: 'a1', perPage: 1, fields: [] })
})

test('a condition holds for something, not for nothing', () => {
  assert.equal(holds(undefined, scope), true)
  assert.equal(holds('{row.name}', scope), true)
  assert.equal(holds('{row.to}', scope), false)
  assert.equal(holds('{query.locale}', scope), false)
})

test('a condition can compare a value with a few words', () => {
  assert.equal(holds('{row.name} is Ada', scope), true)
  assert.equal(holds('{row.name} is Bea, Ada', scope), true)
  assert.equal(holds('{row.name} is not Ada', scope), false)
  assert.equal(holds('{row.name} is not Bea, Cy', scope), true)
  assert.equal(holds('{row.nothing} is not draft', scope), true)
})

test('links are web addresses or the site’s own, never scripts', () => {
  assert.equal(safeUrl('/admin/x'), '/admin/x')
  assert.equal(safeUrl('https://example.com/a'), 'https://example.com/a')
  assert.equal(safeUrl('javascript:alert(1)'), null)
  assert.equal(safeUrl(' JavaScript:alert(1)'), null)
  assert.equal(safeUrl('//evil.example'), null)
  assert.equal(safeUrl('data:text/html,hi'), null)
  assert.equal(safeUrl(''), null)
})

test('a list split by language reads the lit language while the address names none, and so does its count', () => {
  // As ContentModule draws a collection of a site in English and Dutch.
  const list = { type: 'ui/records', props: { source: { ability: 'entries/list', input: { collection: 'surveys', locale: '{query.locale}', status: '{query.status}' } }, filters: [
    { param: 'status', label: 'Status', display: 'segmented', default: 'any' },
    { param: 'locale', label: 'Language', display: 'segmented', default: 'en' },
  ] } }
  const root = { type: 'ui/page', props: { count: { source: { ability: 'entries/list', input: { collection: 'surveys', locale: '{query.locale}', perPage: 1 } } } }, children: [list] }
  const scope = (address) => ({ params: {}, query: placeQuery(root, address) })

  assert.deepEqual(input(list.props.source.input, scope({})), { collection: 'surveys', locale: 'en' })
  assert.deepEqual(input(root.props.count.source.input, scope({})), { collection: 'surveys', locale: 'en', perPage: 1 })
  // What the address names wins; "All" stays no filter at all.
  assert.deepEqual(input(list.props.source.input, scope({ locale: 'nl', status: 'draft' })), { collection: 'surveys', locale: 'nl', status: 'draft' })
  assert.deepEqual(input(list.props.source.input, scope({ locale: '' })), { collection: 'surveys', locale: 'en' })
})
