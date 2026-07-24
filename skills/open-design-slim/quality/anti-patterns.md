# Anti-Patterns

Avoid these patterns unless the user's brief explicitly requires them.

- A landing page when the user asked for an app, dashboard, tool, or workflow.
- Generic SaaS cards with no product-specific workflow.
- Oversized hero type inside compact tools, sidebars, cards, or forms.
- Nested cards, floating section cards, decorative blobs, and meaningless glass
  panels.
- One-hue palettes, especially purple-blue gradients, beige-only themes,
  dark-slate-only themes, and orange/brown dashboards.
- Text inside controls that cannot fit at mobile or compact desktop widths.
- Missing empty, loading, error, focus, selected, and disabled states.
- Default browser controls with no visible integration into the visual system.
- Generated artifacts that call `/api/*`, `od`, daemon data roots, or desktop
  IPC.
- Handoff text that claims live preview, export, media, plugin, MCP, provider,
  artifact DB, or daemon management capability.
