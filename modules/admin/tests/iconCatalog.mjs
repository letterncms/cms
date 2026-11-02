import assert from 'node:assert/strict'
import { test } from 'node:test'
import catalog from '../src/lib/icon-catalog.json' with { type: 'json' }
import { catalogBody, phosphorName, storedName } from '../src/lib/iconCatalog.ts'

test('a Phosphor name the admin has no name for is stored as it is', () => {
  assert.equal(storedName('handshake', catalog), 'handshake')
  assert.equal(phosphorName('handshake', catalog), 'handshake')
  assert.ok(catalogBody('handshake', catalog))
})

test("the admin's own names keep drawing what they always drew", () => {
  assert.equal(phosphorName('page', catalog), 'file')
  assert.equal(phosphorName('chat', catalog), 'chats-circle')
})

test('a Phosphor icon the admin names differently is stored so it still draws itself', () => {
  // `chat` is the admin's name for chats-circle, so Phosphor's own `chat` needs another way in.
  assert.equal(storedName('chat', catalog), 'ph-chat')
  assert.equal(catalogBody('ph-chat', catalog), catalog.icons.chat)
  assert.equal(phosphorName('ph-chat', catalog), 'chat')
  // And the icon the admin's `chat` draws can still be picked by its own name.
  assert.equal(storedName('chats-circle', catalog), 'chats-circle')
  assert.equal(catalogBody('chats-circle', catalog), catalog.icons['chats-circle'])
})

test('every stored name fits what the icon field accepts', () => {
  for (const name of Object.keys(catalog.icons)) assert.match(storedName(name, catalog), /^[a-z0-9-]{1,40}$/)
})
