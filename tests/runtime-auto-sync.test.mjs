import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import test from 'node:test'

import {
  DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS,
  resolveRuntimeAutoSyncIntervalMs,
  startRuntimeAutoSyncLoop,
} from '../scripts/runtime-auto-sync.mjs'

function createFakeChild() {
  const child = new EventEmitter()
  child.unrefCalled = false
  child.unref = () => {
    child.unrefCalled = true
  }
  return child
}

test('resolveRuntimeAutoSyncIntervalMs honors enablement flags and interval overrides', () => {
  assert.equal(resolveRuntimeAutoSyncIntervalMs({}), DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS)
  assert.equal(
    resolveRuntimeAutoSyncIntervalMs({
      ASTRONCODE_RUNTIME_AUTO_SYNC_INTERVAL_MS: '45000',
    }),
    45000,
  )
  assert.equal(
    resolveRuntimeAutoSyncIntervalMs({
      ASTRONCODE_RUNTIME_AUTO_SYNC_INTERVAL_MS: 'not-a-number',
    }),
    DEFAULT_RUNTIME_AUTO_SYNC_INTERVAL_MS,
  )
  assert.equal(
    resolveRuntimeAutoSyncIntervalMs({
      ASTRONCODE_RUNTIME_AUTO_SYNC_INTERVAL_MS: '0',
    }),
    null,
  )
  assert.equal(
    resolveRuntimeAutoSyncIntervalMs({
      ASTRONCODE_AUTO_SYNC: '0',
    }),
    null,
  )
  assert.equal(
    resolveRuntimeAutoSyncIntervalMs({
      ASTRONCODE_RUNTIME_AUTO_SYNC: '0',
    }),
    null,
  )
})

test('startRuntimeAutoSyncLoop schedules non-overlapping node-based sync launches', () => {
  const spawnCalls = []
  const fakeChildren = []
  let intervalHandle = null
  let clearedHandle = null

  const stop = startRuntimeAutoSyncLoop({
    scriptPath: 'C:/tmp/main-windows-sync.mjs',
    projectRoot: 'C:/tmp/project',
    env: {
      ASTRONCODE_RUNTIME_AUTO_SYNC_INTERVAL_MS: '2500',
    },
    nodeExecPath: 'node',
    syncArgs: ['--apply', '--commit'],
    spawnImpl(command, args, options) {
      spawnCalls.push({ command, args, options })
      const child = createFakeChild()
      fakeChildren.push(child)
      return child
    },
    setIntervalImpl(callback, ms) {
      intervalHandle = {
        callback,
        ms,
        unrefCalled: false,
        unref() {
          this.unrefCalled = true
        },
      }
      return intervalHandle
    },
    clearIntervalImpl(handle) {
      clearedHandle = handle
    },
  })

  assert.equal(intervalHandle.ms, 2500)
  assert.equal(intervalHandle.unrefCalled, true)

  intervalHandle.callback()
  assert.equal(spawnCalls.length, 1)
  assert.equal(spawnCalls[0].command, 'node')
  assert.deepEqual(spawnCalls[0].args, [
    'C:/tmp/main-windows-sync.mjs',
    '--apply',
    '--commit',
  ])
  assert.equal(fakeChildren[0].unrefCalled, true)

  intervalHandle.callback()
  assert.equal(spawnCalls.length, 1)

  fakeChildren[0].emit('close', 0)
  intervalHandle.callback()
  assert.equal(spawnCalls.length, 2)

  stop()
  assert.equal(clearedHandle, intervalHandle)
})

test('startRuntimeAutoSyncLoop is a no-op when runtime sync is disabled', () => {
  let intervalCreated = false

  const stop = startRuntimeAutoSyncLoop({
    scriptPath: 'C:/tmp/main-windows-sync.mjs',
    projectRoot: 'C:/tmp/project',
    env: {
      ASTRONCODE_RUNTIME_AUTO_SYNC: '0',
    },
    spawnImpl() {
      throw new Error('spawn should not be called when runtime sync is disabled')
    },
    setIntervalImpl() {
      intervalCreated = true
      return {
        unref() {},
      }
    },
    clearIntervalImpl() {},
  })

  assert.equal(intervalCreated, false)
  assert.doesNotThrow(() => stop())
})
