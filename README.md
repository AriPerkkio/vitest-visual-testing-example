# Skycast: Vitest visual regression playground

> Highly 🤖-generated source code

[Vitest HTML report hosted at Github Pages](https://ariperkkio.github.io/vitest-visual-testing-example/)

A small Preact + TypeScript weather dashboard with [Vitest browser mode visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing).

- **Preact 11 + TypeScript 7**, built with **Vite 8**
- **Light and dark mode.** Theme tokens are CSS custom properties keyed on `[data-theme]`.
- **No real backend.** Every `/api/*` request is answered by **MSW 3**, in dev and in tests.
- **Vitest 5 browser mode** (Playwright: Chromium, Firefox, WebKit) screenshots each component in both themes, plus full-page app flows
- **[Sentry Snapshots](https://docs.sentry.io/product/snapshots/)** keeps the baselines and does the diffing. No reference images are committed.

## Getting started

```sh
pnpm install
pnpm exec playwright install chromium firefox webkit

pnpm dev            # app at http://localhost:5173, API mocked by MSW
pnpm test           # watch mode
pnpm test --run     # single run
pnpm vrt:baseline   # save the current screenshots as the local baseline
```

## Visual regression testing with Sentry

Tests capture screenshots with `toCaptureSnapshot(name)` (see `src/test/matchers.ts`). Every run writes them to `.vitest/sentry/__screenshots__/<browser>/<test file>/<name>.png`, plus a `.json` file with metadata for Sentry. Nothing is committed: `.vitest/` is gitignored.

CI uploads that directory with `sentry-cli snapshots upload`, and CI's screenshots are the source of truth:

- **Push to `main`:** the upload becomes the baseline for PRs branched from that commit.
- **Pull request:** Sentry compares the upload with the baseline of the PR's merge-base and adds a **Snapshot Testing** check. Review the changes in Sentry and approve them there or on the check. There's nothing to commit.

Fork PRs don't get the `SENTRY_AUTH_TOKEN` secret, so they skip the upload. Their screenshots are still in the HTML report artifact.

### Local workflow

Your machine renders differently from CI's Linux container, so locally you compare against a baseline rendered on your own machine:

```sh
git switch main
pnpm vrt:baseline        # writes .vitest/sentry/baseline/

git switch my-feature
pnpm test --run          # compares against the baseline
```

`pnpm vrt:baseline` doesn't touch git. It replaces `.vitest/sentry/baseline/` with the screenshots of whatever is checked out. After that, each `toCaptureSnapshot()` with a baseline image also runs `toMatchScreenshot()` against it and fails on a difference, with the reference, actual and diff images in the report (`pnpm test --ui` shows them too). Screenshots without a baseline image, like new ones, are only captured. CI never has a baseline, so it only captures and uploads.

### Setup

1. Create a Sentry project and an auth token with `project:write` (or an org token with `org:ci`).
2. In GitHub, add the repository secrets `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` and `SENTRY_PROJECT`.
3. Install the Sentry GitHub App with **Checks** and **Pull requests** read/write and subscribe it to **Check run** events. Sentry needs it to post the status check.
