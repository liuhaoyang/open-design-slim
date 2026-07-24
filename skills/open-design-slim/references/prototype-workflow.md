# Prototype Workflow

Use this workflow for static HTML, React, or deck-style prototypes. The goal is
a reviewable artifact that expresses a real product workflow, not a decorative
mock.

## 1. Resolve Context

- Restate the user goal in one sentence.
- Identify the target user, job to be done, primary workflow, and artifact kind.
- Inspect host repository UI conventions when available:
  - existing screens or route files,
  - tokens and theme files,
  - component primitives,
  - screenshot or design-system docs,
  - layout and navigation patterns.
- If no host source exists, use `assets/design-systems/default/`.

## 2. Pick the Template

- Static page or dashboard: copy `assets/templates/static-html/index.html`.
- React surface: copy `assets/templates/react-prototype/Prototype.jsx`.
- Narrative or presentation: use `references/deck-framework.md` and
  `assets/templates/deck-html/index.html`.

The template is a starting scaffold. Replace placeholder data and layout with
domain-specific UI and states.

## 3. Build the Real Workflow

Include the parts a user would expect to operate:

- product shell, navigation, breadcrumbs, or toolbar when the task is app-like,
- primary data view, filters, actions, confirmation affordances, and details,
- loading, empty, error, selected, disabled, focus, hover, and mobile states,
- realistic sample data labeled as sample when it is not user-provided,
- responsive layout constraints that prevent text overlap or layout jumps.

Operational tools should be dense enough for scanning and repeated action.
Marketing or editorial artifacts can be more expressive, but still need real
content hierarchy and responsive behavior.

## 4. Apply Visual Craft

- Use semantic color roles from the chosen design system.
- Keep palette balanced; avoid one-note purple-blue, beige, dark-slate, or
  orange/brown themes unless the brief requires them.
- Use stable dimensions for controls, tiles, counters, boards, and toolbars.
- Use visible focus states and keyboard-friendly controls.
- Avoid nested cards, decorative blobs, generic SaaS hero cards, and text that
  explains how to use the UI.

## 5. Validate Locally

Run the bundled helper from the skill directory when Node is available:

```bash
node scripts/od-slim.mjs validate prototype --entry <path-to-entry>
```

Then perform manual checks from:

- `quality/state-matrix.md`
- `quality/visual-checklist.md`
- `quality/responsive-viewports.json`
- `quality/anti-patterns.md`
- `quality/visual-qa-recipe.md` when browser or screenshot tooling is
  available.

The helper scans the entry directory by default. It checks the entry shape,
forbidden runtime strings, basic state/a11y/viewport signals, and
`OPEN_DESIGN_SLIM_HANDOFF.md` placeholder cleanup. Use `--dir <dir>` when the
entry file lives outside the artifact root.

If browser or screenshot validation is unavailable, say that in the handoff and
claim only source-level validation.

## 6. Handoff

Use `contracts/handoff.md`. Include the generated files, source design system,
source files used, state coverage, validation commands, visual QA results or
gaps, and runtime-boundary confirmation.
