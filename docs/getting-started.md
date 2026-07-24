# Getting Started

Use `open-design-slim` when a coding agent needs Open Design style generation
without starting the Open Design daemon, web app, desktop app, or `/api/*`
runtime.

## What You Can Generate

- Static HTML prototype from `assets/templates/static-html/index.html`.
- React prototype from `assets/templates/react-prototype/Prototype.jsx`.
- Deck-style HTML artifact from `assets/templates/deck-html/index.html`.
- Portable design-system bundle from `assets/design-systems/default/`.

The canonical skill entrypoint is `skills/open-design-slim/SKILL.md`. The Open
Design Slim CLI command is `open-design-slim`, with `od-slim` as a short alias.
Keep the slug `open-design-slim` when copying, publishing, or documenting the
bundle.

## Recommended Agent Flow

1. Read `skills/open-design-slim/SKILL.md`.
2. Pick exactly one generation mode.
3. Read the matching workflow:
   - `references/prototype-workflow.md` for static HTML or React prototypes.
   - `references/deck-framework.md` for deck-style HTML.
   - `references/design-system-workflow.md` for design-system bundles.
4. Read the relevant contracts before writing output:
   - `contracts/prototype-output.md`
   - `contracts/design-system-output.md`
   - `contracts/handoff.md`
   - `contracts/forbidden-runtime-deps.md`
   - `contracts/provenance.md`
5. Prefer host repository UI code, tokens, screenshots, and existing
   `DESIGN.md` files over the bundled default design system.
6. Use the bundled skill helper, Open Design Slim CLI, or manual quality files
   before final handoff.

## Quick Commands

When Open Design Slim CLI is installed or available from this source checkout:

```bash
open-design-slim --help
open-design-slim init prototype --kind static --output ./prototype
open-design-slim init prototype --kind react --output ./prototype-react
open-design-slim init prototype --kind deck --output ./deck
open-design-slim init design-system --output ./design-system --name "Product Name"
open-design-slim manifest show
```

After editing the generated scaffold into a real artifact:

```bash
open-design-slim validate prototype --entry ./prototype/index.html
open-design-slim validate design-system --dir ./design-system
```

The `od-slim` binary is a CLI alias. Skill files should not invoke
repository paths outside the skill directory. Inside an installed skill, run the
self-contained helper from the skill root:

```bash
node scripts/od-slim.mjs --help
node scripts/od-slim.mjs validate design-system --dir assets/design-systems/default
```

If Node is unavailable, copy templates manually and use the contracts and
quality checklists.

## Completion Boundary

Generation is complete when the requested files exist, follow their output
contract, avoid forbidden runtime dependencies, cover the relevant states, and
include a factual handoff. Passing helper checks does not prove full Open Design
runtime parity or visual equivalence with a daemon-backed preview.
