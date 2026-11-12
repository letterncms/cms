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

test('a time is read however it is typed, in 24 or 12 hours', async () => {
  const { readTime } = await import('../src/ui/dateTime.ts')
  for (const [typed, read] of [['19:03', '19:03'], ['7:03 PM', '19:03'], ['7:03 p.m.', '19:03'], ['7pm', '19:00'], ['12 am', '00:00'], ['12:30 PM', '12:30'], ['1903', '19:03'], ['9', '09:00'], ['19.03', '19:03'], ['19h03', '19:03']]) assert.equal(readTime(typed), read, typed)
  for (const typed of ['25:00', '13 pm', '7:60', 'soon', '']) assert.equal(readTime(typed), null, typed)
  assert.equal(readTime('7:03:09 pm', true), '19:03:09')
  assert.equal(readTime('19:03', true), '19:03:00')
})
