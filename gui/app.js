const state = {
  status: null,
}

const transcript = document.querySelector('#transcript')
const composer = document.querySelector('#composer')
const promptInput = document.querySelector('#prompt-input')
const requestState = document.querySelector('#request-state')
const sendButton = document.querySelector('#send-button')
const executionLog = document.querySelector('#execution-log')
const steps = [...document.querySelectorAll('.step')]

function setText(selector, value) {
  const element = document.querySelector(selector)
  if (element) {
    element.textContent = value
  }
}

function autosizeComposer() {
  promptInput.style.height = 'auto'
  promptInput.style.height = `${Math.min(promptInput.scrollHeight, 220)}px`
}

function appendInlineWithCode(target, text) {
  const regex = /`([^`]+)`/g
  let lastIndex = 0
  let match = regex.exec(text)

  while (match) {
    if (match.index > lastIndex) {
      target.append(document.createTextNode(text.slice(lastIndex, match.index)))
    }

    const code = document.createElement('code')
    code.textContent = match[1]
    target.append(code)
    lastIndex = regex.lastIndex
    match = regex.exec(text)
  }

  if (lastIndex < text.length) {
    target.append(document.createTextNode(text.slice(lastIndex)))
  }
}

function renderRichText(text) {
  const wrapper = document.createElement('div')
  wrapper.className = 'message-body'

  const sections = text.split(/```/)

  sections.forEach((section, index) => {
    if (!section.trim()) {
      return
    }

    if (index % 2 === 1) {
      const codeBlock = document.createElement('pre')
      const code = document.createElement('code')
      code.textContent = section.replace(/^\w+\n/, '')
      codeBlock.append(code)
      wrapper.append(codeBlock)
      return
    }

    const blocks = section.trim().split(/\n\s*\n/)
    for (const block of blocks) {
      const lines = block.split('\n').filter(Boolean)
      if (lines.length === 0) {
        continue
      }

      if (lines.every(line => line.trim().startsWith('- '))) {
        const list = document.createElement('ul')
        for (const line of lines) {
          const item = document.createElement('li')
          appendInlineWithCode(item, line.trim().slice(2))
          list.append(item)
        }
        wrapper.append(list)
        continue
      }

      if (lines.every(line => line.trim().startsWith('> '))) {
        const quote = document.createElement('blockquote')
        appendInlineWithCode(quote, lines.map(line => line.trim().slice(2)).join('\n'))
        wrapper.append(quote)
        continue
      }

      const paragraph = document.createElement('p')
      lines.forEach((line, lineIndex) => {
        appendInlineWithCode(paragraph, line)
        if (lineIndex < lines.length - 1) {
          paragraph.append(document.createElement('br'))
        }
      })
      wrapper.append(paragraph)
    }
  })

  return wrapper
}

function addMessage(role, body) {
  const article = document.createElement('article')
  article.className = `message ${role}`

  const roleNode = document.createElement('div')
  roleNode.className = 'message-role'
  roleNode.textContent = role === 'user' ? '你' : 'Astroncode'

  article.append(roleNode, renderRichText(body))
  transcript.append(article)
  transcript.scrollTop = transcript.scrollHeight
  return article
}

function createLiveRunMessage(prompt) {
  const article = document.createElement('article')
  article.className = 'message assistant live-message'

  const roleNode = document.createElement('div')
  roleNode.className = 'message-role'
  roleNode.textContent = 'Astroncode'

  const body = document.createElement('div')
  body.className = 'message-body'

  const runtime = document.createElement('div')
  runtime.className = 'inline-runtime'

  const header = document.createElement('div')
  header.className = 'inline-runtime-header'

  const badge = document.createElement('span')
  badge.className = 'inline-runtime-badge'
  badge.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>'

  const title = document.createElement('div')
  title.className = 'inline-runtime-title'

  const label = document.createElement('div')
  label.className = 'inline-runtime-label'
  label.textContent = '正在准备执行'

  const meta = document.createElement('div')
  meta.className = 'inline-runtime-meta'
  meta.textContent = 'Astroncode 正在接收你的任务'

  title.append(label, meta)
  header.append(badge, title)

  const promptBox = document.createElement('div')
  promptBox.className = 'inline-runtime-prompt'
  promptBox.textContent = prompt

  const stageRow = document.createElement('div')
  stageRow.className = 'inline-runtime-stages'
  stageRow.innerHTML = `
    <span class="runtime-stage is-active" data-inline-step="accept">接收</span>
    <span class="runtime-stage" data-inline-step="dispatch">调用</span>
    <span class="runtime-stage" data-inline-step="model">等待</span>
    <span class="runtime-stage" data-inline-step="finish">完成</span>
  `

  const latest = document.createElement('div')
  latest.className = 'inline-runtime-latest'
  latest.textContent = '已接收任务'

  const output = document.createElement('div')
  output.className = 'inline-runtime-output'

  runtime.append(header, promptBox, stageRow, latest, output)
  body.append(runtime)
  article.append(roleNode, body)
  transcript.append(article)
  transcript.scrollTop = transcript.scrollHeight

  return {
    article,
    label,
    meta,
    latest,
    output,
    badge,
    inlineSteps: [...stageRow.querySelectorAll('[data-inline-step]')],
  }
}

