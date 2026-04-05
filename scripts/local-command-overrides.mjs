import path from 'node:path'

import { ASTRONCODE_COMMAND, ASTRONCODE_NAME, ASTRONCODE_VERSION } from './astron-meta.mjs'
import {
  normalizeAstronBaseUrl,
  readAstronEnvConfig,
  writeAstronEnvFile,
} from './astron-env.mjs'
import { ensureRuntimeBrandingBundle } from './runtime-branding.mjs'

function writeLine(stream, line = '') {
  stream.write(`${line}\n`)
}

function hasFlag(argv, ...flags) {
  return argv.some(arg => flags.includes(arg))
}

function writeLines(stream, lines) {
  for (const line of lines) {
    writeLine(stream, line)
  }
}

function readOption(argv, optionName) {
  const longName = `--${optionName}`

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === longName) {
      return argv[index + 1]
    }

    if (arg.startsWith(`${longName}=`)) {
      return arg.slice(longName.length + 1)
    }
  }

  return undefined
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

function isHelpRequest(argv) {
  return hasFlag(argv, '-h', '--help')
}

function getAuthState(projectRoot) {
  const { filePath, exists, entries } = readAstronEnvConfig(projectRoot)
  const authToken = entries.ASTRONCODE_AUTH_TOKEN || ''
  const apiKey = entries.ASTRONCODE_API_KEY || ''
  const baseUrl = entries.ASTRONCODE_BASE_URL || ''
  const normalizedBaseUrl = normalizeAstronBaseUrl(baseUrl)
  const model = entries.ASTRONCODE_MODEL || ''
  const credential = authToken || apiKey
  const providerMode = authToken ? 'auth-token' : apiKey ? 'api-key' : 'missing'

  return {
    filePath,
    exists,
    authToken,
    apiKey,
    baseUrl,
    normalizedBaseUrl,
    model,
    credential,
    providerMode,
    ready: Boolean(credential && baseUrl && model),
  }
}

function buildAuthStatusPayload(state) {
  return {
    configFile: state.filePath,
    authStatus: state.ready ? 'configured' : 'missing-local-provider-settings',
    providerMode: state.providerMode,
    credentialMasked: maskSecret(state.credential),
    baseUrl: state.baseUrl || null,
    runtimeBaseUrl: state.normalizedBaseUrl || null,
    model: state.model || null,
    ready: state.ready,
  }
}

function printAuthStatus(stdout, projectRoot, options = {}) {
  const state = getAuthState(projectRoot)
  const payload = buildAuthStatusPayload(state)

  if (options.json) {
    writeLine(stdout, JSON.stringify(payload, null, 2))
    return state
  }

  writeLine(stdout, `${ASTRONCODE_NAME} auth status`)
  writeLine(stdout, `Config file: ${state.filePath}`)
  writeLine(stdout, `Auth status: ${state.ready ? 'configured' : 'missing local provider settings'}`)
  writeLine(stdout, `Provider mode: ${state.providerMode}`)
  writeLine(stdout, `Credential: ${maskSecret(state.credential)}`)
  writeLine(stdout, `Base URL: ${state.baseUrl || '(not set)'}`)
  writeLine(stdout, `Runtime base URL: ${state.normalizedBaseUrl || '(not set)'}`)
  writeLine(stdout, `Model: ${state.model || '(not set)'}`)
  writeLine(stdout, `Ready for launch: ${state.ready ? 'yes' : 'no'}`)

  return state
}

function writeAuthGroupHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} auth <command>`,
    '',
    `Manage local ${ASTRONCODE_NAME} provider credentials.`,
    '',
    'Commands:',
    '  login [options]   Configure or update local provider credentials',
    '  logout            Remove locally stored provider credentials',
    '  status [options]  Show local authentication status',
    '',
    `Run \`${ASTRONCODE_COMMAND} auth <command> --help\` for command-specific options.`,
  ])
}

function writeAuthLoginHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} auth login [options]`,
    '',
    `Configure local provider credentials for ${ASTRONCODE_NAME}.`,
    '',
    'Options:',
    '  --token <token>      Store a bearer token as ASTRONCODE_AUTH_TOKEN',
    '  --api-key <key>      Store an API key as ASTRONCODE_API_KEY',
    '  --base-url <url>     Set the provider base URL',
    '  --model <model>      Set the default model ID',
    '  -h, --help           Display help for command',
    '',
    'Examples:',
    `  ${ASTRONCODE_COMMAND} auth login --token "<provider-token>" --base-url "<provider-url>" --model "<model-id>"`,
    `  ${ASTRONCODE_COMMAND} auth login --api-key "<provider-key>" --base-url "<provider-url>" --model "<model-id>"`,
  ])
}

function writeAuthStatusHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} auth status [options]`,
    '',
    `Show local authentication status for ${ASTRONCODE_NAME}.`,
    '',
    'Options:',
    '  --json               Output machine-readable JSON',
    '  --text               Output human-readable text (default)',
    '  -h, --help           Display help for command',
  ])
}

function writeAuthLogoutHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} auth logout`,
    '',
    'Remove locally stored provider credentials from `.env.astroncode`.',
    '',
    'Options:',
    '  -h, --help           Display help for command',
  ])
}

function writeSetupTokenHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} setup-token`,
    '',
    `Show local token setup guidance for ${ASTRONCODE_NAME}.`,
    '',
    'This command explains how to store provider credentials in `.env.astroncode`.',
  ])
}

function writeDoctorHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} doctor`,
    '',
    'Run local diagnostics for provider configuration and branded runtime health.',
    '',
    'Checks:',
    '  - local config file presence',
    '  - provider credential availability',
    '  - base URL normalization',
    '  - default model configuration',
    '  - branded runtime cache generation',
  ])
}

function writeInstallHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} install [target]`,
    '',
    `Show local install status for this ${ASTRONCODE_NAME} build.`,
    '',
    'This local build provides local status only and does not fetch upstream binaries. Use this command to inspect',
    'the current install path and requested target only.',
  ])
}

function writeUpdateHelp(stdout, command = 'update') {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} ${command}`,
    '',
    `Show the current ${ASTRONCODE_NAME} version and local update guidance.`,
    '',
    'This local build does not self-update from hosted release infrastructure.',
  ])
}

function writeAssistantHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} assistant [session-id]`,
    '',
    'Assistant bridge mode is not available in this local build.',
    '',
    `Use \`${ASTRONCODE_COMMAND}\`, \`${ASTRONCODE_COMMAND} -c\`, or \`${ASTRONCODE_COMMAND} -r <session-id>\` for local sessions.`,
  ])
}

function writeRemoteHelp(stdout) {
  writeLines(stdout, [
    `Usage: ${ASTRONCODE_COMMAND} remote-control`,
    `Usage: ${ASTRONCODE_COMMAND} --remote "<task>"`,
    '',
    `Remote control is unavailable in this local ${ASTRONCODE_NAME} build.`,
    '',
    `Use \`${ASTRONCODE_COMMAND}\` or \`${ASTRONCODE_COMMAND} -p\` for local runs.`,
    `Example: ${ASTRONCODE_COMMAND} -p "<task>"`,
  ])
}

function detectBridgeInvocation(args) {
  const commandAliases = new Set(['remote-control', 'rc', 'remote', 'sync', 'bridge'])

  if (args.length === 0) {
    return null
  }

  if (commandAliases.has(args[0])) {
    return { type: 'remote-control', args: args.slice(1) }
  }

  if (args[0] === 'assistant') {
    return { type: 'assistant', args: args.slice(1) }
  }

  if (hasFlag(args, '--remote-control', '--rc', '--remote')) {
    return { type: 'remote-control', args }
  }

  return null
}

function handleAuthStatus({ argv, projectRoot, stdout }) {
  if (isHelpRequest(argv)) {
    writeAuthStatusHelp(stdout)
    return {
      handled: true,
      exitCode: 0,
    }
  }

  printAuthStatus(stdout, projectRoot, { json: hasFlag(argv, '--json') })

  return {
    handled: true,
    exitCode: 0,
  }
}

