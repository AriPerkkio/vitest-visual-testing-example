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
pnpm test --run     # single run, writes screenshots to snapshots/
```

## Visual regression testing with Sentry

Tests capture screenshots with `toCaptureSnapshot(name)` (see `src/test/matchers.ts`). It doesn't compare anything. It writes `snapshots/<browser>/<test file>/<name>.png` plus a `.json` file with metadata for Sentry.

CI uploads `snapshots/` with `sentry-cli snapshots upload`:

- **Push to `main`:** the upload becomes the baseline for PRs branched from that commit.
- **Pull request:** Sentry compares the upload with the baseline of the PR's merge-base and adds a **Snapshot Testing** check. Review the changes in Sentry and approve them there or on the check. There's nothing to commit.

Fork PRs don't get the `SENTRY_AUTH_TOKEN` secret, so they skip the upload. Their screenshots are still in the HTML report artifact.

### Setup

1. Create a Sentry project and an auth token with `project:write` (or an org token with `org:ci`).
2. In GitHub, add the repository secret `SENTRY_AUTH_TOKEN` and the variables `SENTRY_ORG` and `SENTRY_PROJECT`.
3. Install the Sentry GitHub App with **Checks** and **Pull requests** read/write and subscribe it to **Check run** events. Sentry needs it to post the status check.

### Comparing locally (experimental)

Local renders differ from CI's Linux container, so compare a local run against a local baseline:

```sh
git stash && pnpm test --run && mv snapshots snapshots-base && git stash pop
pnpm test --run
pnpm exec sentry-cli snapshots diff snapshots-base snapshots   # diff masks go to diff-output/
```
