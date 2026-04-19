/**
 * QuerySource Type
 *
 * Identifies the source/category of a query for analytics and caching purposes.
 * This is used to track different query patterns and optimize cache TTLs.
 */

/**
 * QuerySource - A string identifying the source of a query.
 *
 * This is a broad string type because query sources can be dynamically constructed
 * (e.g., 'agent:builtin:${agentType}', 'repl_main_thread:outputStyle:${style}').
 *
 * Common patterns:
 * - 'repl_main_thread' - Main REPL queries
 * - 'repl_main_thread:outputStyle:${style}' - REPL with specific output style
 * - 'agent:builtin:${agentType}' - Built-in agent queries
 * - 'agent:default' - Default agent
 * - 'agent:custom' - Custom agent queries
 * - '${tool_name}_tool' - Tool-specific queries
 * - 'side_question' - Side question queries
 * - 'session_search' - Session search queries
 * - 'auto_mode' - Auto mode classifier queries
 */
export type QuerySource = string

/**
 * Well-known query source constants for common patterns.
 */
export const KNOWN_QUERY_SOURCES = {
  // REPL sources
  REPL_MAIN_THREAD: 'repl_main_thread',
  REPL_OUTPUT_STYLE: 'repl_main_thread:outputStyle',

  // Agent sources
  AGENT_DEFAULT: 'agent:default',
  AGENT_CUSTOM: 'agent:custom',
  AGENT_BUILTIN_PREFIX: 'agent:builtin:',

  // Tool sources
  WEB_FETCH: 'web_fetch_apply',
  WEB_SEARCH: 'web_search_tool',

  // Utility sources
  SIDE_QUESTION: 'side_question',
  SESSION_SEARCH: 'session_search',
  GENERATE_TITLE: 'generate_session_title',
  AUTO_MODE: 'auto_mode',
  PERMISSION_EXPLAINER: 'permission_explainer',
  MODEL_VALIDATION: 'model_validation',
  MEMDIR_RELEVANCE: 'memdir_relevance',
  TELEPORT_TITLE: 'teleport_generate_title',
  CHROME_MCP: 'chrome_mcp',
  MCP_DATETIME_PARSE: 'mcp_datetime_parse',
} as const

/**
 * Type for well-known query sources.
 */
export type KnownQuerySource = (typeof KNOWN_QUERY_SOURCES)[keyof typeof KNOWN_QUERY_SOURCES]
