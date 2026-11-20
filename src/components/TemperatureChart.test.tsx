import { describe, expect, test } from "vitest";
import { buildReport } from "../mocks/data";
import { renderThemed, themes } from "../test/utils";
import { TemperatureChart } from "./TemperatureChart";

describe.each(themes)("TemperatureChart (%s)", (theme) => {
  test("24h curve", async () => {
    const { hourly } = buildReport("cairo", "metric")!;
    const { frame } = await renderThemed(
      <TemperatureChart points={hourly} units="metric" />,
      theme,
      { width: 720 },
    );
    await expect(frame).toMatchAndAttachScreenshot(`temperature-chart-${theme}`);
  });

  test("sub-zero temperatures", async () => {
    const { hourly } = buildReport("helsinki", "metric")!;
    const { frame } = await renderThemed(
      <TemperatureChart points={hourly} units="metric" />,
      theme,
      { width: 720 },
    );
    await expect(frame).toMatchAndAttachScreenshot(`temperature-chart-subzero-${theme}`);
  });
});
