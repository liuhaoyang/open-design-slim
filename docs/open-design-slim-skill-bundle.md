# Open Design Slim Skill Bundle

## Status

`open-design-slim` is the accepted portable Open Design Slim Skill bundle in
this repository. Its canonical slug and folder name are
`skills/open-design-slim/`.

The repository placement is intentional:

- `skills/` is for functional skills a coding agent invokes mid-task.
- `design-templates/` is for renderable template catalogue entries surfaced as
  Open Design start points.
- `open-design-slim` is a generation kit that includes templates as side files,
  but its entrypoint is a coding agent loading `SKILL.md`, so it belongs under
  `skills/`.

## Purpose

`open-design-slim` is a portable, daemonless skill bundle for coding
agents such as Claude Code, Codex, Cursor, and repo-local automation agents.

It is intentionally a reduced generation capability, not the full Open Design
runtime. Full Open Design remains daemon-backed and owns project/run/artifact
management, prompt composition, design-system and template staging, web/desktop
preview, export/media/plugin tooling, MCP/provider management, and `/api/*`
surfaces. `open-design-slim` packages the minimum reusable context needed for a
coding agent to produce design artifacts directly inside its current workspace.

## Target Outcome

A coding agent can load `skills/open-design-slim/SKILL.md`, progressively read
the referenced side files, and generate:

- a static HTML prototype,
- a React prototype,
- a deck-style HTML artifact,
- a portable design-system bundle.

The output is ordinary repository content. It does not require Open Design to be
installed, running, or reachable.

## Bundle Contents

The delivered bundle is a complete folder:

```text
skills/open-design-slim/
  SKILL.md
  references/
    core.md
    prototype-workflow.md
    design-system-workflow.md
    deck-framework.md
  assets/
    templates/
      static-html/index.html
      react-prototype/Prototype.jsx
      deck-html/index.html
    design-systems/default/
      manifest.json
      DESIGN.md
      USAGE.md
      tokens.css
      components.manifest.json
      source/provenance.json
      preview/index.html
      ui_kits/app/index.html
    examples/
      golden/static-dashboard/index.html
      golden/form-settings/index.html
      golden/mobile-constrained/index.html
      golden/deck-report/index.html
      anti-patterns.md
  contracts/
    prototype-output.md
    design-system-output.md
    handoff.md
    provenance.md
    forbidden-runtime-deps.md
  quality/
    state-matrix.md
    visual-checklist.md
    visual-qa-recipe.md
    responsive-viewports.json
    anti-patterns.md
  scripts/
    od-slim.mjs
```

`SKILL.md` owns the trigger contract and routes the agent to references,
contracts, quality files, templates, examples, and the optional helper script.
It stays concise by design; detailed workflow material lives in side files.

## Frontmatter Contract

The skill entrypoint includes:

- `name: open-design-slim`
- `description` that names the portable daemonless generation use case
- `triggers` for daemonless Open Design, portable prototypes, and design-system
  bundle generation
- `od.mode: utility`
- `od.design_system.generates: true`

`od.mode` is not `prototype`, `deck`, or `template` because those modes classify
design-template catalogue entries. This bundle is a functional skill that can
produce several artifact types.

## Naming Decision

The canonical display name is Open Design Slim, and the canonical slug is
`open-design-slim`.

This name is retained because the portable bundle must be distinct from
daemon-backed Open Design skills while still describing its reduced,
daemonless, runtime-excluded boundary. `open-design-skill` is rejected as too
ambiguous, and `open-design-flash` is rejected as too brand-like for the
engineering boundary. Natural language triggers such as `portable open design
skill` may remain aliases, but exporters, folders, archives, metadata, and docs
should use `open-design-slim`.

The naming discussion is retained here as maintainer context. It should not ship
as a separate file inside the Skill bundle because generation agents do not need
to read naming rationale before producing artifacts.

## Generation-Complete Boundary

The generation is complete when:

1. The requested files exist at the user-selected output path.
2. The artifact follows its relevant output contract.
3. The artifact avoids forbidden runtime dependencies.
4. The output names the design-system source used.
5. The state matrix appropriate to the artifact is represented.
6. A handoff names generated files, checks performed, and visual validation gaps.

This is not equivalent to full Open Design runtime completion. The skill bundle
can guide and validate file shape, but it cannot create daemon run records,
artifact database rows, live previews, media assets, export jobs, comments, or
plugin execution.

The hardened helper may reject outputs with unresolved handoff placeholders,
thin state coverage signals, missing viewport or accessibility basics, or
forbidden runtime dependency strings. Passing these checks means the portable
file contract is cleaner; it still does not prove visual equivalence with the
full Open Design web/desktop preview.

## Runtime Exclusions

`open-design-slim` must not require or promise:

- `od daemon`, `apps/web`, `apps/desktop`, or packaged Electron runtime,
- live preview, iframe bridges, comment mode, or browser-side inspection,
- artifact DB, project registry, run history, or task lifecycle,
- media tools, export pipeline, plugin execution, MCP proxying, or provider
  management,
- automatic design-system discovery from daemon-managed state,
- calls to `/api/*`,
- daemon data-root access such as `OD_DATA_DIR`,
- Open Design product CLI commands.

Generated artifacts must not call `/api/*`. If a host repository later wires an
artifact into an application API, that is normal application work outside the
portable skill contract.

## Helper Script Boundary

`skills/open-design-slim/scripts/od-slim.mjs` is a portable compatibility
artifact inside the Skill bundle. It intentionally remains `.mjs` so an agent can
run it directly with Node in a copied skill folder without a TypeScript build
step.

Allowed helper behavior:

- copy bundled templates to a requested output directory,
- scaffold the default design-system bundle,
- validate local prototype and design-system files for bundle shape, handoff
  completeness, source/provenance metadata, and basic state/a11y/viewport
  signals,
