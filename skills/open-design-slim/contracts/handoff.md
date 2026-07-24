# Handoff Contract

Use this structure in the final response or in an `OPEN_DESIGN_SLIM_HANDOFF.md`
file when the generated artifact needs a durable local record.

```md
# Open Design Slim Handoff

## Artifact
- Kind:
- Entry:
- Supporting files:

## Source Files
- Template source:
- Design source files:
- Provenance file:

## Design System
- Source:
- Tokens used:
- Deviations:

## State Coverage
- Populated:
- Empty:
- Loading:
- Error:
- Selected:
- Disabled:
- Focus:
- Mobile:

## Validation
- Commands:
- Manual checks:
- Browser or screenshot checks:

## Runtime Boundary
- Uses Open Design daemon: no
- Calls /api/*: no
- Requires artifact DB or daemon data root: no

## Validation Gaps
- Unverified visual assumptions:
- Follow-up needed:
```

Keep the handoff factual. Do not say "fully verified" unless browser or visual
inspection actually happened.

Before final delivery, replace generic placeholders such as `[path]`,
`[command]`, `fill in`, `TODO`, or `TBD` with artifact-specific evidence. The
helper validation treats unresolved placeholders as failures.
