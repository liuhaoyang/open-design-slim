# Deck-Style HTML Framework

Use the deck template when the user asks for a presentation, proposal,
roadmap, research readout, or executive narrative that should still be an
ordinary local HTML file.

## Structure

- One `index.html` file with self-contained CSS and JavaScript.
- Slides are `<section class="slide">` blocks inside a single deck root.
- Navigation controls are ordinary buttons; do not rely on Open Design preview
  bridges or host iframe messages.
- Each slide should have a clear narrative job: context, tension, evidence,
  proposal, tradeoffs, plan, or ask.

## Slide Types

- Title: literal topic or product name, not a vague slogan.
- Summary: 3 to 5 crisp claims with evidence labels.
- Comparison: grid or table with concrete criteria.
- Process: timeline, steps, state machine, or architecture flow.
- Evidence: metrics, quotes, screenshots, or source-backed notes.
- Decision: recommendation, alternatives, risks, and next action.

## Visual Rules

- Fit each slide within one viewport without requiring vertical scrolling.
- Keep text density readable at 1280x720 and 1440x900.
- Avoid animated gimmicks, 3D covers, or decorative backgrounds unless the
  brief requires a highly expressive deck.
- Do not include speaker notes that claim hidden context the artifact does not
  show.

## Validation

The deck is a prototype artifact. Validate it with:

```bash
node skills/open-design-slim/scripts/od-slim.mjs validate prototype --entry <deck/index.html>
```

Then manually inspect the state and responsive checklist. The helper only
checks file shape and forbidden dependencies; visual quality still needs human
or browser review.
