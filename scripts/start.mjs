import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { applyAstronEnv, loadAstronEnvFile } from './astron-env.mjs'
import { ASTRONCODE_NAME } from './astron-meta.mjs'
import { runLocalAstronCommand } from './local-command-overrides.mjs'
import { ensureRuntimeBrandingBundle } from './runtime-branding.mjs'
import {
  isPrintInvocation,
  normalizeWindowsPrintRuntimeResult,
} from './runtime-exit-normalizer.mjs'
import { detectUnsupportedAstronInvocation } from './runtime-guards.mjs'
import { runSetupWizard, shouldAutoLaunchSetup } from './setup-wizard.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const cliEntry = path.join(projectRoot, 'cli.js')
const runtimeCacheDir = path.join(projectRoot, '.astroncode-runtime')
const astronSystemPromptFile = path.join(__dirname, 'astron-system-prompt.txt')
const launchArgs = process.argv.slice(2)

// Windows: Set stdin to UTF-8 mode for Chinese/CJK input
if (process.platform === 'win32' && process.stdin.isTTY) {
  process.stdin.setEncoding('utf8')
}

function hasPromptOverride(argv) {
  return argv.some(
    arg =>
      arg === '--system-prompt' ||
      arg === '--system-prompt-file' ||
      arg === '--append-system-prompt' ||
      arg === '--append-system-prompt-file' ||
      arg.startsWith('--system-prompt=') ||
      arg.startsWith('--system-prompt-file=') ||
      arg.startsWith('--append-system-prompt=') ||
      arg.startsWith('--append-system-prompt-file='),
  )
}

const runtimeArgs = hasPromptOverride(launchArgs)
  ? launchArgs
  : ['--append-system-prompt-file', astronSystemPromptFile, ...launchArgs]

const localCommand = await runLocalAstronCommand({
  argv: launchArgs,
  projectRoot,
  stdout: process.stdout,
})

if (localCommand.handled) {
  process.exit(localCommand.exitCode ?? 0)
}

const initialConfig = loadAstronEnvFile(projectRoot)

if (shouldAutoLaunchSetup({ argv: launchArgs, entries: initialConfig })) {
  const setupResult = await runSetupWizard({
    projectRoot,
    stdout: process.stdout,
    stdin: process.stdin,
  })

  if (!setupResult.completed) {
    process.exit(setupResult.exitCode ?? 0)
  }
}

const unsupported = detectUnsupportedAstronInvocation(launchArgs)

if (unsupported) {
  console.error(unsupported.message)
  process.exit(unsupported.exitCode ?? 2)
}

let runtimeEntry = cliEntry

try {
  const brandedRuntime = await ensureRuntimeBrandingBundle(cliEntry, runtimeCacheDir)
  runtimeEntry = brandedRuntime.runtimeFile
} catch (error) {
  console.error(`[${ASTRONCODE_NAME}] Failed to synchronize runtime branding:`, error.message)
  process.exit(1)
}

const mergedEnv = applyAstronEnv({
  ...process.env,
  ...loadAstronEnvFile(projectRoot),
})

const shouldCapturePrintRuntime =
  process.platform === 'win32' && isPrintInvocation(runtimeArgs)

const child = spawn(process.execPath, [runtimeEntry, ...runtimeArgs], {
  cwd: projectRoot,
  env: {
    ...mergedEnv,
    LANG: 'en_US.UTF-8',
    PYTHONIOENCODING: 'utf-8',
  },
  stdio: shouldCapturePrintRuntime ? ['inherit', 'pipe', 'pipe'] : 'inherit',
})

const exitCode = await new Promise(resolve => {
  let stderrBuffer = ''

  if (shouldCapturePrintRuntime) {
    child.stdout?.on('data', chunk => {
      process.stdout.write(chunk)
    })

    child.stderr?.on('data', chunk => {
      stderrBuffer += String(chunk)
    })
  }

  child.once('close', code => {
    if (!shouldCapturePrintRuntime) {
      resolve(code ?? 0)
      return
    }

    const normalized = normalizeWindowsPrintRuntimeResult({
      exitCode: code ?? 0,
      stderr: stderrBuffer,
    })

    if (normalized.stderr) {
      process.stderr.write(normalized.stderr)
    }

    resolve(normalized.exitCode)
  })

  child.once('error', error => {
    console.error(`[${ASTRONCODE_NAME}] Failed to start:`, error.message)
    resolve(1)
  })
})

process.exitCode = exitCode
