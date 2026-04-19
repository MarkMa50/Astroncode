function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

function globToRegExp(pattern) {
  let output = '^'

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index]
    const next = pattern[index + 1]
    const nextNext = pattern[index + 2]

    if (char === '*') {
      if (next === '*' && nextNext === '/') {
        output += '(?:.*/)?'
        index += 2
        continue
      }

      if (next === '*') {
        output += '.*'
        index += 1
        continue
      }

      output += '[^/]*'
      continue
    }

    output += escapeRegExp(char)
  }

  output += '$'
  return new RegExp(output)
}

export function normalizePath(relativePath) {
  return String(relativePath)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
}

export function applyRenameMap(relativePath, renameMap = []) {
  const normalizedPath = normalizePath(relativePath)

  for (const rule of renameMap) {
    const sourcePrefix = normalizePath(rule.source ?? '')
    const targetPrefix = normalizePath(rule.target ?? '')

    if (
      normalizedPath === sourcePrefix
      || normalizedPath.startsWith(`${sourcePrefix}/`)
      || (sourcePrefix.endsWith('/') && normalizedPath.startsWith(sourcePrefix))
    ) {
      return normalizePath(
        `${targetPrefix}${normalizedPath.slice(sourcePrefix.length)}`,
      )
    }
  }

  return normalizedPath
}

export function matchesAnyPattern(relativePath, patterns = []) {
  const normalizedPath = normalizePath(relativePath)
  return patterns.some(pattern => globToRegExp(normalizePath(pattern)).test(normalizedPath))
}

export function classifyPath(relativePath, config) {
  const sourcePath = normalizePath(relativePath)
  const targetPath = applyRenameMap(sourcePath, config.renameMap)

  if (
    matchesAnyPattern(sourcePath, config.shared?.exclude)
    || matchesAnyPattern(targetPath, config.shared?.exclude)
  ) {
    return {
      type: 'ignored',
      sourcePath,
      targetPath,
      reason: 'matched shared exclude rule',
    }
  }

  if (
    matchesAnyPattern(sourcePath, config.preserve)
    || matchesAnyPattern(targetPath, config.preserve)
  ) {
    return {
      type: 'preserve',
      sourcePath,
      targetPath,
      reason: 'matched preserve rule',
    }
  }

  if (
    matchesAnyPattern(sourcePath, config.blocked)
    || matchesAnyPattern(targetPath, config.blocked)
  ) {
    return {
      type: 'blocked',
      sourcePath,
      targetPath,
      reason: 'matched blocked rule',
    }
  }

  if (
    matchesAnyPattern(sourcePath, config.shared?.include)
    || matchesAnyPattern(targetPath, config.shared?.include)
  ) {
    return {
      type: 'shared',
      sourcePath,
      targetPath,
      reason: 'matched shared include rule',
    }
  }

  return {
    type: 'ignored',
    sourcePath,
    targetPath,
    reason: 'no sync rule matched',
  }
}

function sameContent(left, right) {
  if (left === undefined && right === undefined) {
    return true
  }

  if (left === undefined || right === undefined) {
    return false
  }

  if (Buffer.isBuffer(left) && Buffer.isBuffer(right)) {
    return left.equals(right)
  }

  return String(left) === String(right)
}

export function planSync({
  sourceFiles,
  targetFiles,
  config,
}) {
  const copyActions = []
  const preserveConflicts = []
  const blockedConflicts = []
  let ignoredCount = 0

  for (const [sourcePath, sourceContent] of [...sourceFiles.entries()].sort()) {
    const decision = classifyPath(sourcePath, config)
    const targetContent = targetFiles.get(decision.targetPath)
    const differs = !sameContent(sourceContent, targetContent)

    if (decision.type === 'ignored') {
      ignoredCount += 1
      continue
    }

    if (!differs) {
      continue
    }

    if (decision.type === 'shared') {
      copyActions.push({
        sourcePath: decision.sourcePath,
        targetPath: decision.targetPath,
        mode: targetContent === undefined ? 'create' : 'update',
      })
      continue
    }

    if (decision.type === 'preserve') {
      preserveConflicts.push({
        sourcePath: decision.sourcePath,
        targetPath: decision.targetPath,
        reason: decision.reason,
      })
      continue
    }

    if (decision.type === 'blocked') {
      blockedConflicts.push({
        sourcePath: decision.sourcePath,
        targetPath: decision.targetPath,
        reason: decision.reason,
      })
    }
  }

  return {
    copyActions,
    preserveConflicts,
    blockedConflicts,
    ignoredCount,
  }
}
