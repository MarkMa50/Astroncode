import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'
import {
  incrementPatch,
  readCurrentVersion,
  VERSION_FILE_PATHS,
  writeVersionFiles,
} from './version-files.mjs'

const execFileAsync = promisify(execFile)

const sourceDir = path.resolve(process.argv[2] || process.cwd())
const VERSION_FILE_SET = new Set(VERSION_FILE_PATHS)
const LOCAL_ONLY_FILE_SET = new Set([
  '.env.astroncode',
  '.astroncode-deploy-source.json',
])

async function runGit(args, { allowFailure = false } = {}) {
  try {
    const { stdout } = await execFileAsync('git', ['-C', sourceDir, ...args], {
      encoding: 'utf8',
    })
    return stdout
  } catch (error) {
    if (allowFailure) {
      return ''
    }

    throw error
  }
}

function isMeaningfulPath(filePath) {
  return Boolean(filePath) && !VERSION_FILE_SET.has(filePath) && !LOCAL_ONLY_FILE_SET.has(filePath)
}

async function getWorkingTreeChangedPaths() {
  const stdout = await runGit(
    ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--no-renames'],
    { allowFailure: true },
  )

  if (!stdout) {
    return []
  }

  return stdout
    .split('\0')
    .filter(Boolean)
    .map(entry => entry.slice(3))
}

async function hasCommittedMeaningfulChangesSinceLastVersion() {
  const lastVersionCommit = (
    await runGit(
      ['log', '-n', '1', '--format=%H', 'HEAD', '--', ...VERSION_FILE_PATHS],
      { allowFailure: true },
    )
  ).trim()

  if (!lastVersionCommit) {
    return false
  }

  const changedFiles = await runGit(
    [
      'diff',
      '--name-only',
      `${lastVersionCommit}..HEAD`,
      '--',
      '.',
      ':(exclude)package.json',
      ':(exclude)scripts/astron-meta.mjs',
      ':(exclude).env.astroncode',
      ':(exclude).astroncode-deploy-source.json',
    ],
    { allowFailure: true },
  )

  return changedFiles
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .some(isMeaningfulPath)
}

const workingTreeChangedPaths = await getWorkingTreeChangedPaths()
const hasPendingVersionFileChanges = workingTreeChangedPaths.some(filePath =>
  VERSION_FILE_SET.has(filePath),
)
const hasMeaningfulWorkingTreeChanges = workingTreeChangedPaths.some(isMeaningfulPath)
const shouldBump =
  !hasPendingVersionFileChanges &&
  (hasMeaningfulWorkingTreeChanges ||
    (await hasCommittedMeaningfulChangesSinceLastVersion()))

if (!shouldBump) {
  process.exit(0)
}

const currentVersion = await readCurrentVersion(sourceDir)
const nextVersion = incrementPatch(currentVersion)
await writeVersionFiles(sourceDir, nextVersion)
process.stdout.write(nextVersion)
