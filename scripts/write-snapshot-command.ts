import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type { BrowserCommand } from "vitest/node";

/**
 * Screenshots of the current run, plus a `.json` sidecar per image.
 * CI uploads this directory to Sentry with `sentry-cli snapshots upload`.
 */
export const SCREENSHOTS_DIR = ".vitest/sentry/__screenshots__";

/**
 * Local baseline written by `pnpm vrt:baseline`. When it has an image for a
 * screenshot, `toCaptureSnapshot()` compares against it. CI never has one.
 */
export const BASELINE_DIR = ".vitest/sentry/baseline";

/** `<dir>/<browser>/<test file>/<name>.png`, e.g. `chromium/src/App.test.tsx/app-cairo-dark.png` */
export function screenshotPath(
  root: string,
  dir: string,
  browser: string,
  testFile: string,
  name: string,
) {
  return resolve(root, dir, browser, testFile, `${name}.png`);
}

/**
 * Browser command behind `toCaptureSnapshot()`. Runs in Node, so it can write
 * outside the test file's directory.
 *
 * Sentry identifies each snapshot by its path, so keep names stable: renaming
 * one shows up as a removal plus an addition.
 *
 * @returns whether the test should compare against the local baseline
 */
export const writeSnapshot: BrowserCommand<
  [name: string, base64: string, theme: "light" | "dark" | undefined]
> = async (ctx, name, base64, theme) => {
  if (!ctx.testPath) {
    throw new Error("writeSnapshot can only be called from a test file");
  }
  const root = ctx.project.config.root;
  const browser = ctx.project.config.browser.name;
  const testFile = relative(root, ctx.testPath);
  const image = Buffer.from(base64, "base64");

  // Optional metadata Sentry shows in its UI.
  // See https://docs.sentry.io/product/snapshots/uploading-snapshots/
  const metadata = {
    display_name: name,
    group: testFile,
    tags: { browser, ...(theme && { theme }) },
    ...(theme && { canvas_theme: theme }),
  };

  const screenshot = screenshotPath(root, SCREENSHOTS_DIR, browser, testFile, name);
  await mkdir(dirname(screenshot), { recursive: true });
  await writeFile(screenshot, image);
  await writeFile(screenshot.replace(/\.png$/, ".json"), `${JSON.stringify(metadata, null, 2)}\n`);

  const baseline = screenshotPath(root, BASELINE_DIR, browser, testFile, name);
  if (process.env.VRT_BASELINE) {
    await mkdir(dirname(baseline), { recursive: true });
    await writeFile(baseline, image);
    return false;
  }
  return existsSync(baseline);
};

/** `toMatchScreenshot()` reads its references from the local baseline. */
export function resolveBaselinePath(data: {
  root: string;
  browserName: string;
  testFileDirectory: string;
  testFileName: string;
  arg: string;
}) {
  return screenshotPath(
    data.root,
    BASELINE_DIR,
    data.browserName,
    join(data.testFileDirectory, data.testFileName),
    data.arg,
  );
}
