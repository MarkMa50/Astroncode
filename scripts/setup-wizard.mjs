import readline from 'node:readline/promises'

import { normalizeAstronBaseUrl, readAstronEnvConfig, writeAstronEnvFile } from './astron-env.mjs'
import { ASTRONCODE_COMMAND, ASTRONCODE_NAME } from './astron-meta.mjs'

function writeLine(stream, line = '') {
  stream.write(`${line}\n`)
}

function maskSecret(secret) {
  const value = String(secret ?? '').trim()

  if (!value) {
    return '(not set)'
  }

  if (value.length <= 10) {
    return `${value.slice(0, 2)}...${value.slice(-2)}`
  }

  return `${value.slice(0, 5)}...${value.slice(-5)}`
}

function cleanValue(value) {
  return String(value ?? '').trim()
}

function looksLikeBaseUrl(value) {
  const cleaned = cleanValue(value)
  return cleaned.startsWith('http://') || cleaned.startsWith('https://')
}

function looksLikeCredential(value) {
  const cleaned = cleanValue(value)

  if (!cleaned) {
    return false
  }

  if (looksLikeBaseUrl(cleaned)) {
    return false
  }

  if (/\s/.test(cleaned)) {
    return false
  }

  return cleaned.length >= 12
}

function inferModeFromCredential(credential, fallbackMode = 'token') {
  const cleaned = cleanValue(credential).toLowerCase()

  if (
    cleaned.startsWith('sk-') ||
    cleaned.startsWith('rk-') ||
    cleaned.startsWith('api_') ||
    cleaned.startsWith('api-') ||
    cleaned.startsWith('key-')
  ) {
    return 'api-key'
  }

  return fallbackMode === 'api-key' ? 'api-key' : 'token'
}

function normalizeStoredBaseUrl(baseUrl) {
  return cleanValue(baseUrl).replace(/\/+$/, '')
}

function getProviderMode(entries = {}) {
  if (entries.ASTRONCODE_AUTH_TOKEN) {
    return 'token'
  }

  if (entries.ASTRONCODE_API_KEY) {
    return 'api-key'
  }

  return 'token'
}

function getCredentialForMode(entries, mode) {
  return mode === 'api-key'
    ? cleanValue(entries.ASTRONCODE_API_KEY)
    : cleanValue(entries.ASTRONCODE_AUTH_TOKEN)
}

function createPromptBridge({ input, output, prompt }) {
  if (typeof prompt === 'function') {
    return {
      async ask(message) {
        return cleanValue(await prompt(message))
      },
      async close() {},
    }
  }

  const rl = readline.createInterface({
    input,
    output,
    terminal: Boolean(input?.isTTY && output?.isTTY),
  })

  return {
    async ask(message) {
      return cleanValue(await rl.question(message))
    },
    async close() {
      rl.close()
    },
  }
}

async function askChoice(bridge, message, choices, fallback) {
  while (true) {
    const answer = await bridge.ask(message)

    if (!answer) {
      return fallback
    }

    const normalized = answer.toLowerCase()

    if (choices[normalized]) {
      return choices[normalized]
    }
  }
}

async function askRequiredValue(bridge, message, fallback = '') {
  while (true) {
    const answer = await bridge.ask(message)

    if (answer) {
      return answer
    }

    if (fallback) {
      return fallback
    }
  }
}

async function askBaseUrl(bridge, stdout, message, fallback = '') {
  while (true) {
    const answer = await askRequiredValue(bridge, message, fallback)

    if (looksLikeBaseUrl(answer)) {
      return answer
    }

    writeLine(stdout, 'Please enter a valid URL starting with http:// or https://')
  }
}

async function askProviderMode({ bridge, stdout, currentMode }) {
  const modeChoices = {
    token: 'token',
    t: 'token',
    'api-key': 'api-key',
    apikey: 'api-key',
    api: 'api-key',
    key: 'api-key',
    '2': 'api-key',
    '1': 'token',
  }

  while (true) {
    const answer = await bridge.ask(`Credential type [token/api-key] (${currentMode}): `)

    if (!answer) {
      return {
        mode: currentMode,
        prefetchedCredential: '',
      }
    }

    const normalized = answer.toLowerCase()

    if (modeChoices[normalized]) {
      return {
        mode: modeChoices[normalized],
        prefetchedCredential: '',
      }
    }

    if (looksLikeCredential(answer)) {
      const inferredMode = inferModeFromCredential(answer, currentMode)
      const inferredLabel = inferredMode === 'api-key' ? 'API key' : 'auth token'

      writeLine(stdout, `Detected a pasted ${inferredLabel}. Continuing with that value.`)

      return {
        mode: inferredMode,
        prefetchedCredential: cleanValue(answer),
      }
    }

    if (looksLikeBaseUrl(answer)) {
      writeLine(
        stdout,
        'That looks like a provider URL. First enter `token` or `api-key`, or just paste your credential here.',
      )
      continue
    }

    writeLine(
      stdout,
      'Please enter `token` or `api-key`, or paste your provider credential directly at this prompt.',
    )
  }
}

export function isProviderReady(entries = {}) {
  const credential = cleanValue(entries.ASTRONCODE_AUTH_TOKEN || entries.ASTRONCODE_API_KEY)
  const baseUrl = cleanValue(entries.ASTRONCODE_BASE_URL)
  const model = cleanValue(entries.ASTRONCODE_MODEL)

  return Boolean(credential && baseUrl && model)
}

