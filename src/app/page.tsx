"use client";

import { LocationPrompt } from "@/components/location/LocationPrompt";
import { LocationStatus } from "@/components/location/LocationStatus";
import { FuelFilter } from "@/components/filters/FuelFilter";
import { StationList } from "@/components/stations/StationList";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useGeolocation } from "@/contexts/GeolocationContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function Home() {
  const { status, coordinates } = useGeolocation();
  const [selectedFuelId, setSelectedFuelId] = useLocalStorage<
    number | undefined
  >("lepleink-fuel", undefined);

  const isLocationGranted = status === "granted";

  return (
    <main className="min-h-screen bg-white">
      {/* Offline indicator */}
      <OfflineBanner />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4 mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
          <h1 className="text-xl font-bold text-gray-900">lepleink</h1>
          <p className="text-sm text-gray-500">
            Carburant moins cher près de vous
          </p>
          {coordinates && (
            <LocationStatus lat={coordinates.lat} lng={coordinates.lng} />
          )}
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl">
        {!isLocationGranted ? (
          <LocationPrompt />
        ) : (
          <>
            {/* Fuel filter */}
            <div className="mb-4">
              <FuelFilter
                selectedFuelId={selectedFuelId}
                onFuelChange={setSelectedFuelId}
              />
            </div>

            {/* Station list */}
            <StationList selectedFuelId={selectedFuelId} />
          </>
        )}
      </div>
    </main>
  );
}
