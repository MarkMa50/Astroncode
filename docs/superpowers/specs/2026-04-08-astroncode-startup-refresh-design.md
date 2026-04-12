# Astroncode Startup Refresh Design

**Goal:** Replace the current startup mascot-like welcome block with a cleaner sci-fi welcome treatment centered on a large pixel-style `ASTRONCODE` wordmark, and shift the visible theme from orange to a blue-purple neon palette.

**Scope:**
- Update the visible startup branding that users see immediately after launch.
- Keep the internal compatibility layer and provider wiring unchanged.
- Remove visible legacy orange branding from the startup experience.

**Approved Direction:**
- Use a large wordmark-first welcome panel.
- Make the primary palette neon blue + violet.
- Keep the right-side panel structure, but retint it through the shared brand token.
- Remove the duplicate mini-logo or mascot feeling from the left panel.

**Visible Outcomes:**
- The left panel shows a large `ASTRONCODE` pixel-style banner.
- The banner uses a blue-primary and violet-secondary color pairing.
- The title border and startup highlights no longer render in the old orange hue.
- The installer warning and legacy visible `claude` startup strings remain suppressed.

**Implementation Notes:**
- Runtime patching is the primary delivery path because startup execution flows through `scripts/start.mjs -> cli.js -> runtime-branding.mjs`.
- Source files should still be updated for future consistency.
- Tests must cover both the runtime patch output and the theme token rewrites.
