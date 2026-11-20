import type { ComponentChildren } from "preact";
import { page } from "vitest/browser";
import { render } from "vitest-browser-preact";
import type { Theme } from "../hooks/useTheme";

export const themes: Theme[] = ["light", "dark"];

interface Options {
  /** Fixed width keeps the screenshot dimensions stable. */
  width?: number;
}

/**
 * Renders `ui` inside a padded container that has its own `data-theme`.
 * Returns a locator for that container, which is what we screenshot —
 * so the captured image includes the themed background around the component.
 */
export async function renderThemed(
  ui: ComponentChildren,
  theme: Theme,
  { width = 480 }: Options = {},
) {
  const screen = await render(
    <div
      data-theme={theme}
      data-testid="theme-frame"
      style={{ width: `${width}px`, padding: "24px" }}
    >
      {ui}
    </div>,
  );
  return { screen, frame: page.getByTestId("theme-frame") };
}
