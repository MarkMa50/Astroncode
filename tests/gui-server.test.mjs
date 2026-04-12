import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import { createAstronGuiServer } from '../scripts/gui-server.mjs'

const tempDirs = []
const servers = []
const guiRoot = path.resolve(process.cwd(), 'gui')

after(async () => {
  const { rm } = await import('node:fs/promises')
  await Promise.all(servers.map(server => server.stop().catch(() => {})))
  await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
})

async function createProjectRoot() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-gui-'))
  tempDirs.push(dir)
  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      'ASTRONCODE_AUTH_TOKEN=gui-secret-token',
      'ASTRONCODE_BASE_URL=https://maas-coding-api.cn-huabei-1.xf-yun.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )
  return dir
}

async function startServer(runPrompt) {
  const projectRoot = await createProjectRoot()
  const guiServer = createAstronGuiServer({
    projectRoot,
    guiRoot,
    runPrompt,
  })
  servers.push(guiServer)
  const { url } = await guiServer.start()
  return { url }
}

test('GUI server serves the workbench shell', async () => {
  const { url } = await startServer(async () => ({
    ok: true,
    output: 'stubbed response',
    error: '',
    exitCode: 0,
  }))

  const response = await fetch(url)
  const html = await response.text()

  assert.equal(response.status, 200)
  assert.match(html, /Astroncode 工作台/)
  assert.match(html, /id="prompt-input"/)
  assert.match(html, /id="transcript"/)
  assert.match(html, /id="execution-log"/)
  assert.match(html, /id="execution-steps"/)
})

test('GUI server returns local runtime status', async () => {
  const { url } = await startServer(async () => ({
    ok: true,
    output: 'stubbed response',
    error: '',
    exitCode: 0,
  }))

  const response = await fetch(`${url}/api/status`)
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.product, 'Astroncode')
  assert.equal(payload.model, 'astron-code-latest')
  assert.equal(payload.ready, true)
  assert.match(payload.credentialMasked, /gui-s.*token/)
})

test('GUI server rejects empty prompts', async () => {
  const { url } = await startServer(async () => ({
    ok: true,
    output: 'stubbed response',
    error: '',
    exitCode: 0,
  }))

  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt: '   ' }),
  })
  const payload = await response.json()

  assert.equal(response.status, 400)
  assert.equal(payload.ok, false)
  assert.equal(payload.error, 'missing-prompt')
})

test('GUI server returns prompt results through the local bridge hook', async () => {
  const { url } = await startServer(async ({ prompt }) => ({
    ok: true,
    output: `echo:${prompt}`,
    error: '',
    exitCode: 0,
  }))

  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'hello gui' }),
  })
  const payload = await response.json()

  assert.equal(response.status, 200)
  assert.equal(payload.ok, true)
  assert.equal(payload.output, 'echo:hello gui')
})

test('GUI server streams runtime events for chat execution', async () => {
  const projectRoot = await createProjectRoot()
  const guiServer = createAstronGuiServer({
    projectRoot,
    guiRoot,
    runPrompt: async () => ({
      ok: true,
      output: 'unused',
      error: '',
      exitCode: 0,
    }),
    streamPrompt: async ({ onEvent }) => {
      onEvent({ type: 'init', model: 'astron-code-latest', label: '会话已建立' })
      onEvent({ type: 'status', phase: 'thinking', label: '正在分析任务' })
      onEvent({ type: 'text-delta', text: 'hello' })
      onEvent({ type: 'done', result: 'hello', durationMs: 12 })
      return { ok: true, exitCode: 0, error: '' }
    },
  })

  servers.push(guiServer)
  const { url } = await guiServer.start()

  const response = await fetch(`${url}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'stream please' }),
  })

  const body = await response.text()

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type') || '', /application\/x-ndjson/)
  assert.match(body, /"phase":"queued"/)
  assert.match(body, /"phase":"thinking"/)
  assert.match(body, /"type":"text-delta"/)
  assert.match(body, /"type":"done"/)
})
