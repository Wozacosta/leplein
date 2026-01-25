import useSWR from "swr";

import type { ReverseGeocodeResponse } from "@/types/geocode";

const REVERSE_GEOCODE_API =
  "https://api.bigdatacloud.net/data/reverse-geocode-client";

const fetcher = async (url: string): Promise<ReverseGeocodeResponse> => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  return response.json();
};

/**
 * Hook for reverse geocoding coordinates to a location name.
 * Uses BigDataCloud's free API (no API key required).
 *
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @returns SWR response with location data, loading state, and error
 */
export function useReverseGeocode(lat: number | null, lng: number | null) {
  const url =
    lat !== null && lng !== null
      ? `${REVERSE_GEOCODE_API}?latitude=${lat}&longitude=${lng}&localityLanguage=fr`
      : null;

  return useSWR<ReverseGeocodeResponse>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });
}
