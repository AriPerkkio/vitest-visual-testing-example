import { http, HttpResponse } from "msw/http";
import { describe, expect, test, vi } from "vitest";
import { worker } from "../mocks/browser";
import { renderThemed, themes } from "../test/utils";
import { CitySearch } from "./CitySearch";

describe.each(themes)("CitySearch (%s)", (theme) => {
  test("empty", async () => {
    const { frame } = await renderThemed(<CitySearch onSelect={() => {}} />, theme, { width: 440 });
    await expect(frame).toMatchAndAttachScreenshot(`city-search-empty-${theme}`);
  });

  test("shows results from the API", async () => {
    const onSelect = vi.fn();
    const { screen, frame } = await renderThemed(
      // Leave room below the input for the absolutely-positioned dropdown.
      <div style={{ height: "220px" }}>
        <CitySearch onSelect={onSelect} />
      </div>,
      theme,
      { width: 440 },
    );

    await screen.getByRole("searchbox").fill("l");
    // "l" matches Helsinki, Lisbon and London (served by the MSW handler)
    await expect.element(screen.getByRole("option")).toHaveLength(3);
    await expect(frame).toMatchAndAttachScreenshot(`city-search-results-${theme}`);

    await screen.getByRole("button", { name: /Lisbon/ }).click();
    expect(onSelect).toHaveBeenCalledWith({ id: "lisbon", name: "Lisbon", country: "PT" });
  });

  test("no results", async () => {
    worker.use(http.get("/api/cities", () => HttpResponse.json([])));

    const { screen, frame } = await renderThemed(
      <div style={{ height: "120px" }}>
        <CitySearch onSelect={() => {}} />
      </div>,
      theme,
      { width: 440 },
    );
    await screen.getByRole("searchbox").fill("atlantis");
    await expect.element(screen.getByText("No cities found")).toBeVisible();
    await expect(frame).toMatchAndAttachScreenshot(`city-search-no-results-${theme}`);
  });
});
