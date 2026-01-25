import { STALE_THRESHOLD_HOURS } from "./constants";

export function isStale(updateDateString: string): boolean {
  const updateDate = new Date(updateDateString);
  const now = new Date();
  const diffHours = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);
  return diffHours > STALE_THRESHOLD_HOURS;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return "—";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates (clock drift, timezone issues)
  if (diffMs < 0) {
    return "à l'instant";
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // "Just now" for very recent (< 1 min)
  if (diffMins < 1) {
    return "à l'instant";
  }
  if (diffMins < 60) {
    return `il y a ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `il y a ${diffHours}h`;
  }
  if (diffDays < 7) {
    return `il y a ${diffDays}j`;
  }
  return date.toLocaleDateString("fr-FR");
}
