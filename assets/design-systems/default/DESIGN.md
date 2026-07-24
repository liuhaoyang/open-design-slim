# Open Design Slim Default System

## Intent

This default system is a neutral operational UI baseline for prototypes and
portable handoffs. Use it when the host repository does not provide a stronger
design system.

The system favors dense, scannable interfaces for dashboards, review tools,
queues, settings, and admin surfaces. It is intentionally restrained rather
than decorative.

## Color Roles

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Background | `--od-bg` | `#f6f7f2` | Page background |
| Surface | `--od-surface` | `#ffffff` | Panels, tables, forms |
| Muted surface | `--od-surface-muted` | `#eef1e8` | Selected nav, subtle sections |
| Text | `--od-text` | `#18201b` | Primary content |
| Muted text | `--od-text-muted` | `#667066` | Secondary labels |
| Border | `--od-border` | `#d9dfd0` | Panel and row dividers |
| Accent | `--od-accent` | `#2f6f5e` | Primary actions, selected states |
| Danger | `--od-danger` | `#b42318` | Errors and destructive states |
| Warning | `--od-warning` | `#b7791f` | Attention states |
| Success | `--od-success` | `#18794e` | Success and ready states |
| Focus | `--od-focus` | `#8fb8ff` | Keyboard focus ring |

## Typography

- Body: Inter, system UI fallback, 16px base, 1.55 line-height.
- Display: same family, weight 760, tight line-height.
- Labels: 12 to 13px, weight 700, uppercase only for table headers.
- Avoid viewport-scaled body type. Use clamp only for top-level titles.

## Layout

- App shells use a sidebar plus main content on desktop and a stacked sticky
  header on mobile.
- Panel radius: 8 to 10px.
- Control radius: 8px.
- Grid gap: 12 to 18px.
- Dense tables use 14px vertical cell padding and stable minimum widths.

## Components

- Button: default, primary, disabled, focus.
- Segmented control: pressed state with stable control height.
- Metric: label, value, trend, fixed minimum height.
- Panel: header plus body, no nested card shells.
- Table row: selected, hover, status pill.
- State box: loading, empty, error.

## Interaction States

Every interactive component needs visible hover and focus states. Destructive or
blocked actions should show disabled state with nearby context. Loading states
should preserve layout dimensions.

## Accessibility

- Use semantic headings and landmarks.
- Keep focus rings visible.
- Do not rely only on color to communicate status.
- Keep touch targets at least 38px high in compact UI.

## Agent Guidance

Use this system as a fallback baseline. If the host repository includes a
current `DESIGN.md`, token file, component library, or screenshot truth, prefer
that source and document deviations in the handoff.

## Bundle Metadata

- `manifest.json` follows the Open Design design-system bundle shape for local
  compatibility, but it is not daemon registration.
- `source/provenance.json` records bundled sources, runtime exclusions, and
  validation gaps.
- `components.manifest.json` is the compact component-state inventory for
  coding agents.
- `preview/index.html` and `ui_kits/app/index.html` are optional visual
  references for source-level or browser screenshot checks.
