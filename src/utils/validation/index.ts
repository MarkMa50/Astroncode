/**
 * Validation Utilities Index
 *
 * This module provides centralized exports for validation utilities.
 * Import from 'src/utils/validation/index.js' for organized access.
 *
 * @module utils/validation
 */

// JSON utilities
export {
  parseJson,
  stringifyJson,
  isValidJson,
  safeParseJson,
  type JsonValue,
  type JsonArray,
  type JsonObject,
} from '../json.js'

// JSON read utilities
export {
  readJsonFile,
  writeJsonFile,
  parseJsonFile,
} from '../jsonRead.js'

// YAML utilities
export {
  parseYaml,
  stringifyYaml,
  isValidYaml,
} from '../yaml.js'

// XML utilities
export {
  parseXml,
  stringifyXml,
  isValidXml,
} from '../xml.js'

// Frontmatter parser
export {
  parseFrontmatter,
  extractFrontmatter,
  hasFrontmatter,
  type FrontmatterResult,
} from '../frontmatterParser.js'

// Markdown utilities
export {
  parseMarkdown,
  renderMarkdown,
  extractHeadings,
  extractLinks,
  extractCodeBlocks,
  type MarkdownNode,
} from '../markdown.js'

// Semantic boolean
export {
  parseBoolean,
  toBoolean,
  isTruthy,
  isFalsy,
  type BooleanLike,
} from '../semanticBoolean.js'

// Semantic number
export {
  parseNumber,
  toNumber,
  isNumeric,
  type NumberLike,
} from '../semanticNumber.js'

// Semver utilities
export {
  parseSemver,
  compareSemver,
  satisfiesSemver,
  isValidSemver,
  type SemverVersion,
} from '../semver.js'

// Sanitization
export {
  sanitizeInput,
  sanitizePath,
  sanitizeUrl,
  escapeHtml,
  escapeShell,
} from '../sanitization.js'

// Type guards
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isNull,
  isUndefined,
  isNullOrUndefined,
  isPlainObject,
} from '../array.js'
