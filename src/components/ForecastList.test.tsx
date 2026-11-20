import { describe, expect, test } from "vitest";
import { buildReport } from "../mocks/data";
import { renderThemed, themes } from "../test/utils";
import { ForecastList } from "./ForecastList";

describe.each(themes)("ForecastList (%s)", (theme) => {
  test("7 days", async () => {
    const { daily } = buildReport("tokyo", "metric")!;
    const { frame } = await renderThemed(<ForecastList days={daily} />, theme, { width: 640 });
    await expect(frame).toMatchAndAttachScreenshot(`forecast-${theme}`);
  });
});
