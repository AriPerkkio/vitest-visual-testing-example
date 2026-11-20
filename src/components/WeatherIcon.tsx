import type { Condition } from "../api/types";

interface Props {
  condition: Condition;
  size?: number;
  label?: string;
}

const Sun = () => (
  <g class="icon-sun">
    <circle cx="32" cy="32" r="11" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <line key={deg} x1="32" y1="9" x2="32" y2="15" transform={`rotate(${deg} 32 32)`} />
    ))}
  </g>
);

const Cloud = ({ dy = 0, class: className = "icon-cloud" }: { dy?: number; class?: string }) => (
  <path
    class={className}
    transform={`translate(0 ${dy})`}
    d="M20 46h26a9 9 0 0 0 0-18 13 13 0 0 0-25-2 10 10 0 0 0-1 20z"
  />
);

const Drops = () => (
  <g class="icon-rain">
    <line x1="24" y1="50" x2="21" y2="58" />
    <line x1="33" y1="50" x2="30" y2="58" />
    <line x1="42" y1="50" x2="39" y2="58" />
  </g>
);

const Flakes = () => (
  <g class="icon-snow">
    <circle cx="23" cy="54" r="2.2" />
    <circle cx="32" cy="58" r="2.2" />
    <circle cx="41" cy="54" r="2.2" />
  </g>
);

const Bolt = () => <path class="icon-bolt" d="M34 44l-7 10h6l-3 8 9-12h-6l3-6z" />;

const Fog = () => (
  <g class="icon-fog">
    <line x1="14" y1="30" x2="50" y2="30" />
    <line x1="10" y1="38" x2="54" y2="38" />
    <line x1="16" y1="46" x2="48" y2="46" />
  </g>
);

const shapes: Record<Condition, () => preact.JSX.Element> = {
  clear: () => <Sun />,
  "partly-cloudy": () => (
    <>
      <g transform="translate(-8 -8) scale(0.85)">
        <Sun />
      </g>
      <Cloud dy={4} />
    </>
  ),
  cloudy: () => (
    <>
      <g transform="translate(8 -8) scale(0.8)">
        <Cloud class="icon-cloud icon-cloud--back" />
      </g>
      <Cloud dy={2} />
    </>
  ),
  rain: () => (
    <>
      <Cloud dy={-6} />
      <Drops />
    </>
  ),
  thunderstorm: () => (
    <>
      <Cloud dy={-8} class="icon-cloud icon-cloud--dark" />
      <Bolt />
    </>
  ),
  snow: () => (
    <>
      <Cloud dy={-6} />
      <Flakes />
    </>
  ),
  fog: () => <Fog />,
};

export function WeatherIcon({ condition, size = 48, label }: Props) {
  const Shape = shapes[condition];
  return (
    <svg
      class="weather-icon"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={label ?? condition.replace("-", " ")}
    >
      <Shape />
    </svg>
  );
}
