import { describe, expect, test } from "vitest";
import { buildReport } from "../mocks/data";
import { renderThemed, themes } from "../test/utils";
import { WeatherDetails } from "./WeatherDetails";

describe.each(themes)("WeatherDetails (%s)", (theme) => {
  test("stat tiles", async () => {
    const { current } = buildReport("reykjavik", "metric")!;
    const { frame } = await renderThemed(
      <WeatherDetails current={current} units="metric" />,
      theme,
      { width: 560 },
    );
    await expect(frame).toMatchAndAttachScreenshot(`weather-details-${theme}`);
  });
});
