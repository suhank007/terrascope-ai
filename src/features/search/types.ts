export interface GeocodeResult {
  id: number;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  category: string | null;
  /** ISO 3166-1 alpha-2, upper case, when Nominatim reports one. */
  countryCode: string | null;
  countryName: string | null;
  bbox: { west: number; south: number; east: number; north: number } | null;
}

export interface GeocodeResponse {
  results: GeocodeResult[];
}
