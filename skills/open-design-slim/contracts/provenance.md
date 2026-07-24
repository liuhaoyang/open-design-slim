# Provenance Contract

Every generated artifact should make its source basis clear enough for review.

## Source Labels

Use these labels in handoff notes or generated comments:

- `user_provided`: directly specified by the user.
- `host_repo`: copied or adapted from the target repository.
- `bundle_default`: taken from this skill bundle.
- `inferred`: selected by the agent from context.
- `unverified`: plausible but not checked visually or against source.

## Required Provenance Notes

- Design-system source.
- Template source.
- Source files used from the host repository, screenshots, or supplied brief.
- Any copied host-repository tokens or component names.
- Any invented sample data.
- Any visual assumptions not checked in a browser or screenshot.
- Validation gaps that remain after helper checks.

## File Form

For durable local bundles, prefer a `source/provenance.json` file next to the
generated design-system bundle or an equivalent section in
`OPEN_DESIGN_SLIM_HANDOFF.md`.

Recommended JSON shape:

```json
{
  "schemaVersion": "open-design-slim-provenance/v1",
  "bundleName": "Product Design System",
  "sourceType": "bundle_default",
  "sources": [
    {
      "label": "bundle_default",
      "path": "DESIGN.md",
      "role": "design prose",
      "notes": "Portable fallback source."
    }
  ],
  "runtimeBoundary": {
    "usesOpenDesignDaemon": false,
    "callsDaemonApiRoutes": false,
    "requiresArtifactDatabase": false,
    "requiresDaemonDataRoot": false,
    "registeredInOpenDesign": false
  },
  "validationGaps": ["Browser screenshot QA not run."]
}
```

## Do Not Include

- Secrets, tokens, cookies, local credential paths, or provider keys.
- Daemon data-root paths.
- Open Design run IDs or artifact IDs unless the user separately provided them
  for documentation only.
- Claims that the artifact was exported or registered by full Open Design.
