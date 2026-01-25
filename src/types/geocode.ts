/**
 * BigDataCloud Reverse Geocoding API response type.
 * Only includes relevant fields for our use case.
 */
export interface ReverseGeocodeResponse {
  city: string;
  locality: string;
  principalSubdivision: string;
  countryName: string;
  localityInfo: {
    administrative: Array<{
      name: string;
      order: number;
    }>;
  };
}
