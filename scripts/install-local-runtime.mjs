import { spawn } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { readAstronEnvConfig } from './astron-env.mjs'
import { ensureAstronCommandShims } from './install-shims.mjs'

const DESKTOP_CLI_LAUNCHER_NAME = 'Astroncode CLI'

function normalizePathForComparison(value) {
  return String(value ?? '').trim().replace(/[\\/]+$/, '').toLowerCase()
}

function detectDesktopDir(platform = process.platform) {
  const fromEnv = process.env.ASTRONCODE_DESKTOP_DIR

  if (fromEnv && String(fromEnv).trim()) {
    return path.resolve(String(fromEnv).trim())
  }

  const home = os.homedir()
  const candidates =
    platform === 'win32'
      ? [
          path.join(home, 'OneDrive', '桌面'),
          path.join(home, 'OneDrive', 'Desktop'),
          path.join(home, 'Desktop'),
        ]
      : [path.join(home, 'Desktop')]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  return candidates[0]
}

function buildDesktopCliLauncher(projectRoot, platform = process.platform) {
  if (platform !== 'win32') {
    return [
      '#!/bin/sh',
      'set -eu',
      `exec sh "${path.join(projectRoot, 'astroncode.sh')}" "$@"`,
      '',
    ].join('\n')
  }

  return [
    '@echo off',
    'setlocal',
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${path.join(projectRoot, 'astroncode.ps1')}" %*`,
    'exit /b %ERRORLEVEL%',
    '',
  ].join('\r\n')
}

function maybeOpenDesktopDir(desktopDir) {
  if (process.platform !== 'darwin') {
    return
  }

  try {
    const child = spawn('open', [desktopDir], {
      detached: true,
      stdio: 'ignore',
    })
    child.unref()
  } catch {}
}

function buildDesktopGuiLauncher(projectRoot, platform = process.platform) {
  if (platform !== 'win32') {
    return [
      '#!/bin/sh',
      `sh "${path.join(projectRoot, 'astroncode-gui.sh')}"`,
      '',
    ].join('\n')
  }

  const guiScript = path.join(projectRoot, 'astroncode-gui.ps1')

  return [
    'Set WshShell = CreateObject("WScript.Shell")',
    `WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -File ""${guiScript}""", 0, False`,
    '',
  ].join('\r\n')
}

async function removeLegacyDesktopLaunchers(desktopDir, platform = process.platform) {
  const legacyNames = [
    'Astroncode.command',
    `${DESKTOP_CLI_LAUNCHER_NAME}.command`,
    'Astroncode GUI.command',
    'Astroncode.app',
    'Install Astroncode.command',
    'Start Astroncode.command',
    'Start Astroncode GUI.command',
    'Astroncode.cmd',
    `${DESKTOP_CLI_LAUNCHER_NAME}.cmd`,
  ]

  if (platform === 'win32') {
    legacyNames.push('Astroncode GUI.vbs')
  }

  await Promise.all(
    legacyNames.map(filePath =>
      fsp.rm(path.join(desktopDir, filePath), { recursive: true, force: true }),
    ),
  )
}

export async function ensureAstronDesktopLaunchers({
  projectRoot,
  desktopDir = detectDesktopDir(),
  platform = process.platform,
} = {}) {
  const resolvedProjectRoot = path.resolve(projectRoot)
  const resolvedDesktopDir = path.resolve(desktopDir)
  const isWindows = platform === 'win32'

  await fsp.mkdir(resolvedDesktopDir, { recursive: true })
  await removeLegacyDesktopLaunchers(resolvedDesktopDir, platform)

  const launchers = isWindows
    ? [
        {
          name: `${DESKTOP_CLI_LAUNCHER_NAME}.cmd`,
          content: buildDesktopCliLauncher(resolvedProjectRoot, platform),
        },
        {
          name: 'Astroncode GUI.vbs',
          content: buildDesktopGuiLauncher(resolvedProjectRoot, platform),
        },
      ]
    : [
        {
          name: `${DESKTOP_CLI_LAUNCHER_NAME}.command`,
          content: buildDesktopCliLauncher(resolvedProjectRoot, platform),
        },
        {
          name: 'Astroncode GUI.command',
          content: buildDesktopGuiLauncher(resolvedProjectRoot, platform),
        },
      ]

  const writtenFiles = await Promise.all(
    launchers.map(async launcher => {
      const filePath = path.join(resolvedDesktopDir, launcher.name)
      await fsp.writeFile(filePath, launcher.content, 'utf8')
      if (!isWindows) {
        await fsp.chmod(filePath, 0o755)
      }
      return filePath
    }),
  )

  if (!isWindows) {
    maybeOpenDesktopDir(resolvedDesktopDir)
  }

  return {
    desktopDir: resolvedDesktopDir,
    writtenFiles,
    launchers: launchers.map((launcher, index) => ({
      ...launcher,
      filePath: writtenFiles[index],
    })),
  }
}

export async function runAstronInstall({
  projectRoot,
  shimDir,
  desktopDir,
  platform = process.platform,
} = {}) {
  const resolvedProjectRoot = path.resolve(projectRoot)
  const nodePath = process.execPath
  const nodeVersion = process.version
  const shimResult = await ensureAstronCommandShims({
    projectRoot: resolvedProjectRoot,
    shimDir,
    platform,
  })
  const desktopResult = await ensureAstronDesktopLaunchers({
    projectRoot: resolvedProjectRoot,
    desktopDir,
    platform,
  })
  const { filePath, entries } = readAstronEnvConfig(resolvedProjectRoot)
  const providerReady = Boolean(
    (entries.ASTRONCODE_AUTH_TOKEN || entries.ASTRONCODE_API_KEY) &&
      entries.ASTRONCODE_BASE_URL &&
      entries.ASTRONCODE_MODEL,
  )
  const providerMode = entries.ASTRONCODE_AUTH_TOKEN
    ? 'token'
    : entries.ASTRONCODE_API_KEY
      ? 'api-key'
      : 'missing'

  return {
    projectRoot: resolvedProjectRoot,
    nodePath,
    nodeVersion,
    shimResult,
    desktopResult,
    provider: {
      configFile: filePath,
      ready: providerReady,
      mode: providerMode,
    },
    desktopDirOnShimPath:
      normalizePathForComparison(desktopResult.desktopDir) ===
      normalizePathForComparison(shimResult.shimDir),
  }
}
