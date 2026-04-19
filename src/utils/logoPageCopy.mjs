function normalizeDisplayName(username) {
  if (typeof username !== 'string') return null

  const trimmed = username.trim()
  if (!trimmed) return null

  const firstToken = trimmed.split(/\s+/)[0]?.replace(/[,:;.!?]+$/g, '')
  if (!firstToken) return null

  return firstToken.length > 18 ? firstToken.slice(0, 18) : firstToken
}

export function formatWelcomeMessageCopy(username) {
  const displayName = normalizeDisplayName(username)
  if (displayName) {
    return `Welcome back, ${displayName}.`
  }

  return 'Ready when you are.'
}

export function getCompactStartupHint({
  hasRecentActivity = false,
  showOnboarding = false,
} = {}) {
  if (showOnboarding) {
    return 'Tip: run /init to add project guidance'
  }

  if (hasRecentActivity) {
    return 'Tip: run /resume to reopen a recent session'
  }

  return 'Tip: run /help to browse commands'
}

export function getRecentActivityFeedCopy(hasLines) {
  return {
    title: '[ RECENT SESSIONS ]',
    footer: hasLines ? '> /resume to reopen' : undefined,
    emptyMessage: 'No recent sessions yet. Start a task and it will show up here.',
  }
}

export function getWhatsNewFeedCopy({ hasLines, isInternalBuild = false }) {
  return {
    title: isInternalBuild
      ? "What's new [internal build]"
      : "What's new",
    footer: hasLines ? '> /release-notes' : undefined,
    emptyMessage: isInternalBuild
      ? 'Latest internal updates will appear here.'
      : 'Latest Astroncode updates will appear here.',
  }
}

export function buildRuntimeWelcomeFunctionSource(functionName = 'FF8') {
  return `function ${functionName}(q){let K=typeof q=="string"?q.trim():"";if(K){let _=K.split(/\\s+/)[0]?.replace(/[,:;.!?]+$/g,"")||"";if(_.length>18)_=_.slice(0,18);if(_)return\`Welcome back, \${_}.\`}return"Ready when you are."}`
}