- scan local output directories for forbidden runtime dependency strings,
- write an `OPEN_DESIGN_SLIM_HANDOFF.md` template.

Forbidden helper behavior:

- call `od`,
- start a daemon or web server,
- access `/api/*`,
- use network APIs,
- read or write daemon data roots,
- mutate repository configuration outside the requested output directory.

Supported commands:

```bash
node skills/open-design-slim/scripts/od-slim.mjs --help
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind static --output <dir>
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind react --output <dir>
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind deck --output <dir>
node skills/open-design-slim/scripts/od-slim.mjs init design-system --output <dir> --name <name>
node skills/open-design-slim/scripts/od-slim.mjs validate prototype --entry <file> [--dir <dir>]
node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir <dir>
node skills/open-design-slim/scripts/od-slim.mjs bundle handoff --dir <dir>
```

Prototype validation scans the entry directory by default, or the explicit
`--dir` when supplied. Design-system validation scans the full bundle.

## User Flow

1. A user installs, vendors, copies, or attaches the `skills/open-design-slim/`
   folder into a coding-agent workspace.
2. The user asks the coding agent to create or revise a design artifact and
   names `open-design-slim` or points the agent at `SKILL.md`.
3. The agent reads `SKILL.md`, then only the side files relevant to the task.
4. The agent writes the requested artifact directly, such as `index.html`,
   `Prototype.jsx`, or a repo-specific file path requested by the user.
5. The agent optionally runs the bundled helper script, or uses the checklists
   manually when execution is unavailable.
6. The final handoff names generated files, design-system source, validation
   performed, and gaps requiring human visual review.

## Agent Installation Targets

The bundle is host-neutral:

- Claude Code: installed as a normal `SKILL.md` skill folder.
- Codex or other repo-local agents: copied into a repository-local skill or
  support directory and referenced from the prompt or project instructions.
- Archive handoff: attached to a remote session as a self-contained folder.
- Git subdirectory: vendored into a repository that wants repeatable local
  prototype and design-system generation.

The bundle must not depend on `OD_DAEMON_URL`, `OD_PROJECT_ID`,
`OD_TOOL_TOKEN`, Open Design run state, daemon-managed filesystem paths, or a
specific Open Design installation.

## Current Bundle Scope

The current bundle includes:

- one `SKILL.md` entrypoint,
- prototype workflow guidance,
- design-system workflow guidance,
- deck-style HTML guidance,
- static HTML, React, and deck templates,
- a bundled default design system with docs, tokens, bundle manifest,
  component manifest, source/provenance metadata, preview, and app UI kit,
- golden examples for static dashboards, form/settings surfaces,
  mobile-constrained layouts, and deck-style reports,
- anti-pattern examples,
- prototype, design-system, handoff, provenance, and forbidden-runtime-deps
  contracts,
- state, visual, optional screenshot QA, responsive, and anti-pattern quality
  guardrails,
- dependency-free local helper script.

Bundle acceptance:

- A coding agent can generate a complete static `index.html` artifact using only
  files in the bundle and the user's brief.
- A coding agent can generate a React prototype without calling `/api/*`.
- A coding agent can scaffold a portable design-system bundle.
- The generated artifact can be reviewed as ordinary repository output.
- The final handoff clearly states that full Open Design runtime capabilities
  were not used.
- The helper can fail unresolved handoff placeholders, missing design-system
  provenance, missing bundle manifest, forbidden runtime strings, and weak
  prototype state/a11y/viewport signals.

## Quality Guardrails

`open-design-slim` optimizes for repeatable prototype quality rather than only
prompt convenience. The bundle requires agents to:

- inspect relevant host-repository UI code, tokens, components, screenshots, or
  `DESIGN.md` when available,
- prefer host-repository design systems over the bundled default,
- preserve product shell and information architecture unless the user asks for
  an isolated concept,
- generate the primary happy path plus relevant empty, loading, error, selected,
  disabled, focus, and responsive states,
- avoid generic SaaS-card aesthetics, nested cards, decorative blobs, text
  overflow, and one-note palettes,
- state whether browser, screenshot, or manual visual validation was performed.
- when browser or Playwright-style checks are available, use
  `quality/visual-qa-recipe.md`; when unavailable, explicitly downgrade the
  handoff to source-level validation.

If those checks cannot be performed in the remote host, the handoff should claim
only bundle-guided prototype quality, not visual equivalence with full Open
Design runtime output.

## Future Exporter Boundary

Full Open Design may later provide an exporter that produces or refreshes this
folder shape, but the exported bundle remains daemonless at consumption time.

This is explicitly future work. The current bundle does not add root scripts,
does not add an Open Design product command, and does not implement a full
runtime exporter.

Future exporter responsibilities:

- resolve selected design-system docs, tokens, and assets from full Open Design,
- copy selected templates and golden examples,
- emit `SKILL.md`, output contracts, quality checklists, and optional validation
  script,
- stamp bundle metadata such as source Open Design version, selected template,
  selected design system, and generation time,
- avoid embedding daemon-only paths, local credentials, run history, secrets, or
  `/api/*` dependencies.

Future exporter non-responsibilities:

- generated bundles still do not call back into Open Design runtime,
- generated bundles still do not manage artifact databases or live preview,
- generated bundles still do not expose media/export/plugin/MCP/provider
  management.

## Open Questions

- Should the future exporter support multiple named design-system profiles in a
  single bundle, or keep one bundle per selected design system?
- What provenance metadata should be required when a future exporter snapshots a
  full-runtime design system into the slim bundle?
- Should generated bundles include only one artifact type by default to reduce
  context size, or keep the current multi-artifact bundle shape?
