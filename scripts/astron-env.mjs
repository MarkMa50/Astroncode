import fs from 'node:fs'
import path from 'node:path'

const ASTRON_ENV_FILE = '.env.astroncode'

const ASTRON_TO_RUNTIME_ENV = {
  ASTRONCODE_API_KEY: 'ANTHROPIC_API_KEY',
  ASTRONCODE_AUTH_TOKEN: 'ANTHROPIC_AUTH_TOKEN',
  ASTRONCODE_BASE_URL: 'ANTHROPIC_BASE_URL',
  ASTRONCODE_MODEL: 'ANTHROPIC_MODEL',
}

export function normalizeAstronBaseUrl(baseUrl) {
  if (!baseUrl) {
    return baseUrl
  }

  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  if (trimmed.endsWith('/v2')) {
    return `${trimmed.slice(0, -3)}/anthropic`
  }

  return trimmed
}

export function parseEnvFileContent(content) {
  const entries = {}

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key) {
      entries[key] = value
    }
  }

  return entries
}

export function getAstronEnvFilePath(cwd = process.cwd()) {
  return path.join(cwd, ASTRON_ENV_FILE)
}

export function readAstronEnvConfig(cwd = process.cwd()) {
  const filePath = getAstronEnvFilePath(cwd)
  const exists = fs.existsSync(filePath)
  const content = exists ? fs.readFileSync(filePath, 'utf8') : ''

  return {
    filePath,
    exists,
    content,
    entries: parseEnvFileContent(content),
  }
}

function formatEnvValue(value) {
  const stringValue = String(value ?? '')

  if (stringValue === '') {
    return '""'
  }

  if (/^[A-Za-z0-9_./:\\-]+$/.test(stringValue)) {
    return stringValue
  }

  return JSON.stringify(stringValue)
}

export function updateEnvFileContent(content, changes = {}) {
  const pending = new Map(Object.entries(changes))
  const sourceLines = content ? content.split(/\r?\n/) : []
  const nextLines = []

  for (const rawLine of sourceLines) {
    const trimmed = rawLine.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      nextLines.push(rawLine)
      continue
    }

    const separatorIndex = rawLine.indexOf('=')
    if (separatorIndex === -1) {
      nextLines.push(rawLine)
      continue
    }

    const key = rawLine.slice(0, separatorIndex).trim()
    if (!pending.has(key)) {
      nextLines.push(rawLine)
      continue
    }

    const nextValue = pending.get(key)
    pending.delete(key)

    if (nextValue == null) {
      continue
    }

    nextLines.push(`${key}=${formatEnvValue(nextValue)}`)
  }

  for (const [key, value] of pending) {
    if (value == null) {
      continue
    }

    nextLines.push(`${key}=${formatEnvValue(value)}`)
  }

  while (nextLines.length > 0 && nextLines[nextLines.length - 1] === '') {
    nextLines.pop()
  }

  if (nextLines.length === 0) {
    return ''
  }

  return `${nextLines.join('\n')}\n`
}

export function writeAstronEnvFile(cwd = process.cwd(), changes = {}) {
  const current = readAstronEnvConfig(cwd)
  const content = updateEnvFileContent(current.content, changes)

  fs.writeFileSync(current.filePath, content, 'utf8')

  return {
    filePath: current.filePath,
    content,
    entries: parseEnvFileContent(content),
  }
}

export function loadAstronEnvFile(cwd = process.cwd()) {
  return readAstronEnvConfig(cwd).entries
}

export function applyAstronEnv(baseEnv) {
  const env = { ...baseEnv }

  for (const [sourceKey, targetKey] of Object.entries(ASTRON_TO_RUNTIME_ENV)) {
    if (env[sourceKey]) {
      env[targetKey] = env[sourceKey]
    }
  }

  if (env.ASTRONCODE_BASE_URL) {
    env.ANTHROPIC_BASE_URL = normalizeAstronBaseUrl(env.ASTRONCODE_BASE_URL)
  }

  if (env.ASTRONCODE_MODEL && !env.ANTHROPIC_SMALL_FAST_MODEL) {
    env.ANTHROPIC_SMALL_FAST_MODEL = env.ASTRONCODE_MODEL
  }

  if (!env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC) {
    env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = '1'
  }

  if (!env.DISABLE_TELEMETRY) {
    env.DISABLE_TELEMETRY = '1'
  }

  return env
}
