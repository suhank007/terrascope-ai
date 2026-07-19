export interface Flight {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  longitude: number;
  latitude: number;
  altitudeM: number | null;
  onGround: boolean;
  velocityMs: number | null;
  trueTrack: number | null;
  verticalRateMs: number | null;
  lastContact: string;
}

export interface FlightsResponse {
  generatedAt: string;
  count: number;
  truncated: boolean;
  degraded: boolean;
  flights: Flight[];
}

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}
