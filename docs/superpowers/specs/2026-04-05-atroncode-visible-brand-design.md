# Atroncode Visible Brand Design

**Date:** 2026-04-05

**Goal:** Keep the internal compatibility layer and provider configuration stable while changing all user-visible branding from the current AstronCode mix to `Atroncode`, including the startup logo and terminal mascot.

## Scope

Visible layer changes in this design:

- startup welcome message
- startup logo text art
- condensed and full terminal logo headers
- desktop launcher title and ASCII art
- user-facing command/help/output strings managed by the local launcher
- runtime branding patch output for the bundled CLI

Out of scope for this pass:

- internal env var prefixes such as `ASTRONCODE_*`
- provider mapping names such as `ANTHROPIC_*`
- repo-internal implementation identifiers that are not user-visible
- upstream bridge/browser systems that remain intentionally disabled

## Brand Direction

### Display Name

- Visible product name: `Atroncode`
- Visible command name in help text: `atroncode`
- Version string format: `1.0.10 (Atroncode)`

### Startup Identity

The startup should feel more like a distinct local hacker tool than a Claude fork.

- Logo style: pixel-terminal, wide, blocky, compact enough for terminal widths already supported by the current layout
- Mascot style: a tiny terminal creature with ears/claws, still readable in monochrome terminals
- Tone: playful but sharp, “builder workstation” rather than “friendly SaaS”

### Tagline

Use a short technical line under or beside the logo:

- `terminal forge`

## Implementation Strategy

### 1. Runtime-first branding

The bundled runtime still drives the real CLI, so the runtime branding patch must be the source of truth for visible replacements.

- Update string replacements so all visible `AstronCode` / `astroncode` branding becomes `Atroncode` / `atroncode`
- Replace the current welcome text art with the new pixel logo lines
- Replace visible mascot glyph strings used in the logo components where possible through runtime patching

### 2. Source-of-record alignment

Update the source component files to match the runtime patch so future rebuilds preserve the same design:

- `WelcomeV2.tsx`
- `LogoV2.tsx`
- `CondensedLogo.tsx`
- `Clawd.tsx`
- `AnimatedClawd.tsx`

Internal component names may remain unchanged if they are not shown to users.

### 3. Launcher alignment

Update the desktop launcher so the desktop-visible entry point matches the terminal brand:

- window title should show `Atroncode Launcher`
- launcher ASCII art should match the new pixel logo language

## Success Criteria

This design is complete when:

- the startup screen shows `Atroncode` instead of AstronCode/Claude
- the terminal mascot is visibly different from the current Clawd silhouette
- help/version output uses `Atroncode` / `atroncode`
- desktop launcher art and title match the new visible brand
- existing `.env.astroncode` configuration and local provider execution still work unchanged
