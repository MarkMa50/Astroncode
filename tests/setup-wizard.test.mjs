import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

import {
  buildSetupChanges,
  isProviderReady,
  runSetupWizard,
  shouldAutoLaunchSetup,
} from '../scripts/setup-wizard.mjs'

test('isProviderReady requires credential, base URL, and model', () => {
  assert.equal(isProviderReady({}), false)
  assert.equal(
    isProviderReady({
      ASTRONCODE_AUTH_TOKEN: 'secret',
      ASTRONCODE_BASE_URL: 'https://provider.example.com/v2',
      ASTRONCODE_MODEL: 'astron-code-latest',
    }),
    true,
  )
})

test('buildSetupChanges stores token mode and clears api-key mode', () => {
  const changes = buildSetupChanges({
    mode: 'token',
    credential: 'token-123',
    baseUrl: 'https://provider.example.com/v2',
    model: 'astron-code-latest',
  })

  assert.deepEqual(changes, {
    ASTRONCODE_AUTH_TOKEN: 'token-123',
    ASTRONCODE_API_KEY: null,
    ASTRONCODE_BASE_URL: 'https://provider.example.com/v2',
    ASTRONCODE_MODEL: 'astron-code-latest',
  })
})

test('shouldAutoLaunchSetup only triggers on plain first-run launches', () => {
  assert.equal(
    shouldAutoLaunchSetup({
      argv: [],
      entries: {},
    }),
    true,
  )

  assert.equal(
    shouldAutoLaunchSetup({
      argv: ['--help'],
      entries: {},
    }),
    false,
  )

  assert.equal(
    shouldAutoLaunchSetup({
      argv: ['gui'],
      entries: {},
    }),
    false,
  )

  assert.equal(
    shouldAutoLaunchSetup({
      argv: [],
      entries: {
        ASTRONCODE_AUTH_TOKEN: 'secret',
        ASTRONCODE_BASE_URL: 'https://provider.example.com/v2',
        ASTRONCODE_MODEL: 'astron-code-latest',
      },
    }),
    false,
  )
})

test('runSetupWizard writes token-mode provider settings', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-setup-wizard-'))
  const answers = [
    'token',
    'token-123',
    'https://provider.example.com/v2',
    'astron-code-latest',
    'y',
  ]
  const output = []

  const result = await runSetupWizard({
    projectRoot: dir,
    stdout: {
      write(chunk) {
        output.push(String(chunk))
      },
    },
    prompt: async () => answers.shift() ?? '',
  })

  const saved = await readFile(result.filePath, 'utf8')

  assert.equal(result.completed, true)
  assert.match(saved, /ASTRONCODE_AUTH_TOKEN=token-123/)
  assert.doesNotMatch(saved, /ASTRONCODE_API_KEY=/)
  assert.match(saved, /ASTRONCODE_BASE_URL=https:\/\/provider\.example\.com\/v2/)
  assert.match(saved, /ASTRONCODE_MODEL=astron-code-latest/)
  assert.match(output.join(''), /setup wizard/i)
  assert.match(
    output.join(''),
    /Runtime routing: normalized automatically for the local Astroncode runtime/,
  )
})

test('runSetupWizard keeps current values when user presses Enter', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-setup-wizard-existing-'))
  await writeFile(
    path.join(dir, '.env.astroncode'),
    [
      'ASTRONCODE_API_KEY=existing-key',
      'ASTRONCODE_BASE_URL=https://provider.example.com/v2',
      'ASTRONCODE_MODEL=astron-code-latest',
    ].join('\n'),
    'utf8',
  )

  const answers = ['', '', '', '', 'y']

  const result = await runSetupWizard({
    projectRoot: dir,
    stdout: {
      write() {},
    },
    prompt: async () => answers.shift() ?? '',
  })

  const saved = await readFile(path.join(dir, '.env.astroncode'), 'utf8')

  assert.equal(result.completed, true)
  assert.match(saved, /ASTRONCODE_API_KEY=existing-key/)
  assert.match(saved, /ASTRONCODE_BASE_URL=https:\/\/provider\.example\.com\/v2/)
  assert.match(saved, /ASTRONCODE_MODEL=astron-code-latest/)
})

test('runSetupWizard accepts a pasted API key at the credential-type prompt', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-setup-wizard-prefetch-'))
  const output = []
  let promptCount = 0

  const result = await runSetupWizard({
    projectRoot: dir,
    stdout: {
      write(chunk) {
        output.push(String(chunk))
      },
    },
    prompt: async message => {
      promptCount += 1

      if (promptCount === 1) {
        assert.match(message, /Credential type \[token\/api-key\]/)
        return 'sk-live-1234567890'
      }

      if (promptCount === 2) {
        assert.match(message, /Provider base URL/)
        return 'https://provider.example.com/v2'
      }

      if (promptCount === 3) {
        assert.match(message, /Model ID/)
        return 'astron-code-latest'
      }

      if (promptCount === 4) {
        assert.match(message, /Save these settings/)
        return 'y'
      }

      throw new Error(`Unexpected prompt ${promptCount}: ${message}`)
    },
  })

  const saved = await readFile(result.filePath, 'utf8')

  assert.equal(result.completed, true)
  assert.match(saved, /ASTRONCODE_API_KEY=sk-live-1234567890/)
  assert.doesNotMatch(saved, /ASTRONCODE_AUTH_TOKEN=/)
  assert.match(output.join(''), /Detected a pasted API key/i)
})

test('runSetupWizard validates the provider base URL before saving', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-setup-wizard-base-url-'))
  const output = []
  const answers = [
    'token',
    'token-1234567890',
    'provider.example.com/v2',
    'https://provider.example.com/v2',
    'astron-code-latest',
    'y',
  ]

  const result = await runSetupWizard({
    projectRoot: dir,
    stdout: {
      write(chunk) {
        output.push(String(chunk))
      },
    },
    prompt: async () => answers.shift() ?? '',
  })

  const saved = await readFile(result.filePath, 'utf8')

  assert.equal(result.completed, true)
  assert.match(saved, /ASTRONCODE_BASE_URL=https:\/\/provider\.example\.com\/v2/)
  assert.doesNotMatch(saved, /ASTRONCODE_BASE_URL=provider\.example\.com\/v2/)
  assert.match(output.join(''), /Please enter a valid URL starting with http:\/\/ or https:\/\//)
})

test('runSetupWizard returns exit code 130 when the interactive flow is aborted', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-setup-wizard-abort-'))
  const output = []

  const result = await runSetupWizard({
    projectRoot: dir,
    stdout: {
      write(chunk) {
        output.push(String(chunk))
      },
    },
    prompt: async message => {
      if (/Credential type \[token\/api-key\]/.test(message)) {
        const error = new Error('aborted')
        error.code = 'ABORT_ERR'
        throw error
      }

      throw new Error(`Unexpected prompt during abort test: ${message}`)
    },
  })

  assert.equal(result.handled, true)
  assert.equal(result.completed, false)
  assert.equal(result.exitCode, 130)
  assert.match(output.join(''), /Setup cancelled\./)
})
