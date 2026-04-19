import test from 'node:test'
import assert from 'node:assert/strict'
import os from 'node:os'
import path from 'node:path'

import {
  applyAstronEnv,
  getAstronEnvFilePath,
  getAstronRuntimeCacheDir,
  normalizeAstronBaseUrl,
  parseEnvFileContent,
  updateEnvFileContent,
} from '../scripts/astron-env.mjs'

test('parseEnvFileContent reads comments, quotes, and blank lines', () => {
  const parsed = parseEnvFileContent(`
# comment
ASTRONCODE_API_KEY=test-key
ASTRONCODE_MODEL="my-model"

ASTRONCODE_BASE_URL='https://example.com/v1'
  `)

  assert.deepEqual(parsed, {
    ASTRONCODE_API_KEY: 'test-key',
    ASTRONCODE_MODEL: 'my-model',
    ASTRONCODE_BASE_URL: 'https://example.com/v1',
  })
})

test('applyAstronEnv maps Astroncode variables to runtime variables', () => {
  const env = applyAstronEnv({
    PATH: 'C:\\Windows\\System32',
    ASTRONCODE_AUTH_TOKEN: 'key-123',
    ASTRONCODE_BASE_URL: 'https://llm.example.com/v2',
    ASTRONCODE_MODEL: 'provider/model-a',
  })

  assert.equal(env.ANTHROPIC_AUTH_TOKEN, 'key-123')
  assert.equal(env.ANTHROPIC_BASE_URL, 'https://llm.example.com/anthropic')
  assert.equal(env.ANTHROPIC_MODEL, 'provider/model-a')
  assert.equal(env.ANTHROPIC_SMALL_FAST_MODEL, 'provider/model-a')
  assert.equal(env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC, '1')
  assert.equal(env.CLAUDE_CODE_ACCESSIBILITY, '1')
  assert.equal(env.DISABLE_TELEMETRY, '1')
  assert.equal(env.PATH, 'C:\\Windows\\System32')
})

test('applyAstronEnv keeps explicit Anthropic values unless Astroncode overrides exist', () => {
  const env = applyAstronEnv({
    ANTHROPIC_API_KEY: 'existing-key',
    ANTHROPIC_MODEL: 'existing-model',
  })

  assert.equal(env.ANTHROPIC_API_KEY, 'existing-key')
  assert.equal(env.ANTHROPIC_MODEL, 'existing-model')
})

test('applyAstronEnv preserves an explicit accessibility override', () => {
  const env = applyAstronEnv({
    CLAUDE_CODE_ACCESSIBILITY: '0',
  })

  assert.equal(env.CLAUDE_CODE_ACCESSIBILITY, '0')
})

test('normalizeAstronBaseUrl converts the official OpenAI endpoint to the Anthropic endpoint', () => {
  assert.equal(
    normalizeAstronBaseUrl('https://maas-coding-api.cn-huabei-1.xf-yun.com/v2'),
    'https://maas-coding-api.cn-huabei-1.xf-yun.com/anthropic',
  )
})

test('updateEnvFileContent preserves comments while updating and removing keys', () => {
  const updated = updateEnvFileContent(
    [
      '# local config',
      'ASTRONCODE_AUTH_TOKEN=old-token',
      'ASTRONCODE_BASE_URL=https://example.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
      '',
    ].join('\n'),
    {
      ASTRONCODE_AUTH_TOKEN: null,
      ASTRONCODE_MODEL: 'astron-code-1.0.10',
      ASTRONCODE_API_KEY: 'key-123',
    },
  )

  assert.match(updated, /# local config/)
  assert.doesNotMatch(updated, /ASTRONCODE_AUTH_TOKEN=old-token/)
  assert.match(updated, /ASTRONCODE_MODEL=astron-code-1\.0\.10/)
  assert.match(updated, /ASTRONCODE_API_KEY=key-123/)
  assert.match(updated, /ASTRONCODE_BASE_URL=https:\/\/example\.com\/v2/)
})

test('getAstronEnvFilePath prefers a local env file when present', () => {
  const cwd = 'C:\\Users\\markw\\astroncode'
  assert.equal(
    getAstronEnvFilePath(cwd),
    path.join(cwd, '.env.astroncode'),
  )
})

test('getAstronEnvFilePath honors config file and config dir overrides', () => {
  const originalConfigFile = process.env.ASTRONCODE_CONFIG_FILE
  const originalConfigDir = process.env.ASTRONCODE_CONFIG_DIR

  try {
    process.env.ASTRONCODE_CONFIG_FILE = 'D:\\Astron\\custom.env'
    assert.equal(
      getAstronEnvFilePath('C:\\repo'),
      path.resolve('D:\\Astron\\custom.env'),
    )

    delete process.env.ASTRONCODE_CONFIG_FILE
    process.env.ASTRONCODE_CONFIG_DIR = 'D:\\Astron\\config'
    assert.equal(
      getAstronEnvFilePath('C:\\repo'),
      path.join(path.resolve('D:\\Astron\\config'), '.env.astroncode'),
    )
  } finally {
    if (originalConfigFile == null) {
      delete process.env.ASTRONCODE_CONFIG_FILE
    } else {
      process.env.ASTRONCODE_CONFIG_FILE = originalConfigFile
    }

    if (originalConfigDir == null) {
      delete process.env.ASTRONCODE_CONFIG_DIR
    } else {
      process.env.ASTRONCODE_CONFIG_DIR = originalConfigDir
    }
  }
})

test('getAstronRuntimeCacheDir uses Windows roaming config by default and supports override', () => {
  const originalAppData = process.env.APPDATA
  const originalCacheDir = process.env.ASTRONCODE_RUNTIME_CACHE_DIR
  const expectedDefault = path.join(
    process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
    'Astroncode',
    'runtime-cache',
  )

  try {
    delete process.env.ASTRONCODE_RUNTIME_CACHE_DIR
    assert.equal(getAstronRuntimeCacheDir(), expectedDefault)

    process.env.ASTRONCODE_RUNTIME_CACHE_DIR = 'D:\\Astron\\runtime-cache'
    assert.equal(
      getAstronRuntimeCacheDir(),
      path.resolve('D:\\Astron\\runtime-cache'),
    )
  } finally {
    if (originalAppData == null) {
      delete process.env.APPDATA
    } else {
      process.env.APPDATA = originalAppData
    }

    if (originalCacheDir == null) {
      delete process.env.ASTRONCODE_RUNTIME_CACHE_DIR
    } else {
      process.env.ASTRONCODE_RUNTIME_CACHE_DIR = originalCacheDir
    }
  }
})
