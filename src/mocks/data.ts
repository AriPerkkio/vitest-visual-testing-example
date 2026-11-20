import type { City, Condition, DailyForecast, HourlyPoint, WeatherReport } from "../api/types";

/**
 * Fixed fixture data. Everything is deterministic (no Date.now(), no Math.random())
 * so that visual snapshots stay stable between runs.
 */
export const cities: City[] = [
  { id: "helsinki", name: "Helsinki", country: "FI" },
  { id: "lisbon", name: "Lisbon", country: "PT" },
  { id: "tokyo", name: "Tokyo", country: "JP" },
  { id: "reykjavik", name: "Reykjavík", country: "IS" },
  { id: "cairo", name: "Cairo", country: "EG" },
  { id: "london", name: "London", country: "GB" },
];

interface Seed {
  current: Omit<WeatherReport["current"], "temperature" | "feelsLike" | "windSpeed"> & {
    temperature: number;
    feelsLike: number;
    windSpeed: number;
  };
  hourly: number[];
  daily: Array<[Condition, number, number, number]>;
}

// All temperatures in °C, wind in m/s.
const seeds: Record<string, Seed> = {
  helsinki: {
    current: {
      temperature: -3,
      feelsLike: -8,
      condition: "snow",
      description: "Light snow",
      humidity: 86,
      windSpeed: 5.2,
      pressure: 1008,
      uvIndex: 0,
    },
    hourly: [
      -5, -5, -6, -6, -6, -5, -5, -4, -4, -3, -2, -1, -1, 0, 0, -1, -2, -3, -3, -4, -4, -5, -5, -5,
    ],
    daily: [
      ["snow", -1, -6, 80],
      ["cloudy", 0, -4, 30],
      ["partly-cloudy", 1, -3, 10],
      ["clear", -2, -9, 0],
      ["clear", -4, -11, 0],
      ["snow", -2, -7, 70],
      ["cloudy", 0, -3, 40],
    ],
  },
  lisbon: {
    current: {
      temperature: 18,
      feelsLike: 17,
      condition: "partly-cloudy",
      description: "Partly cloudy",
      humidity: 64,
      windSpeed: 3.4,
      pressure: 1019,
      uvIndex: 3,
    },
    hourly: [
      13, 12, 12, 11, 11, 12, 13, 14, 16, 17, 18, 19, 19, 20, 20, 19, 18, 17, 16, 15, 15, 14, 14,
      13,
    ],
    daily: [
      ["partly-cloudy", 20, 12, 10],
      ["clear", 21, 13, 0],
      ["clear", 22, 13, 0],
      ["rain", 17, 12, 75],
      ["rain", 16, 11, 85],
      ["cloudy", 18, 12, 30],
      ["clear", 20, 12, 5],
    ],
  },
  tokyo: {
    current: {
      temperature: 14,
      feelsLike: 12,
      condition: "rain",
      description: "Moderate rain",
      humidity: 91,
      windSpeed: 6.8,
      pressure: 1003,
      uvIndex: 1,
    },
    hourly: [
      11, 11, 10, 10, 10, 11, 11, 12, 13, 14, 14, 15, 15, 15, 14, 14, 13, 13, 12, 12, 12, 11, 11,
      11,
    ],
    daily: [
      ["rain", 15, 10, 90],
      ["thunderstorm", 16, 11, 95],
      ["cloudy", 15, 9, 40],
      ["partly-cloudy", 17, 9, 10],
      ["clear", 18, 10, 0],
      ["clear", 17, 10, 0],
      ["partly-cloudy", 16, 9, 20],
    ],
  },
  reykjavik: {
    current: {
      temperature: 1,
      feelsLike: -5,
      condition: "fog",
      description: "Freezing fog",
      humidity: 97,
      windSpeed: 11.3,
      pressure: 991,
      uvIndex: 0,
    },
    hourly: [0, 0, -1, -1, -1, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, -1, -1, -1, 0],
    daily: [
      ["fog", 2, -1, 40],
      ["snow", 1, -3, 70],
      ["snow", 0, -4, 80],
      ["cloudy", 2, -2, 30],
      ["rain", 4, 0, 60],
      ["cloudy", 3, 0, 30],
      ["partly-cloudy", 2, -2, 20],
    ],
  },
  cairo: {
    current: {
      temperature: 27,
      feelsLike: 28,
      condition: "clear",
      description: "Clear sky",
      humidity: 32,
      windSpeed: 2.1,
      pressure: 1015,
      uvIndex: 7,
    },
    hourly: [
      18, 17, 17, 16, 16, 17, 19, 21, 23, 25, 26, 27, 28, 28, 28, 27, 26, 24, 22, 21, 20, 19, 19,
      18,
    ],
    daily: [
      ["clear", 28, 17, 0],
      ["clear", 29, 17, 0],
      ["clear", 30, 18, 0],
      ["partly-cloudy", 28, 18, 0],
      ["clear", 27, 16, 0],
      ["clear", 28, 16, 0],
      ["clear", 29, 17, 0],
    ],
  },
  london: {
    current: {
      temperature: 9,
      feelsLike: 6,
      condition: "cloudy",
      description: "Overcast",
      humidity: 81,
      windSpeed: 4.6,
      pressure: 1011,
      uvIndex: 1,
    },
    hourly: [7, 7, 6, 6, 6, 6, 7, 7, 8, 8, 9, 10, 10, 10, 10, 9, 9, 8, 8, 8, 7, 7, 7, 7],
    daily: [
      ["cloudy", 10, 6, 30],
      ["rain", 11, 7, 70],
      ["rain", 10, 6, 80],
      ["partly-cloudy", 9, 4, 20],
      ["clear", 8, 2, 0],
      ["fog", 8, 3, 10],
      ["cloudy", 10, 5, 40],
    ],
  },
};

const BASE_DATE = Date.UTC(2026, 10, 20); // 20 Nov 2026, 00:00 UTC
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const toF = (c: number) => Math.round((c * 9) / 5 + 32);
const toMph = (ms: number) => Math.round(ms * 2.237 * 10) / 10;

export function buildReport(
  cityId: string,
  units: "metric" | "imperial",
): WeatherReport | undefined {
  const city = cities.find((c) => c.id === cityId);
  const seed = seeds[cityId];
  if (!city || !seed) return undefined;

  const imperial = units === "imperial";
  const t = (c: number) => (imperial ? toF(c) : c);

  const hourly: HourlyPoint[] = seed.hourly.map((temperature, i) => ({
    time: new Date(BASE_DATE + i * HOUR).toISOString(),
    temperature: t(temperature),
  }));

  const daily: DailyForecast[] = seed.daily.map(
    ([condition, high, low, precipitationChance], i) => ({
      date: new Date(BASE_DATE + i * DAY).toISOString().slice(0, 10),
      condition,
      high: t(high),
      low: t(low),
      precipitationChance,
    }),
  );

  return {
    city,
    units,
    updatedAt: new Date(BASE_DATE + 10 * HOUR + 30 * 60 * 1000).toISOString(),
    current: {
      ...seed.current,
      temperature: t(seed.current.temperature),
      feelsLike: t(seed.current.feelsLike),
      windSpeed: imperial ? toMph(seed.current.windSpeed) : seed.current.windSpeed,
    },
    hourly,
    daily,
  };
}
