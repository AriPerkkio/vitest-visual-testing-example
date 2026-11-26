import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config.ts";
import { resetMouse } from "./scripts/reset-mouse-command.ts";
import { resolveBaselinePath, writeSnapshot } from "./scripts/write-snapshot-command.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // On CI, also emit the HTML report (written to .vitest/index.html, together with
      // every screenshot as an attachment) and GitHub annotations for failed tests.
      reporters: process.env.CI ? ["default", "github-actions", "html"] : ["default"],
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        enabled: true,
        provider: "istanbul",
      },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        // Baselines live in Sentry and only CI uploads, so every browser can
        // run on CI without committing references per OS.
        instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
        // A fixed viewport keeps full-page screenshots stable.
        viewport: { width: 1280, height: 1200 },
        // writeSnapshot: used by `toCaptureSnapshot()` to write .vitest/sentry/.
        // resetMouse: called after each test in src/test/setup.ts.
        commands: { writeSnapshot, resetMouse },
        expect: {
          // Only used locally, to compare against the baseline from `pnpm vrt:baseline`.
          toMatchScreenshot: {
            resolveScreenshotPath: resolveBaselinePath,
            comparatorName: "pixelmatch",
            comparatorOptions: {
              // Per-pixel color distance (0–1). Lower is stricter.
              threshold: 0.1,
              // Baseline and current run render on the same machine, so only a
              // handful of pixels may differ.
              allowedMismatchedPixels: 10,
            },
          },
        },
      },
    },
  }),
);
