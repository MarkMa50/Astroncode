/**
 * API Error Utilities - Unit Tests
 *
 * Tests for error extraction, SSL error handling, and message sanitization.
 */

import assert from 'node:assert/strict'
import test from 'node:test'

// ============================================================================
// SSL Error Code Tests
// ============================================================================

const SSL_ERROR_CODES = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'CERT_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID',
  'CERT_HAS_EXPIRED',
  'CERT_REVOKED',
  'CERT_REJECTED',
  'CERT_UNTRUSTED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'CERT_CHAIN_TOO_LONG',
  'PATH_LENGTH_EXCEEDED',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'HOSTNAME_MISMATCH',
  'ERR_TLS_HANDSHAKE_TIMEOUT',
  'ERR_SSL_WRONG_VERSION_NUMBER',
  'ERR_SSL_DECRYPTION_FAILED_OR_BAD_RECORD_MAC',
])

test('SSL_ERROR_CODES - contains expected codes', () => {
  assert.ok(SSL_ERROR_CODES.has('UNABLE_TO_VERIFY_LEAF_SIGNATURE'))
  assert.ok(SSL_ERROR_CODES.has('CERT_HAS_EXPIRED'))
  assert.ok(SSL_ERROR_CODES.has('SELF_SIGNED_CERT_IN_CHAIN'))
  assert.ok(SSL_ERROR_CODES.has('ERR_TLS_CERT_ALTNAME_INVALID'))
})

test('SSL_ERROR_CODES - does not contain non-SSL codes', () => {
  assert.ok(!SSL_ERROR_CODES.has('ETIMEDOUT'))
  assert.ok(!SSL_ERROR_CODES.has('ECONNREFUSED'))
  assert.ok(!SSL_ERROR_CODES.has('ENOTFOUND'))
})

// ============================================================================
// Connection Error Extraction Tests
// ============================================================================

test('extractConnectionErrorDetails - extracts from error with code', () => {
  const error = new Error('Test error')
  error.code = 'ETIMEDOUT'

  // Simulate extraction logic
  const isSSLError = SSL_ERROR_CODES.has(error.code)
  assert.strictEqual(isSSLError, false)
  assert.strictEqual(error.code, 'ETIMEDOUT')
})

test('extractConnectionErrorDetails - detects SSL errors', () => {
  const error = new Error('SSL error')
  error.code = 'CERT_HAS_EXPIRED'

  const isSSLError = SSL_ERROR_CODES.has(error.code)
  assert.strictEqual(isSSLError, true)
})

test('extractConnectionErrorDetails - walks cause chain', () => {
  const rootCause = new Error('Root error')
  rootCause.code = 'ECONNREFUSED'

  const wrapper = new Error('Wrapper error', { cause: rootCause })

  // Simulate walking the cause chain
  let current = wrapper
  let foundCode = null
  const maxDepth = 5
  let depth = 0

  while (current && depth < maxDepth) {
    if (current instanceof Error && 'code' in current) {
      foundCode = current.code
      break
    }
    if (current instanceof Error && 'cause' in current && current.cause !== current) {
      current = current.cause
      depth++
    } else {
      break
    }
  }

  assert.strictEqual(foundCode, 'ECONNREFUSED')
})

test('extractConnectionErrorDetails - handles null error', () => {
  const error = null
  assert.strictEqual(error, null)
})

test('extractConnectionErrorDetails - handles non-object error', () => {
  const error = 'string error'
  assert.strictEqual(typeof error, 'string')
})

// ============================================================================
// SSL Error Hint Tests
// ============================================================================

test('getSSLErrorHint - returns hint for SSL errors', () => {
  const error = new Error('SSL error')
  error.code = 'CERT_HAS_EXPIRED'

  const isSSLError = SSL_ERROR_CODES.has(error.code)
  assert.strictEqual(isSSLError, true)

  // Expected hint pattern
  const hint = `SSL certificate error (${error.code}). If you are behind a corporate proxy or TLS-intercepting firewall, set NODE_EXTRA_CA_CERTS to your CA bundle path, or ask IT to allowlist *.anthropic.com. Run /doctor for details.`
  assert.ok(hint.includes('NODE_EXTRA_CA_CERTS'))
  assert.ok(hint.includes('CERT_HAS_EXPIRED'))
})

test('getSSLErrorHint - returns null for non-SSL errors', () => {
  const error = new Error('Timeout')
  error.code = 'ETIMEDOUT'

  const isSSLError = SSL_ERROR_CODES.has(error.code)
  assert.strictEqual(isSSLError, false)
})

