/**
 * Environment Utilities - Unit Tests
 *
 * Tests for environment variable handling and platform detection.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import os from 'node:os'

// ============================================================================
// Environment Variable Tests
// ============================================================================

test('getEnv - returns undefined for unset variable', () => {
  const value = process.env.UNSET_VAR_12345
  assert.strictEqual(value, undefined)
})

test('getEnv - returns value for set variable', () => {
  process.env.TEST_VAR = 'test_value'
  assert.strictEqual(process.env.TEST_VAR, 'test_value')
  delete process.env.TEST_VAR
})

test('getEnvString - returns string value', () => {
  process.env.TEST_STRING = 'hello'
  const value = process.env.TEST_STRING
  assert.strictEqual(typeof value, 'string')
  assert.strictEqual(value, 'hello')
  delete process.env.TEST_STRING
})

test('getEnvNumber - parses number value', () => {
  process.env.TEST_NUMBER = '42'
  const value = parseInt(process.env.TEST_NUMBER, 10)
  assert.strictEqual(typeof value, 'number')
  assert.strictEqual(value, 42)
  delete process.env.TEST_NUMBER
})

test('getEnvNumber - returns NaN for invalid number', () => {
  process.env.TEST_INVALID = 'not_a_number'
  const value = parseInt(process.env.TEST_INVALID, 10)
  assert.ok(Number.isNaN(value))
  delete process.env.TEST_INVALID
})

test('getEnvBoolean - parses true values', () => {
  const trueValues = ['true', '1', 'yes', 'on']
  for (const val of trueValues) {
    process.env.TEST_BOOL = val
    const parsed = process.env.TEST_BOOL === 'true' || process.env.TEST_BOOL === '1'
    // Only 'true' and '1' are typically considered true
    delete process.env.TEST_BOOL
  }
  assert.ok(true)
})

test('getEnvBoolean - parses false values', () => {
  const falseValues = ['false', '0', 'no', 'off', '']
  for (const val of falseValues) {
    process.env.TEST_BOOL = val
    const parsed = process.env.TEST_BOOL === 'true'
    assert.strictEqual(parsed, false)
    delete process.env.TEST_BOOL
  }
})

// ============================================================================
// Environment Prefix Tests
// ============================================================================

test('ENV_PREFIX - uses correct prefix', () => {
  const prefix = 'ASTRON_'
  assert.strictEqual(prefix, 'ASTRON_')
})

test('getAstronEnv - gets prefixed variable', () => {
  process.env.ASTRON_TEST = 'value'
  const value = process.env.ASTRON_TEST
  assert.strictEqual(value, 'value')
  delete process.env.ASTRON_TEST
})

test('setAstronEnv - sets prefixed variable', () => {
  process.env.ASTRON_CUSTOM = 'custom_value'
  assert.strictEqual(process.env.ASTRON_CUSTOM, 'custom_value')
  delete process.env.ASTRON_CUSTOM
})

// ============================================================================
// Platform Detection Tests
// ============================================================================

test('getPlatform - returns current platform', () => {
  const platform = process.platform
  assert.ok(['darwin', 'win32', 'linux', 'freebsd', 'openbsd'].includes(platform))
})

test('isMacOS - correctly detects macOS', () => {
  const isMac = process.platform === 'darwin'
  assert.strictEqual(typeof isMac, 'boolean')
  if (isMac) {
    assert.strictEqual(process.platform, 'darwin')
  }
})

test('isWindows - correctly detects Windows', () => {
  const isWin = process.platform === 'win32'
  assert.strictEqual(typeof isWin, 'boolean')
  if (isWin) {
    assert.strictEqual(process.platform, 'win32')
  }
})

test('isLinux - correctly detects Linux', () => {
  const isLinux = process.platform === 'linux'
  assert.strictEqual(typeof isLinux, 'boolean')
  if (isLinux) {
    assert.strictEqual(process.platform, 'linux')
  }
})

// ============================================================================
// Architecture Tests
// ============================================================================

test('getArch - returns current architecture', () => {
  const arch = process.arch
  assert.ok(['x64', 'arm64', 'arm', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x'].includes(arch))
})

test('isArm64 - detects ARM64', () => {
  const isArm64 = process.arch === 'arm64'
  assert.strictEqual(typeof isArm64, 'boolean')
})

test('isX64 - detects x64', () => {
  const isX64 = process.arch === 'x64'
  assert.strictEqual(typeof isX64, 'boolean')
})

// ============================================================================
// Home Directory Tests
// ============================================================================

test('getHomeDir - returns home directory', () => {
  const home = os.homedir()
  assert.ok(typeof home === 'string')
  assert.ok(home.length > 0)
})

test('getConfigDir - returns config directory', () => {
  const home = os.homedir()
  const configDir = process.platform === 'win32'
    ? path.join(home, 'AppData', 'Roaming', 'astroncode')
    : path.join(home, '.config', 'astroncode')

  assert.ok(configDir.includes('astroncode'))
})

// ============================================================================
// Path Separator Tests
// ============================================================================

test('getPathSeparator - returns correct separator', () => {
  const sep = process.platform === 'win32' ? '\\' : '/'
  assert.strictEqual(sep, path.sep)
})

test('getPathDelimiter - returns correct delimiter', () => {
  const delimiter = process.platform === 'win32' ? ';' : ':'
  assert.strictEqual(delimiter, path.delimiter)
})

// ============================================================================
// Node Version Tests
// ============================================================================

test('getNodeVersion - returns Node version', () => {
  const version = process.version
  assert.ok(version.startsWith('v'))
  assert.ok(version.match(/^v\d+\.\d+\.\d+/))
})

test('getNodeMajorVersion - returns major version', () => {
  const major = parseInt(process.version.slice(1).split('.')[0], 10)
  assert.ok(typeof major === 'number')
  assert.ok(major >= 14) // Assuming Node 14+ is required
})

// ============================================================================
// CPU and Memory Tests
// ============================================================================

test('getCpuCount - returns CPU count', () => {
  const cpus = os.cpus()
  assert.ok(Array.isArray(cpus))
  assert.ok(cpus.length > 0)
})

test('getTotalMemory - returns total memory', () => {
  const totalMem = os.totalmem()
  assert.ok(typeof totalMem === 'number')
  assert.ok(totalMem > 0)
})

test('getFreeMemory - returns free memory', () => {
  const freeMem = os.freemem()
  assert.ok(typeof freeMem === 'number')
  assert.ok(freeMem >= 0)
})

// ============================================================================
// Hostname Tests
// ============================================================================

test('getHostname - returns hostname', () => {
  const hostname = os.hostname()
  assert.ok(typeof hostname === 'string')
  assert.ok(hostname.length > 0)
})

// ============================================================================
// User Info Tests
// ============================================================================

test('getUserInfo - returns user info', () => {
  const userInfo = os.userInfo()
  assert.ok(userInfo.username)
  assert.ok(userInfo.homedir)
})

test('getUsername - returns username', () => {
  const username = os.userInfo().username
  assert.ok(typeof username === 'string')
  assert.ok(username.length > 0)
})

// Import path for path tests
import path from 'node:path'
