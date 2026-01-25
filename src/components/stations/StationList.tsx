"use client";

import { useMemo, useState } from "react";

import { StationCard } from "./StationCard";
import { StationListSkeleton } from "./StationListSkeleton";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { useStations } from "@/hooks/useStations";

import type { Station } from "@/types/station";

type SortOrder = "price" | "distance";

interface StationListProps {
  selectedFuelId?: number;
}

export function StationList({ selectedFuelId }: StationListProps) {
  const { coordinates, status } = useGeolocation();
  const {
    data: stations,
    error,
    isLoading,
    mutate,
  } = useStations(coordinates?.lat ?? null, coordinates?.lng ?? null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("price");

  const sortedStations = useMemo(() => {
    if (!stations) return [];

    return [...stations].sort((a, b) => {
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

  if (error) {
    return (
      <ErrorMessage
        message="Impossible de charger les stations"
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

  return (
    <div>
      {/* Sort controls */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSortOrder("price")}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
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
          className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
            sortOrder === "distance"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Plus proche
        </button>
      </div>

      {/* Station list */}
      <div className="space-y-4">
        {sortedStations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            selectedFuelId={selectedFuelId}
          />
        ))}
      </div>

      {/* Results count */}
      <p className="mt-4 text-sm text-center text-gray-500">
        {stations.length} station{stations.length > 1 ? "s" : ""} trouvée
        {stations.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
