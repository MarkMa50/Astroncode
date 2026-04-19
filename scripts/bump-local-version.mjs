import path from 'node:path'
import {
  incrementPatch,
  readCurrentVersion,
  writeVersionFiles,
} from './version-files.mjs'

const sourceDir = path.resolve(process.argv[2] || process.cwd())
const currentVersion = await readCurrentVersion(sourceDir)
const nextVersion = incrementPatch(currentVersion)
await writeVersionFiles(sourceDir, nextVersion)
process.stdout.write(nextVersion)
