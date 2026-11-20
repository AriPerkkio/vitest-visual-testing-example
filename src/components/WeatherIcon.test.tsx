import { describe, expect, test } from "vitest";
import type { Condition } from "../api/types";
import { renderThemed, themes } from "../test/utils";
import { WeatherIcon } from "./WeatherIcon";

const conditions: Condition[] = [
  "clear",
  "partly-cloudy",
  "cloudy",
  "rain",
  "thunderstorm",
  "snow",
  "fog",
];

describe.each(themes)("WeatherIcon (%s)", (theme) => {
  test("all conditions", async () => {
    const { frame } = await renderThemed(
      <div style={{ display: "flex", gap: "12px" }}>
        {conditions.map((c) => (
          <WeatherIcon key={c} condition={c} size={56} />
        ))}
      </div>,
      theme,
      { width: 520 },
    );
    await expect.element(frame).toMatchScreenshot(`weather-icons-${theme}`);
  });
});
