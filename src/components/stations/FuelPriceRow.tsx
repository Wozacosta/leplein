import { formatPrice } from "@/lib/formatPrice";
import { isStale, formatTimeAgo } from "@/lib/isStale";

import type { StationFuelPrice } from "@/types/station";

interface FuelPriceRowProps {
  fuel: StationFuelPrice;
  isHighlighted?: boolean;
}

export function FuelPriceRow({ fuel, isHighlighted }: FuelPriceRowProps) {
  const stale = isStale(fuel.Update.value);
  // API uses 'available' (true = in stock), UI shows 'Rupture' when NOT available
  const isOutOfStock = !fuel.available;

  return (
    <div
      className={`flex items-center justify-between py-1 ${isHighlighted ? "bg-green-50 -mx-2 px-2 rounded" : ""}`}
    >
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded">
          {fuel.picto}
        </span>
        <span className="text-sm text-gray-700">{fuel.shortName}</span>
        {isOutOfStock && (
          <span
            className="px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded"
            title="Carburant en rupture de stock"
          >
            Rupture
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isOutOfStock && fuel.Price && (
          <span
            className={`font-semibold ${isHighlighted ? "text-green-700 text-lg" : "text-gray-900"}`}
          >
            {formatPrice(fuel.Price.value)}
          </span>
        )}
        <span
          className={`text-xs ${stale ? "text-orange-600" : "text-gray-400"}`}
        >
          {formatTimeAgo(fuel.Update.value)}
        </span>
      </div>
    </div>
  );
}
