import useSWR from "swr";

import { API_BASE, endpoints } from "@/lib/api";
import { getErrorType } from "@/lib/errors";
import { fetcher } from "@/lib/fetcher";
import { createOnErrorRetry } from "@/lib/retryStrategy";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

import type { ErrorType } from "@/lib/errors";
import type { Station, StationListItem } from "@/types/station";

/** Maximum concurrent detail fetches to avoid rate limiting */
const MAX_CONCURRENT_FETCHES = 5;

/** Shared retry handler for SWR hooks */
const onErrorRetry = createOnErrorRetry();

/**
 * Fetches items in batches with concurrency limit.
 * Prevents overwhelming the API with too many simultaneous requests.
 */
async function fetchWithConcurrencyLimit<T, R>(
  items: T[],
  fetchFn: (item: T) => Promise<R>,
  limit: number,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(batch.map(fetchFn));
    results.push(...batchResults);
  }

  return results;
}

export interface UseStationsResult {
  data: Station[] | undefined;
  error: Error | undefined;
  isLoading: boolean;
  /** True when showing cached data while an error occurred */
  isStale: boolean;
  /** Categorized error type for UI messaging */
  errorType: ErrorType | null;
  mutate: () => void;
}

/**
 * Fetches nearby stations with full details including prices.
 *
 * The 2aaz.fr API's /stations/around endpoint doesn't return prices,
 * so we first get the list of nearby stations, then fetch each station's
 * details in parallel to get the prices.
 *
 * Detail fetches are batched with a concurrency limit to avoid rate limiting.
 * Includes exponential backoff retry for transient errors.
 */
export function useStations(
  lat: number | null,
  lng: number | null,
): UseStationsResult {
  const isOnline = useOnlineStatus();

  // First, fetch the list of stations around the coordinates
  const listUrl = lat && lng ? endpoints.stationsAround(lat, lng) : null;

  const {
    data: stationList,
    error: listError,
    isLoading: listLoading,
  } = useSWR<StationListItem[]>(listUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
    onErrorRetry,
    // Pause revalidation when offline to avoid useless requests
    isPaused: () => !isOnline,
  });

  // Then fetch details for each station to get prices
  // Using SWR's multiple keys pattern - we create a combined key for the batch
  const stationIds = stationList?.map((s) => s.id) ?? [];
  const detailsKey =
    stationIds.length > 0
      ? `${API_BASE}/stations/details/${stationIds.join(",")}`
      : null;

  const {
    data: stations,
    error: detailsError,
    isLoading: detailsLoading,
    mutate,
  } = useSWR<Station[]>(
    detailsKey,
    async () => {
      if (!stationList || stationList.length === 0) return [];

      // Fetch station details with concurrency limit to avoid rate limiting
      const fetchStationDetail = async (
        listItem: StationListItem,
      ): Promise<Station> => {
        try {
          const detail = await fetcher<Station>(endpoints.station(listItem.id));
          // Merge distance from list (not available in detail endpoint)
          return {
            ...detail,
            distance: listItem.distance,
            Distance: listItem.Distance,
          };
        } catch (error) {
          // Log the error for debugging, but don't fail the entire batch
          console.warn(
            `Failed to fetch details for station ${listItem.id}:`,
            error instanceof Error ? error.message : "Unknown error",
          );
          // Return list item as fallback (no prices available)
          return {
            ...listItem,
            Fuels: listItem.Fuels ?? [],
          } as Station;
        }
      };

      return fetchWithConcurrencyLimit(
        stationList,
        fetchStationDetail,
        MAX_CONCURRENT_FETCHES,
      );
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      onErrorRetry,
      // Pause revalidation when offline to avoid useless requests
      isPaused: () => !isOnline,
    },
  );

  const error = listError || detailsError;

  return {
    data: stations,
    error,
    isLoading: listLoading || detailsLoading,
    // Show stale indicator when we have data but also have an error
    isStale: Boolean(stations && error),
    errorType: error ? getErrorType(error) : null,
    mutate,
  };
}
