import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  ensureAstronDesktopLaunchers,
  runAstronInstall,
} from '../scripts/install-local-runtime.mjs'

test('ensureAstronDesktopLaunchers writes CLI and GUI desktop launchers', async () => {
  const desktopDir = await mkdtemp(path.join(os.tmpdir(), 'astron-desktop-'))
  const projectRoot = 'C:\\Users\\markw\\astroncode'

  const result = await ensureAstronDesktopLaunchers({
    projectRoot,
    desktopDir,
  })

  const cliLauncher = await readFile(path.join(desktopDir, 'Astroncode.cmd'), 'utf8')
  const guiLauncher = await readFile(path.join(desktopDir, 'Astroncode GUI.vbs'), 'utf8')

  assert.equal(result.desktopDir, desktopDir)
  assert.equal(result.launchers.length, 2)
  assert.match(cliLauncher, /astroncode\.ps1/)
  assert.match(guiLauncher, /astroncode-gui\.ps1/)
})

test('ensureAstronDesktopLaunchers writes mac command launchers', async () => {
  const desktopDir = await mkdtemp(path.join(os.tmpdir(), 'astron-desktop-mac-'))
  const projectRoot = '/Applications/Astroncode'

  const result = await ensureAstronDesktopLaunchers({
    projectRoot,
    desktopDir,
    platform: 'darwin',
  })

  const cliLauncher = await readFile(path.join(desktopDir, 'Astroncode.command'), 'utf8')
  const guiLauncher = await readFile(path.join(desktopDir, 'Astroncode GUI.command'), 'utf8')

  assert.equal(result.launchers.length, 2)
  assert.match(cliLauncher, /^#!\/bin\/sh/m)
  assert.match(guiLauncher, /astroncode-gui\.sh/)
})

test('runAstronInstall repairs shims and desktop launchers and reports provider status', async () => {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'astron-install-root-'))
  const shimDir = await mkdtemp(path.join(os.tmpdir(), 'astron-install-shims-'))
  const desktopDir = await mkdtemp(path.join(os.tmpdir(), 'astron-install-desktop-'))

  await writeFile(
    path.join(projectRoot, '.env.astroncode'),
    [
      'ASTRONCODE_AUTH_TOKEN=install-token',
      'ASTRONCODE_BASE_URL=https://provider.example.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  const result = await runAstronInstall({
    projectRoot,
    shimDir,
    desktopDir,
  })

  const shimFile = await readFile(path.join(shimDir, 'astroncode.cmd'), 'utf8')
  const desktopFile = await readFile(path.join(desktopDir, 'Astroncode.cmd'), 'utf8')

  assert.equal(result.provider.ready, true)
  assert.equal(result.provider.mode, 'token')
  assert.match(result.nodeVersion, /^v/)
  assert.match(shimFile, /astroncode\.ps1/)
  assert.match(desktopFile, /astroncode\.ps1/)
})
