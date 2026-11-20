import { afterAll, afterEach, beforeAll } from "vitest";
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

afterEach(() => {
  // Drop per-test overrides added via `worker.use(...)`.
  worker.resetHandlers();
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

afterAll(() => {
  worker.stop();
});
