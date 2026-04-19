/**
 * File System Utilities Index
 *
 * This module provides centralized exports for file system operations.
 * Import from 'src/utils/fs/index.js' for organized access.
 *
 * @module utils/fs
 */

// File operations
export {
  readFile,
  writeFile,
  appendFile,
  deleteFile,
  fileExists,
  isFile,
  isDirectory,
  ensureDir,
  ensureFile,
  type ReadFileOptions,
  type WriteFileOptions,
} from '../file.js'

// File history
export {
  FileHistory,
  getFileHistory,
  addToHistory,
  clearHistory,
  type FileHistoryEntry,
} from '../fileHistory.js'

// File read utilities
export {
  readFileInRange,
  readFileWithLimit,
  getFileSize,
  getFileStats,
} from '../readFileInRange.js'

// File state cache
export {
  FileStateCache,
  getCachedFileState,
  invalidateCache,
  type FileState,
} from '../fileStateCache.js'

// Path utilities
export {
  normalizePath,
  resolvePath,
  relativePath,
  joinPath,
  dirname,
  basename,
  extname,
  isAbsolute,
} from '../path.js'

// Glob utilities
export {
  glob,
  globSync,
  globStream,
  type GlobOptions,
  type GlobResult,
} from '../glob.js'

// Diff utilities
export {
  computeDiff,
  applyDiff,
  parseDiff,
  formatDiff,
  type DiffResult,
  type DiffHunk,
} from '../diff.js'

// Temp file utilities
export {
  createTempFile,
  createTempDir,
  cleanupTemp,
  withTempFile,
  withTempDir,
} from '../tempfile.js'

// System directories
export {
  getConfigDir,
  getDataDir,
  getCacheDir,
  getLogDir,
  getTempDir,
} from '../systemDirectories.js'

// XDG base directories
export {
  xdgConfigHome,
  xdgDataHome,
  xdgCacheHome,
  xdgStateHome,
} from '../xdg.js'
