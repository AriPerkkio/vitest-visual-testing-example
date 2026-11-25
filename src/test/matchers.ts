import { expect } from "vitest";
import { commands, page, type Locator } from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    /** See scripts/write-snapshot-command.ts */
    writeSnapshot: (
      name: string,
      base64: string,
      theme: "light" | "dark" | undefined,
    ) => Promise<string>;
  }
}

declare module "vitest" {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    /**
     * Captures a screenshot of the element for Sentry Snapshots. It doesn't
     * compare anything: CI uploads the `snapshots/` directory and Sentry diffs it
     * against the base commit, then reports the result as a PR check.
     *
     * The screenshot is also attached to the test, so Vitest's HTML report shows it.
     *
     * A name ending in `-light` or `-dark` sets the canvas theme in Sentry's viewer.
     *
     * Use it with plain `expect(locator)`, **not** `expect.element(locator)`.
     * The matcher already waits for the element. Wrapping it in `expect.element()`
     * would retry the whole capture until the timeout, and drop the test file from
     * the stack, so the annotation would lose its location in the report.
     */
    toCaptureSnapshot: (name: string) => Promise<void>;
  }
}

/** Consecutive screenshots must be identical before one is accepted. */
const MAX_ATTEMPTS = 5;

expect.extend({
  async toCaptureSnapshot(actual: unknown, name: string) {
    if (this.isNot) {
      throw new Error("toCaptureSnapshot cannot be used with .not");
    }
    const { task } = this;
    if (!task) {
      throw new Error("toCaptureSnapshot can only be used inside a test");
    }

    const locator = actual as Locator;
    await expect.element(locator).toBeVisible();
    const base64 = await stableScreenshot(locator, name);
    const theme = name.match(/-(light|dark)$/)?.[1] as "light" | "dark" | undefined;

    await commands.writeSnapshot(name, base64, theme);
    await task.context.annotate(name, "screenshot", {
      body: base64,
      contentType: "image/png",
    });

    return { pass: true, message: () => "" };
  },
});

/**
 * Takes screenshots until two in a row are identical. `toMatchScreenshot()` did
 * this for us. Without it, a half-rendered frame would show up in Sentry as a
 * flaky diff.
 */
async function stableScreenshot(locator: Locator, name: string) {
  let previous = await page.screenshot({ element: locator, save: false });
  for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt++) {
    const current = await page.screenshot({ element: locator, save: false });
    if (current === previous) {
      return current;
    }
    previous = current;
  }
  throw new Error(`Screenshot "${name}" kept changing after ${MAX_ATTEMPTS} attempts`);
}
