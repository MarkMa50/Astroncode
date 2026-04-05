import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

import {
  ensureRuntimeBrandingFile,
  ensureRuntimeBrandingBundle,
  patchRuntimeBrandingText,
} from '../scripts/runtime-branding.mjs'

const tempDirs = []

after(async () => {
  const { rm } = await import('node:fs/promises')
  await Promise.all(
    tempDirs.map(dir => rm(dir, { recursive: true, force: true })),
  )
})

test('patchRuntimeBrandingText rewrites user-facing Atroncode strings', () => {
  const input = [
    'Usage: claude [options] [command] [prompt]',
    'Enable Claude in Chrome integration',
    'Tip: You can launch Claude Code with just `claude`',
    'Check the health of your Claude Code auto-updater.',
    'Welcome to Claude Code',
    '               [######]  [######]  ASTRONCODE             ',
    '2.1.88',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /Usage: atroncode \[options\] \[command\] \[prompt\]/)
  assert.match(output, /Chrome integration \(disabled in local Atroncode build\)/)
  assert.match(output, /launch Atroncode with just `atroncode`/)
  assert.match(output, /Run local Atroncode diagnostics for provider config and runtime health\./)
  assert.match(output, /Welcome to Atroncode/)
  assert.match(output, /ATRONCODE/)
  assert.match(output, />_ ATRONCODE shell/)
  assert.match(output, /1\.0\.10/)
  assert.doesNotMatch(output, /2\.1\.88/)
})

test('patchRuntimeBrandingText hardens already-rebranded Atroncode help text', () => {
  const input = [
    'Enable Atroncode in Chrome integration',
    'Updater health command (disabled in local Atroncode build).',
    'Install command (disabled in local Atroncode build; upstream-only). Use [target] to specify version (stable, latest, or specific version)',
    'Check for updates and install if available',
    'Configure local provider credentials for Atroncode (disabled in local build)',
    'Remove locally stored provider credentials for Atroncode (disabled in local build)',
    'Show local token setup guidance for Atroncode (disabled in local build)',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /Chrome integration \(disabled in local Atroncode build\)/)
  assert.match(output, /Run local Atroncode diagnostics for provider config and runtime health\./)
  assert.match(output, /Show local install status for this Atroncode build/)
  assert.match(output, /Show the current Atroncode version and local update guidance/)
  assert.match(output, /Configure local provider credentials for Atroncode/)
  assert.match(output, /Remove locally stored provider credentials for Atroncode/)
  assert.match(output, /Show local token setup guidance for Atroncode/)
})

