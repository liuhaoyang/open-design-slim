# Maintenance And Publishing Notes

This repository is a standalone home for the migrated `open-design-slim` skill
bundle. Maintain the bundle as a portable file bundle, not as a daemon-backed
Open Design runtime extension.

## Maintenance Rules

- Keep the canonical slug `open-design-slim`.
- Keep the skill entrypoint at `skills/open-design-slim/SKILL.md`.
- Keep Open Design Slim CLI behavior local-filesystem-only.
- Keep `open-design-slim` as the canonical binary and `od-slim` as the only
  short alias. Do not register `od`.
- Keep the CLI package and skill bundle decoupled: skill guidance can call its
  own `scripts/od-slim.mjs`, but must not call executable paths outside the
  skill directory.
- Do not introduce dependencies on `od`, `/api/*`, daemon data roots, artifact
  databases, desktop IPC, plugin hosts, provider management, MCP proxying,
  media tools, or export pipelines.
- Do not edit `open-design/` submodule contents as part of bundle maintenance.
- Prefer concise side-file docs over expanding `SKILL.md` with maintainer
  rationale.

## Updating The Bundle

When changing templates, contracts, quality files, or CLI validation:

1. Update `SKILL.md` if generation modes, contracts, or CLI commands changed.
2. Update this repository's docs under `docs/`.
3. Run lightweight source checks:

   ```bash
   pnpm run build
   pnpm run check:generated
   pnpm run check:assets
   pnpm run test
   pnpm run typecheck
   node bin/open-design-slim.mjs --help
   node skills/open-design-slim/scripts/od-slim.mjs --help
   node bin/open-design-slim.mjs manifest show
   node bin/open-design-slim.mjs validate design-system --dir assets/design-systems/default
   node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir skills/open-design-slim/assets/design-systems/default
   git status --short --untracked-files=all
   git submodule status
   ```

4. If CLI validation changed, scaffold a small temporary artifact and verify
   the command still fails or passes for the intended reasons.
5. If visual guidance changed, compare against the golden examples under
   `assets/examples/golden/`.

## Publishing Or Copying

For the publishable CLI package, include:

- `package.json`
- `bin/`
- `dist/`
- `dist/manifest/`
- `assets/`

For a host-neutral skill distribution, run:

```bash
pnpm run release:skill
```

This writes `release/open-design-slim-skill.tar.gz`. The archive includes:

- `skills/open-design-slim/SKILL.md`
- `skills/open-design-slim/references/`
- `skills/open-design-slim/contracts/`
- `skills/open-design-slim/quality/`
- `skills/open-design-slim/assets/`
- `skills/open-design-slim/scripts/od-slim.mjs`

The root `docs/` directory is useful for maintainers, but an agent runtime only
needs the skill folder unless the host distribution expects repository-level
documentation. If only the skill folder is copied, it remains usable through
`node scripts/od-slim.mjs`, manual template copying, and the checklists. The
helper must remain self-contained and must not import or read files outside the
skill directory.

`check:skill-closure` must pass before publishing or copying the skill bundle.
It copies only `skills/open-design-slim/` to a temporary directory and verifies
the helper can run from that isolated copy.

`release:skill` runs `check:skill-closure` before creating the tarball, so CI
and release packaging both exercise the isolated skill bundle without making
every local `pnpm run check` slower.

## TypeScript Runtime

The package TypeScript stack is aligned with upstream Open Design:

- `packageManager: pnpm@10.33.2`
- `typescript: 5.9.3`
- `tsx: 4.22.3`
- `@types/node: 20.19.39`
- engines: Node `>=20`, pnpm `>=10.33.2 <11`

The source package builds `src/cli.ts` into `dist/cli.mjs` for publishable CLI
usage and into `skills/open-design-slim/scripts/od-slim.mjs` for skill-bundle
usage. Maintainers should run `pnpm install` and `pnpm run check` after
dependency, CLI, or asset changes.

## Versioning Guidance

The package version lives in root `package.json`. Keep generated design-system
bundle metadata separate from the package version.

Use provenance notes for generated design systems to record whether values came
from `bundle_default`, `host_repo`, `user_provided`, or `inferred` sources.

## Future Exporter Boundary

A future full Open Design exporter may refresh this folder shape, but the
exported bundle must remain daemonless at consumption time. Exporter-generated
bundles should avoid secrets, local daemon paths, run history, artifact IDs,
and network/runtime dependencies.
