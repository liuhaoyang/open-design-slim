# Helper CLI Reference

`skills/open-design-slim/scripts/od-slim.mjs` is an optional local helper for
agents and maintainers. It uses Node built-ins and local filesystem operations
only. It is not an Open Design product command.

## Boundary

The helper may:

- copy bundled prototype templates,
- scaffold the bundled default design system,
- create `OPEN_DESIGN_SLIM_HANDOFF.md`,
- validate local text files for required shape and forbidden runtime strings.

The helper must not:

- call `od`,
- start a daemon or web server,
- call network APIs,
- access `/api/*`,
- read or write daemon data roots,
- mutate repository configuration outside the requested output directory.

## Commands

```bash
node skills/open-design-slim/scripts/od-slim.mjs --help
```

Prints usage and the daemonless boundary.

```bash
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind static --output <dir>
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind react --output <dir>
node skills/open-design-slim/scripts/od-slim.mjs init prototype --kind deck --output <dir>
```

Copies the matching bundled template into `<dir>` and writes an initial
`OPEN_DESIGN_SLIM_HANDOFF.md`. The scaffold still needs product-specific copy,
state coverage, source attribution, and visual review before final delivery.

```bash
node skills/open-design-slim/scripts/od-slim.mjs init design-system --output <dir> --name <name>
```

Copies `assets/design-systems/default/` into `<dir>`, renames the design-system
bundle metadata in `DESIGN.md`, `manifest.json`, `components.manifest.json`, and
`source/provenance.json`, then writes a handoff.

```bash
node skills/open-design-slim/scripts/od-slim.mjs validate prototype --entry <file> [--dir <dir>]
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
node skills/open-design-slim/scripts/od-slim.mjs validate design-system --dir <dir>
```

Validates a design-system bundle for required files, bundle metadata,
component inventory, provenance shape, optional handoff cleanliness, and
forbidden runtime dependency strings.

```bash
node skills/open-design-slim/scripts/od-slim.mjs bundle handoff --dir <dir>
```

Writes a draft handoff template into `<dir>`. Replace generic notes with
artifact-specific evidence before validation or final delivery.

## Exit Behavior

The helper prints validation failures and exits non-zero when checks fail. A
passing helper run means the portable file contract is cleaner; it does not
prove browser rendering quality or parity with the full Open Design runtime.
