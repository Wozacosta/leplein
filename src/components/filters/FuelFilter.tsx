"use client";

import { FUEL_TYPES } from "@/lib/constants";

interface FuelFilterProps {
  selectedFuelId: number | undefined;
  onFuelChange: (fuelId: number | undefined) => void;
}

export function FuelFilter({ selectedFuelId, onFuelChange }: FuelFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onFuelChange(undefined)}
        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
          selectedFuelId === undefined
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Tous
      </button>
      {FUEL_TYPES.map((fuel) => (
        <button
          type="button"
          key={fuel.id}
          onClick={() => onFuelChange(fuel.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            selectedFuelId === fuel.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {fuel.shortName}
        </button>
      ))}
    </div>
  );
}
