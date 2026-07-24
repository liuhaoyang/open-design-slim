# Optional Visual QA Recipe

Use this recipe when a browser or Playwright-style screenshot tool is available.
It is optional: `open-design-slim` must still work in source-only remote
workspaces. If you cannot run it, say so in the handoff and downgrade the claim
to source-level validation only.

## Static HTML Or Deck

1. Open the generated `index.html` directly in a browser, or serve the output
   directory with any local static-file command owned by the host repository.
2. Capture or inspect these viewport sizes when practical:
   - `390x844`
   - `768x1024`
   - `1280x720`
   - `1440x900`
3. Check that the first viewport identifies the product or report topic,
   controls have visible focus, no text overlaps, and mobile layout is
   deliberately reflowed rather than squeezed.
4. For decks, click previous and next controls and confirm the first and last
   endpoints are disabled.

## Playwright-Style Smoke

This is a portable sketch, not a required test harness:

```js
import { chromium } from "playwright";

const fileUrl = `file://${process.cwd()}/prototype/index.html`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(fileUrl);
await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
await browser.close();
```

## Handoff Language

When visual QA ran:

```md
Browser or screenshot checks: inspected 390x844 and 1440x900; no overlap found;
deck endpoints disabled.
```

When visual QA did not run:

```md
Browser or screenshot checks: not run. Validation is limited to source-level
helper checks and manual contract review; visual fidelity remains a follow-up.
```

Do not claim full Open Design runtime parity, live preview bridge behavior, or
desktop renderer equivalence from this recipe.
