/**
 * Utils Main Index
 *
 * Centralized entry point for all utility modules.
 * Provides organized access to core, fs, network, process, ui, and validation utilities.
 *
 * ## Usage
 *
 * ```typescript
 * // Import from specific category
 * import { AstronError, isAbortError } from 'src/utils/core/index.js'
 *
 * // Or import from main index
 * import { AstronError, readFile, httpGet } from 'src/utils/index.js'
 * ```
 *
 * ## Organization
 *
 * - **core/**: Error handling, config, environment, logging
 * - **fs/**: File system operations, paths, glob, diff
 * - **network/**: HTTP, API client, proxy, WebSocket
 * - **process/**: Shell execution, process management, signals
 * - **ui/**: Formatting, terminal, theme, clipboard
 * - **validation/**: JSON, YAML, markdown, type guards
 *
 * @module utils
 */

// Re-export from categorized subdirectories
export * from './core/index.js'
export * from './fs/index.js'
export * from './network/index.js'
export * from './process/index.js'
export * from './ui/index.js'
export * from './validation/index.js'
