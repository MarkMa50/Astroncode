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

test('patchRuntimeBrandingText rewrites user-facing Astroncode strings', () => {
  const input = [
    'if(!process.stdin.isTTY||jT6||process.argv.includes("-p")||process.argv.includes("--print"))return;',
    'Usage: claude [options] [command] [prompt]',
    'Enable Claude in Chrome integration',
    'Tip: You can launch Claude Code with just `claude`',
    'Check the health of your Claude Code auto-updater.',
    'Welcome to Claude Code',
    '               [######]  [######]  ASTRONCODE             ',
    '2.1.88',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(
    output,
    /if\(!process\.stdin\.isTTY\|\|process\.platform==="win32"\|\|jT6\|\|process\.argv\.includes\("-p"\)\|\|process\.argv\.includes\("--print"\)\)return;/,
  )
  assert.match(output, /Usage: astroncode \[options\] \[command\] \[prompt\]/)
  assert.match(
    output,
    /Chrome integration \(disabled in local Astroncode build\)/,
  )
  assert.match(output, /launch Astroncode with just `astroncode`/)
  assert.match(
    output,
    /Run local Astroncode diagnostics for provider config and runtime health\./,
  )
  assert.match(output, /Welcome to Astroncode/)
  assert.match(output, /╠═╣╚═╗ ║ ╠╦╝/)
  assert.match(output, /1\.0\.742/)
  assert.match(output, /1\.0\.742/)
  assert.doesNotMatch(output, /2\.1\.88/)
})

test('patchRuntimeBrandingText hardens already-rebranded Astroncode help text', () => {
  const input = [
    'Enable Astroncode in Chrome integration',
    'Updater health command (disabled in local Astroncode build).',
    'Install command (disabled in local Astroncode build; upstream-only). Use [target] to specify version (stable, latest, or specific version)',
    'Check for updates and install if available',
    'Configure local provider credentials for Astroncode (disabled in local build)',
    'Remove locally stored provider credentials for Astroncode (disabled in local build)',
    'Show local token setup guidance for Astroncode (disabled in local build)',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(
    output,
    /Chrome integration \(disabled in local Astroncode build\)/,
  )
  assert.match(
    output,
    /Run local Astroncode diagnostics for provider config and runtime health\./,
  )
  assert.match(output, /Show local install status for this Astroncode build/)
  assert.match(
    output,
    /Show the current Astroncode version and local update guidance/,
  )
  assert.match(output, /Configure local provider credentials for Astroncode/)
  assert.match(
    output,
    /Remove locally stored provider credentials for Astroncode/,
  )
  assert.match(output, /Show local token setup guidance for Astroncode/)
})

test('patchRuntimeBrandingText replaces the legacy startup mascot and suppresses installer nags', () => {
  const input = [
    'function FF8(q){if(!q||q.length>A0Y)return"Welcome back!";return`Welcome back ${q}!`}',
    'function qJ6(q){let K=z6(26),_;if(K[0]!==q)_=q===void 0?{}:q,K[0]=q,K[1]=_;else _=K[1];let{pose:z}=_,Y=z===void 0?"default":z;if(a1.terminal==="Apple_Terminal"){let D;if(K[2]!==Y)D=bz.createElement(j0Y,{pose:Y}),K[2]=Y,K[3]=D;else D=K[3];return D}let $=O0Y[Y],A;if(K[4]!==$.r1L)A=bz.createElement(k,{color:"clawd_body"},$.r1L),K[4]=$.r1L,K[5]=A;else A=K[5];let O;if(K[6]!==$.r1E)O=bz.createElement(k,{color:"clawd_body",backgroundColor:"clawd_background"},$.r1E),K[6]=$.r1E,K[7]=O;else O=K[7];let w;if(K[8]!==$.r1R)w=bz.createElement(k,{color:"clawd_body"},$.r1R),K[8]=$.r1R,K[9]=w;else w=K[9];let j;if(K[10]!==A||K[11]!==O||K[12]!==w)j=bz.createElement(k,null,A,O,w),K[10]=A,K[11]=O,K[12]=w,K[13]=j;else j=K[13];let H;if(K[14]!==$.r2L)H=bz.createElement(k,{color:"clawd_body"},$.r2L),K[14]=$.r2L,K[15]=H;else H=K[15];let J;if(K[16]===Symbol.for("react.memo_cache_sentinel"))J=bz.createElement(k,{color:"clawd_body",backgroundColor:"clawd_background"},"â–ˆâ–ˆâ–ˆâ–ˆâ–ˆ"),K[16]=J;else J=K[16];let M;if(K[17]!==$.r2R)M=bz.createElement(k,{color:"clawd_body"},$.r2R),K[17]=$.r2R,K[18]=M;else M=K[18];let X;if(K[19]!==H||K[20]!==M)X=bz.createElement(k,null,H,J,M),K[19]=H,K[20]=M,K[21]=X;else X=K[21];let P;if(K[22]===Symbol.for("react.memo_cache_sentinel"))P=bz.createElement(k,{color:"clawd_body"},"  ","â–˜â–˜ â–â–","  "),K[22]=P;else P=K[22];let W;if(K[23]!==X||K[24]!==j)W=bz.createElement(u,{flexDirection:"column"},j,X,P),K[23]=X,K[24]=j,K[25]=W;else W=K[25];return W}',
    'async function lcY(){if(jj()||i6(process.env.DISABLE_INSTALLATION_CHECKS))return null;if(await Ro()==="development")return null;return{timeoutMs:15000,key:"npm-deprecation-warning",text:ccY,color:"warning",priority:"high"}}',
    'Astroncode has switched from npm to native installer. Run `claude install` or see https://docs.astron.com/en/docs/atroncode/getting-started for more options.',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /╔═╗╔═╗╔╦╗╦═╗/)
  assert.match(output, /╔═╗╔═╗╔╦╗╔═╗/)
  assert.doesNotMatch(output, /Welcome back/)
  assert.doesNotMatch(output, /neon command deck/i)
  assert.doesNotMatch(output, /ATRON|pixel coding core/)
  assert.match(output, /async function lcY\(\)\{return null\}/)
  assert.doesNotMatch(output, /claude install/)
})

test('patchRuntimeBrandingText rethemes startup brand colors to neon blue and violet', () => {
  const input = [
    'const theme={claude:"rgb(215,119,87)",claudeShimmer:"rgb(245,149,117)",clawd_body:"rgb(215,119,87)",briefLabelClaude:"rgb(215,119,87)"};',
    'const ansiTheme={claude:"ansi:redBright",clawd_body:"ansi:redBright",briefLabelClaude:"ansi:redBright"};',
    'const daltonized={claude:"rgb(255,153,51)",claudeShimmer:"rgb(255,183,101)",briefLabelClaude:"rgb(255,153,51)"};',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /claude:"rgb\(96,120,255\)"/)
  assert.match(output, /claudeShimmer:"rgb\(156,170,255\)"/)
  assert.match(output, /clawd_body:"rgb\(186,120,255\)"/)
  assert.match(output, /briefLabelClaude:"rgb\(186,120,255\)"/)
  assert.match(output, /claude:"ansi:blueBright"/)
  assert.match(output, /clawd_body:"ansi:magentaBright"/)
  assert.match(output, /briefLabelClaude:"ansi:magentaBright"/)
  assert.doesNotMatch(output, /rgb\(215,119,87\)|rgb\(255,153,51\)|ansi:redBright/)
})

test('patchRuntimeBrandingText rewrites remaining visible hosted-brand prompts', () => {
  const input = [
    'Diagnose and verify your Claude Code installation and settings',
    'Submit feedback about Claude Code',
    'Switch Anthropic accounts',
    'Sign in with your Anthropic account',
    'Sign out from your Anthropic account',
    'Successfully removed your local Astroncode provider credentials.',
    'Add an MCP server to Claude Code.',
    '  claude mcp add --transport http sentry https://mcp.sentry.dev/mcp',
    "Enable XAA (SEP-990) for this server. Requires 'claude mcp xaa setup' first.",
    'Set the AI model for Claude Code (currently astron-code-latest)',
    'Share a free week of Claude Code with friends and earn extra usage',
    'Share a free week of Claude Code with friends',
    'Manage Claude Code marketplaces',
    'Connect to a Claude Code server (internal Ã¢â‚¬â€ use cc:// URLs)',
    'Connect your local environment for remote-control sessions via claude.ai/code',
    'Run Claude Code on a remote host over SSH. Deploys the binary and tunnels API auth back through your local machine Ã¢â‚¬â€ no remote setup needed.',
    'You are currently using your subscription to power your Claude Code usage',
    'Use your existing Claude Code API key',
    'Create a long-lived token with your Claude subscription',
    'ANTHROPIC_API_KEY already exists in repository secrets!',
    'A Claude workflow file already exists in this repository.',
    'A Claude workflow file already exists at .github/workflows/claude.yml',
    'View the latest workflow template at: https://github.com/anthropics/claude-code-action/blob/main/examples/claude.yml',
    'Example: anthropics/claude-cli',
    'Claude Code Review workflow',
    'For manual setup Ã¢â€ â€™ Visit: https://github.com/anthropics/claude-code-action',
    'add-from-claude-desktop',
    'Claude in Chrome (Beta)',
    'Claude in Chrome (Beta) settings',
    'Claude in Chrome requires a claude.ai subscription.',
    'Chrome extension not detected Ã‚Â· https://claude.ai/chrome to install',
    'Claude in Chrome enabled Â· /chrome',
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
    'Checking for Claude DesktopÃ¢â‚¬Â¦',
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

  assert.match(
    output,
    /Diagnose and verify your Astroncode installation and settings/,
  )
  assert.match(output, /Submit feedback about Astroncode/)
  assert.match(output, /Switch local provider accounts/)
  assert.match(output, /Configure local provider credentials/)
  assert.match(output, /Remove locally stored provider credentials/)
  assert.match(
    output,
    /Successfully removed your local Astroncode provider credentials\./,
  )
  assert.match(output, /Add an MCP server to Astroncode\./)
  assert.match(output, /astroncode mcp add --transport http sentry/)
  assert.match(output, /Requires 'astroncode mcp xaa setup' first\./)
  assert.match(
    output,
    /Set the AI model for Astroncode \(currently astron-code-latest\)/,
  )
  assert.match(
    output,
    /Share a free week of Astroncode with friends and earn extra usage/,
  )
  assert.match(output, /Share a free week of Astroncode with friends/)
  assert.match(output, /Manage Astroncode marketplaces/)
  assert.match(output, /Connect to an Astroncode server \(internal .*use cc:\/\/ URLs\)/)
  assert.match(
    output,
    /Connect your local environment for remote-control sessions through the Astroncode bridge/,
  )
  assert.match(output, /Run Astroncode on a remote host over SSH/)
  assert.match(
    output,
    /You are currently using your subscription to power your Astroncode usage/,
  )
  assert.match(output, /Use your existing Astroncode API key/)
  assert.match(output, /Use a long-lived token from your local provider/)
  assert.match(
    output,
    /A provider API key secret already exists in repository secrets!/,
  )
  assert.match(
    output,
    /An Astroncode workflow file already exists in this repository\./,
  )
  assert.match(
    output,
    /An existing Astroncode workflow file was found at \.github\/workflows\/claude\.yml/,
  )
  assert.match(
    output,
    /Review the current local workflow template guidance before updating this file\./,
  )
  assert.match(output, /Example: your-org\/astroncode/)
  assert.match(output, /Astroncode Review workflow/)
  assert.match(
    output,
    /Review the current local workflow template guidance before updating this file\./,
  )
  assert.match(output, /add-from-astroncode-desktop/)
  assert.match(output, /Astroncode Browser Control \(Beta\)/)
  assert.match(output, /Astroncode Browser Control \(Beta\) settings/)
  assert.match(
    output,
    /Astroncode Browser Control is disabled in this local build\./,
  )
  assert.match(output, /Chrome extension not detected/)
  assert.match(output, /(?:Astroncode Browser Control|Claude in Chrome) enabled .*\/chrome/)
  assert.match(output, /Astroncode Browser Control enabled by default/)
  assert.match(
    output,
    /Learn more: browser control is disabled in this local Astroncode build\./,
  )
  assert.match(
    output,
    /Not logged in\. Run astroncode auth login to authenticate\./,
  )
  assert.match(
    output,
    /Successfully logged out from your Astroncode provider account\./,
  )
  assert.match(output, /Continue the current session in Astroncode Desktop/)
  assert.match(
    output,
    /No MCP servers found in Astroncode Desktop configuration or the configuration file does not exist\./,
  )
  assert.match(output, /Import MCP Servers from Astroncode Desktop/)
  assert.match(
    output,
    /Run Astroncode locally and continue sessions with the Astroncode Desktop handoff flow\./,
  )
  assert.match(output, /Continue your session in Astroncode Desktop with \/desktop/)
  assert.match(
    output,
    /Use \/desktop to continue the current session in Astroncode Desktop/,
  )
  assert.match(output, /Astroncode Desktop is not installed\./)
  assert.match(output, /Checking for .*Desktop/)
  assert.match(output, /Session transferred to Astroncode Desktop/)
  assert.match(
    output,
    /Voice mode requires local provider credentials\. Please run \/login to sign in\./,
  )
  assert.match(output, /No IDEs with Astroncode extension detected\./)
  assert.match(output, /Astroncode extension or plugin installed and is running\./)
  assert.match(
    output,
    /Please install the Astroncode JetBrains plugin and restart your IDE\./,
  )
  assert.match(
    output,
    /Only one Astroncode instance can be connected to VS Code at a time\./,
  )
  assert.match(
    output,
    /Remote Control requires locally configured provider credentials\. Run `astroncode auth login` to configure access\./,
  )
  assert.match(
    output,
    /Remote Control is only available with locally configured provider credentials\. Please use `\/login` to refresh your Astroncode access\./,
  )
  assert.match(output, /Local provider credentials are already configured\./)
  assert.match(output, /Opening the local provider login flow\./)
  assert.match(output, /Re-run \/login to update your local provider settings\./)
  assert.match(output, /To display provider subscription rate limit usage/)
  assert.match(output, /To remove this server, run: astroncode/)
  assert.match(output, /\[Astroncode Browser Control\] Detected browser: Chrome/)
  assert.doesNotMatch(
    output,
    /Claude Code extension|claude\.ai/,
  )
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
      '2.1.88',
    ].join('\n'),
    'utf8',
  )

  const result = await ensureRuntimeBrandingFile(runtimeFile)
  const patched = await readFile(runtimeFile, 'utf8')

  assert.equal(result.changed, true)
  assert.ok(result.replacements > 0)
  assert.match(patched, /K.name\("astroncode"\)/)
  assert.match(patched, /Usage: astroncode/)
  assert.match(
    patched,
    /Chrome integration \(disabled in local Astroncode build\)/,
  )
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
    '2.1.88',
  ].join('\n')

  await writeFile(runtimeFile, source, 'utf8')

  const result = await ensureRuntimeBrandingBundle(runtimeFile, outputDir)
  const original = await readFile(runtimeFile, 'utf8')
  const branded = await readFile(result.runtimeFile, 'utf8')

  assert.equal(original, source)
  assert.notEqual(result.runtimeFile, runtimeFile)
  assert.match(result.runtimeFile, /cli\.astron\.[a-f0-9]{12}\.js$/)
  assert.match(branded, /K.name\("astroncode"\)/)
  assert.match(
    branded,
    /Chrome integration \(disabled in local Astroncode build\)/,
  )
})

