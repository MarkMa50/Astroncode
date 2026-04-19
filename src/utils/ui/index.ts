/**
 * UI Utilities Index
 *
 * This module provides centralized exports for UI-related utilities.
 * Import from 'src/utils/ui/index.js' for organized access.
 *
 * @module utils/ui
 */

// Formatting utilities
export {
  format,
  formatBrief,
  formatTimestamp,
  formatDuration,
  formatBytes,
  formatNumber,
  formatPercent,
  truncate,
  truncateMiddle,
  type FormatOptions,
} from '../format.js'

// String utilities
export {
  capitalize,
  lowercase,
  uppercase,
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  splitWords,
  pluralize,
  singularize,
} from '../stringUtils.js'

// ANSI utilities
export {
  stripAnsi,
  hasAnsi,
  ansiRegex,
  sliceAnsi,
  stringWidth,
} from '../sliceAnsi.js'

// Highlighting
export {
  highlightMatch,
  highlightCode,
  highlightDiff,
  type HighlightOptions,
} from '../highlightMatch.jsx'

// Terminal utilities
export {
  getTerminalSize,
  getTerminalWidth,
  getTerminalHeight,
  isTerminal,
  supportsColor,
  supportsTrueColor,
} from '../terminal.js'

// Terminal panel
export {
  TerminalPanel,
  createTerminalPanel,
  type TerminalPanelOptions,
} from '../terminalPanel.js'

// Fullscreen utilities
export {
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
  toggleFullscreen,
} from '../fullscreen.js'

// Theme utilities
export {
  getTheme,
  setTheme,
  getThemeColors,
  isDarkTheme,
  isLightTheme,
  type Theme,
  type ThemeName,
  type ThemeSetting,
} from '../theme.js'

// System theme
export {
  getSystemTheme,
  onSystemThemeChange,
  type SystemTheme,
} from '../systemTheme.js'

// Display tags
export {
  DisplayTags,
  getDisplayTags,
  type DisplayTag,
} from '../displayTags.js'

// Hyperlink utilities
export {
  createHyperlink,
  parseHyperlink,
  supportsHyperlink,
} from '../hyperlink.js'

// Clipboard utilities
export {
  copyToClipboard,
  pasteFromClipboard,
  supportsClipboard,
} from '../screenshotClipboard.js'
