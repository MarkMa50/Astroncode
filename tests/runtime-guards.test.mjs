import assert from 'node:assert/strict'
import { test } from 'node:test'

import { detectUnsupportedAstronInvocation } from '../scripts/runtime-guards.mjs'

test('detectUnsupportedAstronInvocation allows auth login flows to be handled locally', () => {
  const result = detectUnsupportedAstronInvocation(['auth', 'login'])

  assert.equal(result, null)
})

test('detectUnsupportedAstronInvocation blocks chrome integration flags', () => {
  const result = detectUnsupportedAstronInvocation(['--chrome'])

  assert.ok(result)
  assert.match(result.message, /Chrome integration is disabled/i)
  assert.doesNotMatch(result.message, /Claude web services/i)
})

test('detectUnsupportedAstronInvocation allows --no-chrome in local mode', () => {
  const result = detectUnsupportedAstronInvocation(['--no-chrome'])

  assert.equal(result, null)
})

test('detectUnsupportedAstronInvocation allows print-mode prompts', () => {
  const result = detectUnsupportedAstronInvocation([
    '-p',
    'Reply with exactly OK.',
    '--output-format',
    'text',
  ])

  assert.equal(result, null)
})

test('detectUnsupportedAstronInvocation blocks removed mobile commands', () => {
  for (const command of ['mobile', 'ios', 'android']) {
    const result = detectUnsupportedAstronInvocation([command])

    assert.ok(result)
    assert.equal(result.exitCode, 2)
    assert.match(result.message, /Mobile companion command is disabled/i)
  }
})
