# Astroncode Startup Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Replace the current startup banner with a cleaner terminal-safe `ASTRONCODE` wordmark and keep runtime branding aligned with the source component.

**Architecture:** The source startup component defines the visible banner, while the runtime branding script rewrites the packaged bundle to match it. Layout helpers cap the left panel width, so the wordmark and metadata spacing must be updated together.

**Tech Stack:** React Ink, Node.js runtime patching, Node test runner

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Redesign The Source Wordmark

**Outcome:** The source startup component renders a compact, aligned wordmark that fits the left panel without clipping.

**Files:**
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\LogoV2.tsx`
- Modify: `C:\Users\markw\astroncode\src\utils\logoV2Utils.ts`
- Test: `C:\Users\markw\astroncode\tests\source-branding.test.mjs`

**Task Context:**
- `WelcomeV2.tsx` holds the visible wordmark.
- `LogoV2.tsx` and `logoV2Utils.ts` decide how much width the left panel gets.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- `C:\Users\markw\astroncode\src\components\LogoV2\LogoV2.tsx`
- `C:\Users\markw\astroncode\src\utils\logoV2Utils.ts`

Confirm:
- The current wordmark width and panel width limits
- The metadata block position under the logo

- [ ] **Step 2: Write the failing test**

Use `tests/source-branding.test.mjs` to assert the new wordmark lines and the updated width cap.

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test ./tests/source-branding.test.mjs`
Expected: FAIL because the old wordmark shape is still present

- [ ] **Step 4: Implement the minimal change**

Replace the current wordmark with the approved single-block design and update width constraints.

- [ ] **Step 5: Run task verification**

Run:
- `node --test ./tests/source-branding.test.mjs`

Expected:
- test passes

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Redesign The Source Wordmark
- `Result:` passed
- `Verified:` `node --test ./tests/source-branding.test.mjs`
- `Next:` Update runtime branding to emit the same logo

### Task 2: Align Runtime Branding With The New Logo

**Outcome:** The packaged runtime emits the same startup wordmark and supporting copy as the source component.

**Files:**
- Modify: `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- Test: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

**Task Context:**
- The runtime patch script rewrites startup text in the bundled CLI.
- Startup art tests already cover both help copy and welcome art replacements.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

Confirm:
- Which art lines the runtime currently injects
- Which assertions lock the visible welcome art shape

- [ ] **Step 2: Write the failing test**

Update `tests/runtime-branding.test.mjs` so the startup-art assertions expect the new single-block wordmark.

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test ./tests/runtime-branding.test.mjs`
Expected: FAIL because the runtime script still emits the old banner

- [ ] **Step 4: Implement the minimal change**

Swap the runtime wordmark lines to match the source component and keep the existing copy rewrites intact.

- [ ] **Step 5: Run task verification**

Run:
- `node --test ./tests/runtime-branding.test.mjs`

Expected:
- test passes

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Align Runtime Branding With The New Logo
- `Result:` passed
- `Verified:` `node --test ./tests/runtime-branding.test.mjs`
- `Next:` Run the full suite and verify the startup launcher version path still works

### Task 3: Full Verification

**Outcome:** The redesign is covered by tests and the launcher still boots the branded CLI.

**Files:**
- Modify: none
- Test: `C:\Users\markw\astroncode\tests\source-branding.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

**Task Context:**
- The previous iterations regressed because source and runtime branding diverged.

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\package.json`

Confirm:
- The full test command to run

- [ ] **Step 2: Run task verification**

Run:
- `npm test`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 -v`

Expected:
- all tests pass
- version prints `1.0.10 (Astroncode)`

- [ ] **Step 3: Synthesize task result**

Checkpoint:
- `Task:` Full Verification
- `Result:` passed
- `Verified:` `npm test`, launcher version check
- `Next:` Ask the user to fully restart Astroncode and visually confirm the new startup logo
