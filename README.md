# Skycast: Vitest visual regression playground

> Highly 🤖-generated source code

A small Preact + TypeScript weather dashboard with [Vitest browser mode visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing).

- **Preact 11 + TypeScript 7**, built with **Vite 8**
- **Light and dark mode.** Theme tokens are CSS custom properties keyed on `[data-theme]`.
- **No real backend.** Every `/api/*` request is answered by **MSW 3**, in dev and in tests.
- **Vitest 5 browser mode** (Playwright/Chromium) with `toMatchScreenshot()`, run on each component in both themes, plus full-page app flows

## Getting started

```sh
pnpm install
pnpm exec playwright install chromium

pnpm dev            # app at http://localhost:5173, API mocked by MSW
pnpm test           # watch mode
pnpm test --run     # single run
pnpm test:update    # accept new/changed screenshots
```
