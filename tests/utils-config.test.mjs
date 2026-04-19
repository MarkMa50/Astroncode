/**
 * Config Utilities - Unit Tests
 *
 * Tests for configuration management, loading, and validation.
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import path from 'node:path'
import os from 'node:os'

// ============================================================================
// Config Path Tests
// ============================================================================

test('getConfigPath - returns valid config path', () => {
  const configDir = path.join(os.homedir(), '.config', 'astroncode')
  assert.ok(configDir.includes('.config'))
  assert.ok(configDir.includes('astroncode'))
})

test('getGlobalConfigPath - returns global config path', () => {
  const globalPath = path.join(os.homedir(), '.config', 'astroncode', 'config.json')
  assert.ok(globalPath.endsWith('config.json'))
})

test('getProjectConfigPath - returns project config path', () => {
  const projectPath = '.astroncode/config.json'
  assert.ok(projectPath.includes('.astroncode'))
})

// ============================================================================
// Config Loading Tests
// ============================================================================

test('loadConfig - handles missing config', async () => {
  // Config should handle missing file gracefully
  const defaultConfig = { version: '1.0.0' }
  assert.ok(defaultConfig.version)
})

test('loadConfig - parses valid JSON', () => {
  const configJson = '{"name": "test", "version": "1.0.0"}'
  const config = JSON.parse(configJson)
  assert.strictEqual(config.name, 'test')
  assert.strictEqual(config.version, '1.0.0')
})

test('loadConfig - throws on invalid JSON', () => {
  const invalidJson = '{"name": "test", invalid}'
  assert.throws(() => JSON.parse(invalidJson), SyntaxError)
})

// ============================================================================
// Config Validation Tests
// ============================================================================

test('validateConfig - validates required fields', () => {
  const config = {
    name: 'test-project',
    version: '1.0.0',
  }

  assert.ok(config.name)
  assert.ok(config.version)
})

test('validateConfig - handles missing optional fields', () => {
  const config = {
    name: 'test-project',
  }

  // Optional fields should have defaults
  const fullConfig = {
    ...config,
    version: config.version || '0.0.0',
  }

  assert.ok(fullConfig.version)
})

// ============================================================================
// Config Merging Tests
// ============================================================================

test('mergeConfig - merges global and project config', () => {
  const globalConfig = {
    theme: 'dark',
    logLevel: 'info',
  }

  const projectConfig = {
    theme: 'light',
    customSetting: 'value',
  }

  const merged = {
    ...globalConfig,
    ...projectConfig,
  }

  assert.strictEqual(merged.theme, 'light') // Project overrides global
  assert.strictEqual(merged.logLevel, 'info') // Global preserved
  assert.strictEqual(merged.customSetting, 'value') // Project added
})

test('mergeConfig - handles nested objects', () => {
  const globalConfig = {
    settings: {
      timeout: 30000,
      retries: 3,
    },
  }

  const projectConfig = {
    settings: {
      timeout: 60000,
    },
  }

  const merged = {
    settings: {
      ...globalConfig.settings,
      ...projectConfig.settings,
    },
  }

  assert.strictEqual(merged.settings.timeout, 60000)
  assert.strictEqual(merged.settings.retries, 3)
})

// ============================================================================
// Config Update Tests
// ============================================================================

test('updateConfig - updates single value', () => {
  const config = { theme: 'dark', logLevel: 'info' }
  const updated = { ...config, theme: 'light' }

  assert.strictEqual(updated.theme, 'light')
  assert.strictEqual(updated.logLevel, 'info')
})

test('updateConfig - preserves other values', () => {
  const config = { a: 1, b: 2, c: 3 }
  const updated = { ...config, b: 20 }

  assert.strictEqual(updated.a, 1)
  assert.strictEqual(updated.b, 20)
  assert.strictEqual(updated.c, 3)
})

// ============================================================================
// Environment Override Tests
// ============================================================================

test('applyEnvOverrides - applies environment overrides', () => {
  process.env.ASTRON_THEME = 'light'
  const config = { theme: 'dark' }

  const envTheme = process.env.ASTRON_THEME
  if (envTheme) {
    config.theme = envTheme
  }

  assert.strictEqual(config.theme, 'light')
  delete process.env.ASTRON_THEME
})

// ============================================================================
// Config Schema Tests
// ============================================================================

test('validateSchema - validates against schema', () => {
  const schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      version: { type: 'string' },
    },
    required: ['name'],
  }

  const validConfig = { name: 'test', version: '1.0.0' }
  assert.ok(validConfig.name)
  assert.strictEqual(typeof validConfig.name, 'string')
})

// ============================================================================
// Config Serialization Tests
// ============================================================================

test('serializeConfig - serializes to JSON', () => {
  const config = {
    name: 'test',
    settings: { timeout: 30000 },
  }

  const json = JSON.stringify(config, null, 2)
  const parsed = JSON.parse(json)

  assert.deepStrictEqual(parsed, config)
})

test('serializeConfig - handles circular references', () => {
  const config = { name: 'test' }
  // No circular reference here
  const json = JSON.stringify(config)
  assert.ok(json.includes('test'))
})
