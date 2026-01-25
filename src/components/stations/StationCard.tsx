import { formatDistance } from "@/lib/formatDistance";
import { FuelPriceRow } from "./FuelPriceRow";

import type { Station } from "@/types/station";

interface StationCardProps {
  station: Station;
  selectedFuelId?: number;
}

export function StationCard({ station, selectedFuelId }: StationCardProps) {
  const selectedFuel = selectedFuelId
    ? station.Fuels.find((f) => f.id === selectedFuelId)
    : station.Fuels[0];

  const handleOpenMaps = () => {
    const address = encodeURIComponent(
      `${station.Address.street_line}, ${station.Address.city_line}`,
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${address}`,
      "_blank",
    );
  };

  const handleCopyAddress = async () => {
    const address = `${station.Address.street_line}, ${station.Address.city_line}`;
    await navigator.clipboard.writeText(address);
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {station.Brand?.short_name || station.name}
            </h3>
            {station.type === "A" && (
              <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                Autoroute
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {station.Address.street_line}
          </p>
          <p className="text-sm text-gray-500">{station.Address.city_line}</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-600">
            {formatDistance(station.Distance.value)}
          </span>
        </div>
      </div>

      {/* Fuel prices */}
      <div className="mt-3 space-y-2">
        {selectedFuel ? (
          <FuelPriceRow fuel={selectedFuel} isHighlighted />
        ) : (
          station.Fuels.slice(0, 3).map((fuel) => (
            <FuelPriceRow key={fuel.id} fuel={fuel} />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleOpenMaps}
          className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Y aller
        </button>
        <button
          onClick={handleCopyAddress}
          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          title="Copier l'adresse"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
