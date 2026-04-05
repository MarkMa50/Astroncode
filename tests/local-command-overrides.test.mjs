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
  assert.match(stdout.toString(), /Atroncode auth status/)
  assert.match(stdout.toString(), /Auth status: configured/)
  assert.match(stdout.toString(), /astron-code-latest/)
  assert.match(stdout.toString(), /https:\/\/maas-coding-api\.cn-huabei-1\.xf-yun\.com\/anthropic/)
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
  assert.match(stdout.toString(), /Usage: atroncode auth login/)
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

  const stdout = createWriter()
  const result = await runLocalAstronCommand({
    argv: ['doctor'],
    projectRoot: dir,
    stdout,
    stderr: createWriter(),
  })

  assert.equal(result.handled, true)
  assert.equal(result.exitCode, 0)
  assert.match(stdout.toString(), /Atroncode doctor/i)
  assert.match(stdout.toString(), /\[ok\] Local provider credentials/)
  assert.match(stdout.toString(), /\[ok\] Runtime branding cache/)
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
  assert.match(doctorHelp.toString(), /Usage: atroncode doctor/)
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
  assert.match(installHelp.toString(), /Usage: atroncode install \[target\]/)
  assert.match(installHelp.toString(), /local status only/i)
})

test('runLocalAstronCommand blocks hosted bridge aliases with AstronCode guidance', async () => {
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
  assert.match(stdout.toString(), /Remote control is unavailable in this local Atroncode build/i)
  assert.match(stdout.toString(), /Use `atroncode` or `atroncode -p` for local runs/i)
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
  assert.match(stdout.toString(), /Usage: atroncode assistant \[session-id\]/i)
  assert.match(stdout.toString(), /not available in this local build/i)
})
