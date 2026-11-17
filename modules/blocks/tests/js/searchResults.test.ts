import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDate, inLanguage, mark, search, snippet, termsOf, type Page } from '../../runtime/src/searchResults.ts'

const pages: Page[] = [
  { title: 'Waste collection', url: '/waste', keywords: 'bin, rubbish', text: 'Put your recycling out on Monday. Café opening hours.', headings: [{ text: 'Garden waste', id: 'garden', level: 2 }], kind: 'Service', locale: 'en' },
  { title: 'Recycling centre opens', url: '/news/rc', description: 'The new recycling centre opens in March.', kind: 'News', date: '2026-03-02', locale: 'en' },
  { title: 'Parking', url: '/parking', text: 'Long text '.repeat(30) + 'Résidents can apply for a permit here. ' + 'more words '.repeat(30), headings: [{ text: 'Resident permits', id: 'permits', level: 2 }], locale: 'en' },
  { title: 'Abfall', url: '/de/abfall', text: 'recycling', locale: 'de' },
]
const find = (query: string, lang = 'en-GB') => search(inLanguage(pages, lang), termsOf(query)).map((hit) => hit.url)

test('what was typed is its words, without case or accents', () => {
  assert.deepEqual(termsOf('  Ärger, café-Bar!! café '), ['arger', 'cafe', 'bar'])
  assert.deepEqual(termsOf('   '), [])
})

test('every word must match, at the start of a word, the title first', () => {
  assert.deepEqual(find('recycl'), ['/news/rc', '/waste'], 'the title before the text')
  assert.deepEqual(find('cycl'), ['/news/rc'], 'inside a word only in a title')
  assert.deepEqual(find('bin'), ['/waste'], 'by its keywords')
  assert.deepEqual(find('cafe'), ['/waste'], 'without accents')
  assert.deepEqual(find('recycling parking'), [], 'every word, not any')
})

test('a page only a heading names opens at that heading', () => {
  assert.deepEqual(find('garden waste'), ['/waste#garden'])
  assert.deepEqual(find('residents permit'), ['/parking#permits'])
})

test('only pages in the page\'s language, when the index has several', () => {
  assert.deepEqual(find('abfall', 'de'), ['/de/abfall'])
  assert.deepEqual(find('abfall', 'en'), [])
  assert.deepEqual(inLanguage([pages[3]], 'en').map((p) => p.url), ['/de/abfall'], 'one language: all of it')
})

test('a snippet is the description, or the text around the first match, with the words marked', () => {
  assert.equal(snippet(pages[1], termsOf('recycl')), 'The new <mark>recycling</mark> centre opens in March.')
  const around = snippet(pages[2], termsOf('residents'))
  assert.match(around, /^….*<mark>Résidents<\/mark> can apply for a permit here\..*…$/)
  assert.ok(around.length < 220)
  assert.equal(mark('<b>x</b> recycling', termsOf('recycl')), '&lt;b&gt;x&lt;/b&gt; <mark>recycling</mark>', 'escaped')
  assert.equal(mark('Café and cafes', termsOf('cafe')), '<mark>Café</mark> and <mark>cafes</mark>')
})

test('a date is a day in the page\'s language', () => {
  assert.equal(formatDate('2026-03-02', 'en'), 'March 2, 2026')
  assert.equal(formatDate('2026-03-02', 'de'), '2. März 2026')
  assert.equal(formatDate('nope', 'en'), '')
  assert.equal(formatDate(undefined, 'en'), '')
})
