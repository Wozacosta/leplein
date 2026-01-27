"use client";

import { useMemo } from "react";

import { StationCard } from "./StationCard";
import { StationListSkeleton } from "./StationListSkeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStations } from "@/hooks/useStations";

import type { Station } from "@/types/station";

type SortOrder = "price" | "distance";

interface StationListProps {
  selectedFuelId?: number;
}

/**
 * Banner shown when displaying cached data during an error.
 */
function StaleBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex items-center justify-between gap-2 p-3 mb-4 text-sm rounded-lg bg-amber-50 text-amber-800 border border-amber-200"
      role="status"
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 flex-shrink-0"
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
        <span>Données potentiellement obsolètes</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 rounded hover:bg-amber-200 transition-colors"
      >
        Réessayer
      </button>
    </div>
  );
}

export function StationList({ selectedFuelId }: StationListProps) {
  const { coordinates, status } = useGeolocation();
  const {
    data: stations,
    error,
    isLoading,
    isStale,
    errorType,
    mutate,
  } = useStations(coordinates?.lat ?? null, coordinates?.lng ?? null);
  const [sortOrder, setSortOrder] = useLocalStorage<SortOrder>(
    "lepleink-sort",
    "price",
  );

  const filteredAndSortedStations = useMemo(() => {
    if (!stations) return [];

    // Step 1: Filter by fuel availability (when a specific fuel is selected)
    let filtered = stations;
    if (selectedFuelId !== undefined) {
      filtered = stations.filter((station) => {
        const fuel = station.Fuels.find((f) => f.id === selectedFuelId);
        return fuel && fuel.available;
      });
    }

    // Step 2: Sort
    return [...filtered].sort((a, b) => {
      if (sortOrder === "distance") {
        // Handle optional Distance field
        const distA = a.Distance?.value ?? Infinity;
        const distB = b.Distance?.value ?? Infinity;
        return distA - distB;
      }

      // Sort by price of selected fuel (or first available fuel)
      const getFuelPrice = (station: Station) => {
        const fuel = selectedFuelId
          ? station.Fuels.find((f) => f.id === selectedFuelId)
          : station.Fuels[0];
        // Use !available instead of rupture (API uses available: true/false)
        const isOutOfStock = fuel ? !fuel.available : true;
        return isOutOfStock ? Infinity : (fuel?.Price?.value ?? Infinity);
      };

      return getFuelPrice(a) - getFuelPrice(b);
    });
  }, [stations, sortOrder, selectedFuelId]);

  if (status === "idle" || status === "requesting") {
    return null;
  }

  if (status === "denied" || status === "unavailable") {
    return null; // Let LocationPrompt handle this
  }

  if (isLoading) {
    return <StationListSkeleton count={3} />;
  }

  // Error with no cached data - show error message
  if (error && !stations) {
    return (
      <ErrorMessage
        errorType={errorType ?? undefined}
        onRetry={() => mutate()}
      />
    );
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        Aucune station trouvée à proximité
      </div>
    );
  }

  if (filteredAndSortedStations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {selectedFuelId !== undefined
          ? "Aucune station avec ce carburant à proximité"
          : "Aucune station trouvée à proximité"}
      </div>
    );
  }

  return (
    <div>
      {/* Stale data banner - show when error occurred but cached data available */}
      {isStale && <StaleBanner onRetry={() => mutate()} />}

      {/* Sort controls */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSortOrder("price")}
          className={`flex items-center justify-center px-4 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
            sortOrder === "price"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Moins cher
        </button>
        <button
          type="button"
          onClick={() => setSortOrder("distance")}
          className={`flex items-center justify-center px-4 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
            sortOrder === "distance"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Plus proche
        </button>
      </div>

      {/* Station list */}
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {filteredAndSortedStations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            selectedFuelId={selectedFuelId}
          />
        ))}
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-center text-gray-500">
        {filteredAndSortedStations.length} station
        {filteredAndSortedStations.length > 1 ? "s" : ""} trouvée
        {filteredAndSortedStations.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
