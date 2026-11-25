import { describe, expect, test } from "vitest";
import { buildReport } from "../mocks/data";
import { renderThemed, themes } from "../test/utils";
import { CurrentConditions } from "./CurrentConditions";

// Each city has a different condition, which changes the card's gradient and icon.
const cases = ["helsinki", "cairo", "tokyo"] as const;

describe.each(themes)("CurrentConditions (%s)", (theme) => {
  test.each(cases)("%s", async (cityId) => {
    const report = buildReport(cityId, "metric")!;
    const { frame } = await renderThemed(
      <CurrentConditions
        city={report.city}
        current={report.current}
        units="metric"
        updatedAt={report.updatedAt}
      />,
      theme,
      { width: 420 },
    );
    await expect(frame).toCaptureSnapshot(`current-${cityId}-${theme}`);
  });

  test("imperial units", async () => {
    const report = buildReport("lisbon", "imperial")!;
    const { frame } = await renderThemed(
      <CurrentConditions
        city={report.city}
        current={report.current}
        units="imperial"
        updatedAt={report.updatedAt}
      />,
      theme,
      { width: 420 },
    );
    await expect(frame).toCaptureSnapshot(`current-lisbon-imperial-${theme}`);
  });
});
