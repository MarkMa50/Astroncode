import http from 'node:http'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

import { readAstronEnvConfig } from './astron-env.mjs'
import { ASTRONCODE_NAME, ASTRONCODE_VERSION } from './astron-meta.mjs'

const DEFAULT_HOST = '127.0.0.1'

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  response.end(JSON.stringify(payload))
}

function text(response, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(statusCode, {
    'content-type': contentType,
    'cache-control': 'no-store',
  })
  response.end(payload)
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

function inferMimeType(filePath) {
  if (filePath.endsWith('.css')) {
    return 'text/css; charset=utf-8'
  }

  if (filePath.endsWith('.js')) {
    return 'application/javascript; charset=utf-8'
  }

  if (filePath.endsWith('.json')) {
    return 'application/json; charset=utf-8'
  }

  return 'text/html; charset=utf-8'
}

export function buildGuiStatus({ projectRoot }) {
  const { filePath, exists, entries } = readAstronEnvConfig(projectRoot)
  const token = entries.ASTRONCODE_AUTH_TOKEN || entries.ASTRONCODE_API_KEY || ''
  const model = entries.ASTRONCODE_MODEL || 'not-configured'
  const baseUrl = entries.ASTRONCODE_BASE_URL || '(not set)'

  return {
    product: ASTRONCODE_NAME,
    version: ASTRONCODE_VERSION,
    workspaceName: path.basename(projectRoot),
    workspacePath: projectRoot,
    configFile: filePath,
    configExists: exists,
    model,
    providerBaseUrl: baseUrl,
    credentialMasked: maskSecret(token),
    ready: Boolean(token && entries.ASTRONCODE_BASE_URL && entries.ASTRONCODE_MODEL),
    launchedAt: new Date().toISOString(),
  }
}

async function defaultRunPrompt({ prompt, projectRoot, env }) {
  const startScript = path.join(projectRoot, 'scripts', 'start.mjs')

  return new Promise(resolve => {
    const child = spawn(process.execPath, [startScript, '-p', prompt, '--output-format', 'text'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        ...env,
      },
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

    child.once('close', code => {
      resolve({
        ok: (code ?? 1) === 0,
        exitCode: code ?? 1,
        output: stdout.trim(),
        error: stderr.trim(),
      })
    })

    child.once('error', error => {
      resolve({
        ok: false,
        exitCode: 1,
        output: '',
        error: error.message,
      })
    })
  })
}

function buildStreamJsonInput(prompt) {
  return `${JSON.stringify({
    type: 'user',
    message: {
      role: 'user',
      content: [{ type: 'text', text: prompt }],
    },
  })}\n`
}

function mapRuntimeEvent(line) {
  if (!line) {
    return null
  }

  let parsed = null
  try {
    parsed = JSON.parse(line)
  } catch {
    return {
      type: 'status',
      phase: 'dispatching',
      label: '正在连接本地核心',
    }
  }

  if (parsed.type === 'system' && parsed.subtype === 'init') {
    return {
      type: 'init',
      model: parsed.model,
      sessionId: parsed.session_id,
      label: '会话已建立',
    }
  }

  if (parsed.type === 'stream_event') {
    const event = parsed.event || {}

    if (event.type === 'content_block_start' && event.content_block?.type === 'thinking') {
      return {
        type: 'status',
        phase: 'thinking',
        label: '正在分析任务',
      }
    }

    if (event.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
      return {
        type: 'status',
        phase: 'dispatching',
        label: `正在调用工具 ${event.content_block?.name || ''}`.trim(),
      }
    }

    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      return {
        type: 'text-delta',
        text: event.delta.text || '',
      }
    }

    if (event.type === 'message_delta') {
      return {
        type: 'status',
        phase: 'finishing',
        label: '正在整理输出',
      }
    }
  }

  if (parsed.type === 'assistant' && Array.isArray(parsed.message?.content)) {
    const textBlock = parsed.message.content.find(block => block.type === 'text')
    if (textBlock?.text) {
      return {
        type: 'assistant',
        text: textBlock.text,
      }
    }
  }

  if (parsed.type === 'result') {
    return {
      type: 'done',
      result: parsed.result || '',
      durationMs: parsed.duration_ms || 0,
    }
  }

  if (parsed.is_error || parsed.subtype === 'error') {
    return {
      type: 'error',
      error: parsed.result || parsed.error || 'runtime-error',
    }
  }

  return null
}

async function defaultStreamPrompt({ prompt, projectRoot, env, onEvent }) {
  const startScript = path.join(projectRoot, 'scripts', 'start.mjs')

  return new Promise(resolve => {
    const child = spawn(
      process.execPath,
      [
        startScript,
        '-p',
        '--verbose',
        '--input-format',
        'stream-json',
        '--output-format',
        'stream-json',
        '--include-partial-messages',
      ],
      {
        cwd: projectRoot,
        env: {
          ...process.env,
          ...env,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    let stdoutBuffer = ''
    let stderr = ''

    child.stdin.write(buildStreamJsonInput(prompt))
    child.stdin.end()

    child.stdout.on('data', chunk => {
      stdoutBuffer += String(chunk)
      const lines = stdoutBuffer.split(/\r?\n/)
      stdoutBuffer = lines.pop() ?? ''

      for (const line of lines) {
        const event = mapRuntimeEvent(line.trim())
        if (event) {
          onEvent(event)
        }
      }
    })

    child.stderr.on('data', chunk => {
      stderr += String(chunk)
    })

    child.once('close', code => {
      if (stdoutBuffer.trim()) {
        const event = mapRuntimeEvent(stdoutBuffer.trim())
        if (event) {
          onEvent(event)
        }
      }

      resolve({
        ok: (code ?? 1) === 0,
        exitCode: code ?? 1,
        error: stderr.trim(),
      })
    })

    child.once('error', error => {
      onEvent({
        type: 'error',
        error: error.message,
      })
      resolve({
        ok: false,
        exitCode: 1,
        error: error.message,
      })
    })
  })
}

async function serveStaticFile({ requestPath, guiRoot, response }) {
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath
  const absolutePath = path.join(guiRoot, normalizedPath.replace(/^\/+/, ''))
  const resolved = path.resolve(absolutePath)

  if (!resolved.startsWith(path.resolve(guiRoot))) {
    json(response, 403, { error: 'forbidden' })
    return
  }

  try {
    const content = await fs.readFile(resolved, 'utf8')
    text(response, 200, content, inferMimeType(resolved))
  } catch {
    json(response, 404, { error: 'not-found' })
  }
}

async function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', chunk => {
      body += String(chunk)
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'))
      }
    })

    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

export function createAstronGuiServer({
  projectRoot,
  guiRoot = path.join(projectRoot, 'gui'),
  host = DEFAULT_HOST,
  port = 0,
  env = {},
  runPrompt = defaultRunPrompt,
  streamPrompt = defaultStreamPrompt,
} = {}) {
  if (!projectRoot) {
    throw new Error('projectRoot is required')
  }

  let serverUrl = null
  const status = buildGuiStatus({ projectRoot })

  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || '/', `http://${host}`)

    if (request.method === 'GET' && requestUrl.pathname === '/api/status') {
      json(response, 200, buildGuiStatus({ projectRoot }))
      return
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/projects/current') {
      json(response, 200, {
        workspaceName: status.workspaceName,
        workspacePath: status.workspacePath,
        configFile: status.configFile,
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/chat') {
      let payload = null

      try {
        payload = JSON.parse(await readRequestBody(request))
      } catch (error) {
        json(response, 400, {
          ok: false,
          error: 'invalid-json',
          detail: error.message,
        })
        return
      }

      const prompt = String(payload?.prompt ?? '').trim()
      if (!prompt) {
        json(response, 400, {
          ok: false,
          error: 'missing-prompt',
          detail: 'Prompt is required.',
        })
        return
      }

      const result = await runPrompt({ prompt, projectRoot, env })
      json(response, result.ok ? 200 : 500, {
        ok: result.ok,
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
      })
      return
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/chat/stream') {
      let payload = null

      try {
        payload = JSON.parse(await readRequestBody(request))
      } catch (error) {
        json(response, 400, {
          ok: false,
          error: 'invalid-json',
          detail: error.message,
        })
        return
      }

      const prompt = String(payload?.prompt ?? '').trim()
      if (!prompt) {
        json(response, 400, {
          ok: false,
          error: 'missing-prompt',
          detail: 'Prompt is required.',
        })
        return
      }

      response.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
        connection: 'keep-alive',
      })

      const writeEvent = event => {
        response.write(`${JSON.stringify(event)}\n`)
      }

      writeEvent({
        type: 'status',
        phase: 'queued',
        label: '已接收任务',
      })

      const result = await streamPrompt({
        prompt,
        projectRoot,
        env,
        onEvent: writeEvent,
      })

      if (!result.ok && result.error) {
        writeEvent({
          type: 'error',
          error: result.error,
        })
      }

      response.end()
      return
    }

    if (request.method === 'GET') {
      await serveStaticFile({
        requestPath: requestUrl.pathname,
        guiRoot,
        response,
      })
      return
    }

    json(response, 405, { error: 'method-not-allowed' })
  })

  return {
    host,
    port,
    async start() {
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, host, resolve)
      })

      const address = server.address()
      if (typeof address === 'object' && address) {
        serverUrl = `http://${host}:${address.port}`
      }

      return {
        url: serverUrl,
        address,
      }
    },
    async stop() {
      await new Promise((resolve, reject) => {
        server.close(error => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    },
    get url() {
      return serverUrl
    },
    get server() {
      return server
    },
  }
}

export async function openAstronGuiInBrowser(url) {
  if (!url) {
    return
  }

  if (process.platform === 'win32') {
    const child = spawn('cmd', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
    })
    child.unref()
    return
  }

  const command = process.platform === 'darwin' ? 'open' : 'xdg-open'
  const child = spawn(command, [url], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
}

export async function launchAstronGui({
  projectRoot,
  stdout = process.stdout,
  host = DEFAULT_HOST,
  port = 0,
  openBrowser = true,
} = {}) {
  const guiServer = createAstronGuiServer({
    projectRoot,
    host,
    port,
  })

  const { url } = await guiServer.start()

  stdout.write(`[${ASTRONCODE_NAME}] GUI workbench ready at ${url}\n`)
  stdout.write(`[${ASTRONCODE_NAME}] Press Ctrl+C to stop the local GUI server.\n`)

  if (openBrowser) {
    await openAstronGuiInBrowser(url)
  }

  const shutdown = async () => {
    process.off('SIGINT', handleSignal)
    process.off('SIGTERM', handleSignal)
    await guiServer.stop()
  }

  const handleSignal = async () => {
    await shutdown()
    process.exit(0)
  }

  process.on('SIGINT', handleSignal)
  process.on('SIGTERM', handleSignal)

  return new Promise(resolve => {
    guiServer.server.once('close', () => {
      resolve({
        handled: true,
        exitCode: 0,
      })
    })
  })
}
