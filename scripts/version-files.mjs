import fs from 'node:fs/promises'
import path from 'node:path'

export const VERSION_FILE_PATHS = ['package.json', 'scripts/astron-meta.mjs']

export function incrementPatch(version) {
  const match = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)(.*)$/)

  if (!match) {
    throw new Error(`Unsupported version format: ${version}`)
  }

  const [, major, minor, patchPart, suffix] = match
  return `${major}.${minor}.${Number(patchPart) + 1}${suffix || ''}`
}

export async function readCurrentVersion(sourceDir) {
  const packageJsonPath = path.join(sourceDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  return String(packageJson.version).trim()
}

export async function writeVersionFiles(sourceDir, nextVersion) {
  const packageJsonPath = path.join(sourceDir, 'package.json')
  const astronMetaPath = path.join(sourceDir, 'scripts', 'astron-meta.mjs')

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  packageJson.version = nextVersion
  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')

  const astronMeta = await fs.readFile(astronMetaPath, 'utf8')
  const updatedAstronMeta = astronMeta.replace(
    /export const ASTRONCODE_VERSION = '.*'/,
    `export const ASTRONCODE_VERSION = '${nextVersion}'`,
  )

  if (updatedAstronMeta === astronMeta) {
    throw new Error('Failed to update scripts/astron-meta.mjs version string')
  }

  await fs.writeFile(astronMetaPath, updatedAstronMeta, 'utf8')
}