function handleAuthLogin({ argv, projectRoot, stdout }) {
  if (isHelpRequest(argv)) {
    writeAuthLoginHelp(stdout)
    return {
      handled: true,
      exitCode: 0,
    }
  }

  const token = readOption(argv, 'token')
  const apiKey = readOption(argv, 'api-key')
  const baseUrl = readOption(argv, 'base-url')
  const model = readOption(argv, 'model')

  if (token === undefined && apiKey === undefined && baseUrl === undefined && model === undefined) {
    const state = printAuthStatus(stdout, projectRoot)
    writeLine(stdout)
    writeLine(
      stdout,
      `Use \`${ASTRONCODE_COMMAND} auth login --token "<provider-token>" --base-url "<provider-url>" --model "<model-id>"\` to update local credentials.`,
    )

    if (state.ready) {
      writeLine(stdout, `Local provider credentials are already configured for this ${ASTRONCODE_NAME} build.`)
    }

    return {
      handled: true,
      exitCode: 0,
    }
  }

  const changes = {}

  if (token !== undefined) {
    changes.ASTRONCODE_AUTH_TOKEN = token
    changes.ASTRONCODE_API_KEY = null
  }

  if (apiKey !== undefined) {
    changes.ASTRONCODE_API_KEY = apiKey
    changes.ASTRONCODE_AUTH_TOKEN = null
  }

  if (baseUrl !== undefined) {
    changes.ASTRONCODE_BASE_URL = baseUrl
  }

  if (model !== undefined) {
    changes.ASTRONCODE_MODEL = model
  }

  const result = writeAstronEnvFile(projectRoot, changes)

  writeLine(stdout, `[${ASTRONCODE_NAME}] Updated local provider settings in ${result.filePath}`)
  writeLine(stdout)
  printAuthStatus(stdout, projectRoot)

  return {
    handled: true,
    exitCode: 0,
  }
}

function handleAuthLogout({ projectRoot, stdout }) {
  const state = getAuthState(projectRoot)

  writeAstronEnvFile(projectRoot, {
    ASTRONCODE_AUTH_TOKEN: null,
    ASTRONCODE_API_KEY: null,
  })

  if (state.credential) {
    writeLine(stdout, `[${ASTRONCODE_NAME}] Removed local provider credentials from ${state.filePath}`)
  } else {
    writeLine(stdout, `[${ASTRONCODE_NAME}] No local provider credentials were stored in ${state.filePath}`)
  }

  return {
    handled: true,
    exitCode: 0,
  }
}

function handleSetupToken({ argv, projectRoot, stdout }) {
  if (isHelpRequest(argv)) {
    writeSetupTokenHelp(stdout)
    return {
      handled: true,
      exitCode: 0,
    }
  }

  writeLine(stdout, `${ASTRONCODE_NAME} token setup`)
  writeLine(stdout, 'Store your provider token in `.env.astroncode` or use the local login helper below:')
  writeLine(
    stdout,
    `${ASTRONCODE_COMMAND} auth login --token "<provider-token>" --base-url "<provider-url>" --model "<model-id>"`,
  )
  writeLine(stdout)
  printAuthStatus(stdout, projectRoot)

  return {
    handled: true,
    exitCode: 0,
  }
}

async function handleDoctor({ argv, projectRoot, stdout }) {
  if (isHelpRequest(argv)) {
    writeDoctorHelp(stdout)
    return {
      handled: true,
      exitCode: 0,
    }
  }

  const state = getAuthState(projectRoot)
  const runtimeSource = path.join(projectRoot, 'cli.js')
  const runtimeCacheDir = path.join(projectRoot, '.astroncode-runtime')
  const checks = [
    { status: 'ok', label: 'Node.js runtime', detail: process.version },
    {
      status: state.exists ? 'ok' : 'warn',
      label: 'Local config file',
      detail: state.exists ? state.filePath : `Missing ${state.filePath}`,
    },
    {
      status: state.credential ? 'ok' : 'warn',
      label: 'Local provider credentials',
      detail: state.credential ? `${state.providerMode} ${maskSecret(state.credential)}` : 'No token or API key configured',
    },
    {
      status: state.baseUrl ? 'ok' : 'warn',
      label: 'Base URL normalized',
      detail: state.baseUrl ? state.normalizedBaseUrl : 'No provider base URL configured',
    },
    {
      status: state.model ? 'ok' : 'warn',
      label: 'Model configured',
      detail: state.model || 'No model configured',
    },
  ]

  try {
    const brandedRuntime = await ensureRuntimeBrandingBundle(runtimeSource, runtimeCacheDir)
    checks.push({
      status: 'ok',
      label: 'Runtime branding cache',
      detail: brandedRuntime.runtimeFile,
    })
  } catch (error) {
    checks.push({
      status: 'fail',
      label: 'Runtime branding cache',
      detail: error.message,
    })
  }

  const isReady = checks.every(check => check.status === 'ok')

  writeLine(stdout, `${ASTRONCODE_NAME} doctor (${ASTRONCODE_VERSION})`)
  for (const check of checks) {
    writeLine(stdout, `[${check.status}] ${check.label}: ${check.detail}`)
  }
  writeLine(stdout, `Ready: ${isReady ? 'yes' : 'no'}`)

  return {
    handled: true,
    exitCode: isReady ? 0 : 1,
  }
}

