import path from 'node:path'

import { ensureRuntimeBrandingFile } from './runtime-branding.mjs'

const runtimeFile = path.resolve(process.cwd(), 'cli.js')
const result = await ensureRuntimeBrandingFile(runtimeFile)

console.log(
  `[AstronCode] Runtime branding patch applied to ${runtimeFile}. Rules changed: ${result.replacements}`,
)
