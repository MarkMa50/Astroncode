/**
 * Shell Utilities Index
 *
 * Shell providers, command validation, and shell detection.
 *
 * @module utils/shell
 */

// Shell providers
export { BashProvider } from './bashProvider.js'
export { PowerShellProvider } from './powershellProvider.js'
export type { ShellProvider } from './shellProvider.js'

// Shell detection
export { detectPowerShell } from './powershellDetection.js'
export { resolveDefaultShell } from './resolveDefaultShell.js'

// Prefix handling
export { getShellPrefixInfo, parsePrefix } from './prefix.js'
export { getSpecPrefix } from './specPrefix.js'

// Output limits
export { getOutputLimits } from './outputLimits.js'

// Read-only command validation
export { validateReadOnlyCommand } from './readOnlyCommandValidation.js'

// Shell tool utilities
export { getShellToolUtils } from './shellToolUtils.js'
