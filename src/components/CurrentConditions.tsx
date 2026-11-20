import type { City, CurrentWeather, Units } from "../api/types";
import { formatTemp, formatTime, unitSymbol } from "../format";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  city: City;
  current: CurrentWeather;
  units: Units;
  updatedAt: string;
}

export function CurrentConditions({ city, current, units, updatedAt }: Props) {
  return (
    <section class={`card current current--${current.condition}`} aria-label="Current conditions">
      <header class="current__header">
        <div>
          <h2 class="current__city">
            {city.name}
            <span class="current__country">{city.country}</span>
          </h2>
          <p class="muted">Updated {formatTime(updatedAt)} UTC</p>
        </div>
        <WeatherIcon condition={current.condition} size={72} label={current.description} />
      </header>
      <div class="current__temp">
        {formatTemp(current.temperature)}
        <span class="current__unit">{unitSymbol(units).slice(1)}</span>
      </div>
      <p class="current__description">{current.description}</p>
      <p class="muted">Feels like {formatTemp(current.feelsLike)}</p>
    </section>
  );
}
