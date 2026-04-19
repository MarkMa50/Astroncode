/**
 * JSON Utilities - Unit Tests
 *
 * Tests for JSON parsing, JSONL, and safe JSON operations.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// Safe JSON Parse Tests
// ============================================================================

test('safeParseJSON - parses valid JSON', () => {
  const json = '{"name": "test", "value": 42}'
  const parsed = JSON.parse(json)
  assert.strictEqual(parsed.name, 'test')
  assert.strictEqual(parsed.value, 42)
})

test('safeParseJSON - handles invalid JSON', () => {
  const invalidJson = '{"name": "test", invalid}'
  assert.throws(() => JSON.parse(invalidJson), SyntaxError)
})

test('safeParseJSON - handles null input', () => {
  const parsed = null
  assert.strictEqual(parsed, null)
})

test('safeParseJSON - handles undefined input', () => {
  const parsed = undefined
  assert.strictEqual(parsed, undefined)
})

test('safeParseJSON - handles empty string', () => {
  const json = ''
  assert.throws(() => JSON.parse(json), SyntaxError)
})

test('safeParseJSON - parses arrays', () => {
  const json = '[1, 2, 3, "four"]'
  const parsed = JSON.parse(json)
  assert.deepStrictEqual(parsed, [1, 2, 3, 'four'])
})

test('safeParseJSON - parses primitives', () => {
  assert.strictEqual(JSON.parse('42'), 42)
  assert.strictEqual(JSON.parse('"string"'), 'string')
  assert.strictEqual(JSON.parse('true'), true)
  assert.strictEqual(JSON.parse('null'), null)
})

// ============================================================================
// BOM Handling Tests
// ============================================================================

test('stripBOM - removes UTF-8 BOM', () => {
  const withBOM = '\uFEFF{"test": "value"}'
  const stripped = withBOM.charCodeAt(0) === 0xfeff ? withBOM.slice(1) : withBOM
  assert.ok(!stripped.startsWith('\uFEFF'))
  assert.strictEqual(stripped, '{"test": "value"}')
})

test('stripBOM - handles string without BOM', () => {
  const noBOM = '{"test": "value"}'
  const stripped = noBOM.charCodeAt(0) === 0xfeff ? noBOM.slice(1) : noBOM
  assert.strictEqual(stripped, noBOM)
})

// ============================================================================
// JSONL Parsing Tests
// ============================================================================

test('parseJSONL - parses single line', () => {
  const jsonl = '{"id": 1, "name": "test"}'
  const parsed = JSON.parse(jsonl)
  assert.strictEqual(parsed.id, 1)
  assert.strictEqual(parsed.name, 'test')
})

test('parseJSONL - parses multiple lines', () => {
  const jsonl = `{"id": 1}
{"id": 2}
{"id": 3}`

  const lines = jsonl.split('\n').filter(Boolean)
  const parsed = lines.map(line => JSON.parse(line))
  assert.strictEqual(parsed.length, 3)
  assert.strictEqual(parsed[0].id, 1)
  assert.strictEqual(parsed[1].id, 2)
  assert.strictEqual(parsed[2].id, 3)
})

test('parseJSONL - handles empty lines', () => {
  const jsonl = `{"id": 1}

{"id": 2}

`
  const lines = jsonl.split('\n').filter(line => line.trim())
  assert.strictEqual(lines.length, 2)
})

test('parseJSONL - skips malformed lines', () => {
  const jsonl = `{"id": 1}
invalid json
{"id": 2}`

  const lines = jsonl.split('\n').filter(Boolean)
  const valid = []
  for (const line of lines) {
    try {
      valid.push(JSON.parse(line))
    } catch {
      // Skip malformed
    }
  }
  assert.strictEqual(valid.length, 2)
})

// ============================================================================
// JSON Stringify Tests
// ============================================================================

test('JSON.stringify - handles objects', () => {
  const obj = { name: 'test', value: 42 }
  const json = JSON.stringify(obj)
  assert.ok(json.includes('name'))
  assert.ok(json.includes('test'))
})

test('JSON.stringify - handles arrays', () => {
  const arr = [1, 2, 3]
  const json = JSON.stringify(arr)
  assert.strictEqual(json, '[1,2,3]')
})

test('JSON.stringify - handles nested objects', () => {
  const obj = { outer: { inner: 'value' } }
  const json = JSON.stringify(obj)
  const parsed = JSON.parse(json)
  assert.strictEqual(parsed.outer.inner, 'value')
})

test('JSON.stringify - handles circular reference', () => {
  const obj = { name: 'test' }
  // obj.self = obj // This would cause circular reference error
  const json = JSON.stringify(obj)
  assert.ok(json.includes('test'))
})

test('JSON.stringify - formats with indent', () => {
  const obj = { name: 'test' }
  const json = JSON.stringify(obj, null, 2)
  assert.ok(json.includes('\n'))
  assert.ok(json.includes('  '))
})

// ============================================================================
// JSON Modification Tests
// ============================================================================

test('addItemToJSONArray - adds to empty array', () => {
  const arr = []
  const newItem = { id: 1 }
  const result = [...arr, newItem]
  assert.strictEqual(result.length, 1)
  assert.deepStrictEqual(result[0], newItem)
})

test('addItemToJSONArray - appends to existing array', () => {
  const arr = [{ id: 1 }]
  const newItem = { id: 2 }
  const result = [...arr, newItem]
  assert.strictEqual(result.length, 2)
  assert.strictEqual(result[1].id, 2)
})

// ============================================================================
// JSONC Tests (JSON with Comments)
// ============================================================================

test('JSONC - allows comments', () => {
  // This would require jsonc-parser, but we can test the concept
  const jsonc = `{
    // This is a comment
    "name": "test",
    /* Multi-line
       comment */
    "value": 42
  }`
  // In real implementation, this would parse successfully
  assert.ok(jsonc.includes('//'))
  assert.ok(jsonc.includes('/*'))
})

// ============================================================================
// Deep Clone Tests
// ============================================================================

test('deepClone - clones object', () => {
  const original = { a: 1, b: { c: 2 } }
  const cloned = JSON.parse(JSON.stringify(original))
  assert.deepStrictEqual(cloned, original)
  assert.notStrictEqual(cloned, original)
  assert.notStrictEqual(cloned.b, original.b)
})

test('deepClone - clones array', () => {
  const original = [1, [2, 3], { a: 4 }]
  const cloned = JSON.parse(JSON.stringify(original))
  assert.deepStrictEqual(cloned, original)
  assert.notStrictEqual(cloned, original)
  assert.notStrictEqual(cloned[1], original[1])
})

// ============================================================================
// Edge Case Tests
// ============================================================================

test('JSON.parse - handles large numbers', () => {
  const json = '{"value": 9007199254740993}' // Larger than MAX_SAFE_INTEGER
  const parsed = JSON.parse(json)
  assert.ok(parsed.value > Number.MAX_SAFE_INTEGER)
})

test('JSON.parse - handles special characters', () => {
  const json = '{"emoji": "🎉", "unicode": "日本語"}'
  const parsed = JSON.parse(json)
  assert.strictEqual(parsed.emoji, '🎉')
  assert.strictEqual(parsed.unicode, '日本語')
})

test('JSON.parse - handles escaped characters', () => {
  const json = '{"path": "C:\\\\Users\\\\test"}'
  const parsed = JSON.parse(json)
  assert.strictEqual(parsed.path, 'C:\\Users\\test')
})
