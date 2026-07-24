# Prototype Output Contract

This contract applies to static HTML, React, and deck-style prototype outputs.

## Required Properties

- The artifact is reviewable as ordinary workspace output.
- The artifact states or implies its design-system source through tokens,
  comments, or nearby handoff notes.
- The primary entry is one of:
  - `index.html` for static HTML or deck-style HTML,
  - `Prototype.jsx` for React prototypes,
  - a host-repository file path explicitly requested by the user.
- The generated UI covers the state matrix appropriate to the workflow:
  populated, empty, loading, error, selected, disabled, focus, and mobile.
- Copy is domain-specific. Placeholder labels such as `Lorem ipsum`, `Card 1`,
  or `Feature goes here` are not acceptable unless the user asked for raw
  scaffolding.
- Layout uses stable dimensions and responsive constraints so content does not
  overlap or resize controls unpredictably.

## Dependency Rules

- Static HTML should be self-contained unless the user or host repo requires
  local assets.
- React prototypes should use host repository conventions when integrated into
  an app. Standalone `Prototype.jsx` should avoid extra package assumptions.
- Do not require Open Design daemon, desktop, web runtime, `/api/*`, app IPC,
  artifact database records, plugin hosts, provider keys, MCP proxying, or
  daemon data roots.

## Accessibility Baseline

- Use semantic landmarks where practical.
- Interactive controls have accessible names.
- Focus states are visible.
- Color is not the only state indicator.
- Text contrast is reasonable for body copy and controls.

## Handoff Requirements

The final response or generated `OPEN_DESIGN_SLIM_HANDOFF.md` must list:

- generated files,
- artifact kind,
- design-system source,
- state coverage,
- commands or manual checks performed,
- visual validation gaps.
