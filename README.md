# Atroncode

Atroncode is a locally deployed coding-agent runtime that keeps the Claude Code-style terminal workflow, but launches against your own provider configuration instead of Anthropic-managed auth.

This deployment lives at `C:\Users\markw\astroncode`.

## Start

Recommended entrypoints:

```powershell
.\atroncode.ps1 --help
.\atroncode.ps1 -p "Reply with exactly OK." --output-format text
```

Or:

```powershell
node .\scripts\start.mjs --help
```

Desktop launcher:

```text
C:\Users\markw\Desktop\Atroncode Launcher.cmd
```

## Provider configuration

Atroncode reads `.env.astroncode` and maps those values into the upstream runtime:

- `ASTRONCODE_AUTH_TOKEN -> ANTHROPIC_AUTH_TOKEN`
- `ASTRONCODE_BASE_URL -> ANTHROPIC_BASE_URL`
- `ASTRONCODE_MODEL -> ANTHROPIC_MODEL`

Defaults applied by the launcher:

- `ANTHROPIC_SMALL_FAST_MODEL = ASTRONCODE_MODEL`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC = 1`

For iFlytek Astron Coding Plan, the launcher automatically normalizes the official OpenAI-style `/v2` endpoint to the Anthropic-compatible `/anthropic` endpoint before startup.

```powershell
ASTRONCODE_AUTH_TOKEN=...
ASTRONCODE_BASE_URL=...
ASTRONCODE_MODEL=...
```

## Runtime hardening

The local launch path now does three things before `cli.js` starts:

1. Loads and applies `.env.astroncode`
2. Generates a branded runtime copy in `.astroncode-runtime` so the original `cli.js` is never rewritten during normal startup
3. Handles local Atroncode-safe commands in the launcher and blocks only the remaining upstream-only flows

## Supported local workflow

Supported and verified:

- normal interactive launch
- `--help`
- `-v`
- `-p/--print`
- `auth status`
- `auth login`
- `auth logout`
- `setup-token`
- `doctor`
- `install`
- `update` / `upgrade`
- local provider-token execution through `.env.astroncode`

Currently blocked on purpose in this local build:

- `remote-control`
- `assistant`
- `--chrome` / `--no-chrome`

Those remaining paths still depend on upstream Claude browser-extension or hosted session infrastructure, so Atroncode exits early with a clear local-build message instead of sending you into a broken flow.

## Tests

Run all local verification tests:

```powershell
npm test
```
