import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { msw } from "msw/vite";

export default defineConfig({
  plugins: [
    preact(),
    // Serves /mockServiceWorker.js in dev (and in Vitest browser mode),
    // so there's no need to run `msw init` and commit the worker script.
    msw({ mode: "worker-only" }),
  ],
});
