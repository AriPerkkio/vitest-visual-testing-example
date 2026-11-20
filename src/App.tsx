import { useState } from "preact/hooks";
import type { Units } from "./api/types";
import { CitySearch } from "./components/CitySearch";
import { CurrentConditions } from "./components/CurrentConditions";
import { ForecastList } from "./components/ForecastList";
import { ErrorState, LoadingSkeleton } from "./components/States";
import { TemperatureChart } from "./components/TemperatureChart";
import { ThemeToggle } from "./components/ThemeToggle";
import { UnitToggle } from "./components/UnitToggle";
import { WeatherDetails } from "./components/WeatherDetails";
import { useTheme, type Theme } from "./hooks/useTheme";
import { useWeather } from "./hooks/useWeather";

interface Props {
  initialCityId?: string;
  initialTheme?: Theme;
}

export function App({ initialCityId = "helsinki", initialTheme }: Props) {
  const { theme, toggle } = useTheme(initialTheme);
  const [cityId, setCityId] = useState(initialCityId);
  const [units, setUnits] = useState<Units>("metric");
  const weather = useWeather(cityId, units);

  return (
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <span class="brand__mark" aria-hidden="true" />
          Skycast
        </div>
        <CitySearch onSelect={(city) => setCityId(city.id)} />
        <div class="topbar__actions">
          <UnitToggle units={units} onChange={setUnits} />
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main>
        {weather.status === "loading" && <LoadingSkeleton />}
        {weather.status === "error" && (
          <ErrorState message={weather.error} onRetry={weather.retry} />
        )}
        {weather.status === "success" && (
          <div class="dashboard">
            <CurrentConditions
              city={weather.data.city}
              current={weather.data.current}
              units={weather.data.units}
              updatedAt={weather.data.updatedAt}
            />
            <WeatherDetails current={weather.data.current} units={weather.data.units} />
            <TemperatureChart
              points={weather.data.hourly}
              units={weather.data.units}
              width={1010}
              height={240}
            />
            <ForecastList days={weather.data.daily} units={weather.data.units} />
          </div>
        )}
      </main>
    </div>
  );
}
