import {
  ASTRONCODE_COMMAND,
  ASTRONCODE_NAME,
} from './astron-meta.mjs'

const LOCAL_BUILD_LABEL = `local ${ASTRONCODE_NAME} build`

// Additional branding rules to extend runtime-branding.mjs
// These rules are merged with the main brandingReplacements array

export const additionalBrandingRules = [
  // === CLAUDE.AI REFERENCES ===
  ['claude.ai subscription', 'local provider subscription'],
  ['claude.ai account', 'local provider account'],
  ['claude.ai authentication', 'local provider authentication'],
  ['claude.ai/code', 'the local bridge'],
  ['Claude.ai account', 'Local provider account'],
  ['your Claude.ai account', 'your local provider account'],
  ['sign in with your Claude.ai account', 'configure your local provider credentials'],
  
  // === CLAUDE SUBSCRIPTION/ACCOUNT ===
  ['Claude subscription', 'local provider subscription'],
  ['Claude account', 'local provider account'],
  ['your Claude account', 'your local provider account'],
  ['with your Claude subscription', 'with your local provider credentials'],
  ['sign in with your Claude account', 'configure your local provider credentials'],
  ['Login with Claude account', 'Configure local provider'],
  ['Claude account with subscription', 'Local provider with subscription'],
  
  // === SESSION/STATS ===
  ['Fetching your Claude Code sessions', `Fetching your ${ASTRONCODE_NAME} sessions`],
  ['Loading your Claude Code stats', `Loading your ${ASTRONCODE_NAME} stats`],
  ['your Claude Code usage', `your ${ASTRONCODE_NAME} usage`],
  ['your Claude Code sessions', `your ${ASTRONCODE_NAME} sessions`],
  ['Show your Claude Code usage statistics and activity', `Show your ${ASTRONCODE_NAME} usage statistics and activity`],
  ['Generate a report analyzing your Claude Code sessions', `Generate a report analyzing your ${ASTRONCODE_NAME} sessions`],
  
  // === ANTHROPIC REFERENCES (user-facing) ===
  ['your Anthropic account', 'your local provider account'],
  ['Anthropic account', 'local provider account'],
  ['Anthropic subscription', 'local provider subscription'],

  // === SYSTEM PROMPT MODEL GUIDANCE ===
  [
    "The most recent Claude model family is Claude 4.5/4.6. Model IDs - Smart 4.6: 'astron-opus', Fast 4.6: 'astron-sonnet', Lite 4.5: 'astron-haiku-20251001'. When building AI applications, default to the latest and most capable Claude models.",
    "Astroncode may be configured with provider-backed model IDs. Prefer citing the active configured model ID directly when discussing the current model. Current flagship aliases map to Smart: 'astron-opus', Fast: 'astron-sonnet', Lite: 'astron-haiku-20251001'.",
  ],
  [
    'Astroncode is available as a CLI in the terminal, desktop app (Mac/Windows), web app (the local bridge), and IDE extensions (VS Code, JetBrains).',
    "Astroncode is available as a local coding system in the terminal, desktop app, and IDE extensions for the user's environment.",
  ],
  [
    'Fast mode for Astroncode uses the same Astron Smart 4.6 model with faster output. It does NOT switch to a different model. It can be toggled with /fast.',
    'Fast mode in Astroncode keeps the same configured model and only changes response behavior. It does NOT switch to a different model. It can be toggled with /fast.',
  ],
  [
    'Fast mode for Claude Code uses the same Claude Opus 4.6 model with faster output. It does NOT switch to a different model. It can be toggled with /fast.',
    'Fast mode in Astroncode keeps the same configured model and only changes response behavior. It does NOT switch to a different model. It can be toggled with /fast.',
  ],
]