test('patchRuntimeBrandingText rewrites residual Claude Smart and Anthropic identity text', () => {
  const input = [
    "I'm using astron-code-latest (Claude Smart 4.6).",
    'I am Atroncode, Anthropic official CLI tool.',
    'This is the most capable model in the Astron family.',
    'It is the same model used for both standard and fast modes in Astroncode.',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /Astron Smart 4\.6/)
  assert.match(output, /Astron local CLI tool/)
  assert.doesNotMatch(output, /Claude Smart/)
  assert.doesNotMatch(output, /\bAnthropic\b/)
})

test('patchRuntimeBrandingText leaves Anthropic technical identifiers intact while rewriting visible text', () => {
  const input = [
    'const headers={"x-anthropic-id":"abc123","x-request-id":"req-1"};',
    'const path="/anthropic/messages";',
    'const label="Switch Anthropic accounts";',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /"x-anthropic-id":"abc123"/)
  assert.match(output, /"\/anthropic\/messages"/)
  assert.match(output, /"Switch local provider accounts"/)
})

test('patchRuntimeBrandingText rewrites legacy model-guidance prompt text in the runtime bundle', () => {
  const input = [
    "The most recent Claude model family is Claude 4.5/4.6. Model IDs - Opus 4.6: 'claude-opus-4-6', Sonnet 4.6: 'claude-sonnet-4-6', Haiku 4.5: 'claude-haiku-4-5-20251001'. When building AI applications, default to the latest and most capable Claude models.",
    'Claude Code is available as a CLI in the terminal, desktop app (Mac/Windows), web app (claude.ai/code), and IDE extensions (VS Code, JetBrains).',
    'Fast mode for Claude Code uses the same Claude Opus 4.6 model with faster output. It does NOT switch to a different model. It can be toggled with /fast.',
  ].join('\n')

  const output = patchRuntimeBrandingText(input)

  assert.match(output, /Astroncode may be configured with provider-backed model IDs/)
  assert.match(output, /Astroncode is available as a local coding system/)
  assert.match(output, /Fast mode in Astroncode keeps the same configured model/)
  assert.doesNotMatch(output, /The most recent Claude model family/)
  assert.doesNotMatch(output, /Claude Code is available as a CLI/)
})
