/**
 * Process Utilities Index
 *
 * This module provides centralized exports for process management operations.
 * Import from 'src/utils/process/index.js' for organized access.
 *
 * @module utils/process
 */

// Shell execution
export {
  Shell,
  ShellCommand,
  executeShell,
  executeShellSync,
  type ShellOptions,
  type ShellResult,
} from '../Shell.js'

// Process management
export {
  spawnProcess,
  spawnProcessSync,
  killProcess,
  getProcessInfo,
  type ProcessOptions,
  type ProcessResult,
} from '../process.js'

// Exec utilities
export {
  execFileNoThrow,
  execFileNoThrowPortable,
  execSyncWrapper,
} from '../execFileNoThrow.js'

// Subprocess environment
export {
  getSubprocessEnv,
  setSubprocessEnv,
  type SubprocessEnvOptions,
} from '../subprocessEnv.js'

// Signal handling
export {
  createAbortController,
  createAbortSignal,
  combinedAbortSignal,
  type AbortOptions,
} from '../abortController.js'

// Graceful shutdown
export {
  GracefulShutdown,
  registerShutdownHandler,
  triggerShutdown,
  type ShutdownOptions,
} from '../gracefulShutdown.js'

// Process utilities
export {
  getProcessId,
  getParentProcessId,
  isProcessRunning,
  waitForProcess,
} from '../genericProcessUtils.js'

// Find executable
export {
  findExecutable,
  findExecutableSync,
} from '../findExecutable.js'

// Which utility
export {
  which,
  whichSync,
} from '../which.js'

// Lockfile
export {
  acquireLock,
  releaseLock,
  withLock,
  type LockOptions,
} from '../lockfile.js'