export const additionalBrandingPatterns = [
  // === CLAUDE.AI PATTERNS ===
  {
    pattern: /\bClaude\.ai\b/g,
    replace: 'Local Provider',
  },
  {
    pattern: /\bclaude\.ai\b/g,
    replace: 'local provider',
  },
  
  // === CLAUDE SUBSCRIPTION/ACCOUNT PATTERNS ===
  {
    pattern: /your Claude (?!Code)/gi,
    replace: 'your local provider',
  },
  {
    pattern: /Claude subscription/gi,
    replace: 'local provider subscription',
  },
  {
    pattern: /Claude account/gi,
    replace: 'local provider account',
  },
  
  // === URL REPLACEMENTS ===
  {
    pattern: /https:\/\/code\.claude\.com\/docs\/en\/[a-z-]+/g,
    replace: 'https://github.com/MarkMa50/Astroncode----src',
  },
  {
    pattern: /https:\/\/support\.claude\.com\/[a-z\/-]+/g,
    replace: 'https://github.com/MarkMa50/Astroncode----src/issues',
  },
  {
    pattern: /https:\/\/platform\.claude\.com\/[a-z\/-]+/g,
    replace: 'https://github.com/MarkMa50/Astroncode----src',
  },
  {
    pattern:
      /The most recent Claude model family is Claude 4\.5\/4\.6\.[\s\S]*?When building AI applications, default to the latest and most capable Claude models\./g,
    replace:
      "Astroncode may be configured with provider-backed model IDs. Prefer citing the active configured model ID directly when discussing the current model. Current flagship aliases map to Smart: 'astron-opus', Fast: 'astron-sonnet', Lite: 'astron-haiku-20251001'.",
  },
  {
    pattern:
      /Fast mode for Astroncode uses the same Astron Smart 4\.6 model with faster output\. It does NOT switch to a different model\. It can be toggled with \/fast\./g,
    replace:
      'Fast mode in Astroncode keeps the same configured model and only changes response behavior. It does NOT switch to a different model. It can be toggled with /fast.',
  },
]




// === CLAUDE.md / PROJECT GUIDANCE ===
export const projectGuidanceRules = [
  // File names
  ['CLAUDE.md', 'ASTRONCODE.md'],
  ['CLAUDE_DIR', 'ASTRONCODE_DIR'],
  ['CLAUDE_CODE', 'ASTRONCODE'],
  
  // Environment variables
  ['CLAUDE_CODE_OAUTH_TOKEN', 'ASTRONCODE_OAUTH_TOKEN'],
  ['CLAUDE_CODE_SIMPLE', 'ASTRONCODE_SIMPLE'],
  
  // Model aliases - keep technical names but update user-facing
  ["Model alias (e.g. 'sonnet', 'opus', 'haiku')", "Model alias (e.g. 'fast', 'smart', 'lite')"],
  ["'sonnet', 'opus', 'haiku'", "'fast', 'smart', 'lite'"],
  
  // User-facing model references
  ['Opus update', 'Model update'],
  ['Sonnet update', 'Model update'],
  ['Haiku update', 'Model update'],
  ['latest Opus', 'latest model'],
  ['latest Sonnet', 'latest model'],
  ['latest Haiku', 'latest model'],
]

// === PROJECT GUIDANCE PATTERNS ===
export const projectGuidancePatterns = [
  // CLAUDE.md references in comments and strings
  {
    pattern: /CLAUDE\.md/g,
    replace: 'ASTRONCODE.md',
  },
  // CLAUDE_DIR environment variable
  {
    pattern: /CLAUDE_DIR/g,
    replace: 'ASTRONCODE_DIR',
  },
  // CLAUDE_CODE_ prefix for env vars
  {
    pattern: /CLAUDE_CODE_(?!SIMPLE)/g,
    replace: 'ASTRONCODE_',
  },
  // Model alias descriptions
  {
    pattern: /alias for the latest model \(e\.g\. 'sonnet' or 'opus'\)/gi,
    replace: "alias for the latest model (e.g. 'fast' or 'smart')",
  },
  // Model selection hints
  {
    pattern: /Provide an alias for the latest model \(e\.g\. 'sonnet' or 'opus'\)/gi,
    replace: "Provide an alias for the latest model (e.g. 'fast' or 'smart')",
  },
]

// === STAR MASCOT REPLACEMENT ===
// Replace the simple Clawd mascot with the Astroncode Star mascot