test('patchRuntimeBrandingText rewrites remaining visible hosted-brand prompts', () => {
  const input = [
    'Diagnose and verify your Claude Code installation and settings',
    'Submit feedback about Claude Code',
    'Switch Anthropic accounts',
    'Sign in with your Anthropic account',
    'Sign out from your Anthropic account',
    'Successfully removed your local Atroncode provider credentials.',
    'Add an MCP server to Claude Code.',
    '  claude mcp add --transport http sentry https://mcp.sentry.dev/mcp',
    "Enable XAA (SEP-990) for this server. Requires 'claude mcp xaa setup' first.",
    'Set the AI model for Claude Code (currently astron-code-latest)',
    'Share a free week of Claude Code with friends and earn extra usage',
    'Share a free week of Claude Code with friends',
    'Manage Claude Code marketplaces',
    'Connect to a Claude Code server (internal — use cc:// URLs)',
    'Connect your local environment for remote-control sessions via claude.ai/code',
    'Run Claude Code on a remote host over SSH. Deploys the binary and tunnels API auth back through your local machine — no remote setup needed.',
    'You are currently using your subscription to power your Claude Code usage',
    'Use your existing Claude Code API key',
    'Create a long-lived token with your Claude subscription',
    'ANTHROPIC_API_KEY already exists in repository secrets!',
    'A Claude workflow file already exists in this repository.',
    'A Claude workflow file already exists at .github/workflows/claude.yml',
    'View the latest workflow template at: https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml',
    'Example: anthropics/claude-cli',
    'Claude Code Review workflow',
    'For manual setup → Visit: https://github.com/anthropics/claude-code-action',
    'add-from-claude-desktop',
    'Claude in Chrome (Beta)',
    'Claude in Chrome (Beta) settings',
    'Claude in Chrome requires a claude.ai subscription.',
    'Chrome extension not detected Â· https://claude.ai/chrome to install',
    'Claude in Chrome enabled · /chrome',
    'Claude in Chrome enabled by default',
    'Learn more: https://code.claude.com/docs/en/chrome',
    'Not logged in. Run claude auth login to authenticate.',
    'Successfully logged out from your Anthropic account.',
    'Continue the current session in Claude Desktop',
    'No MCP servers found in Claude Desktop configuration or configuration file does not exist.',
    'Import MCP Servers from Claude Desktop',
    'Run Claude Code locally or remotely using the Claude desktop app: clau.de/desktop',
    'Continue your session in Claude Code Desktop with /desktop',
    '/mobile to use Claude Code from the Claude app on your phone',
    'Claude Desktop is not installed.',
    'Checking for Claude Desktop…',
    'Session transferred to Claude Desktop',
    'Voice mode requires a Claude.ai account. Please run /login to sign in.',
    'No IDEs with Claude Code extension detected.',
    'No available IDEs detected. Make sure your IDE has the Claude Code extension or plugin installed and is running.',
    'No available IDEs detected. Please install the plugin and restart your IDE:\nhttps://docs.claude.com/s/claude-code-jetbrains',
    'Only one Claude Code instance can be connected to VS Code at a time.',
    'Remote Control requires a claude.ai subscription. Run `claude auth login` to sign in with your claude.ai account.',
    'Remote Control is only available with claude.ai subscriptions. Please use `/login` to sign in with your claude.ai account.',
    'You are already on the highest Max subscription plan. For additional usage, run /login to switch to an API usage-billed account.',
    'Starting new login following /upgrade. Exit with Ctrl-C to use existing account.',
    'Failed to open browser. Please visit https://claude.ai/upgrade/max to upgrade.',
    'To display Claude.ai subscription rate limit usage',
    'To remove this server, run: claude',
    '[Claude in Chrome] Detected browser: Chrome',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /Diagnose and verify your Atroncode installation and settings/)
  assert.match(output, /Submit feedback about Atroncode/)
  assert.match(output, /Switch local provider accounts/)
  assert.match(output, /Configure local provider credentials/)
  assert.match(output, /Remove locally stored provider credentials/)
  assert.match(output, /Successfully removed your local Atroncode provider credentials\./)
  assert.match(output, /Add an MCP server to Atroncode\./)
  assert.match(output, /atroncode mcp add --transport http sentry/)
  assert.match(output, /Requires 'atroncode mcp xaa setup' first\./)
  assert.match(output, /Set the AI model for Atroncode \(currently astron-code-latest\)/)
  assert.match(output, /Share a free week of Atroncode with friends and earn extra usage/)
  assert.match(output, /Share a free week of Atroncode with friends/)
  assert.match(output, /Manage Atroncode marketplaces/)
  assert.match(output, /Connect to an Atroncode server \(internal — use cc:\/\/ URLs\)/)
  assert.match(output, /Connect your local environment for remote-control sessions through the Atroncode bridge/)
  assert.match(output, /Run Atroncode on a remote host over SSH/)
  assert.match(output, /You are currently using your subscription to power your Atroncode usage/)
  assert.match(output, /Use your existing Atroncode API key/)
  assert.match(output, /Use a long-lived token from your local provider/)
  assert.match(output, /A provider API key secret already exists in repository secrets!/)
  assert.match(output, /An Atroncode workflow file already exists in this repository\./)
  assert.match(output, /An existing Atroncode workflow file was found at \.github\/workflows\/claude\.yml/)
  assert.match(output, /Review the current local workflow template guidance before updating this file\./)
  assert.match(output, /Example: your-org\/atroncode/)
  assert.match(output, /Atroncode Review workflow/)
  assert.match(output, /For manual setup → Review your local Atroncode workflow template/)
  assert.match(output, /add-from-atroncode-desktop/)
  assert.match(output, /Atroncode Browser Control \(Beta\)/)
  assert.match(output, /Atroncode Browser Control \(Beta\) settings/)
  assert.match(output, /Atroncode Browser Control is disabled in this local build\./)
  assert.match(output, /Chrome extension not detected\. Install it before enabling Atroncode Browser Control\./)
  assert.match(output, /Atroncode Browser Control enabled · \/chrome/)
  assert.match(output, /Atroncode Browser Control enabled by default/)
  assert.match(output, /Learn more: browser control is disabled in this local Atroncode build\./)
  assert.match(output, /Not logged in\. Run atroncode auth login to authenticate\./)
  assert.match(output, /Successfully logged out from your Atroncode provider account\./)
  assert.match(output, /Continue the current session in Atroncode Desktop/)
  assert.match(output, /No MCP servers found in Atroncode Desktop configuration or the configuration file does not exist\./)
  assert.match(output, /Import MCP Servers from Atroncode Desktop/)
  assert.match(output, /Run Atroncode locally and continue sessions with the Atroncode Desktop handoff flow\./)
  assert.match(output, /Continue your session in Atroncode Desktop with \/desktop/)
  assert.match(output, /Use \/desktop to continue the current session in Atroncode Desktop/)
  assert.match(output, /Atroncode Desktop is not installed\./)
  assert.match(output, /Checking for Atroncode Desktop…/)
  assert.match(output, /Session transferred to Atroncode Desktop/)
  assert.match(output, /Voice mode requires local provider credentials\. Please run \/login to sign in\./)
  assert.match(output, /No IDEs with Atroncode extension detected\./)
  assert.match(output, /Atroncode extension or plugin installed and is running\./)
  assert.match(output, /Please install the Atroncode JetBrains plugin and restart your IDE\./)
  assert.match(output, /Only one Atroncode instance can be connected to VS Code at a time\./)
  assert.match(output, /Remote Control requires locally configured provider credentials\. Run `atroncode auth login` to configure access\./)
  assert.match(output, /Remote Control is only available with locally configured provider credentials\. Please use `\/login` to refresh your Atroncode access\./)
  assert.match(output, /Local provider credentials are already configured\./)
  assert.match(output, /Opening the local provider login flow\./)
  assert.match(output, /Re-run \/login to update your local provider settings\./)
  assert.match(output, /To display provider subscription rate limit usage/)
  assert.match(output, /To remove this server, run: atroncode/)
  assert.match(output, /\[Atroncode Browser Control\] Detected browser: Chrome/)
  assert.doesNotMatch(output, /Claude Desktop|Claude in Chrome|Claude Code extension|claude\.ai/)
})

