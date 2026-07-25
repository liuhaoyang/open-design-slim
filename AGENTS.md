# Open Design Slim Agent Guide

## Repository Role

This repository maintains the portable `open-design-slim` skill bundle and a
developer-facing CLI implementation used to build it. The primary release
artifact is the skill bundle under `skills/open-design-slim/`.

The `open-design/` directory is an upstream source-context submodule. Do not
edit it as part of normal bundle or CLI work.

## Development Workflow

- Use an explicit Git worktree for development when working from the
  multi-repository workspace.
- Keep `src/cli.ts` as the maintained CLI source.
- Run `pnpm run build` after changing `src/cli.ts`; this regenerates:
  - `dist/cli.mjs`
  - `dist/manifest/open-design-slim.sources.json`
  - `skills/open-design-slim/scripts/od-slim.mjs`
- Commit generated outputs together with their source changes.

## Required Checks

Before submitting changes, run:

```bash
pnpm run check
pnpm run check:skill-closure
pnpm pack --dry-run
pnpm run release:skill
git diff --check
```

`pnpm run check` includes:

- TypeScript typecheck
- generated artifact staleness check
- package/skill asset sync check
- Vitest unit and e2e tests with 98% coverage thresholds
- CLI and skill smoke checks

`check:skill-closure` is kept as an explicit release/CI gate rather than part
of everyday `check`, so local iteration remains quick while release validation
still proves the copied skill bundle is self-contained.

## Skill Bundle Release

Build and validate the skill bundle with:

```bash
pnpm run build
pnpm run check:skill-closure
pnpm run release:skill
```

`check:skill-closure` copies only `skills/open-design-slim/` to a temporary
directory and verifies `node scripts/od-slim.mjs` works without the repo root,
`src/`, `dist/`, `node_modules`, or top-level `assets/`.

`release:skill` writes:

```text
release/open-design-slim-skill.tar.gz
```

The skill tarball must contain only the skill-facing files:

- `SKILL.md`
- `assets/`
- `contracts/`
- `quality/`
- `references/`
- `scripts/od-slim.mjs`

## Boundaries

- Do not register an `od` binary.
- Do not add daemon, `/api/*`, desktop, export, provider, MCP, network, or
  data-root dependencies to the slim helper.
- Do not make the skill helper import or read files outside
  `skills/open-design-slim/`.
- Keep package `assets/` and skill `assets/` synchronized; `check:assets`
  enforces this.
