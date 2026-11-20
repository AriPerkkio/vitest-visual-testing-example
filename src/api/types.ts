export type Units = "metric" | "imperial";

export type Condition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "fog";

export interface City {
  id: string;
  name: string;
  country: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: Condition;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  uvIndex: number;
}

export interface HourlyPoint {
  /** ISO 8601 timestamp (UTC) */
  time: string;
  temperature: number;
}

export interface DailyForecast {
  /** ISO 8601 date (UTC) */
  date: string;
  condition: Condition;
  high: number;
  low: number;
  precipitationChance: number;
}

export interface WeatherReport {
  city: City;
  units: Units;
  /** ISO 8601 timestamp (UTC) */
  updatedAt: string;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyForecast[];
}
