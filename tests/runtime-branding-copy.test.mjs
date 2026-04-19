import assert from 'node:assert/strict'
import test from 'node:test'

import { applyBrandingReplacements } from '../scripts/runtime-branding.mjs'
import {
  buildRuntimeWelcomeFunctionSource,
  getRecentActivityFeedCopy,
} from '../src/utils/logoPageCopy.mjs'

test('runtime branding stays aligned with the shared logo page copy', () => {
  const recentActivityCopy = getRecentActivityFeedCopy(true)
  const recentActivityEmptyCopy = getRecentActivityFeedCopy(false)
  const source = [
    'function FF8(q){if(!q||q.length>A0Y)return"Welcome back!";return`Welcome back ${q}!`}',
    'Recent activity',
    '/resume for more',
    'No recent activity',
    'Check the Claude Code changelog for updates',
    '/release-notes for more',
    'Unable to fetch latest claude-cli-internal commits',
    "What's new [ANT-ONLY: Latest CC commits]",
  ].join('\n')

  const { patched } = applyBrandingReplacements(source)

  assert.ok(patched.includes(buildRuntimeWelcomeFunctionSource()))
  assert.ok(patched.includes(recentActivityCopy.title))
  assert.ok(patched.includes(recentActivityCopy.footer))
  assert.ok(patched.includes(recentActivityEmptyCopy.emptyMessage))
  assert.equal(patched.includes('/release-notes for more'), false)

  assert.equal(patched.includes('Recent activity'), false)
  assert.equal(patched.includes('/resume for more'), false)
  assert.equal(patched.includes('No recent activity'), false)
  assert.equal(
    patched.includes('Check the Claude Code changelog for updates'),
    false,
  )
  assert.equal(
    patched.includes('Unable to fetch latest claude-cli-internal commits'),
    false,
  )
  assert.equal(
    patched.includes("What's new [ANT-ONLY: Latest CC commits]"),
    false,
  )
})

test('applyBrandingReplacements only warns about missing upstream version when requested', () => {
  const warnings = []
  const originalWarn = console.warn
  console.warn = message => {
    warnings.push(String(message))
  }

  try {
    applyBrandingReplacements('no bundle version here')
    assert.equal(warnings.length, 0)

    applyBrandingReplacements('still no bundle version', {
      warnOnMissingVersionString: true,
      sourceLabel: 'fixture-cli.js',
    })

    assert.equal(warnings.length, 1)
    assert.match(warnings[0], /fixture-cli\.js/)
    assert.match(warnings[0], /2\.1\.88/)
  } finally {
    console.warn = originalWarn
  }
})
