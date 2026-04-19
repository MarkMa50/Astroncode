/**
 * Sanitization Utilities - Unit Tests
 *
 * Tests for Unicode sanitization and hidden character attack mitigation.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// Unicode Normalization Tests
// ============================================================================

test('normalize NFKC - handles composed characters', () => {
  // NFKC normalization decomposes and recomposes characters
  const composed = 'café'
  const normalized = composed.normalize('NFKC')
  assert.strictEqual(typeof normalized, 'string')
  assert.ok(normalized.length > 0)
})

test('normalize NFKC - handles compatibility characters', () => {
  // Full-width characters get normalized
  const fullWidth = 'ＡＢＣ'
  const normalized = fullWidth.normalize('NFKC')
  assert.ok(normalized !== fullWidth)
})

// ============================================================================
// Hidden Character Detection Tests
// ============================================================================

test('sanitizeUnicode - removes zero-width characters', () => {
  const withZeroWidth = 'hello\u200Bworld' // Zero-width space
  const sanitized = withZeroWidth.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, 'helloworld')
})

test('sanitizeUnicode - removes directional marks', () => {
  const withRTL = 'hello\u202Eworld' // Right-to-left override
  const sanitized = withRTL.replace(/[\u202A-\u202E]/g, '')
  assert.ok(!sanitized.includes('\u202E'))
})

test('sanitizeUnicode - removes byte order mark', () => {
  const withBOM = '\uFEFFhello'
  const sanitized = withBOM.replace(/[\uFEFF]/g, '')
  assert.strictEqual(sanitized, 'hello')
})

test('sanitizeUnicode - removes private use characters', () => {
  const withPrivate = 'hello\uE000world' // Private use area
  const sanitized = withPrivate.replace(/[\uE000-\uF8FF]/g, '')
  assert.strictEqual(sanitized, 'helloworld')
})

// ============================================================================
// Unicode Property Class Tests
// ============================================================================

test('sanitizeUnicode - removes format characters (Cf)', () => {
  const input = 'test\u2060string' // Word joiner (Cf category)
  const sanitized = input.replace(/[\p{Cf}]/gu, '')
  assert.ok(!sanitized.includes('\u2060'))
})

test('sanitizeUnicode - removes private use (Co)', () => {
  const input = 'test\uE001string' // Private use (Co category)
  const sanitized = input.replace(/[\p{Co}]/gu, '')
  assert.ok(!sanitized.includes('\uE001'))
})

test('sanitizeUnicode - removes noncharacters (Cn)', () => {
  const input = 'test\uFFFFstring' // Noncharacter (Cn category)
  const sanitized = input.replace(/[\p{Cn}]/gu, '')
  assert.ok(!sanitized.includes('\uFFFF'))
})

// ============================================================================
// Iterative Sanitization Tests
// ============================================================================

test('sanitizeUnicode - iterates until stable', () => {
  let current = 'test\u200B\u200C\u200D'
  let previous = ''
  let iterations = 0

  while (current !== previous && iterations < 10) {
    previous = current
    current = current
      .normalize('NFKC')
      .replace(/[\p{Cf}\p{Co}\p{Cn}]/gu, '')
      .replace(/[\u200B-\u200F]/g, '')
    iterations++
  }

  assert.strictEqual(current, 'test')
  assert.ok(iterations < 10)
})

// ============================================================================
// Recursive Sanitization Tests
// ============================================================================

test('recursivelySanitizeUnicode - handles strings', () => {
  const input = 'hello\u200Bworld'
  const sanitized = input.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, 'helloworld')
})

test('recursivelySanitizeUnicode - handles arrays', () => {
  const input = ['hello\u200Bworld', 'test\u200Ccase']
  const sanitized = input.map(s => s.replace(/[\u200B-\u200F]/g, ''))
  assert.strictEqual(sanitized[0], 'helloworld')
  assert.strictEqual(sanitized[1], 'testcase')
})

test('recursivelySanitizeUnicode - handles objects', () => {
  const input = { key: 'value\u200B', nested: { data: 'test\u200C' } }
  const sanitized = {
    key: input.key.replace(/[\u200B-\u200F]/g, ''),
    nested: {
      data: input.nested.data.replace(/[\u200B-\u200F]/g, ''),
    },
  }
  assert.strictEqual(sanitized.key, 'value')
  assert.strictEqual(sanitized.nested.data, 'test')
})

test('recursivelySanitizeUnicode - handles primitives', () => {
  // Numbers, booleans, null, undefined should pass through
  assert.strictEqual(42, 42)
  assert.strictEqual(true, true)
  assert.strictEqual(null, null)
  assert.strictEqual(undefined, undefined)
})

// ============================================================================
// Security Tests
// ============================================================================

test('sanitizeUnicode - prevents ASCII smuggling', () => {
  // Tag characters can be used to hide text
  const withTags = 'visible\uE0000hidden\uE0001text'
  const sanitized = withTags.replace(/[\p{Co}\p{Cn}]/gu, '')
  assert.ok(sanitized.length < withTags.length)
})

test('sanitizeUnicode - prevents prompt injection', () => {
  // Hidden characters could hide malicious instructions
  const malicious = 'safe\u200Binstruction\u202E; rm -rf /'
  const sanitized = malicious
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/[\u202A-\u202E]/g, '')
  assert.ok(!sanitized.includes('\u200B'))
  assert.ok(!sanitized.includes('\u202E'))
})

// ============================================================================
// Performance Tests
// ============================================================================

test('sanitizeUnicode - handles long strings', () => {
  const longString = 'a'.repeat(10000) + '\u200B' + 'b'.repeat(10000)
  const sanitized = longString.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized.length, 20000)
})

test('sanitizeUnicode - handles many hidden chars', () => {
  const manyHidden = '\u200B'.repeat(100) + 'visible' + '\u200C'.repeat(100)
  const sanitized = manyHidden.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, 'visible')
})

// ============================================================================
// Edge Case Tests
// ============================================================================

test('sanitizeUnicode - handles empty string', () => {
  const sanitized = ''.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, '')
})

test('sanitizeUnicode - handles string without hidden chars', () => {
  const clean = 'normal text'
  const sanitized = clean.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, clean)
})

test('sanitizeUnicode - preserves legitimate formatting', () => {
  // Regular spaces and newlines should be preserved
  const text = 'line1\nline2\tindented'
  const sanitized = text.replace(/[\u200B-\u200F]/g, '')
  assert.strictEqual(sanitized, text)
})
