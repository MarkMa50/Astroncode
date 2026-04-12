# Astroncode Setup Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Add a real first-run setup wizard for Astroncode and make `astroncode setup` re-open that wizard any time so users can update provider settings.

**Architecture:** A new local setup wizard module will own interactive prompting, config normalization, and save confirmation. The local command override layer will route `setup`, while the main launcher will auto-trigger the wizard on the first plain interactive startup when provider config is missing.

**Tech Stack:** Node.js ESM, readline/promises, existing `.env.astroncode` config helpers, node:test

**Execution Rhythm:** `DISCOVER -> IMPLEMENT -> VERIFY -> SYNTHESIZE`

---

### Task 1: Add setup wizard tests

**Outcome:** Tests prove that `astroncode setup` exists and that first-run startup auto-detects missing provider config.

**Files:**
- Create: `C:\Users\markw\astroncode\tests\setup-wizard.test.mjs`
- Modify: `C:\Users\markw\astroncode\tests\local-command-overrides.test.mjs`

**Task Context:**
- Existing tests already cover `auth`, `doctor`, and `gui`
- Wizard logic should be tested as pure behavior where possible

### Task 2: Implement setup wizard module

**Outcome:** Astroncode can walk a user through credential mode, secret, base URL, and model, then save `.env.astroncode`.

**Files:**
- Create: `C:\Users\markw\astroncode\scripts\setup-wizard.mjs`

**Task Context:**
- Reuse `readAstronEnvConfig`, `writeAstronEnvFile`, and URL normalization
- Support both `token` and `api-key` provider styles
- Allow Enter to keep an existing value during reconfiguration

### Task 3: Wire command and first-run startup

**Outcome:** `astroncode setup` launches the wizard, and first plain startup with no ready config auto-enters setup before continuing.

**Files:**
- Modify: `C:\Users\markw\astroncode\scripts\local-command-overrides.mjs`
- Modify: `C:\Users\markw\astroncode\scripts\start.mjs`
- Modify: `C:\Users\markw\astroncode\README.md`

**Task Context:**
- Auto-setup should not hijack `--help`, `-v`, `doctor`, `auth`, or other explicit maintenance commands
- After a successful first-run setup, the normal CLI launch should continue

### Task 4: Verify full flow

**Outcome:** The setup command, first-run auto-setup detection, and local diagnostics all work together.

**Files:**
- Modify: `C:\Users\markw\astroncode\package.json` only if a new test file needs registration

**Task Context:**
- Verification must include both targeted tests and a fresh end-to-end command check
