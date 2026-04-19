import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS = 30_000
const SYNC_CHILD_TIMEOUT_MS = 120_000

export function resolveRuntimeAutoSyncIntervalMs(env = process.env) {
  if (String(env.ASTRONCODE_AUTO_SYNC ?? '') === '0') {
    return null
  }

  if (String(env.ASTRONCODE_RUNTIME_AUTO_SYNC ?? '') === '0') {
    return null
  }

  const rawInterval = env.ASTRONCODE_RUNTIME_AUTO_SYNC_INTERVAL_MS
  if (rawInterval == null || String(rawInterval).trim() === '') {
    return DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS
  }

  const parsed = Number(rawInterval)
  if (!Number.isFinite(parsed)) {
    return DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS
  }

  if (parsed <= 0) {
    return null
  }

  return Math.floor(parsed)
}

export function startRuntimeAutoSyncLoop({
  scriptPath,
  projectRoot,
  env = process.env,
  nodeExecPath = process.execPath,
  syncArgs = ['--apply', '--commit'],
  spawnImpl = spawn,
  setIntervalImpl = setInterval,
  clearIntervalImpl = clearInterval,
} = {}) {
  const intervalMs = resolveRuntimeAutoSyncIntervalMs(env)

  if (!scriptPath || !projectRoot || intervalMs == null) {
    return () => {}
  }

  let inFlight = false

  const tick = () => {
    if (inFlight) {
      return
    }

    inFlight = true

    try {
      const child = spawnImpl(nodeExecPath, [scriptPath, ...syncArgs], {
        cwd: projectRoot,
        env,
        stdio: 'ignore',
      })

      const release = () => {
        clearTimeout(killTimer)
        inFlight = false
      }

      const killTimer = setTimeout(() => {
        try { child.kill?.() } catch {}
        inFlight = false
      }, SYNC_CHILD_TIMEOUT_MS)
      killTimer?.unref?.()

      child.once?.('close', release)
      child.once?.('error', release)
      child.unref?.()
    } catch {
      inFlight = false
    }
  }

  const intervalHandle = setIntervalImpl(tick, intervalMs)
  intervalHandle?.unref?.()

  return () => {
    clearIntervalImpl(intervalHandle)
  }
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const scriptPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'main-windows-sync.mjs',
  )
  startRuntimeAutoSyncLoop({
    scriptPath,
    projectRoot: process.cwd(),
  })
}
