# Repository Layout

This repository packages the migrated `open-design-slim` skill bundle as
ordinary files. The `open-design/` directory is a submodule reference to the
upstream Open Design source and is not part of the slim bundle payload.

## Top Level

```text
.
  README.md
  docs/
  skills/open-design-slim/
  open-design/
```

- `README.md`: repository entrypoint for users and maintainers.
- `docs/`: standalone documentation for the bundle, helper CLI, validation, and
  maintenance.
- `skills/open-design-slim/`: canonical skill bundle. Keep this slug stable.
- `open-design/`: upstream submodule used for source context only.

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
  modes, workflow summary, and helper examples.
- `references/` contains mode-specific generation guidance:
  `core.md`, `prototype-workflow.md`, `design-system-workflow.md`, and
  `deck-framework.md`.
- `contracts/` defines output requirements for prototypes, design-system
  bundles, provenance, handoff, and forbidden runtime dependencies.
- `quality/` contains source-level QA guardrails: state matrix, visual
  checklist, responsive viewports, visual QA recipe, and anti-patterns.
- `assets/` contains templates, the bundled default design system, golden
  examples, and anti-pattern examples.
- `scripts/od-slim.mjs` is the dependency-free helper CLI for local scaffolding,
  validation, and handoff template creation.

## Documentation Map

- `open-design-slim-skill-bundle.md`: accepted bundle spec and boundary.
- `getting-started.md`: practical user flow and quick commands.
- `helper-cli.md`: helper command reference and validation behavior.
- `validation-qa.md`: source, helper, and optional browser QA expectations.
- `maintenance-publishing.md`: maintainer notes for updating and distributing
  the bundle.
