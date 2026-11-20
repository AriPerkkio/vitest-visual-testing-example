import type { DailyForecast, Units } from "../api/types";
import { formatTemp, formatWeekday } from "../format";
import { temperatureColor } from "../temperatureColor";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  days: DailyForecast[];
  units: Units;
}

export function ForecastList({ days, units }: Props) {
  const weekMin = Math.min(...days.map((d) => d.low));
  const weekMax = Math.max(...days.map((d) => d.high));
  const span = Math.max(1, weekMax - weekMin);

  return (
    <section class="card forecast" aria-label="7-day forecast">
      <h3 class="card__title">7-day forecast</h3>
      <ul class="forecast__list">
        {days.map((day, i) => (
          <li key={day.date} class="forecast__row">
            <span class="forecast__day">{i === 0 ? "Today" : formatWeekday(day.date)}</span>
            <WeatherIcon condition={day.condition} size={32} />
            <span
              class={
                day.precipitationChance >= 50 ? "forecast__precip is-high" : "forecast__precip"
              }
            >
              {day.precipitationChance > 0 ? `${day.precipitationChance}%` : ""}
            </span>
            <span class="forecast__low">{formatTemp(day.low)}</span>
            <span class="range" aria-hidden="true">
              <span
                class="range__bar"
                style={{
                  left: `${((day.low - weekMin) / span) * 100}%`,
                  right: `${((weekMax - day.high) / span) * 100}%`,
                  background: `linear-gradient(90deg, ${temperatureColor(day.low, units)}, ${temperatureColor(day.high, units)})`,
                }}
              />
            </span>
            <span class="forecast__high">{formatTemp(day.high)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
