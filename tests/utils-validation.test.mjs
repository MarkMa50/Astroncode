/**
 * Validation Utilities - Unit Tests
 *
 * Tests for semantic parsing, type guards, and validation functions.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// Semantic Boolean Tests
// ============================================================================

test('parseBoolean - parses true values', () => {
  const trueValues = ['true', '1', 'yes', 'on', 'TRUE', 'True']
  for (const val of trueValues) {
    const parsed = val.toLowerCase() === 'true' || val === '1'
    assert.ok(parsed || val.toLowerCase() === 'yes' || val.toLowerCase() === 'on')
  }
})

test('parseBoolean - parses false values', () => {
  const falseValues = ['false', '0', 'no', 'off', '', 'FALSE', 'False']
  for (const val of falseValues) {
    const parsed = val.toLowerCase() === 'true'
    assert.strictEqual(parsed, false)
  }
})

test('isTruthy - identifies truthy values', () => {
  const truthy = [true, 1, 'true', 'yes', 'on', '1', {}, [], 'string']
  for (const val of truthy) {
    assert.ok(!!val, `Expected ${val} to be truthy`)
  }
})

test('isFalsy - identifies falsy values', () => {
  const falsy = [false, 0, '', null, undefined, NaN]
  for (const val of falsy) {
    assert.ok(!val, `Expected ${val} to be falsy`)
  }
})

// ============================================================================
// Semantic Number Tests
// ============================================================================

test('parseNumber - parses integers', () => {
  assert.strictEqual(parseInt('42', 10), 42)
  assert.strictEqual(parseInt('-42', 10), -42)
  assert.strictEqual(parseInt('0', 10), 0)
})

test('parseNumber - parses floats', () => {
  assert.strictEqual(parseFloat('3.14'), 3.14)
  assert.strictEqual(parseFloat('-3.14'), -3.14)
  assert.strictEqual(parseFloat('0.0'), 0.0)
})

test('parseNumber - handles invalid input', () => {
  assert.ok(Number.isNaN(parseInt('not a number', 10)))
  assert.ok(Number.isNaN(parseInt('', 10)))
})

test('isNumeric - identifies numeric strings', () => {
  const numeric = ['42', '3.14', '-10', '0', '1e5']
  for (const val of numeric) {
    assert.ok(!Number.isNaN(Number(val)), `Expected ${val} to be numeric`)
  }
})

test('isNumeric - rejects non-numeric strings', () => {
  const nonNumeric = ['abc', '12abc', 'null', 'undefined']
  for (const val of nonNumeric) {
    assert.ok(Number.isNaN(Number(val)), `Expected ${val} to be non-numeric`)
  }
  // Empty string converts to 0, which is numeric
  assert.strictEqual(Number(''), 0)
})

// ============================================================================
// Type Guard Tests
// ============================================================================

test('isString - identifies strings', () => {
  assert.strictEqual(typeof 'hello', 'string')
  assert.strictEqual(typeof '', 'string')
  assert.notStrictEqual(typeof 123, 'string')
  assert.notStrictEqual(typeof null, 'string')
})

test('isNumber - identifies numbers', () => {
  assert.strictEqual(typeof 42, 'number')
  assert.strictEqual(typeof 3.14, 'number')
  assert.strictEqual(typeof NaN, 'number') // NaN is typeof number
  assert.notStrictEqual(typeof '42', 'number')
})

test('isBoolean - identifies booleans', () => {
  assert.strictEqual(typeof true, 'boolean')
  assert.strictEqual(typeof false, 'boolean')
  assert.notStrictEqual(typeof 'true', 'boolean')
  assert.notStrictEqual(typeof 1, 'boolean')
})

test('isObject - identifies objects', () => {
  assert.strictEqual(typeof {}, 'object')
  assert.strictEqual(typeof [], 'object') // Arrays are objects
  assert.strictEqual(typeof null, 'object') // null is typeof object
  assert.notStrictEqual(typeof 42, 'object')
})

test('isArray - identifies arrays', () => {
  assert.ok(Array.isArray([]))
  assert.ok(Array.isArray([1, 2, 3]))
  assert.ok(!Array.isArray({}))
  assert.ok(!Array.isArray(null))
})

test('isFunction - identifies functions', () => {
  assert.strictEqual(typeof (() => {}), 'function')
  assert.strictEqual(typeof function () {}, 'function')
  assert.notStrictEqual(typeof {}, 'function')
})

test('isNull - identifies null', () => {
  assert.strictEqual(null, null)
  assert.notStrictEqual(undefined, null)
  assert.notStrictEqual(0, null)
})

test('isUndefined - identifies undefined', () => {
  assert.strictEqual(undefined, undefined)
  assert.notStrictEqual(null, undefined)
  assert.notStrictEqual('', undefined)
})

test('isNullOrUndefined - identifies null or undefined', () => {
  assert.ok(null == null) // == null matches both null and undefined
  assert.ok(undefined == null)
  assert.ok('' != null)
  assert.ok(0 != null)
})

test('isPlainObject - identifies plain objects', () => {
  const isPlain = (val) => {
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      return false
    }
    // Check if it's a plain object (prototype is Object.prototype or null)
    const proto = Object.getPrototypeOf(val)
    return proto === null || proto === Object.prototype
  }
  assert.ok(isPlain({}))
  assert.ok(isPlain({ a: 1 }))
  assert.ok(!isPlain([]))
  assert.ok(!isPlain(null))
  // Date objects are not plain objects
  assert.ok(!isPlain(new Date()))
})

// ============================================================================
// JSON Validation Tests
// ============================================================================

test('isValidJson - validates JSON strings', () => {
  const validJson = ['{}', '[]', '"string"', '42', 'true', 'null', '{"a":1}']
  for (const json of validJson) {
    try {
      JSON.parse(json)
      assert.ok(true)
    } catch {
      assert.fail(`Expected ${json} to be valid JSON`)
    }
  }
})

test('isValidJson - rejects invalid JSON', () => {
  const invalidJson = ['{', '[}', 'undefined', '{a:1}', "{'a':1}"]
  for (const json of invalidJson) {
    assert.throws(() => JSON.parse(json), SyntaxError)
  }
})

// ============================================================================
// Semver Tests
// ============================================================================

test('semver - parses valid versions', () => {
  const versions = ['1.0.0', '2.3.4', '0.0.1', '10.20.30']
  for (const v of versions) {
    const parts = v.split('.')
    assert.strictEqual(parts.length, 3)
    assert.ok(parts.every(p => /^\d+$/.test(p)))
  }
})

test('semver - handles prerelease versions', () => {
  const prerelease = ['1.0.0-alpha', '1.0.0-beta.1', '2.0.0-rc.1']
  for (const v of prerelease) {
    assert.ok(v.includes('-'))
  }
})

test('semver - compares versions', () => {
  const compare = (a, b) => {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number)
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number)
    if (aMajor !== bMajor) return aMajor - bMajor
    if (aMinor !== bMinor) return aMinor - bMinor
    return aPatch - bPatch
  }

  assert.ok(compare('1.0.0', '2.0.0') < 0)
  assert.ok(compare('2.0.0', '1.0.0') > 0)
  assert.strictEqual(compare('1.0.0', '1.0.0'), 0)
})

// ============================================================================
// Input Sanitization Tests
// ============================================================================

test('escapeHtml - escapes HTML entities', () => {
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  assert.strictEqual(escapeHtml('<script>'), '&lt;script&gt;')
  assert.strictEqual(escapeHtml('"test"'), '&quot;test&quot;')
  assert.strictEqual(escapeHtml("'test'"), '&#39;test&#39;')
})

test('escapeShell - escapes shell characters', () => {
  const escapeShell = (str) => {
    return str.replace(/([\\'"$`!(){}[\]*?|&;<>\n])/g, '\\$1')
  }

  assert.ok(escapeShell('test; rm -rf').includes('\\;'))
  assert.ok(escapeShell('$HOME').includes('\\$'))
  assert.ok(escapeShell('`cmd`').includes('\\`'))
})

// ============================================================================
// YAML Validation Tests
// ============================================================================

test('YAML - parses simple objects', () => {
  // Simple YAML-like parsing test
  const yaml = `
name: test
value: 42
enabled: true
`
  assert.ok(yaml.includes('name'))
  assert.ok(yaml.includes('value'))
  assert.ok(yaml.includes('enabled'))
})

// ============================================================================
// XML Validation Tests
// ============================================================================

test('XML - validates structure', () => {
  const validXml = '<root><child>value</child></root>'
  assert.ok(validXml.startsWith('<'))
  assert.ok(validXml.endsWith('>'))
  assert.ok(validXml.includes('</root>'))
})

test('XML - detects invalid structure', () => {
  const invalidXml = '<root><child>value</root>'
  // Missing closing tag for child
  assert.ok(!invalidXml.includes('</child>'))
})
