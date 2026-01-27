"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { useGeolocation } from "@/contexts/GeolocationContext";
import { LocationStatus } from "@/components/location/LocationStatus";
import { geocodeAddress } from "@/lib/geocoding";

interface LocationChangerProps {
  lat: number;
  lng: number;
}

const DROPDOWN_ID = "location-changer-dropdown";

export function LocationChanger({ lat, lng }: LocationChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { requestPermission, setManualCoordinates, status } = useGeolocation();
  const prevStatusRef = useRef(status);
  const isRequestingGps = useRef(false);

  // Reset state when dropdown closes
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchError(null);
    triggerRef.current?.focus();
  }, []);

  // Open dropdown and focus first element
  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setSearchError(null);
    // Focus first button after render
    setTimeout(() => firstButtonRef.current?.focus(), 0);
  }, []);

  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, closeDropdown, openDropdown]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Close dropdown when GPS permission changes to granted (after requesting)
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    // Only close if we were requesting GPS and status changed to granted
    if (
      isRequestingGps.current &&
      prevStatus !== "granted" &&
      status === "granted" &&
      isOpen
    ) {
      isRequestingGps.current = false;
      closeDropdown();
    }
  }, [status, isOpen, closeDropdown]);

  const handleUseMyLocation = () => {
    isRequestingGps.current = true;
    requestPermission();
    // Don't close immediately - wait for status change (F8)
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchError("Veuillez entrer une ville ou un code postal");
      return;
    }

    // Cancel any pending request (F2)
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await geocodeAddress(
        trimmedQuery,
        abortControllerRef.current.signal,
      );

      if (!result) {
        setSearchError("Lieu non trouvé. Essayez une autre recherche.");
        return;
      }

      // API returns [lng, lat], we need lat, lng (F4: renamed to avoid shadowing)
      const [resultLng, resultLat] = result.geometry.coordinates;
      const label = result.properties.label;

      setManualCoordinates(resultLat, resultLng, label);
      closeDropdown();
      setQuery("");
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      setSearchError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-1 hover:bg-gray-100 rounded px-1 py-0.5 -ml-1 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={DROPDOWN_ID}
      >
        <LocationStatus lat={lat} lng={lng} />
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id={DROPDOWN_ID}
          role="menu"
          className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3"
        >
          {/* Use GPS button */}
          <button
            ref={firstButtonRef}
            type="button"
            role="menuitem"
            onClick={handleUseMyLocation}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            Utiliser ma position
          </button>

          <div className="my-2 border-t border-gray-200" />

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} role="search">
            <label
              htmlFor="location-changer-search"
              className="block mb-1.5 text-xs font-medium text-gray-500"
            >
              Ou rechercher un lieu
            </label>
            <div className="flex gap-2">
              <input
                id="location-changer-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Paris, 75001..."
                disabled={isSearching}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                aria-describedby={
                  searchError ? "changer-search-error" : undefined
                }
              />
              <button
                type="submit"
                disabled={isSearching}
                aria-label={isSearching ? "Recherche en cours" : undefined}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-[44px]"
              >
                {isSearching ? "..." : "OK"}
              </button>
            </div>
            {searchError && (
              <p
                id="changer-search-error"
                className="mt-1.5 text-xs text-red-600"
                role="alert"
              >
                {searchError}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
