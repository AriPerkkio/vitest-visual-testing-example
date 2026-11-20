import { render } from "preact";
import { App } from "./App";
import "./styles.css";

async function enableMocking() {
  // There is no real backend: MSW intercepts /api/* requests in the browser.
  // In a real project you'd guard this with `import.meta.env.DEV`; here we
  // keep it on for `vite preview` too, since the API doesn't exist.
  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledFrame: "bypass" });
}

enableMocking().then(() => {
  render(<App />, document.getElementById("app")!);
});
