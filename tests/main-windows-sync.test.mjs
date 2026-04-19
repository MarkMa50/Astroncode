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
      'src/constants/querySource.ts',
      'src/utils/index.ts',
      'src/utils/plugins/index.ts',
      'src/utils/ui/index.ts',
      'src/types/utils.ts',
      'tests/services-api-error.test.mjs',
      'src/utils/core/index.ts',
      'tests/utils-core.test.mjs',
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
  managed: [
    {
      path: 'package.json',
      strategy: 'package-json',
      preserveBinKeys: ['atroncode'],
      preserveScriptKeys: [
        'test:astron',
        'test:runtime',
        'test:sync',
        'test:version-sync',
        'sync:align',
        'sync:align:commit',
        'sync:align:dry-run',
        'sync:loop',
      ],
      dropSourceScriptKeys: ['sync:check', 'sync:local', 'sync:cloud'],
      overrides: {
        homepage: 'https://github.com/MarkMa50/Astroncode',
        bugs: {
          url: 'https://github.com/MarkMa50/Astroncode/issues',
        },
      },
    },
    {
      path: 'scripts/astron-meta.mjs',
      strategy: 'copy',
    },
  ],
  blocked: [
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

test('classifyPath allows explicitly shared helper files under src and tests', () => {
  const config = {
    ...baseConfig,
    shared: {
      ...baseConfig.shared,
      include: [
        ...baseConfig.shared.include,
        'src/utils/logoPageCopy.mjs',
        'tests/runtime-branding-copy.test.mjs',
      ],
    },
    blocked: ['README.md'],
  }

  assert.deepEqual(
    classifyPath('src/utils/logoPageCopy.mjs', config),
    {
      type: 'shared',
      sourcePath: 'src/utils/logoPageCopy.mjs',
      targetPath: 'src/utils/logoPageCopy.mjs',
      reason: 'matched shared include rule',
    },
  )

  assert.deepEqual(
    classifyPath('tests/runtime-branding-copy.test.mjs', config),
    {
      type: 'shared',
      sourcePath: 'tests/runtime-branding-copy.test.mjs',
      targetPath: 'tests/runtime-branding-copy.test.mjs',
      reason: 'matched shared include rule',
    },
  )
})

test('classifyPath allows explicitly shared utility index and utility tests', () => {
  const config = {
    ...baseConfig,
    blocked: ['README.md'],
  }

  assert.deepEqual(
    classifyPath('src/utils/core/index.ts', config),
    {
      type: 'shared',
      sourcePath: 'src/utils/core/index.ts',
      targetPath: 'src/utils/core/index.ts',
      reason: 'matched shared include rule',
    },
  )

  assert.deepEqual(
    classifyPath('tests/utils-core.test.mjs', config),
    {
      type: 'shared',
      sourcePath: 'tests/utils-core.test.mjs',
      targetPath: 'tests/utils-core.test.mjs',
      reason: 'matched shared include rule',
    },
  )
})

test('classifyPath allows explicitly shared constants, type barrels, and service tests', () => {
  const config = {
    ...baseConfig,
    blocked: ['README.md'],
  }

  assert.deepEqual(
    classifyPath('src/constants/querySource.ts', config),
    {
      type: 'shared',
      sourcePath: 'src/constants/querySource.ts',
      targetPath: 'src/constants/querySource.ts',
      reason: 'matched shared include rule',
    },
  )

  assert.deepEqual(
    classifyPath('src/utils/index.ts', config),
    {
      type: 'shared',
      sourcePath: 'src/utils/index.ts',
      targetPath: 'src/utils/index.ts',
      reason: 'matched shared include rule',
    },
  )

  assert.deepEqual(
    classifyPath('tests/services-api-error.test.mjs', config),
    {
      type: 'shared',
      sourcePath: 'tests/services-api-error.test.mjs',
      targetPath: 'tests/services-api-error.test.mjs',
      reason: 'matched shared include rule',
    },
  )
})

test('classifyPath treats managed files as managed before blocked rules', () => {
  const decision = classifyPath('package.json', baseConfig)

  assert.equal(decision.type, 'managed')
  assert.equal(decision.sourcePath, 'package.json')
  assert.equal(decision.targetPath, 'package.json')
  assert.equal(decision.reason, 'matched managed rule')
  assert.equal(decision.managedRule?.strategy, 'package-json')
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
    ['scripts/runtime-branding.mjs', 'source runtime branding'],
    ['src/gui/app.js', 'upstream gui'],
  ])
  const targetFiles = new Map([
    ['CHANGELOG.md', 'old changelog'],
    ['scripts/runtime-branding.mjs', 'windows runtime branding'],
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
      sourcePath: 'scripts/runtime-branding.mjs',
      targetPath: 'scripts/runtime-branding.mjs',
      reason: 'matched blocked rule',
    },
  ])
})

