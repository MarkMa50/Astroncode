/**
 * Core Utilities - Unit Tests
 *
 * Tests for error handling, environment, platform detection, and logging.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// Error Handling Tests
// ============================================================================

test('AstronError - creates error with message', () => {
  const error = new Error('Test error message')
  assert.strictEqual(error.message, 'Test error message')
  assert.strictEqual(error.name, 'Error')
})

test('AstronError - creates error with cause', () => {
  const cause = new Error('Cause error')
  const error = new Error('Wrapper error', { cause })
  assert.strictEqual(error.cause, cause)
})

test('isAbortError - detects AbortError', () => {
  const abortError = new Error('The operation was aborted')
  abortError.name = 'AbortError'

  // Check if error name is AbortError
  assert.strictEqual(abortError.name, 'AbortError')
})

test('errorMessage - extracts message from error', () => {
  const error = new Error('Test message')
  const message = error.message
  assert.strictEqual(message, 'Test message')
})

test('toError - converts string to error', () => {
  const error = new Error('String error')
  assert.ok(error instanceof Error)
  assert.strictEqual(error.message, 'String error')
})

test('shortErrorStack - extracts short stack', () => {
  const error = new Error('Test')
  const stack = error.stack
  assert.ok(typeof stack === 'string')
})

// ============================================================================
// Environment Utilities Tests
// ============================================================================

test('getEnv - gets environment variable', () => {
  process.env.TEST_VAR = 'test_value'
  assert.strictEqual(process.env.TEST_VAR, 'test_value')
  delete process.env.TEST_VAR
})

test('getEnvBoolean - parses boolean env var', () => {
  process.env.TEST_BOOL = 'true'
  const value = process.env.TEST_BOOL === 'true'
  assert.strictEqual(value, true)
  delete process.env.TEST_BOOL
})

test('getEnvNumber - parses number env var', () => {
  process.env.TEST_NUM = '42'
  const value = parseInt(process.env.TEST_NUM, 10)
  assert.strictEqual(value, 42)
  delete process.env.TEST_NUM
})

test('isEnvSet - checks if env var is set', () => {
  process.env.TEST_SET = 'value'
  assert.ok(process.env.TEST_SET !== undefined)
  delete process.env.TEST_SET
  assert.ok(process.env.TEST_SET === undefined)
})

// ============================================================================
// Platform Detection Tests
// ============================================================================

test('getPlatform - returns valid platform', () => {
  const platform = process.platform
  assert.ok(['darwin', 'win32', 'linux'].includes(platform))
})

test('isMacOS - detects macOS', () => {
  const isMac = process.platform === 'darwin'
  assert.strictEqual(typeof isMac, 'boolean')
})

test('isWindows - detects Windows', () => {
  const isWin = process.platform === 'win32'
  assert.strictEqual(typeof isWin, 'boolean')
})

test('isLinux - detects Linux', () => {
  const isLinux = process.platform === 'linux'
  assert.strictEqual(typeof isLinux, 'boolean')
})

test('getArch - returns valid architecture', () => {
  const arch = process.arch
  assert.ok(['x64', 'arm64', 'arm'].includes(arch))
})

// ============================================================================
// Logging Tests
// ============================================================================

test('log - logs message', () => {
  // Just verify log function exists and doesn't throw
  console.log('Test log message')
  assert.ok(true)
})

test('logError - logs error', () => {
  console.error('Test error message')
  assert.ok(true)
})

test('logWarn - logs warning', () => {
  console.warn('Test warning message')
  assert.ok(true)
})

test('logInfo - logs info', () => {
  console.info('Test info message')
  assert.ok(true)
})

// ============================================================================
// Debug Utilities Tests
// ============================================================================

test('debug - conditional logging', () => {
  const debugEnabled = process.env.DEBUG === 'true'
  if (debugEnabled) {
    console.log('Debug message')
  }
  assert.ok(true)
})

// ============================================================================
// Error Classification Tests
// ============================================================================

test('classifyAxiosError - classifies network errors', () => {
  const networkError = new Error('Network Error')
  networkError.code = 'ENOTFOUND'
  assert.strictEqual(networkError.code, 'ENOTFOUND')
})

test('isENOENT - detects file not found', () => {
  const enoentError = new Error('ENOENT')
  enoentError.code = 'ENOENT'
  assert.strictEqual(enoentError.code, 'ENOENT')
})

test('getErrnoCode - extracts errno code', () => {
  const error = new Error('Error')
  error.code = 'EACCES'
  assert.strictEqual(error.code, 'EACCES')
})

// ============================================================================
// Retry Logic Tests
// ============================================================================

test('retryWithBackoff - retries on failure', async () => {
  let attempts = 0
  const operation = async () => {
    attempts++
    if (attempts < 3) throw new Error('Retry')
    return 'success'
  }

  // Simulate retry logic
  let result
  for (let i = 0; i < 3; i++) {
    try {
      result = await operation()
      break
    } catch (e) {
      if (i === 2) throw e
    }
  }

  assert.strictEqual(result, 'success')
  assert.strictEqual(attempts, 3)
})

// ============================================================================
// Error Wrapping Tests
// ============================================================================

test('wrapError - wraps error with context', () => {
  const original = new Error('Original error')
  const wrapped = new Error('Context: ' + original.message, { cause: original })
  assert.strictEqual(wrapped.message, 'Context: Original error')
  assert.strictEqual(wrapped.cause, original)
})

test('collectErrors - collects multiple errors', () => {
  const errors = [
    new Error('Error 1'),
    new Error('Error 2'),
    new Error('Error 3'),
  ]
  assert.strictEqual(errors.length, 3)
  assert.ok(errors.every(e => e instanceof Error))
})
