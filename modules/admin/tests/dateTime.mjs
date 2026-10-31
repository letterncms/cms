import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDateTimeInZone, parseDateTimeInZone } from '../src/ui/dateTime.ts'

test('site time is independent of the viewer’s browser timezone', () => {
  assert.equal(formatDateTimeInZone('2026-10-28T12:30:00Z', 'Europe/Brussels'), '2026-10-28T13:30')
  assert.equal(parseDateTimeInZone('2026-10-28T13:30', 'Europe/Brussels').value, '2026-10-28T12:30:00.000Z')
  assert.equal(parseDateTimeInZone('2026-10-28T13:30', 'America/New_York').value, '2026-10-28T17:30:00.000Z')
})

test('non-hour offsets and midnight round-trip correctly', () => {
  assert.equal(parseDateTimeInZone('2026-06-14T00:00', 'Asia/Kathmandu').value, '2026-06-13T18:15:00.000Z')
  assert.equal(formatDateTimeInZone('2026-06-13T18:15:00Z', 'Asia/Kathmandu'), '2026-06-14T00:00')
})

test('spring-forward missing time is rejected rather than silently moved', () => {
  assert.deepEqual(parseDateTimeInZone('2026-03-29T02:30', 'Europe/Brussels'), { value: null, error: 'nonexistent' })
  assert.equal(parseDateTimeInZone('2026-03-29T03:30', 'Europe/Brussels').value, '2026-03-29T01:30:00.000Z')
})

test('fall-back repeated time requires an explicit different choice', () => {
  assert.deepEqual(parseDateTimeInZone('2026-10-25T02:30', 'Europe/Brussels'), { value: null, error: 'ambiguous' })
  assert.equal(parseDateTimeInZone('2026-10-25T03:30', 'Europe/Brussels').value, '2026-10-25T02:30:00.000Z')
})

test('invalid calendar values are rejected', () => {
  for (const value of ['', 'not-a-date', '2026-02-30T09:00', '2026-06-14T25:00', '2026-06-14']) {
    assert.deepEqual(parseDateTimeInZone(value, 'Europe/Brussels'), { value: null, error: 'invalid' })
  }
  assert.equal(formatDateTimeInZone('bad-value', 'Europe/Brussels'), '')
})