function handleLocalInstallInfo({ command, argv, projectRoot, stdout }) {
  if (isHelpRequest(argv)) {
    if (command === 'install') {
      writeInstallHelp(stdout)
    } else {
      writeUpdateHelp(stdout, command)
    }

    return {
      handled: true,
      exitCode: 0,
    }
  }

  const target = argv.find(arg => !arg.startsWith('-'))
  const verb =
    command === 'install'
      ? 'already installed'
      : command === 'upgrade'
        ? 'already up to date'
        : 'current local version'

  writeLine(stdout, `${ASTRONCODE_NAME} ${ASTRONCODE_VERSION} is ${verb} at ${projectRoot}.`)
  writeLine(stdout, `The \`${command}\` command in this local build shows local status only and does not fetch upstream binaries.`)
  if (target) {
    writeLine(stdout, `Requested target: ${target}`)
  }

  return {
    handled: true,
    exitCode: 0,
  }
}

function handleBridgeCommand({ type, argv, stdout }) {
  if (isHelpRequest(argv)) {
    if (type === 'assistant') {
      writeAssistantHelp(stdout)
    } else {
      writeRemoteHelp(stdout)
    }

    return {
      handled: true,
      exitCode: 0,
    }
  }

  if (type === 'assistant') {
    writeAssistantHelp(stdout)
  } else {
    writeRemoteHelp(stdout)
  }

  return {
    handled: true,
    exitCode: 2,
  }
}

export async function runLocalAstronCommand({
  argv,
  projectRoot,
  stdout = process.stdout,
}) {
  const args = argv.filter(Boolean)
  if (args.length === 0) {
    return {
      handled: false,
      exitCode: 0,
    }
  }

  const [command, subcommand] = args

  const bridgeInvocation = detectBridgeInvocation(args)
  if (bridgeInvocation) {
    return handleBridgeCommand({
      type: bridgeInvocation.type,
      argv: bridgeInvocation.args,
      stdout,
    })
  }

  if (command === 'auth' && (args.length === 1 || subcommand === 'help' || subcommand === '-h' || subcommand === '--help')) {
    writeAuthGroupHelp(stdout)
    return {
      handled: true,
      exitCode: 0,
    }
  }

  if (command === 'auth' && subcommand === 'status') {
    return handleAuthStatus({ argv: args.slice(2), projectRoot, stdout })
  }

  if (command === 'auth' && subcommand === 'login') {
    return handleAuthLogin({ argv: args.slice(2), projectRoot, stdout })
  }

  if (command === 'auth' && subcommand === 'logout') {
    if (isHelpRequest(args.slice(2))) {
      writeAuthLogoutHelp(stdout)
      return {
        handled: true,
        exitCode: 0,
      }
    }

    return handleAuthLogout({ projectRoot, stdout })
  }

  if (command === 'setup-token') {
    return handleSetupToken({ argv: args.slice(1), projectRoot, stdout })
  }

  if (command === 'doctor') {
    return handleDoctor({ argv: args.slice(1), projectRoot, stdout })
  }

  if (command === 'install' || command === 'update' || command === 'upgrade') {
    return handleLocalInstallInfo({ command, argv: args.slice(1), projectRoot, stdout })
  }

  return {
    handled: false,
    exitCode: 0,
  }
}
