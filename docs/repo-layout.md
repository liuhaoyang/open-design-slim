# Repository Layout

This repository packages the migrated `open-design-slim` skill bundle as
ordinary files. The `open-design/` directory is a submodule reference to the
upstream Open Design source and is not part of the slim bundle payload.

## Top Level

```text
.
  README.md
  package.json
  bin/
  src/
  dist/
  assets/
  docs/
  scripts/
  tests/
  skills/open-design-slim/
  open-design/
```

- `README.md`: repository entrypoint for users and maintainers.
- `package.json`: package metadata, `open-design-slim` binary, and `od-slim`
  alias. It intentionally does not register an `od` binary.
- `bin/`: package binary shims.
- `src/`: shared local CLI implementation and source manifest.
- `dist/`: generated package CLI JavaScript consumed by `bin/`.
- `assets/`: CLI-shipped templates and default design-system snapshot.
- `docs/`: standalone documentation for the bundle, helper CLI, validation, and
  maintenance.
- `scripts/`: build and consistency checks for generated artifacts and assets.
- `tests/`: minimal CLI behavior and failure-mode tests.
- `skills/open-design-slim/`: canonical skill bundle. Keep this slug stable.
- `open-design/`: upstream submodule used for source context only.

## Package CLI

```text
bin/
  open-design-slim.mjs
  od-slim.mjs
src/
  cli.ts
  manifest/open-design-slim.sources.json
dist/
  cli.mjs
assets/
  templates/
  design-systems/default/
tsconfig.json
```

- `bin/open-design-slim.mjs` is the canonical package-level command shim.
- `bin/od-slim.mjs` is the package-level short alias.
- `src/cli.ts` owns command routing, scaffold copying, validation, handoff
  creation, and `manifest show`.
- `dist/cli.mjs` is the generated publishable JavaScript entry imported by both
  package shims. Published packages do not ship raw TypeScript source.
- `src/manifest/open-design-slim.sources.json` records the pinned upstream
  submodule commit and local snapshot entries used by `manifest show`.
- `assets/` is the CLI package payload used by scaffold and design-system init
  commands. This keeps the CLI publishable without the skill bundle.
- `tsconfig.json` typechecks the TypeScript CLI source with NodeNext module
  semantics.

## Skill Bundle

```text
skills/open-design-slim/
  SKILL.md
  references/
  contracts/
  quality/
  assets/
  scripts/od-slim.mjs
```

- `SKILL.md` is the agent-facing entrypoint with triggers, scope, generation
  modes, workflow summary, and optional CLI command examples.
- `references/` contains mode-specific generation guidance:
  `core.md`, `prototype-workflow.md`, `design-system-workflow.md`, and
  `deck-framework.md`.
- `contracts/` defines output requirements for prototypes, design-system
  bundles, provenance, handoff, and forbidden runtime dependencies.
- `quality/` contains source-level QA guardrails: state matrix, visual
  checklist, responsive viewports, visual QA recipe, and anti-patterns.
- `assets/` contains templates, the bundled default design system, golden
  examples, and anti-pattern examples.
- `scripts/od-slim.mjs` is a self-contained generated helper built from
  `src/cli.ts`. It uses the skill directory as its runtime root and must not
  import or read files outside the skill folder.

## Documentation Map

- `open-design-slim-skill-bundle.md`: accepted bundle spec and boundary.
- `getting-started.md`: practical user flow and quick commands.
- `helper-cli.md`: helper command reference and validation behavior.
- `validation-qa.md`: source, helper, and optional browser QA expectations.
- `maintenance-publishing.md`: maintainer notes for updating and distributing
  the bundle.
