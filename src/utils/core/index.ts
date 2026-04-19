/**
 * Core Utilities Index
 *
 * This module provides centralized exports for core utility functions.
 * Import from 'src/utils/core/index.js' for organized access.
 *
 * @module utils/core
 */

// Error handling
export {
  AstronError,
  ConfigParseError,
  ShellError,
  AbortError,
  TeleportOperationError,
  TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS,
  isAbortError,
  hasExactErrorMessage,
  toError,
  errorMessage,
  getErrnoCode,
  isENOENT,
  getErrnoPath,
  shortErrorStack,
  isFsInaccessible,
  classifyAxiosError,
  retryWithBackoff,
  wrapError,
  collectErrors,
  type AxiosErrorKind,
} from '../errors.js'

// Configuration management
export {
  getGlobalConfig,
  getProjectConfig,
  getConfigValue,
  setConfigValue,
  type GlobalConfig,
  type ProjectConfig,
} from '../config.js'

// Environment utilities
export {
  getEnv,
  getEnvBoolean,
  getEnvNumber,
  getEnvString,
  setEnv,
  isEnvSet,
  type EnvValue,
} from '../envUtils.js'

// Environment variables
export {
  ENV_PREFIX,
  getAstronEnv,
  setAstronEnv,
  getAllAstronEnv,
  type AstronEnvKey,
} from '../env.js'

// Platform detection
export {
  getPlatform,
  isMacOS,
  isWindows,
  isLinux,
  getArch,
  type Platform,
  type Arch,
} from '../platform.js'

// Logging
export {
  log,
  logError,
  logWarn,
  logInfo,
  logDebug,
  setLogLevel,
  type LogLevel,
} from '../log.js'

// Debug utilities
export {
  debug,
  debugEnabled,
  setDebugEnabled,
  debugLog,
} from '../debug.js'
