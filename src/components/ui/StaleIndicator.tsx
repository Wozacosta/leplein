export interface StaleIndicatorProps {
  className?: string;
}

export function StaleIndicator({ className }: StaleIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-50 rounded ${className || ""}`}
      title="Prix potentiellement obsolètes (plus de 48h)"
      aria-label="Données potentiellement obsolètes"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Ancien
    </span>
  );
}
