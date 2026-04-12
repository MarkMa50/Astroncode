# Astroncode Startup Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Ship a visibly improved Astroncode startup screen with a large sci-fi wordmark and blue-purple brand colors.

**Architecture:** The active startup UI is delivered through the branded runtime bundle, so runtime patch rules must be the source of truth for immediate user-facing results. Source components and theme tokens are updated in parallel to keep future builds aligned with the live runtime behavior.

**Tech Stack:** Node.js, Ink/React source components, runtime string-patching in `scripts/runtime-branding.mjs`, Node test runner.

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Lock the New Startup Appearance with Tests

**Outcome:** The new wordmark and blue-purple palette are defined as executable expectations before runtime behavior changes.

**Files:**
- Modify: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

**Task Context:**
- Runtime startup behavior is currently verified from `patchRuntimeBrandingText`.
- The new visual result must be validated from branded runtime output, not only from source components.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`

Confirm:
- the current tests cover startup welcome patching and visible installer nags

- [ ] **Step 2: Write the failing test**

Add assertions for:
- the new `ASTRONCODE` banner copy
- the new sci-fi tagline
- the blue primary token replacement
- the violet secondary token replacement

- [ ] **Step 3: Run the test and confirm it fails**

Run: `npm test -- --test-name-pattern="patchRuntimeBrandingText"`

Expected: FAIL because the old welcome art and orange theme replacements are still active.

### Task 2: Implement the Runtime Startup Refresh

**Outcome:** The real launch path renders the new welcome banner and blue-purple theme.

**Files:**
- Modify: `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`

**Task Context:**
- `scripts/start.mjs` launches a branded runtime bundle produced by `ensureRuntimeBrandingBundle`.
- Runtime replacements must cover both welcome art and theme token rewrites.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- `C:\Users\markw\astroncode\cli.js`

Confirm:
- the welcome art function replacement target still matches
- theme tokens appear in the runtime bundle as direct object literals

- [ ] **Step 2: Implement the minimal runtime patch**

Change:
- the welcome art replacement
- the startup tagline
- the runtime `claude`/`clawd_body`/`briefLabelClaude` theme values

- [ ] **Step 3: Run task verification**

Run:
- `npm test -- --test-name-pattern="patchRuntimeBrandingText"`

Expected:
- runtime-branding tests pass

### Task 3: Align Source Components with the Runtime Result

**Outcome:** Source files match the live runtime branding so future rebuilds stay consistent.

**Files:**
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- Modify: `C:\Users\markw\astroncode\src\utils\theme.ts`

**Task Context:**
- Source edits do not immediately change the live runtime, but they prevent drift.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- `C:\Users\markw\astroncode\src\utils\theme.ts`

Confirm:
- the source welcome markup matches the runtime design direction
- the source theme tokens still use the old orange palette

- [ ] **Step 2: Implement the minimal source alignment**

Change:
- the wordmark arrays
- the tagline
- the `claude`, `clawd_body`, and `briefLabelClaude` token values across supported themes

- [ ] **Step 3: Run task verification**

Run:
- `npm test`

Expected:
- all tests pass

### Task 4: Rebuild and Review the Live Runtime Twice

**Outcome:** The refreshed startup screen is verified in the generated runtime bundle and reviewed twice for visible regressions.

**Files:**
- Modify: `C:\Users\markw\astroncode\.astroncode-runtime\...` (generated at runtime)

**Task Context:**
- The live startup screen is only proven by generating a new runtime bundle and checking the output.

- [ ] **Step 1: Fresh runtime rebuild**

Run:
- `C:\Users\markw\astroncode\astroncode.cmd -p "Reply with exactly OK." --output-format text`

Expected:
- runtime bundle is regenerated
- print mode returns `OK`

- [ ] **Step 2: Self-review pass 1**

Check:
- welcome banner strings in the generated runtime bundle
- blue/violet color values in the generated runtime bundle

- [ ] **Step 3: Self-review pass 2**

Run:
- `C:\Users\markw\astroncode\astroncode.cmd --help`

Check:
- visible startup and help text show Astroncode branding
- no new startup regressions appear

- [ ] **Step 4: Synthesize task result**

Checkpoint:
- `Task:` startup refresh
- `Result:` passed or blocked
- `Verified:` tests + live runtime rebuild
- `Next:` report final result and any residual risks
