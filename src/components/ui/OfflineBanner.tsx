import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Banner displayed when the user is offline.
 * Shows a persistent notice at the top of the viewport.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white bg-gray-700"
      role="status"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4"
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
      <span>Vous êtes hors ligne</span>
    </div>
  );
}
