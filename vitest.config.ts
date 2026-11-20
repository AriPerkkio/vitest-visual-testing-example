import { defineConfig, mergeConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // On CI, also emit the HTML report (written to .vitest/index.html, together with
      // screenshot diffs as attachments) and GitHub annotations for failed tests.
      reporters: process.env.CI ? ["default", "github-actions", "html"] : ["default"],
      setupFiles: ["./src/test/setup.ts"],
      coverage: {
        enabled: true,
      },
      browser: {
        enabled: true,
        headless: true,
        provider: playwright(),
        instances: [{ browser: "chromium" }],
        // A fixed viewport keeps full-page screenshots stable.
        viewport: { width: 1280, height: 1200 },
        expect: {
          toMatchScreenshot: {
            comparatorName: "pixelmatch",
            comparatorOptions: {
              // Per-pixel color distance (0–1). Lower is stricter.
              threshold: 0.1,
              // Fail if even a handful of pixels differ. Loosen this (e.g. 0.001)
              // if you see anti-aliasing noise across machines.
              allowedMismatchedPixels: 10,
            },
          },
        },
      },
    },
  }),
);
