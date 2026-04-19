/**
 * Git Utilities Index
 *
 * Git configuration, filesystem, and gitignore utilities.
 *
 * @module utils/git
 */

// Git config parser
export { parseGitConfig } from './gitConfigParser.js'

// Git filesystem
export { getGitFilesystem } from './gitFilesystem.js'

// Gitignore
export { parseGitignore, matchGitignore } from './gitignore.js'
