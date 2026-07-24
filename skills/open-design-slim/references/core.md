# Core Operating Model

`open-design-slim` is a file-first generation kit for coding agents. It carries
Open Design's practical design guidance into a workspace without carrying the
Open Design runtime.

## Principles

- Generate ordinary repository files that a reviewer can open, diff, and run.
- Prefer host-repository conventions when available: tokens, components,
  screenshots, existing routes, typography, and CSS strategy.
- Fall back to the bundled default design system only when no stronger local
  source exists.
- Make state coverage explicit: happy path, empty, loading, error, selected,
  disabled, focus, constrained, and responsive states.
- Keep generated artifacts daemonless. They must not call `/api/*`, `od`,
  daemon data roots, desktop IPC, plugin hosts, provider proxies, or artifact
  databases.

## Input Hierarchy

1. User brief and acceptance criteria.
2. Host repository source of truth: existing design system, components, tokens,
   screenshots, product docs, and nearby UI code.
3. This skill's contracts and quality guardrails.
4. Bundled templates and default design system.

When sources conflict, preserve the user's explicit requirement unless it asks
for a forbidden runtime dependency. Then use host repository conventions before
the bundled default.

## Output Types

- Static HTML prototype: one self-contained `index.html`.
- React prototype: `Prototype.jsx` plus optional sibling files only if the host
  repo expects them.
- Deck-style HTML: one self-contained `index.html` with slide sections and
  keyboard-free navigation controls.
- Design system bundle: `DESIGN.md`, token files, component manifest, and
  previewable examples.

## Completion Standard

Generation is complete when the artifact follows its contract, uses a declared
design-system source, avoids forbidden runtime dependencies, covers the state
matrix appropriate to the artifact, and includes a handoff that distinguishes
checked facts from assumptions.
