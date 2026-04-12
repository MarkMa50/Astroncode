# Astroncode GUI V1 Design

**Goal:** Add a local GUI workbench for Astroncode that runs on the user's machine, mirrors the information layout of a modern coding assistant console, and keeps the existing CLI/runtime as the execution core.

## Scope

This design covers the first GUI slice only:

- a local browser-based workbench
- a local Node bridge server
- a prompt submission flow backed by the existing `astroncode -p` runtime
- a session-like workbench layout with sidebar, main transcript, and context panel
- a local launch command that opens the GUI in the browser

This design does not include:

- Electron packaging
- multi-tab persistence
- streaming token-by-token output
- file editing from the GUI
- remote collaboration

## Product Direction

The GUI should feel like a coding workbench, not a marketing page. It can borrow the structural familiarity of Claude Code style panels, but it should keep Astroncode branding and a local-first desktop feel.

Visual direction:

- dark workspace base
- blue-purple accent system
- thin dividers and dense but readable layout
- restrained glow, not flashy gradients
- panels that feel like a real developer tool

## Architecture

### 1. Existing core stays intact

Astroncode CLI remains the source of truth for model execution. The GUI should not bypass the current branding/runtime/env path.

### 2. New local bridge layer

A lightweight local HTTP server will:

- serve the GUI files
- expose local status endpoints
- accept prompt requests
- run `astroncode -p ... --output-format text`
- return normalized response payloads to the browser

This keeps the GUI isolated from internal CLI implementation details.

### 3. Static frontend shell

The frontend should be a self-contained static app under a dedicated `gui/` directory so V1 can ship without adding a full frontend toolchain.

### 4. Local command integration

The CLI local command override layer will own a new `gui` command, so users can launch the workbench with:

- `astroncode gui`
- `astroncode ui`

## File Layout

### New files

- `gui/index.html`
- `gui/styles.css`
- `gui/app.js`
- `scripts/gui-server.mjs`
- `tests/gui-server.test.mjs`
- `docs/superpowers/plans/2026-04-11-astroncode-gui-v1.md`

### Modified files

- `scripts/local-command-overrides.mjs`
- `package.json`
- `README.md`

## Responsibilities

### `scripts/gui-server.mjs`

Owns:

- local HTTP server bootstrap
- static file serving
- `/api/status`
- `/api/projects/current`
- `/api/chat`
- browser auto-open helper
- response normalization

### `gui/index.html`

Owns:

- workbench layout
- semantic panel structure
- template anchors for runtime rendering

### `gui/styles.css`

Owns:

- Astroncode GUI visual system
- responsive panel layout
- transcript, composer, sidebar, and context styles

### `gui/app.js`

Owns:

- initial data fetch
- prompt form handling
- transcript rendering
- status chips and panel updates

### `scripts/local-command-overrides.mjs`

Owns:

- `gui` / `ui` command handling
- local help text
- launching the GUI bridge server

## UX Layout

### Left rail

- Astroncode badge
- current workspace
- recent actions
- model and connection chips

### Main panel

- transcript stream
- system status row
- prompt composer
- quick actions

### Right panel

- local environment summary
- current model
- config source
- workbench notes and limits

## Request Flow

1. User runs `astroncode gui`
2. Local override starts the GUI server
3. Browser opens the local workbench URL
4. Browser fetches `/api/status`
5. User submits a prompt
6. Bridge server runs Astroncode print mode through the local runtime chain
7. Browser receives the response and appends it to transcript

## Error Handling

The bridge must handle:

- missing provider config
- child process failure
- port collisions
- malformed JSON requests

User-facing behavior:

- show a readable error card in the transcript
- keep the page interactive
- include actionable next-step text when configuration is missing

## Testing Approach

V1 should include:

- command routing tests for `gui` and `ui`
- server endpoint tests for status and static file serving
- request validation tests for `/api/chat`

## Assumptions

- local browser launch on Windows is acceptable for V1
- single-user local runtime only
- plain text model responses are sufficient for the first GUI slice
- existing Astroncode print mode is stable enough to power the first bridge

## Success Criteria

V1 is successful when:

- `astroncode gui` launches a local browser workbench
- the workbench shows local config/model/project state
- a user can send a prompt and receive a response in the main transcript
- the experience feels like a real local coding console, not a placeholder demo
