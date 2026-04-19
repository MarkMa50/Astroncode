import assert from 'node:assert/strict'
import { mkdtemp, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import { ensureAstronCommandShims } from '../scripts/install-shims.mjs'

test('ensureAstronCommandShims writes astroncode and atroncode launchers', async () => {
  const shimDir = await mkdtemp(path.join(os.tmpdir(), 'astron-shims-'))
  const projectRoot = 'C:\\Users\\markw\\astroncode'

  const result = await ensureAstronCommandShims({
    projectRoot,
    shimDir,
  })

  const astroncodeShim = await readFile(path.join(shimDir, 'astroncode.cmd'), 'utf8')
  const atroncodeShim = await readFile(path.join(shimDir, 'atroncode.cmd'), 'utf8')

  assert.equal(result.shimDir, shimDir)
  assert.equal(result.shims.length, 2)
  assert.match(astroncodeShim, /astroncode\.ps1/)
  assert.match(astroncodeShim, /ExecutionPolicy Bypass/)
  assert.match(atroncodeShim, /atroncode\.ps1/)
})

test('ensureAstronCommandShims writes shell launchers for darwin', async () => {
  const shimDir = await mkdtemp(path.join(os.tmpdir(), 'astron-shims-mac-'))
  const projectRoot = '/Applications/Astroncode'

  const result = await ensureAstronCommandShims({
    projectRoot,
    shimDir,
    platform: 'darwin',
  })

  const astroncodeShim = await readFile(path.join(shimDir, 'astroncode'), 'utf8')
  const atroncodeShim = await readFile(path.join(shimDir, 'atroncode'), 'utf8')

  assert.equal(result.shims.length, 2)
  assert.match(astroncodeShim, /^#!\/bin\/sh/m)
  assert.match(astroncodeShim, /exec sh ".*astroncode\.sh"/)
  assert.match(atroncodeShim, /exec sh ".*atroncode\.sh"/)
})
