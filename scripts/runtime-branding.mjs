import { additionalBrandingRules, additionalBrandingPatterns, clawdReplacementRules, projectGuidanceRules, projectGuidancePatterns, modelNoticeRules, modelNoticePatterns, subscriptionRules, consoleRules, extendedUrlRules, githubRules, modelAliasRules, extendedPatterns, moreModelRules, moreModelPatterns, fixRules, fixPatterns } from './branding-extension.mjs';
import { applyAnthropicCatchAll } from './js-ast-strings.mjs'
import { createHash } from 'node:crypto'
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  ASTRONCODE_COMMAND,
  ASTRONCODE_NAME,
  ASTRONCODE_VERSION,
} from './astron-meta.mjs'

const LOCAL_BUILD_LABEL = `local ${ASTRONCODE_NAME} build`
const BROWSER_CONTROL_NAME = `${ASTRONCODE_NAME} Browser Control`
const DESKTOP_NAME = `${ASTRONCODE_NAME} Desktop`
const WORDMARK_LINES = [
  '╔═╗╔═╗╔╦╗╦═╗╔═╗╔╗╔',
  '╠═╣╚═╗ ║ ╠╦╝║ ║║║║',
  '╩ ╩╚═╝ ╩ ╩╚═╚═╝╝╚╝',
  '     ╔═╗╔═╗╔╦╗╔═╗',
  '     ║  ║ ║ ║║║╣ ',
  '     ╚═╝╚═╝═╩╝╚═╝',
]
const COMBINED_WELCOME_LINES = [...WORDMARK_LINES]
const WELCOME_LINE_1 = COMBINED_WELCOME_LINES[0]
const WELCOME_LINE_2 = COMBINED_WELCOME_LINES[1]
const WELCOME_LINE_3 = COMBINED_WELCOME_LINES[2]
const WELCOME_LINE_4 = COMBINED_WELCOME_LINES[3]
const WELCOME_LINE_5 = COMBINED_WELCOME_LINES[4]
const WELCOME_LINE_6 = ' '.repeat(WORDMARK_LINES[0].length)
const WELCOME_BLANK = ' '.repeat(WORDMARK_LINES[0].length)
function createRuntimeWelcomeArt() {
  const artNodes = WORDMARK_LINES.map((line, index) =>
    `bz.createElement(k,{color:${index < 3 ? '"claude"' : index === 3 ? '"claudeShimmer"' : '"clawd_body"'},bold:!0},${JSON.stringify(line)})`,
  ).join(',')

  return `function qJ6(q){let K=z6(1),_;if(K[0]===Symbol.for("react.memo_cache_sentinel"))_=bz.createElement(u,{flexDirection:"column",alignItems:"center"},${artNodes}),K[0]=_;else _=K[0];return _}`
}

const RUNTIME_WELCOME_ART = createRuntimeWelcomeArt()
const RUNTIME_WELCOME_EMPTY = 'function FF8(q){return""}'
const RUNTIME_NOTICE_DISABLED = 'async function lcY(){return null}'
const UPSTREAM_BUNDLE_VERSION = '2.1.88'
const EARLY_INPUT_WINDOWS_GUARD_FROM =
  'if(!process.stdin.isTTY||jT6||process.argv.includes("-p")||process.argv.includes("--print"))return;'
const EARLY_INPUT_WINDOWS_GUARD_TO =
  'if(!process.stdin.isTTY||process.platform==="win32"||jT6||process.argv.includes("-p")||process.argv.includes("--print"))return;'

