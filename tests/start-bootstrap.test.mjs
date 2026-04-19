import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const projectRoot = path.resolve(import.meta.dirname, '..')

test('start script uses runtime cache helper and sync loop integration', async () => {
  const startSource = await readFile(
    path.join(projectRoot, 'scripts', 'start.mjs'),
    'utf8',
  )

  assert.match(startSource, /getAstronRuntimeCacheDir/)
  assert.match(startSource, /startRuntimeAutoSyncLoop/)
  assert.match(startSource, /main-windows-sync\.mjs/)
  assert.match(startSource, /stopRuntimeAutoSync/)
})
