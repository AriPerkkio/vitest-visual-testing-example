import type { ComponentChildren } from "preact";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon?: ComponentChildren;
  /** Optional 0–1 value rendered as a meter bar */
  meter?: number;
}

export function StatTile({ label, value, hint, icon, meter }: Props) {
  return (
    <div class="stat">
      <div class="stat__label">
        {icon}
        {label}
      </div>
      <div class="stat__value">{value}</div>
      {meter !== undefined && (
        <div
          class="meter"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(meter * 100)}
          aria-label={label}
        >
          <div class="meter__fill" style={{ width: `${Math.min(1, Math.max(0, meter)) * 100}%` }} />
        </div>
      )}
      {hint && <div class="stat__hint">{hint}</div>}
    </div>
  );
}
