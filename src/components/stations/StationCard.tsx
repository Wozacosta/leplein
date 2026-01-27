"use client";

import { useState } from "react";

import { formatDistance } from "@/lib/formatDistance";
import { isStale } from "@/lib/isStale";
import { FuelPriceRow } from "./FuelPriceRow";
import { StaleIndicator } from "@/components/ui/StaleIndicator";

import type { Station } from "@/types/station";

// Feedback timeout duration in milliseconds
const FEEDBACK_TIMEOUT_MS = 2000;

interface StationCardProps {
  station: Station;
  selectedFuelId?: number;
}

// Platform detection utility
function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Copy to clipboard with fallback for older browsers
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers using execCommand
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

export function StationCard({ station, selectedFuelId }: StationCardProps) {
  const [copyFeedback, setCopyFeedback] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [shareFeedback, setShareFeedback] = useState<
    "idle" | "success" | "error"
  >("idle");

  const selectedFuel = selectedFuelId
    ? station.Fuels.find((f) => f.id === selectedFuelId)
    : station.Fuels[0];

  // Station is stale if any of its fuels have stale data
  const hasStaleData = station.Fuels.some((fuel) => isStale(fuel.Update.value));

  // Check if selected fuel is out of stock (for visual muting)
  const isSelectedFuelUnavailable = selectedFuel
    ? !selectedFuel.available
    : false;

  const handleOpenMaps = () => {
    // Prefer coordinates for more accurate navigation
    if (station.Coordinates) {
      const { latitude, longitude } = station.Coordinates;
      if (isIOSDevice()) {
        // Apple Maps for iOS devices
        window.open(
          `maps://maps.apple.com/?daddr=${latitude},${longitude}`,
          "_blank",
        );
      } else {
        // Google Maps directions for other platforms
        window.open(
          `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
          "_blank",
        );
      }
    } else {
      // Fallback to address-based search when coordinates unavailable
      const address = encodeURIComponent(
        `${station.Address.street_line}, ${station.Address.city_line}`,
      );
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${address}`,
        "_blank",
      );
    }
  };

  const handleCopyAddress = async () => {
    const address = `${station.Address.street_line}, ${station.Address.city_line}`;
    try {
      await copyToClipboard(address);
      setCopyFeedback("success");
      setTimeout(() => setCopyFeedback("idle"), FEEDBACK_TIMEOUT_MS);
    } catch {
      setCopyFeedback("error");
      setTimeout(() => setCopyFeedback("idle"), FEEDBACK_TIMEOUT_MS);
    }
  };

  const handleShare = async () => {
    const stationName =
      station.Brand?.shortName || station.Brand?.name || station.name;
    const address = `${station.Address.street_line}, ${station.Address.city_line}`;
    const priceText = selectedFuel?.Price?.text || "Prix non disponible";
    const fuelName = selectedFuel?.shortName || "Carburant";

    const shareText = `${stationName}\n${address}\n${fuelName}: ${priceText}`;

    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Station ${stationName}`,
          text: shareText,
        });
        // Native share completed - no feedback needed as OS provides it
      } catch (error) {
        // User cancelled share - not an error
        if ((error as Error).name !== "AbortError") {
          // Real error - fall back to clipboard
          try {
            await copyToClipboard(shareText);
            setShareFeedback("success");
            setTimeout(() => setShareFeedback("idle"), FEEDBACK_TIMEOUT_MS);
          } catch {
            setShareFeedback("error");
            setTimeout(() => setShareFeedback("idle"), FEEDBACK_TIMEOUT_MS);
          }
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await copyToClipboard(shareText);
        setShareFeedback("success");
        setTimeout(() => setShareFeedback("idle"), FEEDBACK_TIMEOUT_MS);
      } catch {
        setShareFeedback("error");
        setTimeout(() => setShareFeedback("idle"), FEEDBACK_TIMEOUT_MS);
      }
    }
  };

  return (
    <div
      className={`p-4 bg-white border rounded-lg shadow-sm ${isSelectedFuelUnavailable ? "border-gray-300 opacity-60" : "border-gray-200"}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {station.Brand?.shortName || station.Brand?.name || station.name}
            </h3>
            {station.type === "A" && (
              <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                Autoroute
              </span>
            )}
            {hasStaleData && <StaleIndicator />}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {station.Address.street_line}
          </p>
          <p className="text-sm text-gray-500">{station.Address.city_line}</p>
        </div>
        {station.Distance && (
          <div className="text-right">
            <span className="text-sm font-medium text-gray-600">
              {formatDistance(station.Distance.value)}
            </span>
          </div>
        )}
      </div>

      {/* Unavailable fuel notice */}
      {isSelectedFuelUnavailable && (
        <div
          className="flex items-center gap-2 px-3 py-2 mt-3 text-sm text-red-700 bg-red-50 rounded-lg"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
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
          <span>Carburant indisponible</span>
        </div>
      )}

      {/* Fuel prices */}
      <div className="mt-3 space-y-2">
        {selectedFuel ? (
          <FuelPriceRow
            fuel={selectedFuel}
            isHighlighted={!isSelectedFuelUnavailable}
          />
        ) : (
          station.Fuels.slice(0, 3).map((fuel) => (
            <FuelPriceRow key={fuel.id} fuel={fuel} />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={handleOpenMaps}
          className="flex items-center justify-center flex-1 gap-2 px-3 min-h-[44px] text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          aria-label="Ouvrir dans l'application de navigation"
        >
          <svg
            className="w-4 h-4"
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
          Y aller
        </button>
        <button
          type="button"
          onClick={handleCopyAddress}
          className={`flex items-center justify-center px-3 min-h-[44px] min-w-[44px] text-sm font-medium rounded-lg transition-colors ${
            copyFeedback === "success"
              ? "bg-green-100 text-green-700"
              : copyFeedback === "error"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title={
            copyFeedback === "success"
              ? "Adresse copiée !"
              : copyFeedback === "error"
                ? "Erreur de copie"
                : "Copier l'adresse"
          }
          aria-label={
            copyFeedback === "success"
              ? "Adresse copiée"
              : copyFeedback === "error"
                ? "Erreur lors de la copie"
                : "Copier l'adresse"
          }
        >
          {copyFeedback === "success" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : copyFeedback === "error" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className={`flex items-center justify-center px-3 min-h-[44px] min-w-[44px] text-sm font-medium rounded-lg transition-colors ${
            shareFeedback === "success"
              ? "bg-green-100 text-green-700"
              : shareFeedback === "error"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          title={
            shareFeedback === "success"
              ? "Copié pour partage !"
              : shareFeedback === "error"
                ? "Erreur de partage"
                : "Partager la station"
          }
          aria-label={
            shareFeedback === "success"
              ? "Informations copiées"
              : shareFeedback === "error"
                ? "Erreur lors du partage"
                : "Partager cette station"
          }
        >
          {shareFeedback === "success" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : shareFeedback === "error" ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