// Astroncode Star - a pixel star mascot with an animated core, matching the Astroncode identity.
const NEW_O0Y = `O0Y={default:{r1L:"      ★★★★★      ",r1E:"    ★★     ★★    ",r1R:"   ★   ◉◉◉   ★   ",r2L:"  ★     ║     ★  ",r2R:" ★  ╔═══════╗  ★ "},"look-left":{r1L:"      ★★★★★      ",r1E:"    ★★     ★★    ",r1R:"   ★  ◉◉◉    ★   ",r2L:"  ★     ║     ★  ",r2R:" ★  ╔═══════╗  ★ "},"look-right":{r1L:"      ★★★★★      ",r1E:"    ★★     ★★    ",r1R:"   ★   ◉◉◉  ★    ",r2L:"  ★     ║     ★  ",r2R:" ★  ╔═══════╗  ★ "},"arms-up":{r1L:"    ★★★★★★★★    ",r1E:"   ★  ◉◉◉  ★   ",r1R:"  ★    ║    ★  ",r2L:" ★  ╔═══════╗  ★ ",r2R:"★  ║ASTRON║  ★"}}`;

const NEW_W0Y = `w0Y={default:" ★  ║ASTRON║  ★ ","look-left":" ★  ║ASTRON║  ★ ","look-right":" ★  ║ASTRON║  ★ ","arms-up":"    ╚═══════╝    "}`;

export const clawdReplacementRules = [
  // Replace complete O0Y object
  {
    pattern: /O0Y=\{default:\{r1L:" ▐",r1E:"▛███▜",r1R:"▌",r2L:"▝▜",r2R:"▛▘"\},"look-left":\{r1L:" ▐",r1E:"▟███▟",r1R:"▌",r2L:"▝▜",r2R:"▛▘"\},"look-right":\{r1L:" ▐",r1E:"▙███▙",r1R:"▌",r2L:"▝▜",r2R:"▛▘"\},"arms-up":\{r1L:"▗▟",r1E:"▛███▜",r1R:"▙▖",r2L:" ▜",r2R:"▛ "\}\}/g,
    replace: NEW_O0Y,
  },
  // Replace w0Y object
  {
    pattern: /w0Y=\{default:" ▗   ▖ ","look-left":" ▘   ▘ ","look-right":" ▝   ▝ ","arms-up":" ▗   ▖ "\}/g,
    replace: NEW_W0Y,
  },
]

// === OPUS/SONNET/HAIKU NOTICE REPLACEMENTS ===
export const modelNoticeRules = [
  // Opus 1M context notice
  ['Opus now defaults to 1M context · 5x more room, same pricing', 'New model available with extended context'],
  ['Opus 4.6 with 1M context', 'Extended context model'],
  ['Sonnet 4.6 with 1M context', 'Extended context model'],
  ['1M context without Extra Usage', 'Extended context without extra usage'],
  ['extended-context-with-1m', 'extended-context'],
  
  // Model-specific messages
  ['is not available for your account', 'is not available in this configuration'],
  ['https://code.claude.com/docs/en/model-config#extended-context-with-1m', 'https://github.com/MarkMa50/Astroncode----src'],
]

// === MODEL NOTICE PATTERNS ===
export const modelNoticePatterns = [
  // Generic model upgrade notices
  {
    pattern: /Opus \d+\.\d+ with \d+M context/gi,
    replace: 'Extended context model',
  },
  {
    pattern: /Sonnet \d+\.\d+ with \d+M context/gi,
    replace: 'Extended context model',
  },
  {
    pattern: /Haiku \d+\.\d+ with \d+M context/gi,
    replace: 'Extended context model',
  },
  // Claude model references in user-facing text
  {
    pattern: /claude-opus-\d+[.-]\d+/gi,
    replace: 'astron-opus',
  },
  {
    pattern: /claude-sonnet-\d+[.-]\d+/gi,
    replace: 'astron-sonnet',
  },
  {
    pattern: /claude-haiku-\d+[.-]\d+/gi,
    replace: 'astron-haiku',
  },
]


