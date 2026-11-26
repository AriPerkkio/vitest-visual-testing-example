import { expect } from "vitest";
import { commands, page, type Locator } from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    /** See scripts/write-snapshot-command.ts */
    writeSnapshot: (
      name: string,
      base64: string,
      theme: "light" | "dark" | undefined,
    ) => Promise<boolean>;
    /** See scripts/reset-mouse-command.ts */
    resetMouse: () => Promise<void>;
  }
}

declare module "vitest" {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    /**
     * Captures a screenshot of the element into `.vitest/sentry/__screenshots__/`.
     * CI uploads that directory to Sentry, which diffs it against the base commit
     * and reports the result as a PR check.
     *
     * Locally, when `pnpm vrt:baseline` has written a baseline image for this
     * screenshot, it's also compared with `toMatchScreenshot()` and fails on a
     * difference. Screenshots without a baseline image are only captured.
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

    const hasBaseline = await commands.writeSnapshot(name, base64, theme);
    await task.context.annotate(name, "screenshot", {
      body: base64,
      contentType: "image/png",
    });

    if (hasBaseline) {
      // References resolve to .vitest/sentry/baseline/, see vitest.config.ts.
      // On a mismatch this throws and attaches reference/actual/diff images.
      await expect.element(locator).toMatchScreenshot(name);
    }

    return { pass: true, message: () => "" };
  },
});

/**
 * Takes screenshots until two in a row are identical, like `toMatchScreenshot()`
 * does. Without it, a half-rendered frame would show up in Sentry as a flaky diff.
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
