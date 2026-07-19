export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  longitude: number;
  latitude: number;
  depthKm: number;
  url: string;
  tsunami: boolean;
}

export interface EarthquakesResponse {
  generatedAt: string;
  count: number;
  quakes: Earthquake[];
}
