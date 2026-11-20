import type { CurrentWeather, Units } from "../api/types";
import { windUnit } from "../format";
import { StatTile } from "./StatTile";

interface Props {
  current: CurrentWeather;
  units: Units;
}

const uvLabel = (uv: number) =>
  uv <= 2 ? "Low" : uv <= 5 ? "Moderate" : uv <= 7 ? "High" : "Very high";

export function WeatherDetails({ current, units }: Props) {
  return (
    <section class="details" aria-label="Weather details">
      <StatTile label="Humidity" value={`${current.humidity}%`} meter={current.humidity / 100} />
      <StatTile
        label="Wind"
        value={`${current.windSpeed} ${windUnit(units)}`}
        hint={current.windSpeed > 10 ? "Strong breeze" : "Light breeze"}
      />
      <StatTile
        label="Pressure"
        value={`${current.pressure} hPa`}
        hint={current.pressure < 1000 ? "Low pressure" : "Stable"}
      />
      <StatTile
        label="UV index"
        value={String(current.uvIndex)}
        meter={current.uvIndex / 11}
        hint={uvLabel(current.uvIndex)}
      />
    </section>
  );
}
