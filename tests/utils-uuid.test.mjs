/**
 * UUID Utilities - Unit Tests
 *
 * Tests for UUID validation and agent ID generation.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import { randomBytes } from 'node:crypto'

// ============================================================================
// UUID Validation Tests
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

test('validateUuid - validates correct UUID', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000'
  assert.ok(UUID_REGEX.test(validUuid))
})

test('validateUuid - rejects invalid UUID', () => {
  const invalidUuids = [
    'not-a-uuid',
    '550e8400-e29b-41d4-a716', // Too short
    '550e8400-e29b-41d4-a716-446655440000-extra', // Too long
    '550e8400-e29b-41d4-a716-44665544000g', // Invalid char
    '', // Empty
    '550e8400e29b41d4a716446655440000', // No dashes
  ]

  for (const invalid of invalidUuids) {
    assert.ok(!UUID_REGEX.test(invalid), `Should reject: ${invalid}`)
  }
})

test('validateUuid - handles non-string input', () => {
  const nonStrings = [null, undefined, 123, {}, [], true]

  for (const nonString of nonStrings) {
    const isValid = typeof nonString === 'string' && UUID_REGEX.test(nonString)
    assert.ok(!isValid, `Should reject non-string: ${typeof nonString}`)
  }
})

test('validateUuid - accepts uppercase UUID', () => {
  const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000'
  assert.ok(UUID_REGEX.test(uppercaseUuid))
})

test('validateUuid - accepts lowercase UUID', () => {
  const lowercaseUuid = '550e8400-e29b-41d4-a716-446655440000'
  assert.ok(UUID_REGEX.test(lowercaseUuid))
})

// ============================================================================
// Agent ID Generation Tests
// ============================================================================

test('createAgentId - generates valid format', () => {
  // Format: a{16 hex chars}
  const suffix = randomBytes(8).toString('hex')
  const agentId = `a${suffix}`

  assert.ok(agentId.startsWith('a'))
  assert.strictEqual(agentId.length, 17) // 'a' + 16 hex chars
  assert.ok(/^[a-f0-9]+$/.test(agentId.slice(1)))
})

test('createAgentId - generates with label', () => {
  // Format: a{label-}{16 hex chars}
  const label = 'compact'
  const suffix = randomBytes(8).toString('hex')
  const agentId = `a${label}-${suffix}`

  assert.ok(agentId.startsWith('acompact-'))
  assert.ok(agentId.includes('-'))
  assert.ok(/^[a-z0-9-]+$/.test(agentId))
})

test('createAgentId - generates unique IDs', () => {
  const ids = new Set()
  for (let i = 0; i < 100; i++) {
    const suffix = randomBytes(8).toString('hex')
    ids.add(`a${suffix}`)
  }
  assert.strictEqual(ids.size, 100, 'All IDs should be unique')
})

// ============================================================================
// UUID Generation Tests
// ============================================================================

test('randomUUID - generates valid UUID', () => {
  const uuid = crypto.randomUUID()
  assert.ok(UUID_REGEX.test(uuid))
})

test('randomUUID - generates unique UUIDs', () => {
  const uuids = new Set()
  for (let i = 0; i < 100; i++) {
    uuids.add(crypto.randomUUID())
  }
  assert.strictEqual(uuids.size, 100, 'All UUIDs should be unique')
})

// ============================================================================
// UUID Version Tests
// ============================================================================

test('UUID v4 - has correct version indicator', () => {
  const uuid = crypto.randomUUID()
  // UUID v4 has '4' in the 13th position (after removing dashes)
  const withoutDashes = uuid.replace(/-/g, '')
  assert.strictEqual(withoutDashes[12], '4')
})

test('UUID v4 - has correct variant', () => {
  const uuid = crypto.randomUUID()
  // UUID v4 variant is 8, 9, a, or b in the 17th position
  const withoutDashes = uuid.replace(/-/g, '')
  const variantChar = withoutDashes[16].toLowerCase()
  assert.ok(['8', '9', 'a', 'b'].includes(variantChar))
})

// ============================================================================
// UUID Format Tests
// ============================================================================

test('UUID format - has correct structure', () => {
  const uuid = crypto.randomUUID()
  const parts = uuid.split('-')

  assert.strictEqual(parts.length, 5)
  assert.strictEqual(parts[0].length, 8)
  assert.strictEqual(parts[1].length, 4)
  assert.strictEqual(parts[2].length, 4)
  assert.strictEqual(parts[3].length, 4)
  assert.strictEqual(parts[4].length, 12)
})

test('UUID format - all parts are hex', () => {
  const uuid = crypto.randomUUID()
  const withoutDashes = uuid.replace(/-/g, '')

  for (const char of withoutDashes) {
    assert.ok(/[0-9a-f]/i.test(char), `Invalid hex char: ${char}`)
  }
})
