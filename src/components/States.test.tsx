import { describe, expect, test } from "vitest";
import { renderThemed, themes } from "../test/utils";
import { ErrorState } from "./States";

describe.each(themes)("States (%s)", (theme) => {
  test("ErrorState", async () => {
    const { frame } = await renderThemed(
      <ErrorState message="Request failed with 503" onRetry={() => {}} />,
      theme,
      { width: 480 },
    );
    await expect(frame).toCaptureSnapshot(`error-state-${theme}`);
  });
});
