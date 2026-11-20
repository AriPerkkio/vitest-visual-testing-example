import { mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import type { Reporter, TestModule, Vitest } from "vitest/node";

export interface VisualFailure {
  test: string;
  file: string;
  message: string;
  /** Paths are relative to the output directory (the HTML report root). */
  images: Array<{ name: string; path: string }>;
}

/**
 * Writes the failed `toMatchScreenshot` comparisons of a run to
 * `<outputDir>/vrt-failures.json`, with their reference/actual/diff images.
 * CI uses it to post the images as a PR comment
 * (see .github/workflows/ci.yml and scripts/vrt-comment.mjs).
 *
 * Must run next to the `html` reporter: it reuses the images that reporter
 * copies into `<outputDir>/attachments`.
 */
export default class VisualFailuresReporter implements Reporter {
  private root = process.cwd();

  constructor(private options: { outputDir?: string } = {}) {}

  onInit(vitest: Vitest) {
    this.root = vitest.config.root;
  }

  onTestRunEnd(testModules: ReadonlyArray<TestModule>) {
    const outputDir = resolve(this.root, this.options.outputDir ?? ".vitest");
    const failures: VisualFailure[] = [];

    for (const testModule of testModules) {
      for (const test of testModule.children.allTests()) {
        for (const artifact of test.artifacts()) {
          if (artifact.type !== "internal:toMatchScreenshot") continue;

          failures.push({
            test: test.fullName,
            file: relative(this.root, testModule.moduleId),
            message: String((artifact as { message?: unknown }).message ?? ""),
            images: (artifact.attachments ?? []).flatMap((attachment) =>
              attachment.path
                ? [
                    {
                      name: (attachment as { name?: string }).name ?? "image",
                      path: relative(outputDir, attachment.path),
                    },
                  ]
                : [],
            ),
          });
        }
      }
    }

    mkdirSync(outputDir, { recursive: true });
    writeFileSync(resolve(outputDir, "vrt-failures.json"), JSON.stringify({ failures }, null, 2));
  }
}
