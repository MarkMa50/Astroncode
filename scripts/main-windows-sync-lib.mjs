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

export function getManagedRule(relativePath, config) {
  const normalizedPath = normalizePath(relativePath)
  return (config.managed ?? []).find(rule =>
    matchesAnyPattern(normalizedPath, [rule.path]),
  ) ?? null
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

  const managedRule = getManagedRule(sourcePath, config)
    ?? getManagedRule(targetPath, config)

  if (managedRule) {
    return {
      type: 'managed',
      sourcePath,
      targetPath,
      reason: 'matched managed rule',
      managedRule,
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
    if (left.equals(right)) {
      return true
    }

    const leftText = left.toString('utf8')
    const rightText = right.toString('utf8')
    return leftText.replace(/\r\n/g, '\n') === rightText.replace(/\r\n/g, '\n')
  }

  return String(left).replace(/\r\n/g, '\n') === String(right).replace(/\r\n/g, '\n')
}

function toText(content) {
  if (content == null) {
    return ''
  }

  if (Buffer.isBuffer(content)) {
    return content.toString('utf8')
  }

  return String(content)
}

function applyObjectOverrides(baseValue, overrideValue) {
  if (
    overrideValue == null
    || typeof overrideValue !== 'object'
    || Array.isArray(overrideValue)
  ) {
    return overrideValue
  }

  const nextValue = {
    ...(baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue) ? baseValue : {}),
  }

  for (const [key, value] of Object.entries(overrideValue)) {
    nextValue[key] = applyObjectOverrides(nextValue[key], value)
  }

  return nextValue
}

export function mergeManagedContent({
  sourcePath,
  sourceContent,
  targetContent,
  managedRule,
}) {
  if (managedRule.strategy === 'copy') {
    return toText(sourceContent)
  }

  if (managedRule.strategy === 'package-json') {
    const sourcePackage = JSON.parse(toText(sourceContent))
    const targetPackage = targetContent ? JSON.parse(toText(targetContent)) : {}
    const mergedPackage = {
      ...sourcePackage,
    }

    if (sourcePackage.bin) {
      mergedPackage.bin = { ...sourcePackage.bin }
    }

    if (sourcePackage.scripts) {
      mergedPackage.scripts = { ...sourcePackage.scripts }
    }

    for (const key of managedRule.dropSourceScriptKeys ?? []) {
      if (mergedPackage.scripts) {
        delete mergedPackage.scripts[key]
      }
    }

    for (const key of managedRule.preserveBinKeys ?? []) {
      if (targetPackage.bin?.[key]) {
        mergedPackage.bin = mergedPackage.bin ?? {}
        mergedPackage.bin[key] = targetPackage.bin[key]
      }
    }

    for (const key of managedRule.preserveScriptKeys ?? []) {
      if (targetPackage.scripts?.[key]) {
        mergedPackage.scripts = mergedPackage.scripts ?? {}
        mergedPackage.scripts[key] = targetPackage.scripts[key]
      }
    }

    for (const [key, value] of Object.entries(managedRule.overrides ?? {})) {
      mergedPackage[key] = applyObjectOverrides(mergedPackage[key], value)
    }

    return `${JSON.stringify(mergedPackage, null, 2)}\n`
  }

  throw new Error(`Unsupported managed sync strategy for ${sourcePath}: ${managedRule.strategy}`)
}

export function planSync({
  sourceFiles,
  targetFiles,
  config,
}) {
  const copyActions = []
  const managedActions = []
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

    if (decision.type === 'managed') {
      const mergedContent = mergeManagedContent({
        sourcePath: decision.sourcePath,
        sourceContent,
        targetContent,
        managedRule: decision.managedRule,
      })

      if (!sameContent(mergedContent, targetContent)) {
        managedActions.push({
          sourcePath: decision.sourcePath,
          targetPath: decision.targetPath,
          mode: targetContent === undefined ? 'create' : 'update',
          content: mergedContent,
          strategy: decision.managedRule.strategy,
        })
      }
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
    managedActions,
    preserveConflicts,
    blockedConflicts,
    ignoredCount,
  }
}
