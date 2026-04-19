import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { runLocalAstronCommand } from '../scripts/local-command-overrides.mjs'

const tempDirs = []

after(async () => {
  const { rm } = await import('node:fs/promises')
  await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
})

function createWriter() {
  const chunks = []

  return {
    write(chunk) {
      chunks.push(String(chunk))
    },
    toString() {
      return chunks.join('')
    },
  }
}

test('runLocalAstronCommand reports local auth status and masks the secret', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-auth-'))
  tempDirs.push(dir)

  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      'ASTRONCODE_AUTH_TOKEN=real-secret-token',
      'ASTRONCODE_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  const stdout = createWriter()
  const stderr = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['auth', 'status'],
    projectRoot: dir,
    stdout,
    stderr,
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Astroncode auth status/)
  assert.match(stdout.toString(), /Auth status: configured/)
  assert.match(stdout.toString(), /astron-code-latest/)
  assert.match(
    stdout.toString(),
    /Runtime routing: normalized automatically for the local Astroncode runtime/,
  )
  assert.doesNotMatch(stdout.toString(), /real-secret-token/)
  assert.match(stdout.toString(), /real-.*token/)
  assert.equal(stderr.toString(), '')
})

test('runLocalAstronCommand supports auth status --json with masked credentials', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-auth-json-'))
  tempDirs.push(dir)

  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      'ASTRONCODE_AUTH_TOKEN=real-secret-token',
      'ASTRONCODE_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['auth', 'status', '--json'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  const payload = JSON.parse(stdout.toString())

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.equal(payload.ready, true)
  assert.equal(payload.providerMode, 'auth-token')
  assert.equal(payload.model, 'astron-code-latest')
  assert.equal(payload.runtimeBaseUrl, 'https://maas-coding-api.cn-huabei-1.xf-yun.com/anthropic')
  assert.equal(payload.credentialMasked, 'real-...token')
})

test('runLocalAstronCommand prints local help for auth login', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-auth-help-'))
  tempDirs.push(dir)

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['auth', 'login', '--help'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Usage: astroncode auth login/)
  assert.match(stdout.toString(), /--token <token>/)
  assert.match(stdout.toString(), /--base-url <url>/)
  assert.match(stdout.toString(), /--model <model>/)
})

test('runLocalAstronCommand auth logout removes local credentials without deleting model settings', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-logout-'))
  tempDirs.push(dir)

  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      '# local config',
      'ASTRONCODE_AUTH_TOKEN=real-secret-token',
      'ASTRONCODE_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['auth', 'logout'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  const updated = await readFile(path.join(dir, '.env.astroncode'), 'utf8')

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Removed local provider credentials/i)
  assert.doesNotMatch(updated, /ASTRONCODE_AUTH_TOKEN=/)
  assert.match(updated, /ASTRONCODE_BASE_URL=https:\/\/maas-coding-api\.cn-huabei-1\.xf-yun\.com\/v2/)
  assert.match(updated, /ASTRONCODE_MODEL=astron-code-latest/)
  assert.match(updated, /# local config/)
})

test('runLocalAstronCommand doctor validates local runtime readiness', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-doctor-'))
  tempDirs.push(dir)

  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      'ASTRONCODE_AUTH_TOKEN=real-secret-token',
      'ASTRONCODE_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  await writeFile(path.join(dir, 'cli.js'), 'Usage: claude\n2.1.88\n', 'utf8')

  const previousRuntimeCacheDir = process.env.ASTRONCODE_RUNTIME_CACHE_DIR

  try {
    process.env.ASTRONCODE_RUNTIME_CACHE_DIR = path.join(dir, 'shared-cache')

    const stdout = createWriter()
    const result = await runLocalAstronCommand({
      argv: ['doctor'],
      projectRoot: dir,
      stdout,
      stderr: createWriter(),
    })

    assert.equal(result.handled, true)
    assert.equal(result.exitCode, 0)
    assert.match(stdout.toString(), /Astroncode doctor/i)
    assert.match(stdout.toString(), /\[ok\] Local provider credentials/)
    assert.match(stdout.toString(), /\[ok\] Base URL routing:/)
    assert.match(
      stdout.toString(),
      /normalized automatically for the local Astroncode runtime/,
    )
    assert.match(
      stdout.toString(),
      new RegExp(path.join(dir, 'shared-cache').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    )
    assert.match(stdout.toString(), /\[ok\] Runtime branding cache/)
  } finally {
    if (previousRuntimeCacheDir === undefined) {
      delete process.env.ASTRONCODE_RUNTIME_CACHE_DIR
    } else {
      process.env.ASTRONCODE_RUNTIME_CACHE_DIR = previousRuntimeCacheDir
    }
  }
})

