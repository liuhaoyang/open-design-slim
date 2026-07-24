# Forbidden Runtime Dependencies

`open-design-slim` artifacts must stay portable. Generated files, templates,
and helper-script output must not depend on the full Open Design runtime.

## Forbidden in Generated Artifacts

- Calls to `/api/*`.
- Imports from `apps/daemon`, `apps/web`, `apps/desktop`, or packaged runtime
  internals.
- Calls to `od` product commands.
- Assumptions about `OD_DATA_DIR`, `OD_DAEMON_URL`, `OD_PROJECT_ID`,
  `OD_TOOL_TOKEN`, daemon artifact IDs, run IDs, or database rows.
- Desktop IPC, sidecar stamps, Electron globals, plugin hosts, provider
  management, MCP proxying, media tools, or export pipelines.
- Fetching local daemon routes for preview data.

## Allowed

- Local relative assets generated with the artifact.
- Host-repository components and tokens when the artifact is meant to integrate
  into that host repo.
- CDN-free static HTML and CSS.
- Node built-in helper script operations that copy, validate, or write files in
  the user-selected output directory.

## Helper Script Boundary

`scripts/od-slim.mjs` may:

- copy bundled templates,
- create local handoff files,
- validate file text for required markers and forbidden strings,
- inspect local directories.

It must not:

- start a daemon or web server,
- call `od`,
- call network APIs,
- read or write daemon data roots,
- mutate repository config outside the requested output directory.
