# Astroncode for Windows

Astroncode on Windows keeps the upstream terminal workflow, but runs as a local Windows-first build with provider configuration, launcher repair, GUI workbench support, and guarded sync rules for Windows-specific entrypoints.

This working tree is expected at:

- `C:\Users\markw\astroncode`

## Start

Recommended entrypoints:

```powershell
.\astroncode.ps1 --help
.\astroncode.ps1 -p "Reply with exactly OK." --output-format text
```

You can also launch directly through Node:

```powershell
node .\scripts\start.mjs --help
```

Common local commands:

- `astroncode`
- `astroncode setup`
- `astroncode install`
- `astroncode doctor`
- `astroncode gui`

Compatibility aliases are still preserved for existing Windows shortcuts:

- `atroncode`
- `atroncode.ps1`
- `atroncode.cmd`

## Provider configuration

Astroncode reads `.env.astroncode` and maps those values into the runtime:

- `ASTRONCODE_AUTH_TOKEN -> ANTHROPIC_AUTH_TOKEN`
- `ASTRONCODE_API_KEY -> ANTHROPIC_API_KEY`
- `ASTRONCODE_BASE_URL -> ANTHROPIC_BASE_URL`
- `ASTRONCODE_MODEL -> ANTHROPIC_MODEL`

Launcher defaults also apply:

- `ANTHROPIC_SMALL_FAST_MODEL = ASTRONCODE_MODEL`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = 1`
- `DISABLE_TELEMETRY = 1`
- `CLAUDE_CODE_ACCESSIBILITY = 1` on Windows for better IME/CJK input behavior

If your provider exposes an OpenAI-style `/v2` endpoint, Astroncode automatically normalizes it to the runtime `/anthropic` endpoint before startup.

You can configure the local provider any time with:

```powershell
.\astroncode.ps1 setup
```

On a fresh machine with no provider configured yet, a plain `astroncode` launch opens the setup wizard automatically before the runtime starts.

## Runtime behavior

The Windows launch path now does these things before `cli.js` starts:

1. Loads provider configuration from `.env.astroncode` or the configured user config directory
2. Generates a branded runtime copy in the Astroncode runtime cache instead of mutating the bundled `cli.js`
3. Handles local Windows-safe commands before handing off to the upstream runtime
4. Runs the guarded Windows sync loop while the runtime stays open

Windows-specific launch behavior is intentionally preserved for:

- `scripts/start.mjs`
- `scripts/runtime-auto-sync.mjs`
- PowerShell / CMD launchers
- desktop shortcuts
- GUI entrypoints

## Local GUI workbench

Launch the local GUI workbench with:

```powershell
.\astroncode.ps1 gui
```

Optional:

```powershell
.\astroncode.ps1 gui --port 46321 --no-browser
```

The GUI workbench is backed by the same local Astroncode core and currently includes:

- workspace/runtime status
- transcript and prompt composer
- local environment context
- prompt execution through the local `astroncode -p` path

## Main-to-Windows alignment

Windows now learns from the macOS mainline repository through the local alignment workflow:

- source: `MarkMa50/Astroncode----src@main`
- target: `MarkMa50/Astroncode@windows`

Shared files can be aligned with:

```powershell
npm run sync:align:dry-run
npm run sync:align
```

The sync rules intentionally protect Windows-only surfaces such as launchers, GUI files, and Windows runtime wrappers. Managed files such as `package.json` and `scripts/astron-meta.mjs` are merged with Windows-specific overrides instead of being blindly overwritten.

An automatic local task also runs every day at midnight and follows the same rules:

- safe shared updates may be committed automatically
- Windows-only files are preserved
- protected conflicts stop the run instead of forcing an overwrite

## Tests

Run the full local verification suite with:

```powershell
npm test
```

Useful focused checks:

```powershell
npm run test:astron
npm run test:runtime
npm run test:sync
npm run test:version-sync
```
