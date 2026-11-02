export interface AirportRef {
  iata: string;
  icao: string | null;
  name: string;
  city: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

export interface LiveFlight {
  callsign: string | null;
  icao24: string;
  registration: string | null;
  aircraft: string | null;
  latitude: number;
  longitude: number;
  altitudeFt: number | null;
  onGround: boolean;
  speedKt: number | null;
  headingDeg: number | null;
  verticalFpm: number | null;
  lastSeen: string;
}

export interface Progress {
  totalKm: number;
  remainingKm: number;
  /** 0 to 100, from straight-line distance; null when the route is too short to be meaningful. */
  percent: number | null;
  /** Straight-line distance over current ground speed. Not an airline ETA. */
  etaMinutes: number | null;
  /** The aircraft is nowhere near the stated route, so the route is probably wrong or the flight diverted. */
  offRoute: boolean;
}

export type TrackStatus = "airborne" | "on-ground" | "not-tracking" | "not-found";

export interface FlightTrack {
  status: TrackStatus;
  /** What the person typed, tidied. */
  query: string;
  callsign: string | null;
  flightNumber: string | null;
  airline: { name: string; iata: string; icao: string } | null;
  origin: AirportRef | null;
  destination: AirportRef | null;
  live: LiveFlight | null;
  progress: Progress | null;
  generatedAt: string;
}
