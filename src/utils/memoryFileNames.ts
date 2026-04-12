/**
 * Memory file naming constants for Astroncode.
 *
 * Supports both ASTRONCODE.md (new) and CLAUDE.md (legacy) for backward compatibility.
 * When loading memory files, both names are checked, with ASTRONCODE.md taking priority.
 */

/**
 * Primary memory file name (new)
 */
export const MEMORY_FILE_NAME = 'ASTRONCODE.md'

/**
 * Legacy memory file name for backward compatibility
 */
export const LEGACY_MEMORY_FILE_NAME = 'CLAUDE.md'

/**
 * Primary local memory file name (new)
 */
export const LOCAL_MEMORY_FILE_NAME = 'ASTRONCODE.local.md'

/**
 * Legacy local memory file name for backward compatibility
 */
export const LEGACY_LOCAL_MEMORY_FILE_NAME = 'CLAUDE.local.md'

/**
 * Primary rules directory name (new)
 */
export const RULES_DIR_NAME = '.astroncode'

/**
 * Legacy rules directory name for backward compatibility
 */
export const LEGACY_RULES_DIR_NAME = '.claude'

/**
 * Get all possible memory file names to check (in priority order)
 */
export function getMemoryFileNames(): string[] {
  return [MEMORY_FILE_NAME, LEGACY_MEMORY_FILE_NAME]
}

/**
 * Get all possible local memory file names to check (in priority order)
 */
export function getLocalMemoryFileNames(): string[] {
  return [LOCAL_MEMORY_FILE_NAME, LEGACY_LOCAL_MEMORY_FILE_NAME]
}

/**
 * Get all possible rules directory names to check (in priority order)
 */
export function getRulesDirNames(): string[] {
  return [RULES_DIR_NAME, LEGACY_RULES_DIR_NAME]
}

/**
 * Check if a file name is a memory file (either new or legacy name)
 */
export function isMemoryFileName(name: string): boolean {
  return (
    name === MEMORY_FILE_NAME ||
    name === LEGACY_MEMORY_FILE_NAME ||
    name === LOCAL_MEMORY_FILE_NAME ||
    name === LEGACY_LOCAL_MEMORY_FILE_NAME
  )
}