export const brandingReplacements = [
  [EARLY_INPUT_WINDOWS_GUARD_FROM, EARLY_INPUT_WINDOWS_GUARD_TO],
  ['2.1.88', ASTRONCODE_VERSION],
  ['Welcome to Claude Code', `Welcome to ${ASTRONCODE_NAME}`],
  ['Welcome to AstronCode', `Welcome to ${ASTRONCODE_NAME}`],
  ['Welcome to Atroncode', `Welcome to ${ASTRONCODE_NAME}`],
  ['K.name("claude")', `K.name("${ASTRONCODE_COMMAND}")`],
  ['K.name("astroncode")', `K.name("${ASTRONCODE_COMMAND}")`],
  ['K.name("atroncode")', `K.name("${ASTRONCODE_COMMAND}")`],
  ['process.title="claude"', `process.title="${ASTRONCODE_COMMAND}"`],
  ['process.title="astroncode"', `process.title="${ASTRONCODE_COMMAND}"`],
  ['process.title="atroncode"', `process.title="${ASTRONCODE_COMMAND}"`],
  ['Usage: claude [options] [command] [prompt]', `Usage: ${ASTRONCODE_COMMAND} [options] [command] [prompt]`],
  ['Usage: astroncode [options] [command] [prompt]', `Usage: ${ASTRONCODE_COMMAND} [options] [command] [prompt]`],
  ['Usage: claude ssh <user@host | ssh-config-alias> [dir]', `Usage: ${ASTRONCODE_COMMAND} ssh <user@host | ssh-config-alias> [dir]`],
  ['Usage: astroncode ssh <user@host | ssh-config-alias> [dir]', `Usage: ${ASTRONCODE_COMMAND} ssh <user@host | ssh-config-alias> [dir]`],
  ['Usage: claude assistant [sessionId]', `Usage: ${ASTRONCODE_COMMAND} assistant [sessionId]`],
  ['Usage: astroncode assistant [sessionId]', `Usage: ${ASTRONCODE_COMMAND} assistant [sessionId]`],
  ['Usage: claude --remote "your task description"', `Usage: ${ASTRONCODE_COMMAND} --remote "your task description"`],
  ['Usage: astroncode --remote "your task description"', `Usage: ${ASTRONCODE_COMMAND} --remote "your task description"`],
  ['Usage: claude', `Usage: ${ASTRONCODE_COMMAND}`],
  ['Usage: astroncode', `Usage: ${ASTRONCODE_COMMAND}`],
  [
    'Claude Code - starts an interactive session by default, use -p/--print for',
    `${ASTRONCODE_NAME} - starts an interactive session by default, use -p/--print for`,
  ],
  [
    'AstronCode - starts an interactive session by default, use -p/--print for',
    `${ASTRONCODE_NAME} - starts an interactive session by default, use -p/--print for`,
  ],
  ['Error: Claude Code requires Node.js version 18 or higher.', `Error: ${ASTRONCODE_NAME} requires Node.js version 18 or higher.`],
  ['Error: AstronCode requires Node.js version 18 or higher.', `Error: ${ASTRONCODE_NAME} requires Node.js version 18 or higher.`],
  ['Start the Claude Code MCP server', `Start the ${ASTRONCODE_NAME} MCP server`],
  ['Start the AstronCode MCP server', `Start the ${ASTRONCODE_NAME} MCP server`],
  ['Start a Claude Code session server', `Start a ${ASTRONCODE_NAME} session server`],
  ['Start an AstronCode session server', `Start a ${ASTRONCODE_NAME} session server`],
  ['Manage Claude Code plugins', `Manage ${ASTRONCODE_NAME} plugins`],
  ['Manage AstronCode plugins', `Manage ${ASTRONCODE_NAME} plugins`],
  ['Not logged in. Run claude auth login to authenticate.', `Not logged in. Run ${ASTRONCODE_COMMAND} auth login to authenticate.`],
  ['Successfully logged out from your Anthropic account.', `Successfully logged out from your ${ASTRONCODE_NAME} provider account.`],
  ['Sign in to your Anthropic account', `Configure local provider credentials for ${ASTRONCODE_NAME}`],
  ['Log out from your Anthropic account', `Remove locally stored provider credentials for ${ASTRONCODE_NAME}`],
  [
    'Set up a long-lived authentication token (requires Claude subscription)',
    `Show local token setup guidance for ${ASTRONCODE_NAME}`,
  ],
  [
    'This will guide you through long-lived (1-year) auth token setup for your Claude account. Claude subscription required.',
    'This command explains how to store a local provider token in `.env.astroncode`.',
  ],
  [
    'Import MCP servers from Claude Desktop (Mac and WSL only)',
    `Import MCP servers from ${ASTRONCODE_NAME} Desktop (Mac and WSL only)`,
  ],
  [
    'Install Claude Code native build. Use [target] to specify version (stable, latest, or specific version)',
    `Show local install status for this ${ASTRONCODE_NAME} build. Use [target] to inspect the requested target.`,
  ],
  ['Enable Claude in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Disable Claude in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Claude in Chrome (Beta) settings', `${BROWSER_CONTROL_NAME} (Beta) settings`],
  [
    'Claude in Chrome works with the Chrome extension to let you control your browser directly from Claude Code. Navigate websites, fill forms, capture screenshots, record GIFs, and debug with console logs and network requests.',
    `${BROWSER_CONTROL_NAME} works with the Chrome extension to let you control your browser directly from ${ASTRONCODE_NAME}. Navigate websites, fill forms, capture screenshots, record GIFs, and inspect pages with console logs and network requests.`,
  ],
  ['Claude in Chrome is not supported in WSL at this time.', `${BROWSER_CONTROL_NAME} is not supported in WSL at this time.`],
  ['Claude in Chrome requires a claude.ai subscription.', `${BROWSER_CONTROL_NAME} is disabled in this local build.`],
  ['Claude in Chrome (Beta)', `${BROWSER_CONTROL_NAME} (Beta)`],
  [
    'Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings to control which sites Claude can browse, click, and type on.',
    `Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings to control which sites ${ASTRONCODE_NAME} can browse, click, and type on.`,
  ],
  ['Learn more: https://code.claude.com/docs/en/chrome', `Learn more: browser control is disabled in this local ${ASTRONCODE_NAME} build.`],
  ['Enable AstronCode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Disable AstronCode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Enable Atroncode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Disable Atroncode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Enable Astroncode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Disable Astroncode in Chrome integration', `Chrome integration (disabled in ${LOCAL_BUILD_LABEL})`],
  ['Check the health of your Claude Code auto-updater.', `Run local ${ASTRONCODE_NAME} diagnostics for provider config and runtime health.`],
  ['Check the health of your AstronCode auto-updater.', `Run local ${ASTRONCODE_NAME} diagnostics for provider config and runtime health.`],
  ['Check for updates and install if available', `Show the current ${ASTRONCODE_NAME} version and local update guidance.`],
  ['Updater health command (disabled in local AstronCode build).', `Run local ${ASTRONCODE_NAME} diagnostics for provider config and runtime health.`],
  ['Updater health command (disabled in local Atroncode build).', `Run local ${ASTRONCODE_NAME} diagnostics for provider config and runtime health.`],
  ['Updater health command (disabled in local Astroncode build).', `Run local ${ASTRONCODE_NAME} diagnostics for provider config and runtime health.`],
  [
    'Install command (disabled in local AstronCode build; upstream-only). Use [target] to specify version (stable, latest, or specific version)',
    `Show local install status for this ${ASTRONCODE_NAME} build. Use [target] to inspect the requested target.`,
  ],
  [
    'Install command (disabled in local Atroncode build; upstream-only). Use [target] to specify version (stable, latest, or specific version)',
    `Show local install status for this ${ASTRONCODE_NAME} build. Use [target] to inspect the requested target.`,
  ],
  [
    'Install command (disabled in local Astroncode build; upstream-only). Use [target] to specify version (stable, latest, or specific version)',
    `Show local install status for this ${ASTRONCODE_NAME} build. Use [target] to inspect the requested target.`,
  ],
  [
    'Install the AstronCode native build. Use [target] to specify version (stable, latest, or specific version)',
    `Show local install status for this ${ASTRONCODE_NAME} build. Use [target] to inspect the requested target.`,
  ],
  [
    'The workspace trust dialog is skipped when Claude is run with the -p mode.',
    `The workspace trust dialog is skipped when ${ASTRONCODE_NAME} is run with the -p mode.`,
  ],
  [
    'The workspace trust dialog is skipped when AstronCode is run with the -p mode.',
    `The workspace trust dialog is skipped when ${ASTRONCODE_NAME} is run with the -p mode.`,
  ],
  [
    'Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and CLAUDE.md auto-discovery. Sets CLAUDE_CODE_SIMPLE=1. Anthropic auth is strictly ANTHROPIC_API_KEY or apiKeyHelper via --settings (OAuth and keychain are never read). 3P providers (Bedrock/Vertex/Foundry) use their own credentials. Skills still resolve via /skill-name. Explicitly provide context via: --system-prompt[-file], --append-system-prompt[-file], --add-dir (CLAUDE.md dirs), --mcp-config, --settings, --agents, --plugin-dir.',
    'Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and project guidance auto-discovery. Uses local simple mode. Provider auth is strictly environment-variable or settings based in this mode. 3P providers use their own credentials. Skills still resolve via /skill-name. Explicitly provide context via: --system-prompt[-file], --append-system-prompt[-file], --add-dir (project dirs), --mcp-config, --settings, --agents, --plugin-dir.',
  ],
  [
    'Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and project guidance auto-discovery. Uses AstronCode simple mode. Provider auth is strictly environment-variable or settings based in this mode. 3P providers use their own credentials. Skills still resolve via /skill-name. Explicitly provide context via: --system-prompt[-file], --append-system-prompt[-file], --add-dir (project dirs), --mcp-config, --settings, --agents, --plugin-dir.',
    'Minimal mode: skip hooks, LSP, plugin sync, attribution, auto-memory, background prefetches, keychain reads, and project guidance auto-discovery. Uses local simple mode. Provider auth is strictly environment-variable or settings based in this mode. 3P providers use their own credentials. Skills still resolve via /skill-name. Explicitly provide context via: --system-prompt[-file], --append-system-prompt[-file], --add-dir (project dirs), --mcp-config, --settings, --agents, --plugin-dir.',
  ],
  [
    "Model for the current session. Provide an alias for the latest model (e.g. 'sonnet' or 'opus') or a model's full name (e.g. 'claude-sonnet-4-6').",
    "Model for the current session. Provide an alias or a full model ID (for example, 'astron-code-latest').",
  ],
  ['Runs Claude Code on a remote Linux host.', `Runs ${ASTRONCODE_NAME} on a remote Linux host.`],
  ['Runs AstronCode on a remote Linux host.', `Runs ${ASTRONCODE_NAME} on a remote Linux host.`],
  ['run `claude auth login` there', `run \`${ASTRONCODE_COMMAND} auth login\` there`],
  ['run `astroncode auth login` there', `run \`${ASTRONCODE_COMMAND} auth login\` there`],
  ['press prefix twice - Claude uses ', `press prefix twice - ${ASTRONCODE_NAME} uses `],
  ['Tip: You can launch Claude Code with just `claude`', `Tip: You can launch ${ASTRONCODE_NAME} with just \`${ASTRONCODE_COMMAND}\``],
  ['Tip: You can launch AstronCode with just `astroncode`', `Tip: You can launch ${ASTRONCODE_NAME} with just \`${ASTRONCODE_COMMAND}\``],
  [' (Claude Code)', ` (${ASTRONCODE_NAME})`],
  [' (AstronCode)', ` (${ASTRONCODE_NAME})`],
  ['Check the Claude Code changelog for updates', `Check the ${ASTRONCODE_NAME} changelog for updates`],
  ['Check the AstronCode changelog for updates', `Check the ${ASTRONCODE_NAME} changelog for updates`],
  ['Unable to fetch latest claude-cli-internal commits', `Unable to fetch latest ${ASTRONCODE_NAME} internal commits`],
  ['Unable to fetch latest astroncode internal commits', `Unable to fetch latest ${ASTRONCODE_NAME} internal commits`],
  ['Share Claude Code with friends', `Share ${ASTRONCODE_NAME} with friends`],
  ['Share AstronCode with friends', `Share ${ASTRONCODE_NAME} with friends`],
  ['Share Atroncode with friends', `Share ${ASTRONCODE_NAME} with friends`],
  ['Share Astroncode with friends', `Share ${ASTRONCODE_NAME} with friends`],
  ['Diagnose and verify your Claude Code installation and settings', `Diagnose and verify your ${ASTRONCODE_NAME} installation and settings`],
  ['Submit feedback about Claude Code', `Submit feedback about ${ASTRONCODE_NAME}`],
  ['Switch Anthropic accounts', 'Switch local provider accounts'],
  ['Sign in with your Anthropic account', 'Configure local provider credentials'],
  ['Sign out from your Anthropic account', 'Remove locally stored provider credentials'],
  ['Successfully removed your local Atroncode provider credentials.', `Successfully removed your local ${ASTRONCODE_NAME} provider credentials.`],
  ['Successfully removed your local Astroncode provider credentials.', `Successfully removed your local ${ASTRONCODE_NAME} provider credentials.`],
  ['Add an MCP server to Claude Code.', `Add an MCP server to ${ASTRONCODE_NAME}.`],
  ['Set the AI model for Claude Code', `Set the AI model for ${ASTRONCODE_NAME}`],
  ['Share a free week of Claude Code with friends and earn extra usage', `Share a free week of ${ASTRONCODE_NAME} with friends and earn extra usage`],
  ['Share a free week of Claude Code with friends', `Share a free week of ${ASTRONCODE_NAME} with friends`],
  ['Manage Claude Code marketplaces', `Manage ${ASTRONCODE_NAME} marketplaces`],
  ['Connect to a Claude Code server (internal — use cc:// URLs)', `Connect to an ${ASTRONCODE_NAME} server (internal — use cc:// URLs)`],
  ['Connect to a Astroncode server (internal — use cc:// URLs)', `Connect to an ${ASTRONCODE_NAME} server (internal — use cc:// URLs)`],
  ['Connect your local environment for remote-control sessions via claude.ai/code', `Connect your local environment for remote-control sessions through the ${ASTRONCODE_NAME} bridge`],
  ['Run Claude Code on a remote host over SSH. Deploys the binary and tunnels API auth back through your local machine — no remote setup needed.', `Run ${ASTRONCODE_NAME} on a remote host over SSH. Deploys the binary and tunnels API auth back through your local machine — no remote setup needed.`],
  ['You are currently using your overages to power your Claude Code usage. We will automatically switch you back to your subscription rate limits when they reset', `You are currently using your overages to power your ${ASTRONCODE_NAME} usage. We will automatically switch you back to your subscription rate limits when they reset`],
  ['You are currently using your subscription to power your Claude Code usage', `You are currently using your subscription to power your ${ASTRONCODE_NAME} usage`],
  ['claude mcp add', `${ASTRONCODE_COMMAND} mcp add`],
  ['claude mcp xaa setup', `${ASTRONCODE_COMMAND} mcp xaa setup`],
  ['add-from-claude-desktop', `add-from-${ASTRONCODE_COMMAND}-desktop`],
  ['Use your existing Claude Code API key', `Use your existing ${ASTRONCODE_NAME} API key`],
  ['Create a long-lived token with your Claude subscription', 'Use a long-lived token from your local provider'],
  ['ANTHROPIC_API_KEY already exists in repository secrets!', 'A provider API key secret already exists in repository secrets!'],
  ['A Claude workflow file already exists in this repository.', `An ${ASTRONCODE_NAME} workflow file already exists in this repository.`],
  ['A Claude workflow file already exists at', `An existing ${ASTRONCODE_NAME} workflow file was found at`],
  ['View the latest workflow template at:', 'Review the current local workflow template guidance before updating this file.'],
  ['https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml', ''],
  ['Example: anthropics/claude-cli', `Example: your-org/${ASTRONCODE_COMMAND}`],
  ['Claude Code Review workflow', `${ASTRONCODE_NAME} Review workflow`],
  ['For manual setup → Visit: https://github.com/anthropics/claude-code-action', `For manual setup → Review your local ${ASTRONCODE_NAME} workflow template`],
  ['For manual setup → Visit: https://github.com/astroncode/action', `For manual setup → Review your local ${ASTRONCODE_NAME} workflow template`],
  ['For manual setup â†’ Visit: https://github.com/astroncode/action', `For manual setup â†’ Review your local ${ASTRONCODE_NAME} workflow template`],
  ['Continue the current session in Claude Desktop', `Continue the current session in ${DESKTOP_NAME}`],
  ['Claude Desktop is not installed.', `${DESKTOP_NAME} is not installed.`],
  ['Atroncode Desktop is not installed. Install it from https://claude.ai/download', `${DESKTOP_NAME} is not installed. Install the local companion app before using /desktop.`],
  ['Astroncode Desktop is not installed. Install it from https://claude.ai/download', `${DESKTOP_NAME} is not installed. Install the local companion app before using /desktop.`],
  ['Claude Desktop needs to be updated (found v', `${DESKTOP_NAME} needs to be updated (found v`],
  ['Failed to open Claude Desktop', `Failed to open ${DESKTOP_NAME}`],
  ['Checking for Claude Desktop…', `Checking for ${DESKTOP_NAME}…`],
  ['Checking for Claude Desktopâ€¦', `Checking for ${DESKTOP_NAME}â€¦`],
  ['Opening Claude Desktop…', `Opening ${DESKTOP_NAME}…`],
  ['Opening in Claude Desktop…', `Opening in ${DESKTOP_NAME}…`],
  ['Session transferred to Claude Desktop', `Session transferred to ${DESKTOP_NAME}`],
  ['Voice mode requires a Claude.ai account. Please run /login to sign in.', 'Voice mode requires local provider credentials. Please run /login to sign in.'],
  ['No MCP servers found in Claude Desktop configuration or configuration file does not exist.', `No MCP servers found in ${DESKTOP_NAME} configuration or the configuration file does not exist.`],
  ['Import MCP Servers from Claude Desktop', `Import MCP Servers from ${DESKTOP_NAME}`],
  ['Run Claude Code locally or remotely using the Claude desktop app: clau.de/desktop', `Run ${ASTRONCODE_NAME} locally and continue sessions with the ${DESKTOP_NAME} handoff flow.`],
  ['Continue your session in Claude Code Desktop with ', `Continue your session in ${DESKTOP_NAME} with `],
  ['/mobile to use Claude Code from the Claude app on your phone', `Use /desktop to continue the current session in ${DESKTOP_NAME}`],
  ['Chrome extension not detected Â· https://claude.ai/chrome to install', `Chrome extension not detected. Install it before enabling ${BROWSER_CONTROL_NAME}.`],
  ['Claude in Chrome enabled · /chrome', `${BROWSER_CONTROL_NAME} enabled · /chrome`],
  ['Claude in Chrome enabled \xB7 /chrome', `${BROWSER_CONTROL_NAME} enabled · /chrome`],
  ['Claude in Chrome enabled by default', `${BROWSER_CONTROL_NAME} enabled by default`],
  [
    'No available IDEs detected. Please install the plugin and restart your IDE:\nhttps://docs.claude.com/s/claude-code-jetbrains',
    `No available IDEs detected. Please install the ${ASTRONCODE_NAME} JetBrains plugin and restart your IDE.`,
  ],
  [
    'No available IDEs detected. Make sure your IDE has the Claude Code extension or plugin installed and is running.',
    `No available IDEs detected. Make sure your IDE has the ${ASTRONCODE_NAME} extension or plugin installed and is running.`,
  ],
  ['No IDEs with Claude Code extension detected.', `No IDEs with ${ASTRONCODE_NAME} extension detected.`],
  ['Only one Claude Code instance can be connected to VS Code at a time.', `Only one ${ASTRONCODE_NAME} instance can be connected to VS Code at a time.`],
  [
    'Remote Control requires a claude.ai subscription. Run `claude auth login` to sign in with your claude.ai account.',
    `Remote Control requires locally configured provider credentials. Run \`${ASTRONCODE_COMMAND} auth login\` to configure access.`,
  ],
  [
    'Remote Control requires a full-scope login token. Long-lived tokens (from `claude setup-token` or CLAUDE_CODE_OAUTH_TOKEN) are limited to inference-only for security reasons. Run `claude auth login` to use Remote Control.',
    `Remote Control requires a local interactive login token. Long-lived tokens are limited in this path. Run \`${ASTRONCODE_COMMAND} auth login\` to refresh local access.`,
  ],
  [
    'Unable to determine your organization for Remote Control eligibility. Run `claude auth login` to refresh your account information.',
    `Unable to determine the local Remote Control entitlement state. Run \`${ASTRONCODE_COMMAND} auth login\` to refresh local provider settings.`,
  ],
  [
    'Remote Control is only available with claude.ai subscriptions. Please use `/login` to sign in with your claude.ai account.',
    `Remote Control is only available with locally configured provider credentials. Please use \`/login\` to refresh your ${ASTRONCODE_NAME} access.`,
  ],
  [
    'You are already on the highest Max subscription plan. For additional usage, run /login to switch to an API usage-billed account.',
    'Local provider credentials are already configured. Run /login if you want to switch accounts, models, or billing settings.',
  ],
  [
    'Starting new login following /upgrade. Exit with Ctrl-C to use existing account.',
    'Opening the local provider login flow. Exit with Ctrl-C to keep your current settings.',
  ],
  [
    'Failed to open browser. Please visit https://claude.ai/upgrade/max to upgrade.',
    'Failed to open browser. Re-run /login to update your local provider settings.',
  ],
  ['Note: You have launched claude in your home directory. For the best experience, launch it in a project directory instead.', `Note: You have launched ${ASTRONCODE_COMMAND} in your home directory. For the best experience, launch it in a project directory instead.`],
  ['Note: You have launched astroncode in your home directory. For the best experience, launch it in a project directory instead.', `Note: You have launched ${ASTRONCODE_COMMAND} in your home directory. For the best experience, launch it in a project directory instead.`],
  ['Restart Claude Code without {flag} to disable.', `Restart ${ASTRONCODE_NAME} without {flag} to disable.`],
  ['Restart AstronCode without {flag} to disable.', `Restart ${ASTRONCODE_NAME} without {flag} to disable.`],
  ['Channels require claude.ai authentication · run /login, then restart', 'Channels require local provider authentication · run /login, then restart'],
  ['Channels require Atroncode authentication · run /login, then restart', 'Channels require local provider authentication · run /login, then restart'],
  ['channels requires claude.ai authentication (run /login)', 'channels require local provider authentication (run /login)'],
  ['Channels require claude.ai authentication · run /login', 'Channels require local provider authentication · run /login'],
  ['What\'s new [ANT-ONLY: Latest CC commits]', "What's new [internal build: latest commits]"],
  ['                 [##]      [##]                           ', WELCOME_LINE_1],
  ['               [######]  [######]  ASTRONCODE             ', WELCOME_LINE_2],
  ['              [##][##][##][##][##] pixel coding core      ', WELCOME_LINE_3],
  ['               [######]  [######]                         ', WELCOME_LINE_4],
  [
    '{"            \\u2591\\u2591\\u2591\\u2591\\u2591\\u2591                                        "}',
    `{"${WELCOME_LINE_5}"}`,
  ],
  [
    '{"    \\u2591\\u2591\\u2591   \\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591                                      "}',
    `{"${WELCOME_LINE_6}"}`,
  ],
  [
    '{"   \\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591                                    "}',
    `{"${WELCOME_BLANK}"}`,
  ],
  [
    '{"     *                                       \\u2588\\u2588\\u2588\\u2588\\u2588\\u2593\\u2593\\u2591     "}',
    `{"${WELCOME_BLANK}"}`,
  ],
  [
    '{"                                 *         \\u2588\\u2588\\u2588\\u2593\\u2591     \\u2591\\u2591   "}',
    `{"${WELCOME_BLANK}"}`,
  ],
  [
    '{"            \\u2591\\u2591\\u2591\\u2591\\u2591\\u2591                        \\u2588\\u2588\\u2588\\u2593\\u2591           "}',
    `{"${WELCOME_BLANK}"}`,
  ],
  [
    '{"    \\u2591\\u2591\\u2591   \\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591\\u2591                      \\u2588\\u2588\\u2588\\u2593\\u2591           "}',
    `{"${WELCOME_BLANK}"}`,
  ],
  {
    pattern: /\bClaude Code\b/g,
    replace: ASTRONCODE_NAME,
  },
  {
    pattern: /\bAtroncode\b/g,
    replace: ASTRONCODE_NAME,
  },
  {
    pattern: /\bAstronCode\b/g,
    replace: ASTRONCODE_NAME,
  },
  {
    pattern: /\bAstroncode\b/g,
    replace: ASTRONCODE_NAME,
  },
  {
    pattern: /Share Claude Code and earn /g,
    replace: `Share ${ASTRONCODE_NAME} and earn `,
  },
  {
    pattern: /Share AstronCode and earn /g,
    replace: `Share ${ASTRONCODE_NAME} and earn `,
  },
  {
    pattern: /Share Atroncode and earn /g,
    replace: `Share ${ASTRONCODE_NAME} and earn `,
  },
  {
    pattern: /Share Astroncode and earn /g,
    replace: `Share ${ASTRONCODE_NAME} and earn `,
  },
  {
    pattern: /To display Claude\.ai subscription rate limit usage/g,
    replace: 'To display provider subscription rate limit usage',
  },
  {
    pattern: /Learn more at https:\/\/clau\.de\/desktop/g,
    replace: `Desktop handoff is not configured in this ${LOCAL_BUILD_LABEL}`,
  },
  {
    pattern: /To remove this server, run: claude\b/g,
    replace: `To remove this server, run: ${ASTRONCODE_COMMAND}`,
  },
  {
    pattern: /\bclaude auth login\b/g,
    replace: `${ASTRONCODE_COMMAND} auth login`,
  },
  {
    pattern: /\batroncode auth login\b/g,
    replace: `${ASTRONCODE_COMMAND} auth login`,
  },
  {
    pattern: /\bclaude setup-token\b/g,
    replace: `${ASTRONCODE_COMMAND} setup-token`,
  },
  {
    pattern: /\batroncode setup-token\b/g,
    replace: `${ASTRONCODE_COMMAND} setup-token`,
  },
  {
    pattern: /\bclaude update\b/g,
    replace: `${ASTRONCODE_COMMAND} update`,
  },
  {
    pattern: /\batroncode update\b/g,
    replace: `${ASTRONCODE_COMMAND} update`,
  },
  {
    pattern: /Please log in with the correct organization: claude auth login/g,
    replace: `Please log in with the correct organization: ${ASTRONCODE_COMMAND} auth login`,
  },
  {
    pattern: /\[Claude in Chrome\]/g,
    replace: `[${BROWSER_CONTROL_NAME}]`,
  },
  {
    pattern: /Set up a long-lived Atroncode authentication token(?! guidance)/g,
    replace: `Show local token setup guidance for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Sign in to your provider account(?! credentials for Atroncode)/g,
    replace: `Configure local provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Log out from your provider account(?! credentials for Atroncode)/g,
    replace: `Remove locally stored provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Configure local provider credentials for Atroncode(?: \(disabled in local build\))?/g,
    replace: `Configure local provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Remove locally stored provider credentials for Atroncode(?: \(disabled in local build\))?/g,
    replace: `Remove locally stored provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Show local token setup guidance for Atroncode(?: \(disabled in local build\))?/g,
    replace: `Show local token setup guidance for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Configure local provider credentials for Astroncode(?: \(disabled in local build\))?/g,
    replace: `Configure local provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Remove locally stored provider credentials for Astroncode(?: \(disabled in local build\))?/g,
    replace: `Remove locally stored provider credentials for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Show local token setup guidance for Astroncode(?: \(disabled in local build\))?/g,
    replace: `Show local token setup guidance for ${ASTRONCODE_NAME}`,
  },
  {
    pattern: /Tips for getting started/g,
    replace: 'Astroncode quick start',
  },
  {
    pattern: /Run \/init to create a CLAUDE\.md file with instructions for Claude Code/g,
    replace: 'Run /init to create an ASTRONCODE.md file with instructions for Astroncode',
  },
  {
    pattern: /Run \/init to create a CLAUDE\.md file with instructions for Claude/g,
    replace: 'Run /init to create an ASTRONCODE.md file with instructions for Astroncode',
  },
  {
    pattern: /Use \/memory to view and manage Claude memory/g,
    replace: 'Use /memory to view and manage Astron memory',
  },
  {
    pattern: /Hit Enter to queue up additional messages while Claude is working\./g,
    replace: 'Hit Enter to queue up additional messages while Astroncode is working.',
  },
  {
    pattern: /Connect to a Astroncode server \(internal[^)]*use cc:\/\/ URLs\)/g,
    replace: `Connect to an ${ASTRONCODE_NAME} server (internal â€” use cc:// URLs)`,
  },
  {
    pattern: /For manual setup [^:]+: https:\/\/github\.com\/astroncode\/action/g,
    replace: `For manual setup â†’ Review your local ${ASTRONCODE_NAME} workflow template`,
  },
  {
    pattern: /Opus now defaults to 1M context · 5x more room, same pricing/g,
    replace: 'Astroncode local runtime ready · Astron provider connected',
  },
  {
    pattern: /claude:"rgb\(215,119,87\)"/g,
    replace: 'claude:"rgb(96,120,255)"',
  },
  {
    pattern: /claude:"rgb\(255,153,51\)"/g,
    replace: 'claude:"rgb(96,120,255)"',
  },
  {
    pattern: /claudeShimmer:"rgb\(245,149,117\)"/g,
    replace: 'claudeShimmer:"rgb(156,170,255)"',
  },
  {
    pattern: /claudeShimmer:"rgb\(235,159,127\)"/g,
    replace: 'claudeShimmer:"rgb(156,170,255)"',
  },
  {
    pattern: /claudeShimmer:"rgb\(255,183,101\)"/g,
    replace: 'claudeShimmer:"rgb(156,170,255)"',
  },
  {
    pattern: /claude:"ansi:redBright"/g,
    replace: 'claude:"ansi:blueBright"',
  },
  {
    pattern: /claudeShimmer:"ansi:yellowBright"/g,
    replace: 'claudeShimmer:"ansi:cyanBright"',
  },
  {
    pattern: /clawd_body:"rgb\(215,119,87\)"/g,
    replace: 'clawd_body:"rgb(186,120,255)"',
  },
  {
    pattern: /clawd_body:"ansi:redBright"/g,
    replace: 'clawd_body:"ansi:magentaBright"',
  },
  {
    pattern: /briefLabelClaude:"rgb\(215,119,87\)"/g,
    replace: 'briefLabelClaude:"rgb(186,120,255)"',
  },
  {
    pattern: /briefLabelClaude:"rgb\(255,153,51\)"/g,
    replace: 'briefLabelClaude:"rgb(186,120,255)"',
  },
  {
    pattern: /briefLabelClaude:"ansi:redBright"/g,
    replace: 'briefLabelClaude:"ansi:magentaBright"',
  },
  {
    pattern: /function qJ6\(q\)\{.*?return W\}/gs,
    replace: RUNTIME_WELCOME_ART,
  },
  {
    pattern: /function FF8\(q\)\{if\(!q\|\|q\.length>A0Y\)return"Welcome back!";return`Welcome back \$\{q\}!`\}/g,
    replace: RUNTIME_WELCOME_EMPTY,
  },
  {
    pattern: /async function lcY\(\)\{if\(jj\(\)\|\|i6\(process\.env\.DISABLE_INSTALLATION_CHECKS\)\)return null;if\(await Ro\(\)==="development"\)return null;return\{timeoutMs:15000,key:"npm-deprecation-warning",text:ccY,color:"warning",priority:"high"\}\}/g,
    replace: RUNTIME_NOTICE_DISABLED,
  },
  {
    pattern: /Run `claude install`/g,
    replace: 'Run `astroncode install`',
  },
  {
    pattern: /Use `claude install` for native installation/g,
    replace: 'Use `astroncode install` for local installation guidance',
  },
  {
    pattern: /Run claude install to update configuration/g,
    replace: 'Run astroncode install to refresh local configuration',
  },
  {
    pattern: /Consider using native installation: claude install/g,
    replace: 'Review the local Astroncode install guidance: astroncode install',
  },
  {
    pattern: /Or consider using native installation with: claude install/g,
    replace: 'Or review the local Astroncode install guidance with: astroncode install',
  },
  {
    pattern: /Astroncode has switched from npm to native installer\.[^"]*/g,
    replace: 'Astroncode local runtime ready.',
  },
]

