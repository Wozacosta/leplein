"use client";

import { useReverseGeocode } from "@/hooks/useReverseGeocode";
import { useGeolocation } from "@/contexts/GeolocationContext";

interface LocationStatusProps {
  lat: number;
  lng: number;
}

/**
 * Displays the user's approximate location context.
 * Shows "Près de {city}" when geocoding succeeds,
 * or a fallback message on error/loading.
 * Uses manual location label if set.
 */
export function LocationStatus({ lat, lng }: LocationStatusProps) {
  const { locationSource, locationLabel } = useGeolocation();
  const { data, error, isLoading } = useReverseGeocode(lat, lng);

  // If manual search was used and we have a label, show it directly
  if (locationSource === "manual" && locationLabel) {
    return (
      <span className="text-sm text-gray-600">
        <span aria-hidden="true">📍 </span>
        <span>{locationLabel}</span>
      </span>
    );
  }

  if (isLoading) {
    return <span className="text-sm text-gray-400">Localisation...</span>;
  }

  const locationName =
    data?.city || data?.locality || data?.principalSubdivision;

  if (!locationName || error) {
    return (
      <span className="text-sm text-gray-500">
        <span aria-hidden="true">📍 </span>
        <span>Position actuelle</span>
      </span>
    );
  }

  return (
    <span className="text-sm text-gray-600">
      <span aria-hidden="true">📍 </span>
      <span>Près de {locationName}</span>
    </span>
  );
}
