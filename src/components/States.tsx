interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div class="card state state--error" role="alert">
      <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 7v6M12 16.5v.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
      <h3>Couldn't load the weather</h3>
      <p class="muted">{message}</p>
      {onRetry && (
        <button type="button" class="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div class="dashboard" aria-busy="true" aria-label="Loading weather">
      <div class="card skeleton skeleton--current" />
      <div class="details">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} class="stat skeleton skeleton--stat" />
        ))}
      </div>
      <div class="card skeleton skeleton--chart" />
      <div class="card skeleton skeleton--forecast" />
    </div>
  );
}
