# Validation And QA

`open-design-slim` validation is intentionally local and source-backed. It
checks portable file contracts and obvious quality signals; it does not replace
human visual review or the full Open Design runtime.

## Validation Layers

Use the layers that are available in the target workspace:

1. Contract review: read the relevant files under
   `skills/open-design-slim/contracts/`.
2. Helper validation: run `scripts/od-slim.mjs validate ...` for prototypes or
   design-system bundles.
3. Manual quality review: use `skills/open-design-slim/quality/`.
4. Optional browser or screenshot QA: follow
   `quality/visual-qa-recipe.md` when a browser is available.

## Prototype Checklist

For static HTML, React, and deck-style artifacts, confirm:

- The entry path is correct: `index.html`, `Prototype.jsx`, or a
  user-requested host path.
- The artifact declares or records the design-system source.
- The UI contains product-specific content rather than placeholder boilerplate.
- Relevant states are covered: populated, empty, loading, error, selected,
  disabled, focus, and mobile.
- Layout uses stable dimensions and responsive constraints.
- Controls have accessible names and visible focus states.
- The handoff names generated files, checks run, and visual validation gaps.
- Generated files do not call `/api/*`, `od`, daemon data roots, desktop IPC,
  plugin hosts, provider proxies, MCP, media tools, or export pipelines.

Run:

```bash
node skills/open-design-slim/scripts/od-slim.mjs validate prototype --entry <path-to-entry>
```

Use `--dir <artifact-root>` when supporting files live outside the entry file's
directory.

## Design-System Checklist

For design-system bundles, confirm:

- Required files exist: `manifest.json`, `DESIGN.md`, `USAGE.md`,
  `tokens.css`, `components.manifest.json`, and `source/provenance.json`.
- `manifest.json` uses `schemaVersion: od-design-system-project/v1`.
- `components.manifest.json` contains component names, purposes, states, and
  token dependencies.
- `source/provenance.json` records source basis, runtime boundary, and
  validation gaps.
- `DESIGN.md` explains intent, color, typography, layout, components, states,
  accessibility, and agent usage guidance.
- Tokens are semantic roles rather than raw colors only.

Run:

```bash
node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir <bundle-dir>
```

## Optional Visual QA

When a browser is available, inspect or capture these viewports from
`quality/responsive-viewports.json`:

- `390x844`
- `768x1024`
- `1280x720`
- `1440x900`

Check that no text overlaps, controls remain usable, the first viewport
identifies the product or report topic, and mobile layout is deliberately
reflowed. For decks, click previous and next controls and verify endpoint
buttons are disabled.

## Reporting Results

Use factual handoff language:

- If browser checks ran, name the viewport sizes and observed result.
- If browser checks did not run, say validation is limited to source-level
  helper checks and manual contract review.
- Do not claim full Open Design runtime parity, export success, daemon preview
  equivalence, or visual fidelity that was not actually checked.
