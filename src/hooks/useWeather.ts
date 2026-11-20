import { useCallback, useEffect, useState } from "preact/hooks";
import { getWeather } from "../api/client";
import type { Units, WeatherReport } from "../api/types";

type State =
  | { status: "loading" }
  | { status: "success"; data: WeatherReport }
  | { status: "error"; error: string };

export function useWeather(cityId: string, units: Units) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    getWeather(cityId, units, controller.signal)
      .then((data) => setState({ status: "success", data }))
      .catch((error: Error) => {
        if (error.name !== "AbortError") setState({ status: "error", error: error.message });
      });
    return () => controller.abort();
  }, [cityId, units, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
