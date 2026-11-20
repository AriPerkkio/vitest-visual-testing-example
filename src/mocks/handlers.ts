import { delay } from "msw";
import { http, HttpResponse } from "msw/http";
import { buildReport, cities } from "./data";

// Simulate network latency during development, but keep tests fast.
const latency = () => delay(import.meta.env.MODE === "test" ? 0 : 350);

export const handlers = [
  http.get("/api/cities", async ({ request }) => {
    await latency();

    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
    const matches = query
      ? cities.filter(
          (c) => c.name.toLowerCase().includes(query) || c.country.toLowerCase() === query,
        )
      : cities;

    return HttpResponse.json(matches);
  }),

  http.get("/api/weather/:cityId", async ({ params, request }) => {
    await latency();

    const units =
      new URL(request.url).searchParams.get("units") === "imperial" ? "imperial" : "metric";
    const report = buildReport(String(params.cityId), units);

    if (!report) {
      return HttpResponse.json(
        { message: `No weather data for "${params.cityId}"` },
        { status: 404 },
      );
    }

    return HttpResponse.json(report);
  }),
];
