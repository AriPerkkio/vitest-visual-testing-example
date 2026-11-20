import type { City, Units, WeatherReport } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(response.status, body?.message ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  return request(`/api/cities?q=${encodeURIComponent(query)}`, signal);
}

export function getWeather(
  cityId: string,
  units: Units,
  signal?: AbortSignal,
): Promise<WeatherReport> {
  return request(`/api/weather/${encodeURIComponent(cityId)}?units=${units}`, signal);
}