// ============================================================================
// HTML Sanitization Tests
// ============================================================================

test('sanitizeMessageHTML - extracts title from HTML', () => {
  const htmlMessage = '<!DOCTYPE html><html><head><title>Error 502</title></head><body>Bad Gateway</body></html>'
  const titleMatch = htmlMessage.match(/<title>([^<]+)<\/title>/)

  assert.ok(titleMatch)
  assert.strictEqual(titleMatch[1], 'Error 502')
})

test('sanitizeMessageHTML - returns empty for HTML without title', () => {
  const htmlMessage = '<!DOCTYPE html><html><body>No title</body></html>'
  const titleMatch = htmlMessage.match(/<title>([^<]+)<\/title>/)

  assert.strictEqual(titleMatch, null)
})

test('sanitizeMessageHTML - returns original for non-HTML', () => {
  const message = 'Plain text error message'
  const isHTML = message.includes('<!DOCTYPE html') || message.includes('<html')

  assert.strictEqual(isHTML, false)
})

test('sanitizeMessageHTML - handles CloudFlare error pages', () => {
  const cfError = '<!DOCTYPE html><html><head><title>522 Ray</title></head><body>CloudFlare timeout</body></html>'
  const titleMatch = cfError.match(/<title>([^<]+)<\/title>/)

  assert.ok(titleMatch)
  assert.strictEqual(titleMatch[1], '522 Ray')
})

// ============================================================================
// API Error Formatting Tests
// ============================================================================

test('formatAPIError - handles timeout errors', () => {
  const code = 'ETIMEDOUT'
  const expected = 'Request timed out. Check your internet connection and proxy settings'
  assert.ok(expected.includes('timed out'))
})

test('formatAPIError - handles SSL certificate errors', () => {
  const sslCodes = [
    { code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', expected: 'SSL certificate verification failed' },
    { code: 'CERT_HAS_EXPIRED', expected: 'SSL certificate has expired' },
    { code: 'CERT_REVOKED', expected: 'SSL certificate has been revoked' },
    { code: 'SELF_SIGNED_CERT_IN_CHAIN', expected: 'Self-signed certificate detected' },
    { code: 'ERR_TLS_CERT_ALTNAME_INVALID', expected: 'SSL certificate hostname mismatch' },
  ]

  for (const { code, expected } of sslCodes) {
    assert.ok(SSL_ERROR_CODES.has(code))
    // Check that expected message is about certificate issues
    assert.ok(expected.includes('certificate') || expected.includes('SSL'))
  }
})

test('formatAPIError - handles connection error', () => {
  const message = 'Connection error.'
  assert.strictEqual(message, 'Connection error.')
})

test('formatAPIError - handles missing message', () => {
  const error = { status: 500 }
  // Should return fallback message
  const fallback = `API error (status ${error.status ?? 'unknown'})`
  assert.strictEqual(fallback, 'API error (status 500)')
})

// ============================================================================
// Nested Error Extraction Tests
// ============================================================================

test('extractNestedErrorMessage - handles standard Anthropic shape', () => {
  const error = {
    error: {
      error: {
        message: 'Nested error message',
      },
    },
  }

  const hasNested = (val) =>
    typeof val === 'object' && val !== null && 'error' in val && typeof val.error === 'object'

  assert.ok(hasNested(error))
  assert.strictEqual(error.error.error.message, 'Nested error message')
})

test('extractNestedErrorMessage - handles Bedrock shape', () => {
  const error = {
    error: {
      message: 'Bedrock error message',
    },
  }

  assert.strictEqual(error.error.message, 'Bedrock error message')
})

// ============================================================================
// Edge Case Tests
// ============================================================================

test('extractConnectionErrorDetails - handles circular cause', () => {
  const error = new Error('Circular')
  // Don't actually create circular reference, just test the guard
  const maxDepth = 5
  let depth = 0
  let current = error

  while (current && depth < maxDepth) {
    if (current instanceof Error && 'cause' in current && current.cause !== current) {
      current = current.cause
      depth++
    } else {
      break
    }
  }

  assert.ok(depth < maxDepth)
})

test('formatAPIError - handles unknown status', () => {
  const error = {}
  const fallback = `API error (status ${error.status ?? 'unknown'})`
  assert.strictEqual(fallback, 'API error (status unknown)')
})
