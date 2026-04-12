import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

function normalizePathForComparison(value) {
  return String(value ?? '').trim().replace(/[\\/]+$/, '').toLowerCase()
}

export function getAstronShimDir() {
  const fromEnv = process.env.ASTRONCODE_SHIM_DIR

  if (fromEnv && String(fromEnv).trim()) {
    return path.resolve(String(fromEnv).trim())
  }

  return path.join(os.homedir(), '.local', 'bin')
}

export function isShimDirOnPath(shimDir, pathValue = process.env.Path || process.env.PATH || '') {
  const target = normalizePathForComparison(shimDir)

  return String(pathValue)
    .split(path.delimiter)
    .some(entry => normalizePathForComparison(entry) === target)
}

function buildCmdShimContent(targetScript) {
  return [
    '@echo off',
    'setlocal',
    `powershell -NoProfile -ExecutionPolicy Bypass -File "${targetScript}" %*`,
    'exit /b %ERRORLEVEL%',
    '',
  ].join('\r\n')
}

function buildPosixShimContent(projectRoot) {
  return [
    '#!/bin/sh',
    `node "${path.join(projectRoot, 'scripts', 'start.mjs')}" "$@"`,
    '',
  ].join('\n')
}

export async function ensureAstronCommandShims({
  projectRoot,
  shimDir = getAstronShimDir(),
  platform = process.platform,
} = {}) {
  const resolvedProjectRoot = path.resolve(projectRoot)
  const resolvedShimDir = path.resolve(shimDir)
  const isWindows = platform === 'win32'
  const shims = isWindows
    ? [
        {
          name: 'astroncode.cmd',
          targetScript: path.join(resolvedProjectRoot, 'astroncode.ps1'),
          content: buildCmdShimContent(path.join(resolvedProjectRoot, 'astroncode.ps1')),
        },
        {
          name: 'atroncode.cmd',
          targetScript: path.join(resolvedProjectRoot, 'atroncode.ps1'),
          content: buildCmdShimContent(path.join(resolvedProjectRoot, 'atroncode.ps1')),
        },
      ]
    : [
        {
          name: 'astroncode',
          targetScript: path.join(resolvedProjectRoot, 'scripts', 'start.mjs'),
          content: buildPosixShimContent(resolvedProjectRoot),
        },
        {
          name: 'atroncode',
          targetScript: path.join(resolvedProjectRoot, 'scripts', 'start.mjs'),
          content: buildPosixShimContent(resolvedProjectRoot),
        },
      ]

  await fs.mkdir(resolvedShimDir, { recursive: true })

  const writtenFiles = await Promise.all(
    shims.map(async shim => {
      const filePath = path.join(resolvedShimDir, shim.name)
      await fs.writeFile(filePath, shim.content, 'utf8')
      if (!isWindows) {
        await fs.chmod(filePath, 0o755)
      }
      return filePath
    }),
  )

  return {
    shimDir: resolvedShimDir,
    shims,
    writtenFiles,
    onPath: isShimDirOnPath(resolvedShimDir),
  }
}