export function applyBrandingReplacements(source, options = {}) {
  const {
    warnOnMissingVersionString = false,
    sourceLabel = 'runtime bundle',
  } = options
  let patched = source
  let replacements = 0

  for (const rule of [...brandingReplacements, ...additionalBrandingRules, ...additionalBrandingPatterns, ...clawdReplacementRules, ...projectGuidanceRules, ...projectGuidancePatterns, ...modelNoticeRules, ...modelNoticePatterns, ...subscriptionRules, ...consoleRules, ...extendedUrlRules, ...githubRules, ...modelAliasRules, ...extendedPatterns, ...moreModelRules, ...moreModelPatterns, ...fixRules, ...fixPatterns]) {
    if (Array.isArray(rule)) {
      const [from, to] = rule

      if (patched.includes(from)) {
        patched = patched.split(from).join(to)
        replacements += 1
      }

      continue
    }

    rule.pattern.lastIndex = 0
    if (rule.pattern.test(patched)) {
      rule.pattern.lastIndex = 0
      patched = patched.replace(rule.pattern, rule.replace)
      replacements += 1
    }
  }

  if (warnOnMissingVersionString && !source.includes(UPSTREAM_BUNDLE_VERSION)) {
    console.warn(
      `[Astroncode branding] WARNING: upstream bundle version "${UPSTREAM_BUNDLE_VERSION}" ` +
      `not found in ${sourceLabel}. Update UPSTREAM_BUNDLE_VERSION in runtime-branding.mjs ` +
      `to match the new upstream version string.`,
    )
  }

  patched = applyAnthropicCatchAll(patched)

  return {
    patched,
    replacements,
  }
}

