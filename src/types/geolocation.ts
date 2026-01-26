export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export type LocationSource = "gps" | "manual" | null;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  status: GeolocationStatus;
  error: string | null;
  locationSource: LocationSource;
  locationLabel: string | null;
}
