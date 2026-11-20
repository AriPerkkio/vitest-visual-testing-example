import { expect } from "vitest";
import { server, type Locator } from "vitest/browser";

type ScreenshotOptions = Parameters<ReturnType<typeof expect.element>["toMatchScreenshot"]>[1];

declare module "vitest" {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    /**
     * Same as `toMatchScreenshot(name)`, but after a passing comparison it also
     * attaches the reference image to the test, so Vitest's HTML report shows
     * every screenshot, not only failed ones.
     *
     * Use it with plain `expect(locator)`, **not** `expect.element(locator)`.
     * The matcher already polls for the element internally. Wrapping it in
     * `expect.element()` would run it inside the polling loop, which:
     * - drops the test file from the stack, so the annotation loses its location
     *   and doesn't show up in the report's Code tab;
     * - retries a failing comparison until the timeout (only the built-in
     *   `toMatchScreenshot` name is exempt from that).
     */
    toMatchAndAttachScreenshot: (name: string, options?: ScreenshotOptions) => Promise<void>;
  }
}

expect.extend({
  async toMatchAndAttachScreenshot(actual: unknown, name: string, options?: ScreenshotOptions) {
    if (this.isNot) {
      throw new Error("toMatchAndAttachScreenshot cannot be used with .not");
    }
    const { task } = this;
    if (!task) {
      throw new Error("toMatchAndAttachScreenshot can only be used inside a test");
    }

    // Delegate to the built-in matcher through `expect.element()`, so the element
    // is polled for until it appears. The built-in `toMatchScreenshot` is exempt
    // from poll retries; it handles screenshot stability itself. Throws (and
    // attaches reference/actual/diff images) when the comparison fails.
    await expect.element(actual as Locator).toMatchScreenshot(name, options);

    // Mirrors Vitest's default `resolveScreenshotPath`:
    // <test dir>/__screenshots__/<test file>/<name>-<browser>-<platform>.png
    const testPath = this.testPath ?? task.file.filepath;
    const separator = testPath.lastIndexOf("/");
    const dir = testPath.slice(0, separator);
    const file = testPath.slice(separator + 1);
    const reference = `${dir}/__screenshots__/${file}/${name}-${server.browser}-${server.platform}.png`;

    await task.context.annotate(name, "screenshot", {
      path: reference,
      contentType: "image/png",
    });

    return { pass: true, message: () => "" };
  },
});