export function buildSetupChanges({
  mode = 'token',
  credential = '',
  baseUrl = '',
  model = '',
}) {
  const normalizedMode = mode === 'api-key' ? 'api-key' : 'token'

  return {
    ASTRONCODE_AUTH_TOKEN: normalizedMode === 'token' ? cleanValue(credential) : null,
    ASTRONCODE_API_KEY: normalizedMode === 'api-key' ? cleanValue(credential) : null,
    ASTRONCODE_BASE_URL: normalizeStoredBaseUrl(baseUrl),
    ASTRONCODE_MODEL: cleanValue(model),
  }
}

export function shouldAutoLaunchSetup({ argv = [], entries = {} }) {
  return Array.isArray(argv) && argv.filter(Boolean).length === 0 && !isProviderReady(entries)
}

export async function runSetupWizard({
  projectRoot,
  stdout = process.stdout,
  stdin = process.stdin,
  prompt,
} = {}) {
  const { filePath, entries } = readAstronEnvConfig(projectRoot)
  const currentMode = getProviderMode(entries)
  const currentBaseUrl = cleanValue(entries.ASTRONCODE_BASE_URL)
  const currentModel = cleanValue(entries.ASTRONCODE_MODEL)

  if (!prompt && !(stdin?.isTTY && stdout?.isTTY)) {
    writeLine(stdout, `${ASTRONCODE_NAME} setup wizard requires an interactive terminal.`)
    writeLine(stdout, `Run \`${ASTRONCODE_COMMAND} setup\` from a local shell to configure your provider.`)

    return {
      handled: true,
      completed: false,
      exitCode: 1,
      filePath,
    }
  }

  const bridge = createPromptBridge({
    input: stdin,
    output: stdout,
    prompt,
  })

  try {
    writeLine(stdout, `${ASTRONCODE_NAME} setup wizard`)
    writeLine(stdout, `Config file: ${filePath}`)
    writeLine(stdout)
    writeLine(stdout, 'We will configure your local provider credentials for this machine.')
    writeLine(stdout, 'Press Enter to keep the current value shown in brackets.')
    writeLine(stdout, 'You can paste your provider credential directly at the first prompt if that is easier.')
    writeLine(stdout, 'Tip: if your provider gives you an OpenAI-style `/v2` endpoint, Astroncode will normalize it for the local runtime automatically.')
    writeLine(stdout)

    const { mode, prefetchedCredential } = await askProviderMode({
      bridge,
      stdout,
      currentMode,
    })

    const existingCredential = getCredentialForMode(entries, mode)
    const credentialLabel = mode === 'api-key' ? 'API key' : 'Auth token'
    const credential =
      prefetchedCredential ||
      (await askRequiredValue(
        bridge,
        `${credentialLabel} [${existingCredential ? maskSecret(existingCredential) : 'not set'}]: `,
        existingCredential,
      ))

    const baseUrl = await askBaseUrl(
      bridge,
      stdout,
      `Provider base URL [${currentBaseUrl || 'https://provider.example.com/v2'}]: `,
      currentBaseUrl,
    )

    const model = await askRequiredValue(
      bridge,
      `Model ID [${currentModel || 'astron-code-latest'}]: `,
      currentModel,
    )

    const changes = buildSetupChanges({
      mode,
      credential,
      baseUrl,
      model,
    })

    writeLine(stdout)
    writeLine(stdout, 'Provider summary')
    writeLine(stdout, `  Credential type: ${mode}`)
    writeLine(stdout, `  Credential: ${maskSecret(credential)}`)
    writeLine(stdout, `  Base URL: ${changes.ASTRONCODE_BASE_URL}`)
    writeLine(stdout, '  Runtime routing: normalized automatically for the local Astroncode runtime')
    writeLine(stdout, `  Model: ${changes.ASTRONCODE_MODEL}`)
    writeLine(stdout)

    const shouldSave = await askChoice(
      bridge,
      'Save these settings? [Y/n]: ',
      {
        y: 'yes',
        yes: 'yes',
        n: 'no',
        no: 'no',
      },
      'yes',
    )

    if (shouldSave !== 'yes') {
      writeLine(stdout, 'Setup cancelled. Your existing provider settings were not changed.')

      return {
        handled: true,
        completed: false,
        exitCode: 0,
        filePath,
      }
    }

    const result = writeAstronEnvFile(projectRoot, changes)

    writeLine(stdout, `Saved provider settings to ${result.filePath}`)
    writeLine(stdout, `You can re-open this wizard any time with \`${ASTRONCODE_COMMAND} setup\`.`)
    writeLine(stdout, `Next: run \`${ASTRONCODE_COMMAND} doctor\` to validate the local runtime, or launch \`${ASTRONCODE_COMMAND}\` directly.`)

    return {
      handled: true,
      completed: true,
      exitCode: 0,
      filePath: result.filePath,
      entries: result.entries,
    }
  } catch (error) {
    if (error?.code === 'ABORT_ERR') {
      writeLine(stdout)
      writeLine(stdout, 'Setup cancelled.')

      return {
        handled: true,
        completed: false,
        exitCode: 130,
        filePath,
      }
    }

    throw error
  } finally {
    await bridge.close()
  }
}
