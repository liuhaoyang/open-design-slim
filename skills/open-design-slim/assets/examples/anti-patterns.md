# Example Anti-Patterns

## Generic Dashboard

Weak output:

- Four vague cards named "Metric 1" through "Metric 4".
- No navigation, filters, selected row, loading, empty, or error state.
- Purple gradient header unrelated to the product.

Better output:

- Product-specific metrics with labels that imply a workflow.
- App shell, toolbar, table/list, detail panel, and at least three visible states.
- Palette from the host repo or bundled default design system.

## Runtime-Coupled Prototype

Weak output:

```js
fetch("/api/projects/current/artifacts")
```

Why it fails:

- A slim artifact must work as ordinary local output.
- `/api/*` belongs to the full Open Design daemon/web runtime.

Better output:

- Use static sample data in the artifact.
- Label invented data as sample in the handoff.
- Keep future integration notes outside the prototype unless the user asked for
  host repository wiring.

## Decorative Deck

Weak output:

- Full-slide gradients and large slogans with no evidence.
- No decision, tradeoff, source, or next action.
- Text overflows at 1280x720.

Better output:

- Title, context, comparison, decision, and plan slides.
- Evidence labels and compact tables where useful.
- Viewport-fit slide layout with disabled previous/next endpoint states.
