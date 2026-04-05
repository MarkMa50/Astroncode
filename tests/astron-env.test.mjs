import test from 'node:test'
import assert from 'node:assert/strict'

import {
  applyAstronEnv,
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
