"use client";

import { useState } from "react";

import { useGeolocation } from "@/contexts/GeolocationContext";
import { geocodeAddress } from "@/lib/geocoding";

export function LocationSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { setManualCoordinates } = useGeolocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchError("Veuillez entrer une ville ou un code postal");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await geocodeAddress(trimmedQuery);

      if (!result) {
        setSearchError("Lieu non trouvé. Essayez une autre recherche.");
        return;
      }

      // API returns [lng, lat], we need lat, lng
      const [lng, lat] = result.geometry.coordinates;
      const label = result.properties.label;

      setManualCoordinates(lat, lng, label);
    } catch {
      setSearchError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <label
        htmlFor="location-search"
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        Ou rechercher une ville
      </label>

      <div className="flex gap-2">
        <input
          id="location-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paris, 75001..."
          disabled={isSearching}
          className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          aria-describedby={searchError ? "search-error" : undefined}
        />

        <button
          type="submit"
          disabled={isSearching}
          aria-label={isSearching ? "Recherche en cours" : undefined}
          className="px-4 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-[100px]"
        >
          {isSearching ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          ) : (
            "Rechercher"
          )}
        </button>
      </div>

      {searchError && (
        <p id="search-error" className="mt-2 text-sm text-red-600" role="alert">
          {searchError}
        </p>
      )}
    </form>
  );
}
