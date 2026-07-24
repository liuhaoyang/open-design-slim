# Using the Default System

1. Import or copy `tokens.css` into the generated artifact.
2. Read `manifest.json` for the local bundle metadata and declared files.
3. Use semantic tokens for layout and component styling.
4. Follow `components.manifest.json` for required component states.
5. Cite `source/provenance.json` or equivalent handoff notes when recording
   source basis and validation gaps.
6. Use `preview/index.html` for a compact visual sample.
7. Use `ui_kits/app/index.html` when building dense app-like workflows.

## Priority

Host repository design systems outrank this default. Use this default only when
no stronger local product source exists or when the user asks for a fresh
portable system.

## Handoff Note

When this system is used, state:

```md
Design-system source: open-design-slim skill bundle default
Design-system manifest: manifest.json
Design-system provenance: source/provenance.json
Runtime dependency: none
```
