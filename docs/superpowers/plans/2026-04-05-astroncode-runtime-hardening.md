# AstronCode Runtime Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Make the AstronCode launch path self-healing, reduce misleading upstream-only commands, and verify the local build can still run end-to-end.

**Architecture:** The local AstronCode entrypoint should own three responsibilities before `cli.js` starts: environment mapping, runtime branding synchronization, and unsupported-feature guards. Pure helper modules should hold the logic so tests can prove behavior without launching the full CLI.

**Tech Stack:** Node.js ESM, PowerShell launchers, bundled `cli.js`, `node:test`

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Extract and test runtime-branding synchronization

**Outcome:** Runtime branding becomes a reusable module that can be called automatically on every launch and validated by unit tests.

**Files:**
- Create: `scripts/runtime-branding.mjs`
- Modify: `scripts/patch-runtime-branding.mjs`
- Test: `tests/runtime-branding.test.mjs`

**Task Context:**
- `scripts/patch-runtime-branding.mjs` currently owns all replacement rules inline.
- `scripts/start.mjs` launches `cli.js` directly and does not enforce branding sync first.

- [ ] **Step 1: Discover the local context**

Read:
- `scripts/patch-runtime-branding.mjs`
- `scripts/start.mjs`
- `tests/astron-env.test.mjs`

Confirm:
- how runtime replacements are currently defined
- how tests are structured in this repo

- [ ] **Step 2: Write the failing test**

```js
test('patchRuntimeBrandingText rewrites user-facing AstronCode strings', () => {
  const input = 'Usage: claude\nEnable Claude in Chrome integration'
  const output = patchRuntimeBrandingText(input)
  assert.match(output, /Usage: astroncode/)
  assert.match(output, /AstronCode in Chrome integration/)
})

test('ensureRuntimeBrandingFile patches a runtime bundle on disk when needed', async () => {
  // write a temp cli.js stub containing Claude strings
  // run ensureRuntimeBrandingFile
  // assert file contents changed and changed count > 0
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\runtime-branding.test.mjs`
Expected: FAIL because `scripts/runtime-branding.mjs` does not exist yet

- [ ] **Step 4: Implement the minimal change**

```js
// scripts/runtime-branding.mjs
export const brandingReplacements = [...]
export function patchRuntimeBrandingText(source) { ... }
export function ensureRuntimeBrandingFile(runtimeFile) { ... }
```

```js
// scripts/patch-runtime-branding.mjs
import { ensureRuntimeBrandingFile } from './runtime-branding.mjs'
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\runtime-branding.test.mjs`

Expected:
- the new branding tests pass

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` runtime-branding synchronization
- `Result:` passed
- `Verified:` branding tests
- `Next:` wire synchronization into startup

### Task 2: Add launch-time guards for unsupported upstream-only flows

**Outcome:** The AstronCode launcher blocks known Claude-specific commands before they can reach broken upstream OAuth/subscription flows.

**Files:**
- Create: `scripts/runtime-guards.mjs`
- Modify: `scripts/start.mjs`
- Test: `tests/runtime-guards.test.mjs`

**Task Context:**
- Commands like `auth login`, `upgrade`, `--chrome`, and remote-control paths still point at Claude/claude.ai services in `src/`.
- The fastest safe fix is to stop unsupported flows in the local launcher with clear AstronCode messaging.

- [ ] **Step 1: Discover the local context**

Read:
- `scripts/start.mjs`
- `src/bridge/bridgeEnabled.ts`
- `src/commands/chrome/chrome.tsx`
- `src/commands/upgrade/upgrade.tsx`

Confirm:
- which flows are still upstream-only
- which CLI arguments can be detected before spawning `cli.js`

- [ ] **Step 2: Write the failing test**

```js
test('detectUnsupportedAstronInvocation blocks auth login', () => {
  const result = detectUnsupportedAstronInvocation(['auth', 'login'])
  assert.match(result.message, /disabled in this local AstronCode build/)
})

test('detectUnsupportedAstronInvocation allows print prompts', () => {
  const result = detectUnsupportedAstronInvocation(['-p', 'Reply with exactly OK.'])
  assert.equal(result, null)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\runtime-guards.test.mjs`
Expected: FAIL because `scripts/runtime-guards.mjs` does not exist yet

- [ ] **Step 4: Implement the minimal change**

```js
// scripts/runtime-guards.mjs
export function detectUnsupportedAstronInvocation(argv) { ... }
```

```js
// scripts/start.mjs
const unsupported = detectUnsupportedAstronInvocation(process.argv.slice(2))
if (unsupported) {
  console.error(unsupported.message)
  process.exit(unsupported.exitCode)
}
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\runtime-guards.test.mjs`

Expected:
- guard tests pass

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` unsupported command guards
- `Result:` passed
- `Verified:` guard tests
- `Next:` update docs and run live CLI checks

### Task 3: Update operator docs and prove the local build runs

**Outcome:** The repo documents the supported AstronCode workflow and fresh commands prove the launcher, guards, and live provider call all work.

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `scripts/start.mjs`
- Test: `tests/astron-env.test.mjs`

**Task Context:**
- The README still mixes AstronCode messaging with Claude bug-reporting/community links.
- We need fresh evidence for supported launch paths after the new startup changes.

- [ ] **Step 1: Discover the local context**

Read:
- `README.md`
- `package.json`
- `astroncode.ps1`

Confirm:
- which commands and docs users actually see first

- [ ] **Step 2: Write the failing test**

```js
test('supported startup flow still allows print-mode invocation', async () => {
  // use live command verification instead of a unit test for this task
  // documented here so execution proves the launcher still works
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File .\astroncode.ps1 auth login`
Expected: FAIL with current upstream Claude-specific behavior or misleading path

- [ ] **Step 4: Implement the minimal change**

```md
<!-- README -->
Document supported AstronCode entrypoints and explicitly mark disabled upstream-only features.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\astron-env.test.mjs`
- `node --test .\tests\runtime-branding.test.mjs .\tests\runtime-guards.test.mjs`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\astroncode.ps1 --help`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\astroncode.ps1 -p "Reply with exactly OK." --output-format text`
- `powershell -NoProfile -ExecutionPolicy Bypass -File .\astroncode.ps1 auth login`

Expected:
- tests pass
- help still works
- print mode returns `OK`
- `auth login` exits early with an AstronCode-specific unsupported-feature message

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` runtime hardening verification
- `Result:` passed
- `Verified:` test suite and live CLI commands
- `Next:` summarize supported vs disabled features for the user
