export interface GeocodeResult {
  id: number;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  category: string | null;
  bbox: { west: number; south: number; east: number; north: number } | null;
}

export interface GeocodeResponse {
  results: GeocodeResult[];
}