// === CLAUDE PRO/MAX SUBSCRIPTION ===
export const subscriptionRules = [
  ['Claude Pro/Max subscription', 'local provider subscription'],
  ['Claude Pro/Max', 'local provider plan'],
  ['Claude Pro plan', 'local provider plan'],
  ['Claude Max', 'local provider plan'],
  ['Claude.ai account', 'local provider account'],
  ['your Claude.ai account', 'your local provider account'],
  ['sign in with your Claude.ai account', 'configure your local provider credentials'],
  ['Claude Opus is not available with the Claude Pro plan', 'This model is not available with your current plan'],
  ['Subscription Plan (Claude Pro/Max)', 'Subscription Plan (Local Provider)'],
  ['API Usage Billing (Anthropic Console)', 'API Usage Billing (Local Provider)'],
  ['Login method pre-selected: Subscription Plan', 'Login method pre-selected: Local Provider'],
  ['Login method pre-selected: API Usage Billing', 'Login method pre-selected: API Billing'],
  ['Teleport requires a Claude.ai account', 'Teleport requires local provider credentials'],
  ['Your Claude Pro/Max subscription will be used by Claude Code', 'Your local provider credentials will be used by Astroncode'],
  ['forceLoginMethod: "claudeai" for Claude Pro/Max', 'forceLoginMethod: "local" for local provider'],
  ['"claudeai" for Claude Pro/Max, "console" for Console billing', '"local" for local provider, "api" for API billing'],
  ['Claude Code web sessions require authentication with a Claude.ai account', 'Astroncode sessions require local provider authentication'],
  ['API key authentication is not sufficient', 'API key authentication may not be sufficient'],
  ['not Console', 'not API billing'],
]

// === ANTHROPIC CONSOLE/SDK ===
export const consoleRules = [
  ['Anthropic Console', 'Local Provider Console'],
  ['Anthropic API key', 'Provider API key'],
  ['anthropics/claude-code-action', 'astroncode/action'],
  ['anthropics/claude-cli', 'astroncode/cli'],
]

// === URL REPLACEMENTS (Extended) ===
export const extendedUrlRules = [
  ['https://code.claude.com', 'https://github.com/MarkMa50/Astroncode----src'],
  ['https://support.claude.com', 'https://github.com/MarkMa50/Astroncode----src/issues'],
  ['https://platform.claude.com', 'https://github.com/MarkMa50/Astroncode----src'],
  ['https://docs.claude.com', 'https://github.com/MarkMa50/Astroncode----src'],
]

// === GITHUB/REPO REFERENCES ===
export const githubRules = [
  ['github.com/anthropics', 'github.com/astroncode'],
  ['anthropics/claude-code', 'astroncode/astroncode'],
  ['claude-code-action', 'astroncode-action'],
  ['claude-cli-internal', 'astroncode-internal'],
]

// === MODEL ALIASES (User-facing) ===
export const modelAliasRules = [
  ["'sonnet'", "'fast'"],
  ["'opus'", "'smart'"],
  ["'haiku'", "'lite'"],
  ['sonnet model', 'fast model'],
  ['opus model', 'smart model'],
  ['haiku model', 'lite model'],
  ['Sonnet 4.6', 'Fast 4.6'],
  ['Opus 4.6', 'Smart 4.6'],
  ['Haiku 4.5', 'Lite 4.5'],
]

