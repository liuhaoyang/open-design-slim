# Maintenance And Publishing Notes

This repository is a standalone home for the migrated `open-design-slim` skill
bundle. Maintain the bundle as a portable file bundle, not as a daemon-backed
Open Design runtime extension.

## Maintenance Rules

- Keep the canonical slug `open-design-slim`.
- Keep the skill entrypoint at `skills/open-design-slim/SKILL.md`.
- Keep helper behavior local-filesystem-only.
- Do not introduce dependencies on `od`, `/api/*`, daemon data roots, artifact
  databases, desktop IPC, plugin hosts, provider management, MCP proxying,
  media tools, or export pipelines.
- Do not edit `open-design/` submodule contents as part of bundle maintenance.
- Prefer concise side-file docs over expanding `SKILL.md` with maintainer
  rationale.

## Updating The Bundle

When changing templates, contracts, quality files, or helper validation:

1. Update `SKILL.md` if generation modes, contracts, or helper commands changed.
2. Update this repository's docs under `docs/`.
3. Run lightweight source checks:

   ```bash
   node skills/open-design-slim/scripts/od-slim.mjs --help
   node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir skills/open-design-slim/assets/design-systems/default
   git status --short --untracked-files=all
   git submodule status
   ```

4. If helper validation changed, scaffold a small temporary artifact and verify
   the command still fails or passes for the intended reasons.
5. If visual guidance changed, compare against the golden examples under
   `assets/examples/golden/`.

## Publishing Or Copying

For a host-neutral skill distribution, include:

- `skills/open-design-slim/SKILL.md`
- `skills/open-design-slim/references/`
- `skills/open-design-slim/contracts/`
- `skills/open-design-slim/quality/`
- `skills/open-design-slim/assets/`
- `skills/open-design-slim/scripts/od-slim.mjs`

The root `docs/` directory is useful for maintainers, but an agent runtime only
needs the skill folder unless the host distribution expects repository-level
documentation.

## Versioning Guidance

There is no runtime registry version in this repository yet. If a future
distribution adds version metadata, update it in one place and keep generated
design-system bundle metadata separate from the skill bundle version.

Use provenance notes for generated design systems to record whether values came
from `bundle_default`, `host_repo`, `user_provided`, or `inferred` sources.

## Future Exporter Boundary

A future full Open Design exporter may refresh this folder shape, but the
exported bundle must remain daemonless at consumption time. Exporter-generated
bundles should avoid secrets, local daemon paths, run history, artifact IDs,
and network/runtime dependencies.
