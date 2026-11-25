import { afterEach, beforeAll } from "vitest";
import { commands } from "vitest/browser";
import { worker } from "../mocks/browser";
import "../styles.css";
import "./matchers";

// Animations and transitions make screenshots flaky — turn them off for every test.
const noMotion = document.createElement("style");
noMotion.textContent = `*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}`;
document.head.append(noMotion);

beforeAll(async () => {
  await worker.start({
    quiet: true,
    onUnhandledFrame({ frame, defaults }) {
      // Vite's own module requests also pass through the service worker; only
      // fail on API calls that have no handler.
      const request =
        frame.protocol === "http" ? (frame.data as { request: Request }).request : undefined;
      if (request && new URL(request.url).pathname.startsWith("/api/")) {
        defaults.error();
      }
    },
  });
});

afterEach(async () => {
  // Don't let the pointer position of this test hover elements in the next one.
  await commands.resetMouse();
  // Drop per-test overrides added via `worker.use(...)`.
  worker.resetHandlers();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

// No `worker.stop()` in `afterAll`. Stopping tells the service worker that this
// page is gone, and when it was the last page, the worker unregisters itself.
// The next test file then registers it again, and in Firefox that page's
// requests can bypass the worker and reach Vite instead. MSW still releases the
// page when Vitest removes the test file's iframe.
