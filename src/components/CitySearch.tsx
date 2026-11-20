import { useEffect, useState } from "preact/hooks";
import { searchCities } from "../api/client";
import type { City } from "../api/types";

interface Props {
  onSelect: (city: City) => void;
}

export function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    searchCities(query, controller.signal)
      .then((cities) => {
        setResults(cities);
        setOpen(true);
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setResults([]);
      });
    return () => controller.abort();
  }, [query]);

  const select = (city: City) => {
    onSelect(city);
    setQuery("");
    setOpen(false);
  };

  return (
    <div class="search">
      <svg class="search__icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
        <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      <input
        class="search__input"
        type="search"
        placeholder="Search for a city…"
        aria-label="Search for a city"
        value={query}
        onInput={(e) => setQuery(e.currentTarget.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && query.trim() && (
        <ul class="search__results" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li class="search__empty">No cities found</li>
          ) : (
            results.map((city) => (
              <li key={city.id} role="option" aria-selected={false}>
                <button type="button" class="search__result" onClick={() => select(city)}>
                  <span>{city.name}</span>
                  <span class="search__country">{city.country}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
