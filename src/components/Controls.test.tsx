import { useState } from "preact/hooks";
import { describe, expect, test } from "vitest";
import type { Units } from "../api/types";
import { renderThemed, themes } from "../test/utils";
import { ThemeToggle } from "./ThemeToggle";
import { UnitToggle } from "./UnitToggle";

function StatefulUnitToggle() {
  const [units, setUnits] = useState<Units>("metric");
  return <UnitToggle units={units} onChange={setUnits} />;
}

describe.each(themes)("controls (%s)", (theme) => {
  test("UnitToggle switches the active segment", async () => {
    const { screen, frame } = await renderThemed(<StatefulUnitToggle />, theme, { width: 160 });
    await expect(frame).toMatchAndAttachScreenshot(`unit-toggle-metric-${theme}`);

    await screen.getByRole("radio", { name: "°F" }).click();
    await expect.element(screen.getByRole("radio", { name: "°F" })).toBeChecked();
    await expect(frame).toMatchAndAttachScreenshot(`unit-toggle-imperial-${theme}`);
  });

  test("ThemeToggle shows the icon for the current theme", async () => {
    const { frame } = await renderThemed(<ThemeToggle theme={theme} onToggle={() => {}} />, theme, {
      width: 100,
    });
    await expect(frame).toMatchAndAttachScreenshot(`theme-toggle-${theme}`);
  });
});
