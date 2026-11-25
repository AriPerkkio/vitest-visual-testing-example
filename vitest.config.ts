import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config.ts";
import { writeSnapshot } from "./scripts/write-snapshot-command.ts";

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
        // Used by `toCaptureSnapshot()` to write snapshots/ for Sentry.
        commands: { writeSnapshot },
      },
    },
  }),
);
