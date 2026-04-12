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
  const currentCredential = getCredentialForMode(entries, currentMode)
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
    writeLine(stdout, 'Tip: if your provider gives you an OpenAI-style `/v2` endpoint, Astroncode will map it to the runtime `/anthropic` endpoint automatically.')
    writeLine(stdout)

    const mode = await askChoice(
      bridge,
      `Credential type [token/api-key] (${currentMode}): `,
      {
        token: 'token',
        t: 'token',
        'api-key': 'api-key',
        apikey: 'api-key',
        api: 'api-key',
        key: 'api-key',
        '2': 'api-key',
        '1': 'token',
      },
      currentMode,
    )

    const existingCredential = getCredentialForMode(entries, mode)
    const credentialPreview = existingCredential ? maskSecret(existingCredential) : 'not set'
    const credentialLabel = mode === 'api-key' ? 'API key' : 'Auth token'
    const credential = await askRequiredValue(
      bridge,
      `${credentialLabel} [${credentialPreview}]: `,
      existingCredential,
    )

    const baseUrl = await askRequiredValue(
      bridge,
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
    writeLine(stdout, `  Runtime URL: ${normalizeAstronBaseUrl(changes.ASTRONCODE_BASE_URL)}`)
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
  } finally {
    await bridge.close()
  }
}
