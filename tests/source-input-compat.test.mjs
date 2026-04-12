import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const repoRoot = 'C:\\Users\\markw\\astroncode'

async function readRepoFile(relativePath) {
  return readFile(`${repoRoot}\\${relativePath}`, 'utf8')
}

test('early input capture preserves Windows IME compatibility', async () => {
  const earlyInputSource = await readRepoFile('src\\utils\\earlyInput.ts')

  assert.match(earlyInputSource, /process\.platform === 'win32'/)
  assert.match(earlyInputSource, /const chars = Array\.from\(str\)/)
  assert.match(earlyInputSource, /const code = char\.codePointAt\(0\)!/)
  assert.match(
    earlyInputSource,
    /Preserving Chinese input is more important than/,
  )
})
