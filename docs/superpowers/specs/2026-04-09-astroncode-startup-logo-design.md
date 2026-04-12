# Astroncode Startup Logo Design

**Scope**

- Rebuild the startup logo as a single, aligned `ASTRONCODE` wordmark for terminal display.
- Keep the blue and purple palette, but stop splitting individual glyphs into noisy fragments.
- Re-balance the startup panel so the wordmark reads clearly and the metadata sits below it without crowding.

**Constraints**

- The logo must render cleanly in PowerShell and Windows Terminal using monospace glyphs only.
- The design must stay within the current left startup panel and not clip when the feed column is visible.
- The runtime branding layer must output the same wordmark as the source component.

**Approved Direction**

- Use one compact 5-line wordmark.
- Use stable block geometry with consistent left and right edges.
- Apply one primary blue tone to the upper rows and one secondary purple tone to the lower rows.
- Keep supporting lines limited to model, billing, org, and cwd metadata.

**Success Criteria**

- The startup logo no longer appears jagged, fragmented, or misaligned.
- Source and runtime branding tests assert the new wordmark shape.
- Existing startup branding tests still pass after the redesign.
