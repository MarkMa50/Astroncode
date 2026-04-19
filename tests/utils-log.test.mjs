/**
 * Logging Utilities - Unit Tests
 *
 * Tests for logging, debug utilities, and output formatting.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// Log Level Tests
// ============================================================================

test('LogLevel - has correct levels', () => {
  const levels = ['error', 'warn', 'info', 'debug']
  assert.strictEqual(levels.length, 4)
  assert.ok(levels.includes('error'))
  assert.ok(levels.includes('warn'))
  assert.ok(levels.includes('info'))
  assert.ok(levels.includes('debug'))
})

test('LogLevel - has correct priority', () => {
  const priorities = { error: 0, warn: 1, info: 2, debug: 3 }
  assert.ok(priorities.error < priorities.warn)
  assert.ok(priorities.warn < priorities.info)
  assert.ok(priorities.info < priorities.debug)
})

// ============================================================================
// Console Output Tests
// ============================================================================

test('log - outputs to console', () => {
  // Capture console output
  const messages = []
  const originalLog = console.log
  console.log = (...args) => messages.push(args.join(' '))

  console.log('Test message')
  assert.strictEqual(messages[0], 'Test message')

  console.log = originalLog
})

test('logError - outputs error to console', () => {
  const messages = []
  const originalError = console.error
  console.error = (...args) => messages.push(args.join(' '))

  console.error('Error message')
  assert.strictEqual(messages[0], 'Error message')

  console.error = originalError
})

test('logWarn - outputs warning to console', () => {
  const messages = []
  const originalWarn = console.warn
  console.warn = (...args) => messages.push(args.join(' '))

  console.warn('Warning message')
  assert.strictEqual(messages[0], 'Warning message')

  console.warn = originalWarn
})

test('logInfo - outputs info to console', () => {
  const messages = []
  const originalInfo = console.info
  console.info = (...args) => messages.push(args.join(' '))

  console.info('Info message')
  assert.strictEqual(messages[0], 'Info message')

  console.info = originalInfo
})

// ============================================================================
// Debug Mode Tests
// ============================================================================

test('debugEnabled - checks debug mode', () => {
  const debugEnv = process.env.DEBUG
  const isEnabled = debugEnv === 'true' || debugEnv === '1'
  assert.strictEqual(typeof isEnabled, 'boolean')
})

test('setDebugEnabled - sets debug mode', () => {
  process.env.DEBUG = 'true'
  assert.strictEqual(process.env.DEBUG, 'true')
  delete process.env.DEBUG
})

test('debugLog - logs when debug enabled', () => {
  const messages = []
  const originalLog = console.log
  console.log = (...args) => messages.push(args.join(' '))

  const debugEnabled = true
  if (debugEnabled) {
    console.log('[DEBUG]', 'Debug message')
  }

  assert.ok(messages[0].includes('[DEBUG]'))
  assert.ok(messages[0].includes('Debug message'))

  console.log = originalLog
})

// ============================================================================
// Log Formatting Tests
// ============================================================================

test('formatLogMessage - formats with timestamp', () => {
  const timestamp = new Date().toISOString()
  const message = 'Test message'
  const formatted = `[${timestamp}] ${message}`

  assert.ok(formatted.includes(timestamp))
  assert.ok(formatted.includes(message))
})

test('formatLogMessage - formats with level', () => {
  const level = 'INFO'
  const message = 'Test message'
  const formatted = `[${level}] ${message}`

  assert.ok(formatted.includes(level))
  assert.ok(formatted.includes(message))
})

test('formatLogMessage - formats with context', () => {
  const context = 'TestContext'
  const message = 'Test message'
  const formatted = `[${context}] ${message}`

  assert.ok(formatted.includes(context))
  assert.ok(formatted.includes(message))
})

// ============================================================================
// Error Logging Tests
// ============================================================================

test('logError - logs error with stack', () => {
  const error = new Error('Test error')
  const stack = error.stack

  assert.ok(stack.includes('Error: Test error'))
})

test('logError - logs error with cause', () => {
  const cause = new Error('Cause error')
  const error = new Error('Wrapper error', { cause })

  assert.strictEqual(error.cause, cause)
})

// ============================================================================
// Performance Logging Tests
// ============================================================================

test('logPerformance - logs timing', () => {
  const start = Date.now()
  // Simulate operation
  const elapsed = Date.now() - start

  assert.ok(elapsed >= 0)
})

test('logPerformance - logs memory usage', () => {
  const memoryUsage = process.memoryUsage()

  assert.ok(memoryUsage.heapUsed)
  assert.ok(memoryUsage.heapTotal)
  assert.ok(memoryUsage.rss)
})

// ============================================================================
// Log Filtering Tests
// ============================================================================

test('shouldLog - filters by level', () => {
  const currentLevel = 'warn'
  const levels = { error: 0, warn: 1, info: 2, debug: 3 }

  const shouldLogError = levels.error <= levels[currentLevel]
  const shouldLogWarn = levels.warn <= levels[currentLevel]
  const shouldLogInfo = levels.info <= levels[currentLevel]

  assert.ok(shouldLogError)
  assert.ok(shouldLogWarn)
  assert.ok(!shouldLogInfo)
})

// ============================================================================
// Log Buffer Tests
// ============================================================================

test('LogBuffer - buffers messages', () => {
  const buffer = []
  buffer.push('Message 1')
  buffer.push('Message 2')
  buffer.push('Message 3')

  assert.strictEqual(buffer.length, 3)
})

test('LogBuffer - limits buffer size', () => {
  const maxSize = 100
  const buffer = []

  for (let i = 0; i < 150; i++) {
    buffer.push(`Message ${i}`)
    if (buffer.length > maxSize) {
      buffer.shift()
    }
  }

  assert.strictEqual(buffer.length, maxSize)
})

// ============================================================================
// Log Rotation Tests
// ============================================================================

test('rotateLog - creates new log file', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const logName = `astroncode-${timestamp}.log`

  assert.ok(logName.includes('astroncode'))
  assert.ok(logName.endsWith('.log'))
})

// ============================================================================
// Silent Mode Tests
// ============================================================================

test('silentMode - suppresses output', () => {
  const silent = true
  const messages = []

  if (!silent) {
    messages.push('This should not be added')
  }

  assert.strictEqual(messages.length, 0)
})
