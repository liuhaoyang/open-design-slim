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
- A separately publishable Open Design Slim CLI package with `open-design-slim`
  and `od-slim` bins.
- A self-contained skill helper at `skills/open-design-slim/scripts/od-slim.mjs`
  that runs only against files inside the skill directory.

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
- [Open Design Slim CLI Design](docs/open-design-slim-cli.md)
- [Repository Layout](docs/repo-layout.md)
- [Helper CLI Reference](docs/helper-cli.md)
- [Validation And QA](docs/validation-qa.md)
- [Maintenance And Publishing Notes](docs/maintenance-publishing.md)

## Quick Check

```bash
pnpm install
pnpm run build
pnpm run check
pnpm run check:skill-closure
pnpm run release:skill
git status --short --untracked-files=all
git submodule status
```

## Skill Bundle Release

The primary portable artifact is the skill bundle under
`skills/open-design-slim/`. The TypeScript source in `src/cli.ts` is translated
into the self-contained skill helper at
`skills/open-design-slim/scripts/od-slim.mjs` during release builds.

Use:

```bash
pnpm run build
pnpm run check:skill-closure
pnpm run release:skill
```

`check:skill-closure` copies only `skills/open-design-slim/` to a temporary
directory and verifies that `node scripts/od-slim.mjs` can run without the repo
root, `src/`, `dist/`, `node_modules`, or top-level `assets/`. The release
artifact is written to:

```text
release/open-design-slim-skill.tar.gz
```

Generated artifacts should remain ordinary repository files and must not depend
on the full Open Design runtime unless a separate, explicit runtime integration
is performed outside this skill bundle.

When maintaining this repository, edit the root docs, CLI package files
(`bin/`, `src/`, `assets/`), generated skill helper
`skills/open-design-slim/scripts/od-slim.mjs`, and `skills/open-design-slim/`
only. The `open-design/` directory is a submodule for upstream source context
and is not part of the standalone payload.

## License

This repository is licensed under the Apache License, Version 2.0. See
[LICENSE](LICENSE).
