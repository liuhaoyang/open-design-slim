# Open Design Slim Skill Bundle

This repository packages the migrated `open-design-slim` skill bundle for
coding agents that need Open Design style prototype or design-system generation
without starting the Open Design daemon, web app, desktop app, or `/api/*`
runtime.

The canonical skill slug is `open-design-slim`, and the canonical entrypoint is
`skills/open-design-slim/SKILL.md`.

## What Is Included

- Static HTML, React, and deck-style prototype templates.
- A bundled default design system with `DESIGN.md`, semantic tokens, component
  manifest, provenance, preview, and app UI kit.
- Contracts for prototype output, design-system output, provenance, handoff,
  and forbidden runtime dependencies.
- Quality guardrails for state coverage, visual polish, responsive viewports,
  visual QA, and anti-patterns.
- A dependency-free helper CLI at `skills/open-design-slim/scripts/od-slim.mjs`.

The `open-design/` directory is a submodule used for upstream source context.
Do not modify submodule contents when maintaining this standalone bundle.

## Repository Setup

Clone with submodules when you need the upstream Open Design context:

```bash
git clone --recurse-submodules https://github.com/liuhaoyang/open-design-slim.git
```

If the repository was cloned without submodules, initialize the upstream context
afterward:

```bash
git submodule update --init --recursive
```

## Start Here

- [Getting Started](docs/getting-started.md)
- [Open Design Slim Skill Bundle Spec](docs/open-design-slim-skill-bundle.md)
- [Repository Layout](docs/repo-layout.md)
- [Helper CLI Reference](docs/helper-cli.md)
- [Validation And QA](docs/validation-qa.md)
- [Maintenance And Publishing Notes](docs/maintenance-publishing.md)

## Quick Check

```bash
node skills/open-design-slim/scripts/od-slim.mjs --help
node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir skills/open-design-slim/assets/design-systems/default
git status --short --untracked-files=all
git submodule status
```

Generated artifacts should remain ordinary repository files and must not depend
on the full Open Design runtime unless a separate, explicit runtime integration
is performed outside this skill bundle.

When maintaining this repository, edit the root docs and
`skills/open-design-slim/` only. The `open-design/` directory is a submodule for
upstream source context and is not part of the standalone payload.

## License

This repository is licensed under the Apache License, Version 2.0. See
[LICENSE](LICENSE).