function addExecution(copy) {
  const item = document.createElement('div')
  item.className = 'execution-item'

  const time = document.createElement('span')
  time.className = 'execution-time'
  time.textContent = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const text = document.createElement('span')
  text.className = 'execution-copy'
  text.textContent = copy

  item.append(time, text)
  executionLog.prepend(item)

  while (executionLog.children.length > 7) {
    executionLog.removeChild(executionLog.lastElementChild)
  }

  setText('#last-event', copy)
}

function setRunPhase(phase) {
  const phaseMap = {
    idle: ['is-active', '', '', ''],
    queued: ['is-active', '', '', ''],
    thinking: ['is-done', 'is-active', '', ''],
    dispatching: ['is-done', 'is-active', '', ''],
    waiting: ['is-done', 'is-done', 'is-active', ''],
    finishing: ['is-done', 'is-done', 'is-done', 'is-active'],
    done: ['is-done', 'is-done', 'is-done', 'is-done'],
    error: ['is-done', 'is-done', '', 'is-error'],
  }

  const classes = phaseMap[phase] || phaseMap.idle

  steps.forEach((step, index) => {
    step.className = 'step'
    if (classes[index]) {
      step.classList.add(classes[index])
    }
  })
}

function setInlinePhase(view, phase) {
  const phaseMap = {
    queued: ['is-active', '', '', ''],
    thinking: ['is-done', 'is-active', '', ''],
    dispatching: ['is-done', 'is-active', '', ''],
    waiting: ['is-done', 'is-done', 'is-active', ''],
    finishing: ['is-done', 'is-done', 'is-done', 'is-active'],
    done: ['is-done', 'is-done', 'is-done', 'is-done'],
    error: ['is-done', 'is-done', '', 'is-error'],
  }

  const classes = phaseMap[phase] || phaseMap.queued
  view.inlineSteps.forEach((step, index) => {
    step.className = 'runtime-stage'
    if (classes[index]) {
      step.classList.add(classes[index])
    }
  })
}

function updateLiveRun(view, { phase, label, meta }) {
  if (label) {
    view.label.textContent = label
    view.latest.textContent = label
  }

  if (meta) {
    view.meta.textContent = meta
  }

  if (phase) {
    setInlinePhase(view, phase)
    setRunPhase(phase)
  }
}

function finalizeLiveRun(view, resultText, durationMs) {
  view.article.classList.remove('live-message')
  view.badge.classList.add('is-complete')
  view.label.textContent = '执行完成'
  view.meta.textContent = `Astroncode 已返回结果${durationMs ? `，耗时 ${durationMs} ms` : ''}`
  view.latest.textContent = '结果已写入对话'
  setInlinePhase(view, 'done')
  view.output.innerHTML = ''
  view.output.append(renderRichText(resultText || '(empty response)'))
}

function failLiveRun(view, errorText) {
  view.badge.classList.add('is-error')
  view.label.textContent = '执行失败'
  view.meta.textContent = 'Astroncode 在运行时遇到了错误'
  view.latest.textContent = errorText
  setInlinePhase(view, 'error')
}

function updateStatus(status) {
  setText('#workspace-name', status.workspaceName)
  setText('#status-model', status.model)
  setText('#status-bridge', status.ready ? '已连接' : '待配置')
  setText('#workspace-path', status.workspacePath)
  setText('#provider-url', status.providerBaseUrl)
  setText('#config-file', status.configFile)
  setText('#credential-mask', status.credentialMasked)
}

async function loadStatus() {
  const response = await fetch('/api/status')
  const status = await response.json()
  state.status = status
  updateStatus(status)
  addExecution(`已加载工作区 ${status.workspaceName}`)
}

function clearTranscript() {
  transcript.innerHTML = ''
  addMessage('assistant', '会话已清空。你可以直接输入新的任务。')
  setText('#current-task', '等待输入')
  setText('#last-event', '会话已清空')
  setRunPhase('idle')
}