export function patchRuntimeBrandingText(source) {
  return applyBrandingReplacements(source).patched
}

export async function ensureRuntimeBrandingFile(runtimeFile) {
  const source = await readFile(runtimeFile, 'utf8')
  const { patched, replacements } = applyBrandingReplacements(source, {
    warnOnMissingVersionString: true,
    sourceLabel: path.basename(runtimeFile),
  })

  if (patched !== source) {
    await writeFile(runtimeFile, patched, 'utf8')
  }

  return {
    changed: patched !== source,
    replacements,
  }
}

function buildRuntimeBundleName(runtimeFile, patchedSource) {
  const ext = path.extname(runtimeFile)
  const base = path.basename(runtimeFile, ext)
  const hash = createHash('sha256').update(patchedSource).digest('hex').slice(0, 12)

  return `${base}.astron.${hash}${ext}`
}

export async function ensureRuntimeBrandingBundle(runtimeFile, outputDir) {
  const source = await readFile(runtimeFile, 'utf8')
  const { patched, replacements } = applyBrandingReplacements(source, {
    warnOnMissingVersionString: true,
    sourceLabel: path.basename(runtimeFile),
  })

  await mkdir(outputDir, { recursive: true })

  const bundleName = buildRuntimeBundleName(runtimeFile, patched)
  const brandedRuntimeFile = path.join(outputDir, bundleName)

  try {
    await access(brandedRuntimeFile)
  } catch {
    const tempFile = `${brandedRuntimeFile}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tempFile, patched, 'utf8')

    try {
      await rename(tempFile, brandedRuntimeFile)
    } catch (error) {
      await rm(tempFile, { force: true })

      try {
        await access(brandedRuntimeFile)
      } catch {
        throw error
      }
    }
  }

  return {
    runtimeFile: brandedRuntimeFile,
    replacements,
  }
}
