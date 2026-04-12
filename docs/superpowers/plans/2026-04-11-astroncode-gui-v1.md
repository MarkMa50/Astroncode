# Astroncode GUI V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Ship a local browser-based GUI workbench for Astroncode that launches from a new CLI command and executes prompts through the existing CLI runtime.

**Architecture:** The current Astroncode CLI stays as the execution core. A new local Node bridge server serves a static GUI and proxies prompt requests to local print-mode execution. Local command overrides own the `gui` and `ui` launch flow.

**Tech Stack:** Node.js built-ins, static HTML/CSS/JS, existing Astroncode scripts/tests

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Add the GUI bridge server

**Outcome:** A local Node server can serve static GUI files and expose status and chat endpoints.

**Files:**
- Create: `scripts/gui-server.mjs`
- Test: `tests/gui-server.test.mjs`

**Task Context:**
- The bridge must not bypass `scripts/start.mjs` runtime rules
- The bridge should call the local command entry via `process.execPath`

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\start.mjs`
- `C:\Users\markw\astroncode\scripts\astron-env.mjs`

Confirm:
- how environment values are applied
- where the project root is resolved from

- [ ] **Step 2: Write the failing test**

Add tests that assert:
- `/api/status` returns JSON with product and model info
- `/api/chat` rejects an empty prompt
- `/` serves the GUI HTML

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test ./tests/gui-server.test.mjs`
Expected: FAIL because `scripts/gui-server.mjs` does not exist yet

- [ ] **Step 4: Implement the minimal change**

Build a server module that:
- exports a `createAstronGuiServer` factory
- serves files from `gui/`
- implements `/api/status`
- implements `/api/chat`
- normalizes child process output

- [ ] **Step 5: Run task verification**

Run:
- `node --test ./tests/gui-server.test.mjs`

Expected:
- test passes

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` GUI bridge server
- `Result:` passed
- `Verified:` `node --test ./tests/gui-server.test.mjs`
- `Next:` build the static workbench

### Task 2: Build the GUI workbench

**Outcome:** The local GUI renders a usable coding workbench with a transcript, composer, left rail, and right context panel.

**Files:**
- Create: `gui/index.html`
- Create: `gui/styles.css`
- Create: `gui/app.js`

**Task Context:**
- V1 should feel polished without adding a frontend build step
- The layout should resemble a coding assistant workspace, not a landing page

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\README.md`
- `C:\Users\markw\astroncode\docs\superpowers\specs\2026-04-11-astroncode-gui-v1-design.md`

Confirm:
- product naming
- current model terminology

- [ ] **Step 2: Write the failing test**

Use Task 1 endpoint tests to expect the HTML shell to contain:
- `Astroncode Workbench`
- a prompt form
- a transcript region

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test ./tests/gui-server.test.mjs`
Expected: FAIL because the HTML shell is missing

- [ ] **Step 4: Implement the minimal change**

Create:
- an HTML shell with three-pane layout
- CSS for the workbench styling
- browser logic for loading status and posting prompts

- [ ] **Step 5: Run task verification**

Run:
- `node --test ./tests/gui-server.test.mjs`

Expected:
- static shell tests pass
- status fetch and transcript wiring remain intact

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` GUI workbench
- `Result:` passed
- `Verified:` `node --test ./tests/gui-server.test.mjs`
- `Next:` wire launch commands

### Task 3: Add CLI launch integration

**Outcome:** Users can start the GUI with `astroncode gui` or `astroncode ui`.

**Files:**
- Modify: `scripts/local-command-overrides.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Test: `tests/local-command-overrides.test.mjs`

**Task Context:**
- local command routing already exists for install/auth/doctor flows
- GUI launch should stay in the local override layer

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\local-command-overrides.mjs`
- `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`

Confirm:
- how handled commands return status
- how help output is tested

- [ ] **Step 2: Write the failing test**

Add tests that assert:
- `gui --help` returns local help text
- `ui --help` returns local help text

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test ./tests/local-command-overrides.test.mjs`
Expected: FAIL because GUI help is not routed yet

- [ ] **Step 4: Implement the minimal change**

Add:
- local help output for `gui`
- command handling for `gui` and `ui`
- package script and README notes for GUI launch

- [ ] **Step 5: Run task verification**

Run:
- `node --test ./tests/local-command-overrides.test.mjs`
- `node --test ./tests/gui-server.test.mjs`

Expected:
- both pass

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` CLI GUI integration
- `Result:` passed
- `Verified:` local command tests and GUI server tests
- `Next:` full repo verification

### Task 4: Verify the full slice

**Outcome:** The GUI launches locally and the new workbench path is documented and verified.

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Task Context:**
- V1 proof must include both tests and a real local launch

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\package.json`
- `C:\Users\markw\astroncode\README.md`

Confirm:
- where tests are registered
- where launch documentation should live

- [ ] **Step 2: Run final verification**

Run:
- `npm test`
- `node scripts/start.mjs gui --help`

Expected:
- all tests pass
- GUI help prints correctly

- [ ] **Step 3: Synthesize task result**

Checkpoint:
- `Task:` Full GUI V1 verification
- `Result:` passed
- `Verified:` `npm test`, `node scripts/start.mjs gui --help`
- `Next:` optional desktop shell packaging