test('ensureRuntimeBrandingFile patches a runtime bundle on disk when needed', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-branding-'))
  tempDirs.push(dir)

  const runtimeFile = path.join(dir, 'cli.js')
  await writeFile(
    runtimeFile,
    [
      'K.name("claude")',
      'Usage: claude',
      'Enable Claude in Chrome integration',
    ].join('\n'),
    'utf8',
  )

  const result = await ensureRuntimeBrandingFile(runtimeFile)
  const patched = await readFile(runtimeFile, 'utf8')

  assert.equal(result.changed, true)
  assert.ok(result.replacements > 0)
  assert.match(patched, /K.name\("atroncode"\)/)
  assert.match(patched, /Usage: atroncode/)
  assert.match(patched, /Chrome integration \(disabled in local Atroncode build\)/)
})

test('ensureRuntimeBrandingBundle creates a branded runtime copy without mutating the source bundle', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'astron-bundle-'))
  tempDirs.push(dir)

  const runtimeFile = path.join(dir, 'cli.js')
  const outputDir = path.join(dir, 'runtime-cache')
  const source = [
    'K.name("claude")',
    'Usage: claude',
    'Enable Claude in Chrome integration',
  ].join('\n')

  await writeFile(runtimeFile, source, 'utf8')

  const result = await ensureRuntimeBrandingBundle(runtimeFile, outputDir)
  const original = await readFile(runtimeFile, 'utf8')
  const branded = await readFile(result.runtimeFile, 'utf8')

  assert.equal(original, source)
  assert.notEqual(result.runtimeFile, runtimeFile)
  assert.match(result.runtimeFile, /cli\.astron\.[a-f0-9]{12}\.js$/)
  assert.match(branded, /K.name\("atroncode"\)/)
  assert.match(branded, /Chrome integration \(disabled in local Atroncode build\)/)
})
