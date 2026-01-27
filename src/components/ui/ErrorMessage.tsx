import type { ErrorType } from "@/lib/errors";

/**
 * French error messages for different error types.
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  network: "Connexion impossible. Vérifiez votre connexion internet.",
  server: "Le service est temporairement indisponible. Veuillez réessayer.",
  "rate-limit": "Trop de requêtes. Veuillez patienter quelques instants.",
  timeout: "La requête a pris trop de temps. Veuillez réessayer.",
  unknown: "Une erreur est survenue. Veuillez réessayer.",
};

/**
 * Icons for different error types.
 */
function ErrorIcon({ errorType }: { errorType?: ErrorType }) {
  // Network/offline icon
  if (errorType === "network") {
    return (
      <svg
        className="w-6 h-6 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 7.072a4 4 0 010-5.656m-3.536 9.192a9 9 0 010-12.728"
        />
        <line
          x1="4"
          y1="4"
          x2="20"
          y2="20"
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Server error icon
  if (errorType === "server") {
    return (
      <svg
        className="w-6 h-6 text-orange-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    );
  }

  // Default warning triangle
  return (
    <svg
      className="w-6 h-6 text-red-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

/**
 * Background color based on error type.
 */
function getIconBgClass(errorType?: ErrorType): string {
  if (errorType === "network") return "bg-gray-100";
  if (errorType === "server") return "bg-orange-100";
  return "bg-red-100";
}

interface ErrorMessageProps {
  /** Custom message to display, or use default based on errorType */
  message?: string;
  /** Categorized error type for icon and default message */
  errorType?: ErrorType;
  /** Callback for retry button */
  onRetry?: () => void;
  /** Show cache notice with optional timestamp */
  showCacheNotice?: boolean;
}

export function ErrorMessage({
  message,
  errorType,
  onRetry,
  showCacheNotice,
}: ErrorMessageProps) {
  // Use provided message or default based on error type
  const displayMessage =
    message ?? (errorType ? ERROR_MESSAGES[errorType] : ERROR_MESSAGES.unknown);

  return (
    <div
      className="flex flex-col items-center justify-center p-6 text-center"
      role="alert"
    >
      <div className={`p-3 mb-4 rounded-full ${getIconBgClass(errorType)}`}>
        <ErrorIcon errorType={errorType} />
      </div>
      <p className="mb-4 text-gray-600">{displayMessage}</p>
      {showCacheNotice && (
        <p className="mb-4 text-sm text-amber-600">
          Données potentiellement obsolètes affichées
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}
