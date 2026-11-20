import type { Units } from "./api/types";

/**
 * Absolute temperature color scale (°C → color), so a bar's color says how cold
 * or warm a day actually is: freezing days are blue, hot days red.
 */
const STOPS: Array<[celsius: number, color: string]> = [
  [-20, "#6366f1"], // indigo
  [-5, "#38bdf8"], // sky
  [5, "#2dd4bf"], // teal
  [15, "#a3e635"], // lime
  [22, "#facc15"], // yellow
  [30, "#f97316"], // orange
  [38, "#ef4444"], // red
];

const toCelsius = (value: number, units: Units) =>
  units === "imperial" ? ((value - 32) * 5) / 9 : value;

function parse(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

export function temperatureColor(value: number, units: Units): string {
  const celsius = toCelsius(value, units);
  const [first] = STOPS;
  const last = STOPS[STOPS.length - 1];
  if (celsius <= first[0]) return first[1];
  if (celsius >= last[0]) return last[1];

  const upper = STOPS.findIndex(([stop]) => stop >= celsius);
  const [fromTemp, fromColor] = STOPS[upper - 1];
  const [toTemp, toColor] = STOPS[upper];
  const t = (celsius - fromTemp) / (toTemp - fromTemp);

  const from = parse(fromColor);
  const to = parse(toColor);
  const rgb = from.map((channel, i) => Math.round(channel + (to[i] - channel) * t));
  return `rgb(${rgb.join(" ")})`;
}
