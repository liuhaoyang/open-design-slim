# Design-System Workflow

Use this workflow when the user asks for a portable design system, brand kit,
or `DESIGN.md` that another coding agent can apply without Open Design runtime
services.

## 1. Gather Inputs

- User brief, audience, product domain, and visual constraints.
- Existing host repository tokens, CSS variables, components, screenshots, or
  previous `DESIGN.md` files.
- Reference brands or screenshots supplied by the user.

Do not invent claims about a real brand. If a value is inferred, mark it as
inferred in the provenance notes.

## 2. Produce the Bundle

A minimal design-system bundle should include:

- `manifest.json` with local bundle metadata.
- `DESIGN.md` with intent, color roles, typography, layout, components, states,
  accessibility, and agent usage guidance.
- `tokens.css` with semantic CSS variables.
- `components.manifest.json` with component names, roles, states, and token
  dependencies.
- `USAGE.md` explaining how a coding agent should apply the system.
- `source/provenance.json` or equivalent provenance notes.
- Optional `preview/index.html` or `ui_kits/app/index.html` when the user needs
  a visual sample.

The bundled helper can scaffold this from the skill directory when Node is
available:

```bash
node scripts/od-slim.mjs init design-system --output ./design-system --name "Product Name"
```

## 3. Design-System Requirements

- Name semantic roles, not only raw hex values.
- Provide color contrast guidance for text, surfaces, borders, and accents.
- Define body and display typography with fallbacks.
- Define spacing, radius, borders, elevation, and motion defaults.
- Define component behavior and states: hover, focus, active, selected,
  disabled, loading, empty, error.
- Explain when not to use the system, especially if the host repo has a more
  authoritative product system.

## 4. Validate

```bash
node scripts/od-slim.mjs validate design-system --dir <bundle-dir>
```

Then check `contracts/design-system-output.md`,
`contracts/provenance.md`, and `quality/visual-checklist.md`. The helper scans
the whole bundle for forbidden runtime strings and checks `manifest.json`,
`components.manifest.json`, `source/provenance.json`, and any existing handoff
for unresolved placeholders.

## 5. Handoff

List generated files, the source basis for the system, source files used,
inferred values, validation commands, and any areas that need human visual
review.
