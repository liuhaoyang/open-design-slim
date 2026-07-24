---
name: open-design-slim
description: |
  Portable Open Design generation kit for coding agents. Use when a remote or
  repo-local coding agent must generate a polished static HTML prototype, React
  prototype, deck-style HTML artifact, or standalone DESIGN.md design system
  without starting the Open Design daemon, web app, desktop app, or any /api/*
  runtime.
triggers:
  - "open-design-slim"
  - "daemonless open design"
  - "portable design prototype"
  - "generate prototype without daemon"
  - "create design system bundle"
  - "repo-local prototype skill"
od:
  mode: utility
  category: web-artifacts
  scenario: portable-generation
  design_system:
    requires: false
    generates: true
    sections: [color, typography, layout, components, states, handoff]
  capabilities_required:
    - file_read
    - file_write
    - shell_optional
---

# open-design-slim

Use this skill when the user wants Open Design style prototype or design-system
generation in a coding-agent workspace, but the full Open Design runtime is not
available or intentionally out of scope.

This is a portable generation kit. It writes ordinary files into the current
workspace and may use the bundled `scripts/od-slim.mjs` helper when Node is
available. It does not manage projects, runs, artifact databases, previews,
exports, plugins, providers, MCP, media, desktop windows, daemon data roots, or
Open Design product commands.

## Trigger When

- The user asks for a polished prototype from a brief and wants files committed
  directly to a repository.
- The user asks for a lightweight design system or `DESIGN.md` that another
  agent can consume.
- The host cannot start `od daemon`, `apps/web`, desktop, or packaged runtime.
- The work needs a portable bundle that can be copied into Claude Code, Codex,
  Cursor, or another coding-agent environment.

## Do Not Use For

- Live Open Design web or desktop preview workflows.
- Artifact DB, media, export, plugin, MCP, provider, or daemon settings work.
- Any flow that requires generated files to call `/api/*` or read daemon-managed
  data paths.
- Product changes to `od` CLI, daemon routes, web UI, desktop, or packaged
  runtime.

## Generation Modes

Choose one mode, then follow the linked workflow:

- Static HTML prototype: `references/prototype-workflow.md` plus
  `assets/templates/static-html/index.html`.
- React prototype: `references/prototype-workflow.md` plus
  `assets/templates/react-prototype/Prototype.jsx`.
- Deck-style HTML: `references/deck-framework.md` plus
  `assets/templates/deck-html/index.html`.
- Design system bundle: `references/design-system-workflow.md` plus
  `assets/design-systems/default/` (`manifest.json`, `DESIGN.md`,
  `tokens.css`, `components.manifest.json`, `USAGE.md`, and
  `source/provenance.json`).

Read the contracts before writing files:

- Prototype output: `contracts/prototype-output.md`.
- Design-system output: `contracts/design-system-output.md`.
- Runtime exclusions: `contracts/forbidden-runtime-deps.md`.
- Handoff: `contracts/handoff.md`.
- Provenance: `contracts/provenance.md`.

Use quality checks before final handoff:

- State coverage: `quality/state-matrix.md`.
- Visual polish: `quality/visual-checklist.md`.
- Responsive targets: `quality/responsive-viewports.json`.
- Optional browser/screenshot QA: `quality/visual-qa-recipe.md`.
- Anti-patterns: `quality/anti-patterns.md` and
  `assets/examples/anti-patterns.md`.
- Golden examples:
  - `assets/examples/golden/static-dashboard/index.html`
  - `assets/examples/golden/form-settings/index.html`
  - `assets/examples/golden/mobile-constrained/index.html`
  - `assets/examples/golden/deck-report/index.html`

## Workflow

1. Confirm the requested artifact type and output path.
2. Inspect relevant repository UI, tokens, components, screenshots, or
   `DESIGN.md` if they exist. If no host design system exists, use
   `assets/design-systems/default/`.
3. Copy the nearest template or run `node scripts/od-slim.mjs` from this skill
   directory to scaffold it.
4. Replace template content with product-specific UI, real workflows, and the
   state matrix required by the contract.
5. Validate that generated files have no daemon/runtime dependencies and that
   text, layout, focus states, and mobile behavior are coherent.
6. Hand off with generated file paths, design-system source, checks performed,
   and any visual validation gaps.

## Optional CLI

Open Design Slim CLI is also available as a separate publishable package, but
this skill carries a self-contained helper at `scripts/od-slim.mjs`. Run it from
the `skills/open-design-slim/` directory so relative asset paths stay inside the
skill. The helper is not an Open Design product command and uses local file
operations only.

```bash
node scripts/od-slim.mjs --help
node scripts/od-slim.mjs init prototype --kind static --output ./prototype
node scripts/od-slim.mjs init prototype --kind react --output ./prototype-react
node scripts/od-slim.mjs init prototype --kind deck --output ./deck
node scripts/od-slim.mjs init design-system --output ./design-system --name "Acme"
node scripts/od-slim.mjs validate prototype --entry ./prototype/index.html
node scripts/od-slim.mjs validate prototype --entry ./prototype/index.html --dir ./prototype
node scripts/od-slim.mjs validate design-system --dir ./design-system
node scripts/od-slim.mjs bundle handoff --dir ./prototype
node scripts/od-slim.mjs manifest show
```

The standalone package binary `od-slim` remains an alias for `open-design-slim`.
The package and this skill helper do not provide an `od` binary. If Node is
unavailable, copy templates manually and use the contracts and quality
checklists.

Validation scans local text files for forbidden runtime dependencies. Prototype
validation also checks basic entry shape, state/a11y/viewport signals, and a
clean `OPEN_DESIGN_SLIM_HANDOFF.md` without unresolved placeholders. Design
system validation checks bundle metadata, component inventory, provenance, and
runtime boundary strings.

If the host cannot run Node, copy files manually and use the checklists.

## Generation-Complete Boundary

The work is complete when the requested files exist, follow the relevant
contract, avoid forbidden runtime dependencies, cover the expected states, and
include a handoff that states what was checked. Do not claim full Open Design
runtime equivalence unless the full runtime was separately used and verified.
