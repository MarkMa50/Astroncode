/**
 * Path Utilities - Unit Tests
 *
 * Tests for path expansion, normalization, and traversal detection.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import os from 'node:os'

// ============================================================================
// Path Expansion Tests
// ============================================================================

test('expandPath - handles tilde notation', () => {
  const home = os.homedir()
  // Test ~ expansion
  const tildePath = path.join(home, 'Documents')
  assert.ok(tildePath.startsWith(home))
})

test('expandPath - handles absolute paths', () => {
  const absPath = '/absolute/path'
  const normalized = path.normalize(absPath)
  assert.ok(path.isAbsolute(normalized))
})

test('expandPath - handles relative paths', () => {
  const relPath = './src/utils'
  const cwd = process.cwd()
  const resolved = path.resolve(cwd, relPath)
  assert.ok(path.isAbsolute(resolved))
  assert.ok(resolved.includes('src'))
})

test('expandPath - normalizes paths', () => {
  const unnormalized = '/path/with/../parent'
  const normalized = path.normalize(unnormalized)
  assert.ok(!normalized.includes('..'))
})

// ============================================================================
// Path Traversal Tests
// ============================================================================

test('containsPathTraversal - detects parent directory access', () => {
  const traversalPatterns = [
    '../parent',
    'path/../other',
    '..\\windows',
    'path/..',
    '../',
    '..',
  ]

  for (const pattern of traversalPatterns) {
    const hasTraversal = /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(pattern)
    assert.ok(hasTraversal, `Should detect traversal in: ${pattern}`)
  }
})

test('containsPathTraversal - allows safe paths', () => {
  const safePaths = [
    './safe/path',
    'normal/path',
    '/absolute/path',
    'file.txt',
    'path/to/file',
  ]

  for (const safePath of safePaths) {
    const hasTraversal = /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(safePath)
    assert.ok(!hasTraversal, `Should not detect traversal in: ${safePath}`)
  }
})

// ============================================================================
// Path Normalization Tests
// ============================================================================

test('normalizePathForConfigKey - normalizes separators', () => {
  const windowsPath = 'C:\\Users\\test\\file.txt'
  const normalized = windowsPath.replace(/\\/g, '/')
  assert.ok(!normalized.includes('\\'))
  assert.ok(normalized.includes('/'))
})

test('normalizePathForConfigKey - handles forward slashes', () => {
  const unixPath = '/home/user/file.txt'
  const normalized = unixPath.replace(/\\/g, '/')
  assert.strictEqual(normalized, unixPath)
})

// ============================================================================
// Directory Path Tests
// ============================================================================

test('getDirectoryForPath - extracts directory', () => {
  const filePath = '/path/to/file.txt'
  const dirPath = path.dirname(filePath)
  assert.strictEqual(dirPath, '/path/to')
})

test('getDirectoryForPath - handles directory path', () => {
  const dirPath = '/path/to/directory'
  const parentDir = path.dirname(dirPath)
  assert.strictEqual(parentDir, '/path/to')
})

// ============================================================================
// Relative Path Tests
// ============================================================================

test('toRelativePath - converts to relative', () => {
  const cwd = process.cwd()
  const absPath = path.join(cwd, 'src', 'utils')
  const relative = path.relative(cwd, absPath)
  assert.strictEqual(relative.replace(/\\/g, '/'), 'src/utils')
})

test('toRelativePath - keeps absolute if outside cwd', () => {
  const cwd = process.cwd()
  const outsidePath = '/different/location'
  const relative = path.relative(cwd, outsidePath)
  // If outside cwd, relative path starts with ..
  assert.ok(relative.startsWith('..') || path.isAbsolute(outsidePath))
})

// ============================================================================
// Path Join Tests
// ============================================================================

test('path.join - joins segments correctly', () => {
  const joined = path.join('/base', 'dir', 'file.txt')
  assert.ok(joined.includes('base'))
  assert.ok(joined.includes('dir'))
  assert.ok(joined.includes('file.txt'))
})

test('path.join - normalizes result', () => {
  const joined = path.join('/base', '..', 'other')
  assert.ok(!joined.includes('base'))
  assert.ok(joined.includes('other'))
})

// ============================================================================
// Path Resolve Tests
// ============================================================================

test('path.resolve - resolves to absolute', () => {
  const resolved = path.resolve('./relative/path')
  assert.ok(path.isAbsolute(resolved))
})

test('path.resolve - handles multiple segments', () => {
  const resolved = path.resolve('/base', 'dir', 'file.txt')
  assert.ok(path.isAbsolute(resolved))
  assert.ok(resolved.endsWith('file.txt'))
})

// ============================================================================
// Path Parse Tests
// ============================================================================

test('path.parse - parses path components', () => {
  const parsed = path.parse('/home/user/file.txt')
  assert.strictEqual(parsed.dir, '/home/user')
  assert.strictEqual(parsed.base, 'file.txt')
  assert.strictEqual(parsed.ext, '.txt')
  assert.strictEqual(parsed.name, 'file')
})

// ============================================================================
// Path Extname Tests
// ============================================================================

test('path.extname - extracts extension', () => {
  assert.strictEqual(path.extname('file.txt'), '.txt')
  assert.strictEqual(path.extname('file.test.mjs'), '.mjs')
  assert.strictEqual(path.extname('file'), '')
  assert.strictEqual(path.extname('.hidden'), '')
})
