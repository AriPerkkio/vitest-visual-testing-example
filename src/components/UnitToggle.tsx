import type { Units } from "../api/types";

interface Props {
  units: Units;
  onChange: (units: Units) => void;
}

const options: Array<{ value: Units; label: string }> = [
  { value: "metric", label: "°C" },
  { value: "imperial", label: "°F" },
];

export function UnitToggle({ units, onChange }: Props) {
  return (
    <div class="segmented" role="radiogroup" aria-label="Temperature unit">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={units === option.value}
          class={units === option.value ? "segmented__option is-active" : "segmented__option"}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