test('planSync merges managed package metadata with Windows-specific overrides', () => {
  const sourceFiles = new Map([
    ['package.json', JSON.stringify({
      name: 'astroncode',
      version: '1.0.742',
      bin: {
        astroncode: 'scripts/start.mjs',
        astron: 'scripts/start.mjs',
      },
      author: 'Astroncode',
      description: 'Astroncode terminal coding system with a swappable model provider launch layer.',
      homepage: 'https://github.com/MarkMa50/Astroncode----src',
      bugs: {
        url: 'https://github.com/MarkMa50/Astroncode----src/issues',
      },
      scripts: {
        test: 'node --test ./tests/*.test.mjs',
        prepare: 'node ./prepare.mjs',
        'sync:check': 'sh ./scripts/check-installed-sync.sh',
        'sync:local': 'sh ./scripts/deploy-installed-app.sh',
        'sync:cloud': 'sh ./scripts/auto-sync-startup.sh --once',
      },
    }, null, 2)],
  ])
  const targetFiles = new Map([
    ['package.json', JSON.stringify({
      name: 'atroncode',
      version: '1.0.10',
      bin: {
        atroncode: 'scripts/start.mjs',
        astroncode: 'scripts/start.mjs',
      },
      scripts: {
        'test:astron': 'node --test ./tests/astron-env.test.mjs',
        'sync:align': 'node ./scripts/main-windows-sync.mjs --apply',
      },
    }, null, 2)],
  ])

  const plan = planSync({
    sourceFiles,
    targetFiles,
    config: baseConfig,
  })

  assert.equal(plan.managedActions.length, 1)
  assert.equal(plan.managedActions[0].targetPath, 'package.json')
  assert.equal(plan.managedActions[0].mode, 'update')

  const merged = JSON.parse(plan.managedActions[0].content)
  assert.equal(merged.name, 'astroncode')
  assert.equal(merged.version, '1.0.742')
  assert.equal(merged.bin.atroncode, 'scripts/start.mjs')
  assert.equal(merged.bin.astroncode, 'scripts/start.mjs')
  assert.equal(merged.homepage, 'https://github.com/MarkMa50/Astroncode')
  assert.equal(merged.bugs.url, 'https://github.com/MarkMa50/Astroncode/issues')
  assert.equal(merged.scripts.test, 'node --test ./tests/*.test.mjs')
  assert.equal(merged.scripts['test:astron'], 'node --test ./tests/astron-env.test.mjs')
  assert.equal(merged.scripts['sync:align'], 'node ./scripts/main-windows-sync.mjs --apply')
  assert.equal(merged.scripts['sync:check'], undefined)
})

test('planSync treats astron-meta as a managed copy when only the version differs', () => {
  const sourceFiles = new Map([
    ['scripts/astron-meta.mjs', "export const ASTRONCODE_VERSION = '1.0.742'\n"],
  ])
  const targetFiles = new Map([
    ['scripts/astron-meta.mjs', "export const ASTRONCODE_VERSION = '1.0.10'\n"],
  ])

  const plan = planSync({
    sourceFiles,
    targetFiles,
    config: baseConfig,
  })

  assert.deepEqual(plan.managedActions, [
    {
      sourcePath: 'scripts/astron-meta.mjs',
      targetPath: 'scripts/astron-meta.mjs',
      mode: 'update',
      content: "export const ASTRONCODE_VERSION = '1.0.742'\n",
      strategy: 'copy',
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