async function readNdjsonStream(response, onEvent) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const text = await response.text()
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed) {
        continue
      }
      onEvent(JSON.parse(trimmed))
    }
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        continue
      }

      try {
        onEvent(JSON.parse(trimmed))
      } catch {
        // Ignore malformed intermediate lines and keep the stream alive.
      }
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer.trim()))
  }
}

async function requestPromptFallback(prompt) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  })

  const payload = await response.json()
  if (!payload.ok) {
    throw new Error(payload.error || payload.detail || 'fallback-request-failed')
  }

  return payload.output || '(empty response)'
}

async function submitPrompt(prompt) {
  setText('#current-task', prompt)
  requestState.textContent = '运行中'
  sendButton.disabled = true
  setRunPhase('queued')
  addExecution('已接收任务')
  addMessage('user', prompt)
  const liveRun = createLiveRunMessage(prompt)

  let streamedText = ''
  let doneEvent = null

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok || !response.body) {
      throw new Error('stream-unavailable')
    }

    await readNdjsonStream(response, event => {
      if (event.type === 'init') {
        updateLiveRun(liveRun, {
          phase: 'queued',
          label: '会话已建立',
          meta: event.model ? `当前模型：${event.model}` : '正在准备执行',
        })
        addExecution('本地会话已建立')
        return
      }

      if (event.type === 'status') {
        const phase = event.phase === 'dispatching' ? 'dispatching' : event.phase
        updateLiveRun(liveRun, {
          phase,
          label: event.label || '正在执行',
          meta: 'Astroncode 正在运行本地任务',
        })
        addExecution(event.label || '正在执行')
        return
      }

      if (event.type === 'text-delta') {
        streamedText += event.text || ''
        updateLiveRun(liveRun, {
          phase: 'waiting',
          label: '正在生成回答',
          meta: 'Astroncode 正在写出结果',
        })
        liveRun.output.innerHTML = ''
        liveRun.output.append(renderRichText(streamedText))
        transcript.scrollTop = transcript.scrollHeight
        return
      }

      if (event.type === 'assistant' && event.text && !streamedText) {
        streamedText = event.text
        return
      }

      if (event.type === 'done') {
        doneEvent = event
        return
      }

      if (event.type === 'error') {
        throw new Error(event.error || 'runtime-error')
      }
    })

    let finalText = doneEvent?.result || streamedText || ''
    if (!finalText.trim()) {
      addExecution('流式结果为空，切换到稳定回退模式')
      finalText = await requestPromptFallback(prompt)
    }

    finalizeLiveRun(liveRun, finalText, doneEvent?.durationMs)
    addExecution(`执行完成${doneEvent?.durationMs ? `，耗时 ${doneEvent.durationMs} ms` : ''}`)
    setRunPhase('done')
  } catch (error) {
    try {
      addExecution(`流式桥接异常，正在回退：${error.message}`)
      const fallbackText = await requestPromptFallback(prompt)
      finalizeLiveRun(liveRun, fallbackText)
      addExecution('已切换到稳定回退模式并完成响应')
      setRunPhase('done')
    } catch (fallbackError) {
      failLiveRun(liveRun, fallbackError.message)
      addMessage('assistant', `本地桥接错误：${fallbackError.message}`)
      setRunPhase('error')
      addExecution(`桥接错误：${fallbackError.message}`)
    }
  } finally {
    requestState.textContent = '空闲'
    sendButton.disabled = false
    promptInput.focus()
  }
}

composer.addEventListener('submit', async event => {
  event.preventDefault()
  const prompt = promptInput.value.trim()
  if (!prompt) {
    return
  }

  promptInput.value = ''
  autosizeComposer()
  await submitPrompt(prompt)
})

promptInput.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    composer.requestSubmit()
  }
})

for (const element of document.querySelectorAll('[data-prompt]')) {
  element.addEventListener('click', async () => {
    const prompt = element.getAttribute('data-prompt')
    if (prompt) {
      await submitPrompt(prompt)
    }
  })
}

for (const element of document.querySelectorAll('[data-action="clear"]')) {
  element.addEventListener('click', () => {
    clearTranscript()
  })
}

promptInput.addEventListener('input', autosizeComposer)

loadStatus().catch(error => {
  addMessage('assistant', `加载本地状态失败：${error.message}`)
  setRunPhase('error')
  addExecution(`状态加载失败：${error.message}`)
})

setRunPhase('idle')
autosizeComposer()
promptInput.focus()
