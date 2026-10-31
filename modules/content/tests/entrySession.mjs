import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EntrySession } from '../admin/src/entrySession.ts'
import { resolveEntryFields } from '../admin/src/entryFields.ts'
const values = { title: 'Original', slug: 'original', data: { body: 'Text' }, authorId: null }
const entry = { id: 'entry', ...values, version: 'v1' }
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('an in-flight save cannot acknowledge later typing or reuse a stale version', async () => {
  const request = deferred(); const calls = []
  const session = new EntrySession(entry, values, async (current, working) => { calls.push({ current, working }); if (calls.length === 1) return request.promise; return { ...entry, ...working, version: 'v3' } })
  session.update({ title: 'First edit' }); const saving = session.save(); await Promise.resolve()
  session.update({ title: 'Later edit' }); const queued = session.save()
  request.resolve({ ...entry, title: 'First edit', version: 'v2' }); await saving
  assert.equal(session.get().working.title, 'Later edit'); assert.equal(session.get().dirty, true)
  await queued; assert.equal(calls[1].current.version, 'v2'); assert.equal(calls[1].working.title, 'Later edit'); assert.equal(session.get().dirty, false)
})

test('queued saves create only once', async () => {
  const calls = []
  const session = new EntrySession(null, values, async (current, working) => { calls.push(current); return { ...entry, ...working } })
  session.update({ title: 'New' }); await Promise.all([session.save(), session.save()]); assert.equal(calls.length, 1)
})

test('failed saves retain edits and validation until an explicit retry succeeds', async () => {
  let fail = true
  const session = new EntrySession(entry, values, async (_, working) => { if (fail) throw Object.assign(new Error('Invalid body'), { type: 'invalid_input', details: { body: 'Invalid' } }); return { ...entry, ...working, version: 'v2' } })
  session.update({ title: 'Unsaved' }); await assert.rejects(session.save()); assert.equal(session.get().dirty, true); assert.equal(session.get().phase, 'error'); assert.equal(session.get().errors.body, 'Invalid')
  session.update({ data: { body: 'Corrected' } }); assert.ok(session.get().error)
  fail = false; await session.save(); assert.equal(session.get().dirty, false); assert.equal(session.get().error, null)
})

test('conflicts pause writes until an explicit current-version overwrite', async () => {
  const calls = []
  const session = new EntrySession(entry, values, async (_, working, options) => { calls.push(options); if (options.expectedVersion !== 'v2') throw Object.assign(new Error('Changed'), { type: 'conflict', details: { version: 'v2' } }); return { ...entry, ...working, version: 'v3' } })
  session.update({ authorId: 'another' }); await assert.rejects(session.save()); await assert.rejects(session.save()); assert.equal(calls.length, 1); assert.equal(session.get().conflict.version, 'v2')
  await session.save({ expectedVersion: 'v2' }); assert.equal(session.get().working.authorId, 'another'); assert.equal(session.get().conflict, null)
})

test('new entries without a title are never persisted', async () => {
  const session = new EntrySession(null, { ...values, title: '' }, async () => { throw new Error('Must not persist') })
  session.update({ data: { body: 'Draft' } }); assert.equal(await session.save(), null); assert.equal(session.get().dirty, true); assert.ok(session.get().errors.title)
})

test('one field placement contract works for every entry workspace and releases missing panel claims', () => {
  const fields = [
    { handle: 'body', type: 'blocks' }, { handle: 'main', type: 'text' },
    { handle: 'custom', type: 'text', section: 'custom' },
    { handle: 'reviewer', type: 'users', section: 'sidebar' },
    { handle: 'seo', type: 'group', section: 'seo' },
  ]
  const claimed = resolveEntryFields(fields, 'body', [{ id: 'seo', fieldHandles: ['seo'] }])
  assert.deepEqual(claimed.document.map((field) => field.handle), ['main'])
  assert.deepEqual(claimed.sidebar.map((field) => field.handle), ['custom', 'reviewer'])
  assert.equal(claimed.claimed.get('seo'), 'seo')
  const fallback = resolveEntryFields(fields, 'body', [])
  assert.deepEqual(fallback.document.map((field) => field.handle), ['main'])
  assert.deepEqual(fallback.sidebar.map((field) => field.handle), ['custom', 'reviewer', 'seo'])
  assert.deepEqual([...fallback.claimed], [])
  assert.match(resolveEntryFields(fields, 'body', [{ id: 'one', fieldHandles: ['seo'] }, { id: 'two', fieldHandles: ['seo'] }]).error, /both/)
})

test('only an explicitly selected body field leaves the generic field form', () => {
  const fields = [{ handle: 'content', type: 'blocks' }, { handle: 'notes', type: 'markdown' }, { handle: 'metadata', type: 'text', section: 'sidebar' }]
  const fieldOnly = resolveEntryFields(fields, undefined, [])
  assert.deepEqual(fieldOnly.document.map((field) => field.handle), ['content', 'notes'], 'Field-only collections must not silently infer a body from its type.')
  const withBody = resolveEntryFields(fields, 'content', [])
  assert.deepEqual(withBody.document.map((field) => field.handle), ['notes'])
  assert.deepEqual(withBody.sidebar.map((field) => field.handle), ['metadata'])
})
