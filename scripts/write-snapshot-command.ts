import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import type { BrowserCommand } from "vitest/node";

/** Directory that `sentry-cli snapshots upload` uploads. Relative to the project root. */
export const SNAPSHOT_DIR = "snapshots";

/**
 * Browser command behind `toCaptureSnapshot()`. Runs in Node, so it can write
 * outside the test file's directory.
 *
 * Writes `snapshots/<browser>/<test file>/<name>.png` and a `.json` sidecar.
 * Sentry identifies each snapshot by its path, so keep names stable: renaming
 * one shows up as a removal plus an addition.
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
  const base = resolve(root, SNAPSHOT_DIR, browser, testFile, name);

  // Optional metadata Sentry shows in its UI.
  // See https://docs.sentry.io/product/snapshots/uploading-snapshots/
  const metadata = {
    display_name: name,
    group: testFile,
    tags: { browser, ...(theme && { theme }) },
    ...(theme && { canvas_theme: theme }),
  };

  await mkdir(dirname(base), { recursive: true });
  await writeFile(`${base}.png`, Buffer.from(base64, "base64"));
  await writeFile(`${base}.json`, `${JSON.stringify(metadata, null, 2)}\n`);
  return `${base}.png`;
};
