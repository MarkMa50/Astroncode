import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildRuntimeWelcomeFunctionSource,
  formatWelcomeMessageCopy,
  getCompactStartupHint,
  getRecentActivityFeedCopy,
  getWhatsNewFeedCopy,
} from '../src/utils/logoPageCopy.mjs'

test('formatWelcomeMessageCopy normalizes names and falls back gracefully', () => {
  assert.equal(formatWelcomeMessageCopy('  Alice!  '), 'Welcome back, Alice.')
  assert.equal(
    formatWelcomeMessageCopy('abcdefghijklmnopqrstuv'),
    'Welcome back, abcdefghijklmnopqr.',
  )
  assert.equal(formatWelcomeMessageCopy('   '), 'Ready when you are.')
  assert.equal(formatWelcomeMessageCopy(null), 'Ready when you are.')
})

test('getCompactStartupHint prioritizes onboarding over resume and help', () => {
  assert.equal(
    getCompactStartupHint({ hasRecentActivity: true, showOnboarding: true }),
    'Tip: run /init to add project guidance',
  )
  assert.equal(
    getCompactStartupHint({ hasRecentActivity: true, showOnboarding: false }),
    'Tip: run /resume to reopen a recent session',
  )
  assert.equal(
    getCompactStartupHint({ hasRecentActivity: false, showOnboarding: false }),
    'Tip: run /help to browse commands',
  )
})

test('feed copy helpers return the updated CLI page copy', () => {
  assert.deepEqual(getRecentActivityFeedCopy(true), {
    title: '[ RECENT SESSIONS ]',
    footer: '> /resume to reopen',
    emptyMessage: 'No recent sessions yet. Start a task and it will show up here.',
  })

  assert.deepEqual(getWhatsNewFeedCopy({ hasLines: false, isInternalBuild: true }), {
    title: "What's new [internal build]",
    footer: undefined,
    emptyMessage: 'Latest internal updates will appear here.',
  })
})

test('buildRuntimeWelcomeFunctionSource stays aligned with the shared welcome copy', () => {
  const runtimeSource = buildRuntimeWelcomeFunctionSource('runtimeWelcome')
  const runtimeWelcome = new Function(`${runtimeSource}; return runtimeWelcome;`)()

  assert.equal(runtimeWelcome(' Jade, '), formatWelcomeMessageCopy(' Jade, '))
  assert.equal(runtimeWelcome('abcdefghijklmnopqrstuv'), formatWelcomeMessageCopy('abcdefghijklmnopqrstuv'))
  assert.equal(runtimeWelcome(''), formatWelcomeMessageCopy(''))
})
