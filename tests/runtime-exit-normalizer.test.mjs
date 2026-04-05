import assert from 'node:assert/strict'
import test from 'node:test'

import {
  isPrintInvocation,
  KNOWN_WINDOWS_LIBUV_ASSERTION,
  normalizeWindowsPrintRuntimeResult,
} from '../scripts/runtime-exit-normalizer.mjs'

test('isPrintInvocation detects print mode flags', () => {
  assert.equal(isPrintInvocation(['-p', 'hi']), true)
  assert.equal(isPrintInvocation(['--print', 'hi']), true)
  assert.equal(isPrintInvocation(['--help']), false)
})

test('normalizeWindowsPrintRuntimeResult suppresses the known Windows libuv assertion', () => {
  const result = normalizeWindowsPrintRuntimeResult({
    exitCode: 1,
    stderr: `${KNOWN_WINDOWS_LIBUV_ASSERTION}\r\n`,
  })

  assert.equal(result.exitCode, 0)
  assert.equal(result.stderr, '')
  assert.equal(result.suppressedKnownAssertion, true)
})

test('normalizeWindowsPrintRuntimeResult preserves real stderr output', () => {
  const result = normalizeWindowsPrintRuntimeResult({
    exitCode: 1,
    stderr: `actual failure\n${KNOWN_WINDOWS_LIBUV_ASSERTION}\n`,
  })

  assert.equal(result.exitCode, 1)
  assert.equal(result.stderr, 'actual failure\n')
  assert.equal(result.suppressedKnownAssertion, false)
})
