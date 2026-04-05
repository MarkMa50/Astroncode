# AstronCode Local Command Overrides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Replace the remaining high-value Claude-only command stubs with local AstronCode behavior and standardize the shipped version as `1.0.10`.

**Architecture:** The launcher remains the authoritative control point. `scripts/start.mjs` will intercept selected commands before the upstream bundle runs, while `scripts/runtime-branding.mjs` will continue to produce a branded runtime copy for the bundled CLI. `.env.astroncode` stays the single local source of provider credentials.

**Tech Stack:** Node.js ESM, PowerShell launchers, Node test runner

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Add tests for local command behavior

**Outcome:** We have failing tests that define the expected local behavior for version branding and command overrides.

**Files:**
- Create: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`
- Modify: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`

**Task Context:**
- The current launcher blocks `auth login`, `setup-token`, `doctor`, `install`, `update`, and `upgrade`, but the local build should own those flows.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\start.mjs`
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

Confirm:
- current version strings still expose `2.1.88`
- command interception only supports blocklists today

- [ ] **Step 2: Write the failing test**

```js
test('runLocalAstronCommand reports local auth status and masks the secret', async () => {
  assert.equal(result.handled, true)
  assert.match(output, /Auth status: configured/)
  assert.doesNotMatch(output, /real-secret-token/)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\local-command-overrides.test.mjs .\tests\runtime-branding.test.mjs`
Expected: FAIL because the override module and version replacement do not exist yet

- [ ] **Step 4: Implement the minimal change**

```js
// Add a dedicated local command override module and version replacement rules.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\local-command-overrides.test.mjs .\tests\runtime-branding.test.mjs`

Expected:
- new override tests pass
- version branding tests pass with `1.0.10`

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Add tests for local command behavior
- `Result:` passed
- `Verified:` local override and branding test files
- `Next:` wire launcher interception to the new module

- [ ] **Step 7: Commit**

```bash
git add tests/local-command-overrides.test.mjs tests/runtime-branding.test.mjs
git commit -m "test: define local astroncode command behavior"
```

### Task 2: Implement local command overrides and env updates

**Outcome:** The launcher provides local AstronCode-native behavior for auth, token setup, diagnostics, and install/update guidance.

**Files:**
- Create: `C:\Users\markw\astroncode\scripts\local-command-overrides.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\astron-env.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\start.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\runtime-guards.mjs`
- Test: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\astron-env.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\runtime-guards.test.mjs`

**Task Context:**
- Keep `remote-control`, `assistant`, and Chrome-related flags blocked.
- Move local-safe commands into the launcher before the upstream bundle executes.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\astron-env.mjs`
- `C:\Users\markw\astroncode\scripts\runtime-guards.mjs`
- `C:\Users\markw\astroncode\tests\astron-env.test.mjs`

Confirm:
- `.env.astroncode` parsing already exists
- there is no helper for updating `.env.astroncode`

- [ ] **Step 2: Write the failing test**

```js
test('auth logout removes local credentials without deleting model settings', async () => {
  assert.doesNotMatch(updatedFile, /ASTRONCODE_AUTH_TOKEN=/)
  assert.match(updatedFile, /ASTRONCODE_MODEL=astron-code-latest/)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\local-command-overrides.test.mjs .\tests\astron-env.test.mjs .\tests\runtime-guards.test.mjs`
Expected: FAIL because env mutation and launcher overrides are missing

- [ ] **Step 4: Implement the minimal change**

```js
// Add env update helpers, local override dispatch, and leave only truly unsupported commands in the guard layer.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\astron-env.test.mjs .\tests\local-command-overrides.test.mjs .\tests\runtime-guards.test.mjs`

Expected:
- env tests pass
- override tests pass
- guards only block upstream-dependent flows

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Implement local command overrides and env updates
- `Result:` passed
- `Verified:` env tests, local command tests, guard tests
- `Next:` align runtime help/version text and README

- [ ] **Step 7: Commit**

```bash
git add scripts/astron-env.mjs scripts/local-command-overrides.mjs scripts/start.mjs scripts/runtime-guards.mjs tests/astron-env.test.mjs tests/local-command-overrides.test.mjs tests/runtime-guards.test.mjs
git commit -m "feat: add local astroncode command overrides"
```

### Task 3: Align runtime branding, help text, docs, and version

**Outcome:** The branded runtime reports `1.0.10`, help text matches local AstronCode behavior, and README documents the supported commands accurately.

**Files:**
- Modify: `C:\Users\markw\astroncode\package.json`
- Modify: `C:\Users\markw\astroncode\README.md`
- Modify: `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- Modify: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

**Task Context:**
- `package.json` still shows `2.1.88`
- the runtime bundle still contains embedded `2.1.88` constants and outdated help descriptions

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\package.json`
- `C:\Users\markw\astroncode\README.md`
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`

Confirm:
- help text still says several commands are disabled when they are about to be locally supported
- runtime branding is the right place to normalize the reported version string

- [ ] **Step 2: Write the failing test**

```js
test('patchRuntimeBrandingText rewrites embedded runtime version strings', () => {
  assert.match(output, /1\\.0\\.10/)
  assert.doesNotMatch(output, /2\\.1\\.88/)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\runtime-branding.test.mjs`
Expected: FAIL because the version replacement has not been implemented yet

- [ ] **Step 4: Implement the minimal change**

```js
// Replace embedded runtime version text and align help descriptions with local command overrides.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\runtime-branding.test.mjs`
- `npm test`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 -v`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 auth status`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 doctor`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 -p "Reply with exactly OK." --output-format text`

Expected:
- tests pass
- CLI reports `1.0.10`
- local auth/doctor commands work
- print-mode provider call still returns `OK`

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Align runtime branding, help text, docs, and version
- `Result:` passed
- `Verified:` tests, version output, auth status, doctor, and provider print mode
- `Next:` summarize residual upstream-only features that remain blocked

- [ ] **Step 7: Commit**

```bash
git add package.json README.md scripts/runtime-branding.mjs tests/runtime-branding.test.mjs
git commit -m "chore: brand astroncode runtime as 1.0.10"
```
