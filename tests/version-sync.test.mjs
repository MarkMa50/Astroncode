import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const ensureScriptPath = path.join(projectRoot, 'scripts', 'ensure-local-version.mjs')

function runGit(repoDir, args) {
  return execFileSync('git', ['-C', repoDir, ...args], { encoding: 'utf8' }).trim()
}

function runEnsure(repoDir) {
  return execFileSync('node', [ensureScriptPath, repoDir], { encoding: 'utf8' }).trim()
}

async function readVersionFiles(repoDir) {
  const packageJson = JSON.parse(
    await fs.readFile(path.join(repoDir, 'package.json'), 'utf8'),
  )
  const astronMeta = await fs.readFile(
    path.join(repoDir, 'scripts', 'astron-meta.mjs'),
    'utf8',
  )
  const metaVersionMatch = astronMeta.match(
    /export const ASTRONCODE_VERSION = '([^']+)'/,
  )

  return {
    packageVersion: packageJson.version,
    metaVersion: metaVersionMatch?.[1],
  }
}

async function createFixtureRepo(t) {
  const repoDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'astroncode-version-sync-'),
  )
  t.after(async () => {
    await fs.rm(repoDir, { recursive: true, force: true })
  })

  await fs.mkdir(path.join(repoDir, 'scripts'), { recursive: true })
  await fs.writeFile(
    path.join(repoDir, 'package.json'),
    `${JSON.stringify({ name: 'astroncode', version: '1.0.0' }, null, 2)}\n`,
    'utf8',
  )
  await fs.writeFile(
    path.join(repoDir, 'scripts', 'astron-meta.mjs'),
    "export const ASTRONCODE_VERSION = '1.0.0'\n",
    'utf8',
  )
  await fs.writeFile(path.join(repoDir, 'README.md'), '# Fixture\n', 'utf8')

  execFileSync('git', ['init', '-b', 'main'], { cwd: repoDir, stdio: 'ignore' })
  execFileSync('git', ['config', 'user.name', 'Astroncode Tests'], {
    cwd: repoDir,
    stdio: 'ignore',
  })
  execFileSync('git', ['config', 'user.email', 'astroncode-tests@example.com'], {
    cwd: repoDir,
    stdio: 'ignore',
  })

  runGit(repoDir, ['add', '-A'])
  runGit(repoDir, ['commit', '-m', 'initial'])
  return repoDir
}

test('does not bump when there are no real updates', async t => {
  const repoDir = await createFixtureRepo(t)

  assert.equal(runEnsure(repoDir), '')
  assert.deepEqual(await readVersionFiles(repoDir), {
    packageVersion: '1.0.0',
    metaVersion: '1.0.0',
  })
})

test('does not bump for version-file-only edits', async t => {
  const repoDir = await createFixtureRepo(t)

  await fs.writeFile(
    path.join(repoDir, 'scripts', 'astron-meta.mjs'),
    "export const ASTRONCODE_VERSION = '9.9.9'\n",
    'utf8',
  )

  assert.equal(runEnsure(repoDir), '')
  assert.deepEqual(await readVersionFiles(repoDir), {
    packageVersion: '1.0.0',
    metaVersion: '9.9.9',
  })
})

test('bumps for dirty source changes that have not been committed yet', async t => {
  const repoDir = await createFixtureRepo(t)

  await fs.writeFile(path.join(repoDir, 'README.md'), '# Fixture\n\nupdated\n', 'utf8')

  assert.equal(runEnsure(repoDir), '1.0.1')
  assert.equal(runEnsure(repoDir), '')
  assert.deepEqual(await readVersionFiles(repoDir), {
    packageVersion: '1.0.1',
    metaVersion: '1.0.1',
  })
})

test('does not bump for local-only config files', async t => {
  const repoDir = await createFixtureRepo(t)

  await fs.writeFile(
    path.join(repoDir, '.env.astroncode'),
    'ASTRONCODE_AUTH_TOKEN=local-only-token\n',
    'utf8',
  )

  assert.equal(runEnsure(repoDir), '')
  assert.deepEqual(await readVersionFiles(repoDir), {
    packageVersion: '1.0.0',
    metaVersion: '1.0.0',
  })
})

test('bumps for committed source changes that happened after the last version update', async t => {
  const repoDir = await createFixtureRepo(t)

  await fs.writeFile(path.join(repoDir, 'README.md'), '# Fixture\n\ncommitted update\n', 'utf8')
  runGit(repoDir, ['add', 'README.md'])
  runGit(repoDir, ['commit', '-m', 'docs: update readme'])

  assert.equal(runEnsure(repoDir), '1.0.1')
  assert.equal(runEnsure(repoDir), '')
  assert.deepEqual(await readVersionFiles(repoDir), {
    packageVersion: '1.0.1',
    metaVersion: '1.0.1',
  })
})
