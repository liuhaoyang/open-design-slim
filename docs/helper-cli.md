# CLI Reference

Open Design Slim CLI is the separately publishable CLI for agents and
maintainers. The source implementation lives in `src/cli.ts`, builds to
`dist/cli.mjs`, and uses Node built-ins plus local filesystem operations only.
It is not an Open Design product command.

The package exposes two binaries:

- `open-design-slim`: canonical CLI command.
- `od-slim`: short alias. The package intentionally does not expose `od`.

Skill files should call the CLI by command name only, not by repository-internal
paths. In this source checkout, install dev dependencies with `pnpm install`
before running package scripts such as `typecheck` or `check`.

Installed skill bundles also include a self-contained helper at
`scripts/od-slim.mjs`. That script is built from the same source but uses the
skill directory as its runtime root, so it can read `assets/` without reaching
outside the skill folder.

## Development Checks

The package aligns its TypeScript stack with upstream Open Design:

- `pnpm@10.33.2`
- `typescript@5.9.3`
- `tsx@4.22.3`
- `@types/node@20.19.39`
- Node engine `>=20`

Run:

```bash
pnpm run build
pnpm run typecheck
pnpm run test
pnpm run check
```

The source checkout runs `node bin/*.mjs` against the generated `dist/cli.mjs`.
Published usage should prefer `open-design-slim` or `od-slim`.
Skill-bundle usage should prefer `node scripts/od-slim.mjs` from the skill root.

## Boundary

The CLI may:

- copy bundled prototype templates,
- scaffold the bundled default design system,
- create `OPEN_DESIGN_SLIM_HANDOFF.md`,
- validate local text files for required shape and forbidden runtime strings.

The CLI must not:

- call `od`,
- start a daemon or web server,
- call network APIs,
- access `/api/*`,
- read or write daemon data roots,
- mutate repository configuration outside the requested output directory.

## Commands

```bash
open-design-slim --help
```

Prints usage and the daemonless boundary.

```bash
open-design-slim init prototype --kind static --output <dir>
open-design-slim init prototype --kind react --output <dir>
open-design-slim init prototype --kind deck --output <dir>
```

Copies the matching bundled template into `<dir>` and writes an initial
`OPEN_DESIGN_SLIM_HANDOFF.md`. The scaffold still needs product-specific copy,
state coverage, source attribution, and visual review before final delivery.

```bash
open-design-slim init design-system --output <dir> --name <name>
```

Copies `assets/design-systems/default/` into `<dir>`, renames the design-system
bundle metadata in `DESIGN.md`, `manifest.json`, `components.manifest.json`, and
`source/provenance.json`, then writes a handoff.

```bash
open-design-slim validate prototype --entry <file> [--dir <dir>]
```

Validates a `.html`, `.jsx`, or `.tsx` prototype entry. The entry directory is
scanned by default; use `--dir` when supporting files live elsewhere.

Prototype validation checks:

- HTML entry basics: doctype, viewport metadata, `html lang`, title, semantic
  and accessibility signals.
- React entry basics: default export, main/label/state semantics, visible focus
  styling, and explicit state management.
- State and responsive signals for populated, loading, empty, error, selected,
  disabled, focus, and mobile behavior.
- Forbidden runtime dependency strings across text files.
- Required handoff file with unresolved placeholders removed.

```bash
open-design-slim validate design-system --dir <dir>
```

Validates a design-system bundle for required files, bundle metadata,
component inventory, provenance shape, optional handoff cleanliness, and
forbidden runtime dependency strings.

```bash
open-design-slim bundle handoff --dir <dir>
```

Writes a draft handoff template into `<dir>`. Replace generic notes with
artifact-specific evidence before validation or final delivery.

```bash
open-design-slim manifest show
open-design-slim manifest show --json
```

Prints package metadata, binary names, the source manifest path, pinned upstream
submodule commit, and local source-manifest entries.

`sync check` and `sync write` are reserved for a future deterministic snapshot
workflow and are not implemented in this MVP.

## Exit Behavior

The helper prints validation failures and exits non-zero when checks fail. A
passing helper run means the portable file contract is cleaner; it does not
prove browser rendering quality or parity with the full Open Design runtime.
