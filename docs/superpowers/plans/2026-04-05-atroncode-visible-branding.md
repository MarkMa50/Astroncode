# Atroncode Visible Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Replace the visible AstronCode/Claude presentation layer with the approved `Atroncode` terminal identity while leaving the internal compatibility layer unchanged.

**Architecture:** The real CLI still launches from the bundled `cli.js`, so `scripts/runtime-branding.mjs` remains the runtime authority for visible replacements. Source component files are updated in parallel so future rebuilds preserve the same logo, mascot, and help text.

**Tech Stack:** Node.js ESM, Ink/React terminal UI, PowerShell/CMD launcher wrappers, Node test runner

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Define the new visible brand in tests

**Outcome:** Tests describe the required `Atroncode` visible branding and fail before implementation.

**Files:**
- Modify: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`
- Modify: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`

**Task Context:**
- Visible name should become `Atroncode`
- Visible command name should become `atroncode`
- Welcome art and launcher copy should stop using the current AstronCode strings

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- `C:\Users\markw\astroncode\scripts\local-command-overrides.mjs`
- `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`

Confirm:
- current tests still assert `AstronCode` / `astroncode`
- welcome-art text replacements are already covered by runtime-branding tests

- [ ] **Step 2: Write the failing test**

```js
test('patchRuntimeBrandingText rewrites visible branding to Atroncode', () => {
  assert.match(output, /Welcome to Atroncode/)
  assert.match(output, /Usage: atroncode/)
  assert.doesNotMatch(output, /AstronCode/)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\runtime-branding.test.mjs .\tests\local-command-overrides.test.mjs`
Expected: FAIL because visible branding still says AstronCode

- [ ] **Step 4: Implement the minimal change**

```js
// Update display-name replacements and help text expectations to Atroncode.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\runtime-branding.test.mjs .\tests\local-command-overrides.test.mjs`

Expected:
- visible-brand tests pass
- no AstronCode branding remains in tested launcher/help output

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Define the new visible brand in tests
- `Result:` passed
- `Verified:` runtime-branding and local-command tests
- `Next:` implement logo and mascot replacements

- [ ] **Step 7: Commit**

```bash
git add tests/runtime-branding.test.mjs tests/local-command-overrides.test.mjs
git commit -m "test: define atroncode visible branding"
```

### Task 2: Replace runtime-visible branding, welcome art, and launcher branding

**Outcome:** The bundled runtime and launcher present `Atroncode` with the new pixel logo and mascot.

**Files:**
- Modify: `C:\Users\markw\astroncode\scripts\astron-meta.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\local-command-overrides.mjs`
- Modify: `C:\Users\markw\Desktop\AstronCode Launcher.cmd`
- Test: `C:\Users\markw\astroncode\tests\runtime-branding.test.mjs`
- Test: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`

**Task Context:**
- runtime patching is what the real CLI actually executes today
- the launcher title and ASCII art are part of the visible brand

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\scripts\astron-meta.mjs`
- `C:\Users\markw\astroncode\scripts\runtime-branding.mjs`
- `C:\Users\markw\Desktop\AstronCode Launcher.cmd`

Confirm:
- runtime replacements still target AstronCode
- launcher still shows AstronCode ASCII art and title

- [ ] **Step 2: Write the failing test**

```js
test('auth help uses atroncode as the visible command name', async () => {
  assert.match(stdout.toString(), /Usage: atroncode auth login/)
})
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\local-command-overrides.test.mjs .\tests\runtime-branding.test.mjs`
Expected: FAIL because visible command/help branding still says astroncode

- [ ] **Step 4: Implement the minimal change**

```js
// Update visible name constants, runtime replacements, and launcher art.
```

- [ ] **Step 5: Run task verification**

Run:
- `node --test .\tests\local-command-overrides.test.mjs .\tests\runtime-branding.test.mjs`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 --help`
- `& 'C:\Users\markw\Desktop\AstronCode Launcher.cmd' -v`

Expected:
- tests pass
- CLI help says `Usage: atroncode`
- launcher title/art show `Atroncode`

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Replace runtime-visible branding, welcome art, and launcher branding
- `Result:` passed
- `Verified:` tests, help output, launcher version run
- `Next:` align source UI components to the same mascot/logo

- [ ] **Step 7: Commit**

```bash
git add scripts/astron-meta.mjs scripts/runtime-branding.mjs scripts/local-command-overrides.mjs "C:/Users/markw/Desktop/AstronCode Launcher.cmd"
git commit -m "feat: rebrand visible cli layer to atroncode"
```

### Task 3: Align source logo and mascot components with the runtime brand

**Outcome:** Source UI components describe the same `Atroncode` logo and new terminal mascot as the runtime patch.

**Files:**
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\LogoV2.tsx`
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\CondensedLogo.tsx`
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\Clawd.tsx`
- Modify: `C:\Users\markw\astroncode\src\components\LogoV2\AnimatedClawd.tsx`

**Task Context:**
- source files are not the active runtime today, but they should match the actual branded experience
- internal component names may remain for compatibility if the visible output changes

- [ ] **Step 1: Discover the local context**

Read:
- `C:\Users\markw\astroncode\src\components\LogoV2\WelcomeV2.tsx`
- `C:\Users\markw\astroncode\src\components\LogoV2\LogoV2.tsx`
- `C:\Users\markw\astroncode\src\components\LogoV2\CondensedLogo.tsx`
- `C:\Users\markw\astroncode\src\components\LogoV2\Clawd.tsx`

Confirm:
- current source art still carries AstronCode/Claude-era strings and the older mascot silhouette

- [ ] **Step 2: Write the failing test**

```js
// Runtime-branding tests should already encode the visible output;
// this task uses those tests as the acceptance contract.
```

- [ ] **Step 3: Run the test and confirm it fails**

Run: `node --test .\tests\runtime-branding.test.mjs`
Expected: FAIL if the runtime/source art drift remains

- [ ] **Step 4: Implement the minimal change**

```js
// Rewrite source welcome/logo/mascot strings so they mirror the shipped visible design.
```

- [ ] **Step 5: Run task verification**

Run:
- `npm test`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 -v`
- `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\markw\astroncode\astroncode.ps1 --help`

Expected:
- tests pass
- visible brand is `Atroncode`
- startup/version/help still work with existing local config

- [ ] **Step 6: Synthesize task result**

Checkpoint:
- `Task:` Align source logo and mascot components with the runtime brand
- `Result:` passed
- `Verified:` full test suite plus real CLI runs
- `Next:` summarize any remaining Claude-only internals intentionally left untouched

- [ ] **Step 7: Commit**

```bash
git add src/components/LogoV2/WelcomeV2.tsx src/components/LogoV2/LogoV2.tsx src/components/LogoV2/CondensedLogo.tsx src/components/LogoV2/Clawd.tsx src/components/LogoV2/AnimatedClawd.tsx
git commit -m "chore: align atroncode logo and mascot source files"
```