test('runLocalAstronCommand prints local help for doctor and install', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-help-'))
  tempDirs.push(dir)

  const doctorHelp = createWriter()
  const doctorResult = await runLocalAstronCommand({
    argv: ['doctor', '--help'],
    projectRoot: dir,
    stdout: doctorHelp,
    stderr: createWriter(),
  })

  assert.equal(doctorResult.handled, true)
  assert.equal(doctorResult.exitCode, 0)
  assert.match(doctorHelp.toString(), /Usage: astroncode doctor/)
  assert.match(doctorHelp.toString(), /local diagnostics/i)

  const installHelp = createWriter()
  const installResult = await runLocalAstronCommand({
    argv: ['install', '--help'],
    projectRoot: dir,
    stdout: installHelp,
    stderr: createWriter(),
  })

  assert.equal(installResult.handled, true)
  assert.equal(installResult.exitCode, 0)
  assert.match(installHelp.toString(), /Usage: astroncode install \[target\]/)
  assert.match(installHelp.toString(), /repair or install local command shims/i)
  assert.match(installHelp.toString(), /PowerShell or Command Prompt/i)
})

test('runLocalAstronCommand blocks hosted bridge aliases with Astroncode guidance', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-bridge-'))
  tempDirs.push(dir)

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['--remote', 'Ship this task'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 2)
  assert.match(stdout.toString(), /Remote control is unavailable in this local Astroncode build/i)
  assert.match(stdout.toString(), /Use `astroncode` or `astroncode -p` for local runs/i)
  assert.doesNotMatch(stdout.toString(), /claude\.ai/i)
})

test('runLocalAstronCommand prints local help for assistant bridge mode', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-assistant-help-'))
  tempDirs.push(dir)

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['assistant', '--help'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Usage: astroncode assistant \[session-id\]/i)
  assert.match(stdout.toString(), /not available in this local build/i)
})

test('runLocalAstronCommand prints local help for gui and ui launchers', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-gui-help-'))
  tempDirs.push(dir)

  const guiHelp = createWriter()
  const guiResult = await runLocalAstronCommand({
    argv: ['gui', '--help'],
    projectRoot: dir,
    stdout: guiHelp,
    stderr: createWriter(),
  })

  assert.equal(guiResult.handled, true)
  assert.equal(guiResult.exitCode, 0)
  assert.match(guiHelp.toString(), /Usage: astroncode gui/i)
  assert.match(guiHelp.toString(), /Launch the local Astroncode GUI workbench/i)
  assert.match(guiHelp.toString(), /--no-browser/i)
  assert.match(guiHelp.toString(), /--port <port>/i)

  const uiHelp = createWriter()
  const uiResult = await runLocalAstronCommand({
    argv: ['ui', '--help'],
    projectRoot: dir,
    stdout: uiHelp,
    stderr: createWriter(),
  })

  assert.equal(uiResult.handled, true)
  assert.equal(uiResult.exitCode, 0)
  assert.match(uiHelp.toString(), /Usage: astroncode ui/i)
  assert.match(uiHelp.toString(), /default browser/i)
})

test('runLocalAstronCommand prints local help for setup wizard', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-setup-help-'))
  tempDirs.push(dir)

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['setup', '--help'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Usage: astroncode setup/i)
  assert.match(stdout.toString(), /setup wizard/i)
  assert.match(stdout.toString(), /provider credentials/i)
})

test('runLocalAstronCommand install repairs command shims in the target shim directory', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-install-'))
  tempDirs.push(dir)

  const shimDir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-shim-target-'))
  tempDirs.push(shimDir)
  const desktopDir = await mkdtemp(path.join(os.tmpdir(), 'astron-local-desktop-target-'))
  tempDirs.push(desktopDir)

  const previousShimDir = process.env.ASTRONCODE_SHIM_DIR
  const previousDesktopDir = process.env.ASTRONCODE_DESKTOP_DIR
  process.env.ASTRONCODE_SHIM_DIR = shimDir
  process.env.ASTRONCODE_DESKTOP_DIR = desktopDir

  try {
    const stdout = createWriter()
    const result = await runLocalAstronCommand({
      argv: ['install'],
      projectRoot: dir,
      stdout,
      stderr: createWriter(),
    })

    const astroncodeShim = await readFile(path.join(shimDir, 'astroncode.cmd'), 'utf8')
    const desktopLauncher = await readFile(path.join(desktopDir, 'Astroncode CLI.cmd'), 'utf8')

    assert.equal(result.handled, true)
    assert.equal(result.exitCode, 0)
    assert.match(stdout.toString(), /Installed command shims/i)
    assert.match(stdout.toString(), /Repaired desktop launchers/i)
    assert.match(stdout.toString(), /Node\.js:/i)
    assert.match(stdout.toString(), /astroncode\.cmd/i)
    assert.match(stdout.toString(), /Astroncode CLI\.cmd/i)
    assert.match(astroncodeShim, /astroncode\.ps1/)
    assert.match(desktopLauncher, /astroncode\.ps1/)
  } finally {
    if (previousShimDir === undefined) {
      delete process.env.ASTRONCODE_SHIM_DIR
    } else {
      process.env.ASTRONCODE_SHIM_DIR = previousShimDir
    }

    if (previousDesktopDir === undefined) {
      delete process.env.ASTRONCODE_DESKTOP_DIR
    } else {
      process.env.ASTRONCODE_DESKTOP_DIR = previousDesktopDir
    }
  }
})
