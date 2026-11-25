import type { BrowserCommand } from "vitest/node";

/**
 * Moves the mouse to the top-left corner of the test runner page, outside the
 * test iframe. Otherwise the pointer stays where the previous test clicked, and
 * whatever renders under it in the next test gets a :hover style. Whether the
 * browser applies it depends on timing, so screenshots would be flaky.
 */
export const resetMouse: BrowserCommand<[]> = async (ctx) => {
  await ctx.page.mouse.move(0, 0);
};
