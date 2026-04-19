import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { planSync } from './main-windows-sync-lib.mjs'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_CONFIG_PATH = path.resolve(
  SCRIPT_DIR,
  '../sync/main-windows-sync.config.json',
)

function parseArgs(argv) {
  return {
    apply: argv.includes('--apply'),
    commit: argv.includes('--commit'),
    json: argv.includes('--json'),
    noPull: argv.includes('--no-pull'),
    configPath: readOption(argv, '--config') ?? DEFAULT_CONFIG_PATH,
    sourceRoot: readOption(argv, '--source-root') ?? null,
    targetRoot: readOption(argv, '--target-root') ?? process.cwd(),
  }
}

function readOption(argv, flag) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return null
  }

  return argv[index + 1] ?? null
}

function execCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', chunk => {
      stdout += String(chunk)
    })

    child.stderr.on('data', chunk => {
      stderr += String(chunk)
    })

    child.on('error', reject)
    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(
        new Error(
          `${command} ${args.join(' ')} failed with exit code ${code}\n${stderr || stdout}`,
        ),
      )
    })
  })
}

async function ensureCheckout({ repository, branch, repoRoot, cloneIfMissing = false }) {
  if (!existsSync(repoRoot)) {
    if (!cloneIfMissing) {
      throw new Error(`Missing repository checkout: ${repoRoot}`)
    }

    await mkdir(path.dirname(repoRoot), { recursive: true })
    await execCommand('gh', ['repo', 'clone', repository, repoRoot], {
      cwd: path.dirname(repoRoot),
    })
  }

  const { stdout: dirtyStdout } = await execCommand(
    'git',
    ['status', '--porcelain'],
    { cwd: repoRoot },
  )

  if (dirtyStdout.trim() !== '') {
    throw new Error(`Repository is not clean: ${repoRoot}`)
  }

  await execCommand('git', ['checkout', branch], { cwd: repoRoot })
  await execCommand('git', ['fetch', 'origin', branch], { cwd: repoRoot })
  await execCommand('git', ['pull', '--ff-only', 'origin', branch], { cwd: repoRoot })
}

async function collectFiles(rootDir) {
  const output = new Map()

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue
      }

      const absolutePath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(absolutePath)
        continue
      }

      const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, '/')
      output.set(relativePath, await readFile(absolutePath))
    }
  }

  await walk(rootDir)
  return output
}

function renderSummary(summary, sourceRoot, targetRoot) {
  return [
    `Source: ${sourceRoot}`,
    `Target: ${targetRoot}`,
    `Shared updates: ${summary.copyActions.length}`,
    `Preserve conflicts: ${summary.preserveConflicts.length}`,
    `Blocked conflicts: ${summary.blockedConflicts.length}`,
    `Ignored files: ${summary.ignoredCount}`,
  ].join('\n')
}

async function applyCopyActions({ sourceRoot, targetRoot, copyActions }) {
  for (const action of copyActions) {
    const from = path.join(sourceRoot, action.sourcePath)
    const to = path.join(targetRoot, action.targetPath)

    await mkdir(path.dirname(to), { recursive: true })
    await copyFile(from, to)
  }
}

async function maybeCommit({ targetRoot, branch, copyActions, sourceRoot }) {
  if (copyActions.length === 0) {
    return null
  }

  const { stdout: sourceShaStdout } = await execCommand(
    'git',
    ['rev-parse', '--short', 'HEAD'],
    { cwd: sourceRoot },
  )
  const sourceSha = sourceShaStdout.trim()

  await execCommand(
    'git',
    ['add', '--', ...copyActions.map(action => action.targetPath)],
    { cwd: targetRoot },
  )
  await execCommand(
    'git',
    ['commit', '-m', `chore: align shared main docs from ${sourceSha}`],
    { cwd: targetRoot },
  )
  await execCommand('git', ['push', 'origin', branch], { cwd: targetRoot })

  return sourceSha
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const config = JSON.parse(await readFile(args.configPath, 'utf8'))
  const targetRoot = path.resolve(args.targetRoot)
  const sourceRoot = path.resolve(
    args.sourceRoot
      ?? path.join(targetRoot, config.source.localClone),
  )

  if (!args.noPull) {
    await ensureCheckout({
      repository: config.source.repository,
      branch: config.source.branch,
      repoRoot: sourceRoot,
      cloneIfMissing: true,
    })
    await ensureCheckout({
      repository: config.target.repository,
      branch: config.target.branch,
      repoRoot: targetRoot,
      cloneIfMissing: false,
    })
  }

  const sourceFiles = await collectFiles(sourceRoot)
  const targetFiles = await collectFiles(targetRoot)
  const summary = planSync({
    sourceFiles,
    targetFiles,
    config,
  })

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          sourceRoot,
          targetRoot,
          ...summary,
        },
        null,
        2,
      ),
    )
  } else {
    console.log(renderSummary(summary, sourceRoot, targetRoot))
  }

  if (summary.preserveConflicts.length > 0 || summary.blockedConflicts.length > 0) {
    process.exitCode = 2
    return
  }

  if (!args.apply) {
    return
  }

  await applyCopyActions({
    sourceRoot,
    targetRoot,
    copyActions: summary.copyActions,
  })

  if (args.commit) {
    await maybeCommit({
      targetRoot,
      branch: config.target.branch,
      copyActions: summary.copyActions,
      sourceRoot,
    })
  }
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
