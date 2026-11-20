import type { Units } from "./api/types";

// Fixed locale + time zone so rendering (and therefore screenshots) is identical on every machine.
const LOCALE = "en-US";
const TIME_ZONE = "UTC";

export const unitSymbol = (units: Units) => (units === "metric" ? "°C" : "°F");
export const windUnit = (units: Units) => (units === "metric" ? "m/s" : "mph");

export const formatTemp = (value: number) => `${Math.round(value)}°`;

export const formatWeekday = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(LOCALE, { weekday: "short", timeZone: TIME_ZONE });

export const formatHour = (iso: string) =>
  new Date(iso).toLocaleTimeString(LOCALE, { hour: "numeric", timeZone: TIME_ZONE });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  });
