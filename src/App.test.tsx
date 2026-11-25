import { http, HttpResponse } from "msw/http";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-preact";
import { App } from "./App";
import { worker } from "./mocks/browser";
import { themes } from "./test/utils";

/**
 * Full-page tests. The App fetches real HTTP requests that MSW answers,
 * so these exercise the whole stack: fetch → mock API → state → render.
 */
describe.each(themes)("App (%s)", (theme) => {
  test("dashboard", async () => {
    const screen = await render(<App initialTheme={theme} />);
    await expect.element(screen.getByRole("heading", { name: /Helsinki/ })).toBeVisible();
    await expect(page.elementLocator(screen.container)).toCaptureSnapshot(`app-helsinki-${theme}`);
  });

  test("switching units refetches in °F", async () => {
    const screen = await render(<App initialCityId="lisbon" initialTheme={theme} />);
    await expect.element(screen.getByRole("heading", { name: /Lisbon/ })).toBeVisible();

    await screen.getByRole("radio", { name: "°F" }).click();
    await expect.element(screen.getByText("Next 24 hours (°F)")).toBeVisible();
    await expect(page.elementLocator(screen.container)).toCaptureSnapshot(
      `app-lisbon-imperial-${theme}`,
    );
  });

  test("selecting a city from search", async () => {
    const screen = await render(<App initialTheme={theme} />);
    await expect.element(screen.getByRole("heading", { name: /Helsinki/ })).toBeVisible();

    await screen.getByRole("searchbox").fill("cai");
    await screen.getByRole("button", { name: /Cairo/ }).click();
    await expect.element(screen.getByRole("heading", { name: /Cairo/ })).toBeVisible();
    await expect(page.elementLocator(screen.container)).toCaptureSnapshot(`app-cairo-${theme}`);
  });

  test("server error", async () => {
    worker.use(
      http.get("/api/weather/:cityId", () =>
        HttpResponse.json(
          { message: "The weather service is temporarily unavailable." },
          { status: 503 },
        ),
      ),
    );
    const screen = await render(<App initialTheme={theme} />);
    await expect.element(screen.getByRole("alert")).toBeVisible();
    await expect(page.elementLocator(screen.container)).toCaptureSnapshot(`app-error-${theme}`);
  });

  test("theme toggle", async () => {
    const screen = await render(<App initialTheme={theme} />);
    await expect.element(screen.getByRole("heading", { name: /Helsinki/ })).toBeVisible();

    const other = theme === "light" ? "dark" : "light";
    await screen.getByRole("button", { name: `Switch to ${other} mode` }).click();
    await expect.poll(() => document.documentElement.dataset.theme).toBe(other);
  });
});
