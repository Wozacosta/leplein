import useSWR from "swr";

import { endpoints } from "@/lib/api";
import { getErrorType } from "@/lib/errors";
import { fetcher } from "@/lib/fetcher";
import { createOnErrorRetry } from "@/lib/retryStrategy";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import type { ErrorType } from "@/lib/errors";
import type { Fuel } from "@/types/fuel";

/** Shared retry handler for SWR hooks */
const onErrorRetry = createOnErrorRetry();

/**
 * Hardcoded fallback fuel types - reference data rarely changes.
 * Used when API is unavailable to maintain basic functionality.
 */
const FALLBACK_FUELS: Fuel[] = [
  { id: 1, name: "Gazole", short_name: "Gazole", type: "D", picto: "B7" },
  { id: 2, name: "SP95", short_name: "SP95", type: "E", picto: "E5" },
  { id: 3, name: "E85", short_name: "E85", type: "E", picto: "E85" },
  { id: 4, name: "GPLc", short_name: "GPLc", type: "G", picto: "LPG" },
  { id: 5, name: "E10", short_name: "E10", type: "E", picto: "E10" },
  { id: 6, name: "SP98", short_name: "SP98", type: "E", picto: "E5" },
];

export interface UseFuelsResult {
  data: Fuel[] | undefined;
  error: Error | undefined;
  isLoading: boolean;
  /** True when using fallback data due to error */
  isUsingFallback: boolean;
  /** Categorized error type for UI messaging */
  errorType: ErrorType | null;
}

/**
 * Fetches fuel type reference data with fallback support.
 * Includes retry logic for transient errors.
 * Falls back to hardcoded fuel types if API is unavailable.
 */
export function useFuels(): UseFuelsResult {
  const isOnline = useOnlineStatus();

  const { data, error, isLoading } = useSWR<Fuel[]>(
    endpoints.fuels(),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour - reference data rarely changes
      onErrorRetry,
      // Pause revalidation when offline to avoid useless requests
      isPaused: () => !isOnline,
    },
  );

  // Use fallback data when API fails and no cached data available
  const isUsingFallback = Boolean(error && !data);
  const effectiveData = data ?? (error ? FALLBACK_FUELS : undefined);

  return {
    data: effectiveData,
    error,
    isLoading,
    isUsingFallback,
    errorType: error ? getErrorType(error) : null,
  };
}