// === EXTENDED PATTERNS ===
export const extendedPatterns = [
  // Claude Pro/Max patterns
  {
    pattern: /Claude (Pro|Max)\/Max/gi,
    replace: 'local provider plan',
  },
  {
    pattern: /Claude (Pro|Max) plan/gi,
    replace: 'local provider plan',
  },
  // Model references
  {
    pattern: /claude-(opus|sonnet|haiku)-\d+[.-]\d+/gi,
    replace: 'astron-$1',
  },
  // GitHub references
  {
    pattern: /github\.com\/anthropics\/[^"\s]+/gi,
    replace: 'github.com/astroncode/repo',
  },
]



// === MORE MODEL RULES ===
export const moreModelRules = [
  ['Claude Opus', 'Smart model'],
  ['Claude Sonnet', 'Fast model'],
  ['Claude Haiku', 'Lite model'],
  ['Claude Smart', 'Astron Smart'],
  ['Claude Fast', 'Astron Fast'],
  ['Claude Lite', 'Astron Lite'],
  ['the Claude Opus', 'the Smart model'],
  ['the Claude Sonnet', 'the Fast model'],
  ['the Claude Haiku', 'the Lite model'],
  ['Anthropic official CLI tool', 'Astron local CLI tool'],
  ['Anthropic official tool', 'Astron local tool'],
  ['Astron official CLI tool', 'Astron local CLI tool'],
  ['Astron official tool', 'Astron local tool'],
  ['the most capable model in the Astron family', 'the primary configured model in the Astroncode setup'],
  ['same model used for both standard and fast modes in Astroncode', 'same configured model used across Astroncode response modes'],
]

// === MORE MODEL PATTERNS ===
export const moreModelPatterns = [
  {
    pattern: /Claude (Opus|Sonnet|Haiku)/gi,
    replace: '$1',
  },
  {
    pattern: /Claude (Smart|Fast|Lite)/gi,
    replace: 'Astron $1',
  },
  {
    pattern: /the Claude (Opus|Sonnet|Haiku)/gi,
    replace: 'the $1',
  },
  // NOTE: Global /\bAnthropic\b/ removed — see js-ast-strings.mjs for the
  // AST-safe catch-all that replaces it without hitting HTTP headers or SDK names.
]



// === FIX RULES ===
export const fixRules = [
  ['astroncode/claude-code', 'astroncode/astroncode'],
  ['astroncode/claude-cli', 'astroncode/astroncode'],
  ['Opus now defaults to 1M context', 'New model available with extended context'],
  ['your local providerPro/Max subscription', 'your local provider subscription'],
  ['local providerPro/Max', 'local provider'],
  // Identity strings
  ["You are Claude Code, Anthropic's official CLI for Claude", "You are Astroncode, Astron's local coding assistant"],
  ["You are Astroncode, Anthropic's official CLI for Claude", "You are Astroncode, Astron's local coding assistant"],
  ["You are Astroncode, Astron's official CLI for Claude", "You are Astroncode, Astron's local coding assistant"],
  ["You are an agent for Claude Code, Anthropic's official CLI for Claude", "You are an agent for Astroncode, Astron's local coding assistant"],
  ["You are an agent for Astroncode, Anthropic's official CLI for Claude", "You are an agent for Astroncode, Astron's local coding assistant"],
  ["You are an agent for Astroncode, Astron's official CLI for Claude", "You are an agent for Astroncode, Astron's local coding assistant"],
  ["You are a file search specialist for Claude Code, Anthropic's official CLI for Claude", "You are a file search specialist for Astroncode, Astron's local coding assistant"],
  ["You are a file search specialist for Astroncode, Anthropic's official CLI for Claude", "You are a file search specialist for Astroncode, Astron's local coding assistant"],
  ["You are a file search specialist for Astroncode, Astron's official CLI for Claude", "You are a file search specialist for Astroncode, Astron's local coding assistant"],
  ["You are Claude Code, an AI assistant", "You are Astroncode, an AI assistant"],
  ["agent for Claude Code, Anthropic's official CLI", "agent for Astroncode, Astron's local coding assistant"],
  ["specialist for Claude Code, Anthropic's official CLI", "specialist for Astroncode, Astron's local coding assistant"],
  // User-facing help strings
  ['/help: Get help with using Claude Code', '/help: Get help with using Astroncode'],
  ['problem with Claude Code', 'problem with Astroncode'],
  ['using Claude Code', 'using Astroncode'],
]

// === FIX PATTERNS ===
export const fixPatterns = [
  {
    pattern: /\/claude-[a-z]+/gi,
    replace: '/astroncode',
  },
  {
    pattern: /your local providerPro/gi,
    replace: 'your local provider',
  },
  {
    pattern:
      /Fast mode for Astroncode uses the same [\s\S]+? model with faster output\. It does NOT switch to a different model\. It can be toggled with \/fast\./g,
    replace:
      'Fast mode in Astroncode keeps the same configured model and only changes response behavior. It does NOT switch to a different model. It can be toggled with /fast.',
  },
  // Identity pattern for any remaining "Claude Code, Anthropic's" patterns
  {
    pattern: /Claude Code, Anthropic's official CLI/g,
    replace: "Astroncode, Astron's official CLI",
  },
  {
    pattern: /Claude Code, an AI assistant/g,
    replace: 'Astroncode, an AI assistant',
  },
]
