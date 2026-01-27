// IGN Géoplateforme Geocoding API
// https://data.geopf.fr/geocodage

export interface GeocodingFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    label: string;
    id: string;
    postcode?: string;
    city?: string;
    citycode?: string;
    street?: string;
    housenumber?: string;
    name?: string;
    type?: "housenumber" | "street" | "locality" | "municipality";
    _type: "address" | "poi" | "parcel";
    _score: number;
  };
}

interface GeocodingResponse {
  type: "FeatureCollection";
  features: GeocodingFeature[];
}

const GEOCODING_API_BASE = "https://data.geopf.fr/geocodage";

export async function geocodeAddress(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodingFeature | null> {
  const params = new URLSearchParams({
    q: query,
    limit: "1",
    index: "address",
  });

  const url = `${GEOCODING_API_BASE}/search?${params}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("Erreur lors de la recherche");
  }

  const data: GeocodingResponse = await response.json();

  if (data.features.length === 0) {
    return null;
  }

  return data.features[0];
}
