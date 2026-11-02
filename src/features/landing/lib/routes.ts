/** Real airport coordinates (lat, lon) for the front-page globe art. */
export const AIRPORT_POINTS: Record<string, [number, number]> = {
  LHR: [51.47, -0.45],
  CDG: [49.01, 2.55],
  FRA: [50.03, 8.57],
  JFK: [40.64, -73.78],
  MIA: [25.79, -80.29],
  LAX: [33.94, -118.41],
  GRU: [-23.43, -46.47],
  DXB: [25.25, 55.37],
  NBO: [-1.32, 36.93],
  DEL: [28.56, 77.1],
  SIN: [1.35, 103.99],
  HND: [35.55, 139.78],
  SYD: [-33.95, 151.18],
};

/** Long-haul pairs that look good on a globe. Speed is how fast the aircraft dot travels (1 is about 40 s). */
export const ROUTES: { from: string; to: string; speed: number; offset: number }[] = [
  { from: "LHR", to: "JFK", speed: 1, offset: 0.1 },
  { from: "LHR", to: "DXB", speed: 0.9, offset: 0.55 },
  { from: "DXB", to: "SIN", speed: 0.8, offset: 0.3 },
  { from: "SIN", to: "SYD", speed: 0.85, offset: 0.75 },
  { from: "JFK", to: "LAX", speed: 1.1, offset: 0.4 },
  { from: "LAX", to: "HND", speed: 0.7, offset: 0.2 },
  { from: "DXB", to: "NBO", speed: 1.0, offset: 0.6 },
  { from: "MIA", to: "GRU", speed: 0.9, offset: 0.05 },
  { from: "FRA", to: "DEL", speed: 0.95, offset: 0.5 },
  { from: "CDG", to: "JFK", speed: 1.05, offset: 0.85 },
  { from: "DEL", to: "SIN", speed: 1.0, offset: 0.15 },
];
