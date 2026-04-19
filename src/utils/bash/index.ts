/**
 * Bash Utilities Index
 *
 * Bash shell parsing, command analysis, and completion utilities.
 *
 * @module utils/bash
 */

// Command parsing
export { parseBashCommand } from './bashParser.js'
export { parsePipeCommand } from './bashPipeCommand.js'
export type { ParsedCommand, ParsedPipeline } from './ParsedCommand.js'

// AST and tree-sitter
export { analyzeWithTreeSitter } from './treeSitterAnalysis.js'
export { parseToAst } from './ast.js'

// Commands and heredoc
export { parseCommands } from './commands.js'
export { parseHeredoc } from './heredoc.js'

// Shell utilities
export { getShellCompletion } from './shellCompletion.js'
export { quoteShellArg, unquoteShellArg } from './shellQuote.js'
export { getQuotingType } from './shellQuoting.js'
export { getShellPrefix } from './shellPrefix.js'
export { getPrefix } from './prefix.js'
export { parsePrefix } from './parser.js'

// Registry
export { getBashRegistry } from './registry.js'

// Snapshot
export { ShellSnapshot } from './ShellSnapshot.js'

// Re-export specs
export * from './specs/index.js'
