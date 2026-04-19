import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyRenameMap,
  classifyPath,
  planSync,
} from '../scripts/main-windows-sync-lib.mjs'

const baseConfig = {
  shared: {
    include: [
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'docs/**/*.md',
    ],
    exclude: [
      'docs/superpowers/**',
    ],
  },
  preserve: [
    'gui/**',
    'astroncode.ps1',
    'astroncode.cmd',
  ],
  blocked: [
    'package.json',
    'README.md',
    'scripts/**',
    'src/**',
    'tests/**',
  ],
  renameMap: [
    {
      source: 'docs/',
      target: 'docs/',
    },
  ],
}

test('applyRenameMap remaps configured prefixes and leaves unrelated paths untouched', () => {
  assert.equal(
    applyRenameMap('docs/ARCHITECTURE.md', baseConfig.renameMap),
    'docs/ARCHITECTURE.md',
  )
  assert.equal(
    applyRenameMap('CHANGELOG.md', baseConfig.renameMap),
    'CHANGELOG.md',
  )
})

test('classifyPath marks included markdown docs as shared and scripts as blocked', () => {
  assert.deepEqual(
    classifyPath('docs/ARCHITECTURE.md', baseConfig),
    {
      type: 'shared',
      sourcePath: 'docs/ARCHITECTURE.md',
      targetPath: 'docs/ARCHITECTURE.md',
      reason: 'matched shared include rule',
    },
  )

  assert.deepEqual(
    classifyPath('scripts/runtime-branding.mjs', baseConfig),
    {
      type: 'blocked',
      sourcePath: 'scripts/runtime-branding.mjs',
      targetPath: 'scripts/runtime-branding.mjs',
      reason: 'matched blocked rule',
    },
  )
})

test('classifyPath protects Windows preserve targets after rename mapping', () => {
  const config = {
    ...baseConfig,
    renameMap: [
      {
        source: 'src/gui/',
        target: 'gui/',
      },
    ],
  }

  assert.deepEqual(
    classifyPath('src/gui/app.js', config),
    {
      type: 'preserve',
      sourcePath: 'src/gui/app.js',
      targetPath: 'gui/app.js',
      reason: 'matched preserve rule',
    },
  )
})

test('planSync copies shared docs but reports preserve and blocked conflicts separately', () => {
  const sourceFiles = new Map([
    ['CHANGELOG.md', 'new changelog'],
    ['docs/ARCHITECTURE.md', 'shared architecture'],
    ['package.json', '{"name":"astroncode"}'],
    ['src/gui/app.js', 'upstream gui'],
  ])
  const targetFiles = new Map([
    ['CHANGELOG.md', 'old changelog'],
    ['package.json', '{"name":"atroncode"}'],
    ['gui/app.js', 'windows gui'],
  ])
  const config = {
    ...baseConfig,
    renameMap: [
      {
        source: 'src/gui/',
        target: 'gui/',
      },
    ],
  }

  const plan = planSync({
    sourceFiles,
    targetFiles,
    config,
  })

  assert.deepEqual(plan.copyActions, [
    {
      sourcePath: 'CHANGELOG.md',
      targetPath: 'CHANGELOG.md',
      mode: 'update',
    },
    {
      sourcePath: 'docs/ARCHITECTURE.md',
      targetPath: 'docs/ARCHITECTURE.md',
      mode: 'create',
    },
  ])
  assert.deepEqual(plan.preserveConflicts, [
    {
      sourcePath: 'src/gui/app.js',
      targetPath: 'gui/app.js',
      reason: 'matched preserve rule',
    },
  ])
  assert.deepEqual(plan.blockedConflicts, [
    {
      sourcePath: 'package.json',
      targetPath: 'package.json',
      reason: 'matched blocked rule',
    },
  ])
})

test('planSync treats LF and CRLF text files as equivalent for shared sync decisions', () => {
  const sourceFiles = new Map([
    ['scripts/version-files.mjs', 'export const A = 1\nexport const B = 2\n'],
  ])
  const targetFiles = new Map([
    ['scripts/version-files.mjs', 'export const A = 1\r\nexport const B = 2\r\n'],
  ])
  const config = {
    ...baseConfig,
    shared: {
      ...baseConfig.shared,
      include: ['scripts/version-files.mjs'],
    },
    blocked: [],
  }

  const plan = planSync({
    sourceFiles,
    targetFiles,
    config,
  })

  assert.deepEqual(plan.copyActions, [])
  assert.deepEqual(plan.preserveConflicts, [])
  assert.deepEqual(plan.blockedConflicts, [])
})
