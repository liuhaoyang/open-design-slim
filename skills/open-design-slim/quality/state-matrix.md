# State Matrix

Cover the states that make sense for the artifact. Do not force irrelevant
states, but do not omit common workflow states from app-like prototypes.

| State | Required For | Evidence In Artifact |
| --- | --- | --- |
| Populated | All prototypes | Realistic primary content and data rows/cards |
| Empty | Dashboards, lists, search, setup flows | Empty panel with next action |
| Loading | Async or data-heavy surfaces | Skeleton, spinner, or loading copy that does not shift layout |
| Error | Forms, async surfaces, imports, publishing | Recoverable error message and action |
| Selected | Tables, lists, galleries, inspectors | Selected row/card/detail relationship |
| Disabled | Forms, gated actions, incomplete setup | Disabled control with clear context |
| Focus | Interactive controls | Visible focus ring or equivalent state |
| Hover/Active | Buttons, links, rows, controls | CSS or component states |
| Mobile | All web artifacts | Layout remains coherent at narrow width |
| Constrained | Dense dashboards and decks | No text overlap at compact viewport |

## Minimum Acceptance

- Static dashboards: populated, empty, loading, error, selected, focus, mobile.
- React app surfaces: all states relevant to the workflow.
- Deck-style HTML: active slide, disabled previous/next endpoints, mobile or
  narrow-screen slide fit.
- Design-system previews: component default, hover, focus, selected, disabled,
  loading, empty, and error examples when those components exist.
