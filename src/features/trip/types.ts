/** How bad a signal is, on one scale shared by every source we read. */
export type Severity = "none" | "caution" | "high" | "critical";

export type Section<T> = { status: "ok"; data: T } | { status: "unavailable"; reason: string };

export interface Destination {
  name: string;
  /** ISO 3166-1 alpha-2, upper case. */
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
}

export interface CountryEssentials {
  code: string;
  name: string;
  officialName: string;
  flag: string;
  capital: string | null;
  languages: string[];
  currencyCode: string | null;
  currencyName: string | null;
  currencySymbol: string | null;
  /** "+33" style, or null when the dataset has none. */
  callingCode: string | null;
  drivesOn: "left" | "right";
}

export interface UkAdvisory {
  severity: Severity;
  /** FCDO's own alert tags, e.g. "avoid_all_travel_to_parts". */
  alerts: string[];
  /** True when the warning covers only parts of the country. */
  partial: boolean;
  summary: string;
  url: string;
  updatedAt: string | null;
}

export interface UsAdvisory {
  /** 1 (normal precautions) to 4 (do not travel). */
  level: 1 | 2 | 3 | 4;
  severity: Severity;
  label: string;
  url: string;
  updatedAt: string | null;
}

export interface AdvisoriesData {
  uk: UkAdvisory | null;
  us: UsAdvisory | null;
  /** Sources that failed to load, so a gap is never mistaken for "all clear". */
  missing?: string[];
}

export interface HealthNotice {
  /** CDC travel-notice level, 1 to 4. */
  level: 1 | 2 | 3 | 4;
  severity: Severity;
  title: string;
  summary: string;
  url: string;
  date: string | null;
}

export interface Outbreak {
  title: string;
  url: string;
  date: string;
}

export interface HealthData {
  notices: HealthNotice[];
  outbreaks: Outbreak[];
  missing?: string[];
}

export interface ForecastDay {
  date: string;
  weatherCode: number;
  maxC: number;
  minC: number;
  rainChancePct: number | null;
  windMaxKph: number | null;
}

export interface ForecastData {
  timezone: string;
  days: ForecastDay[];
}

export interface AirQualityData {
  usAqi: number;
  label: string;
  color: string;
  observedAt: string;
}

export interface NearbyQuake {
  id: string;
  magnitude: number;
  place: string;
  distanceKm: number;
  time: string;
  tsunami: boolean;
}

export interface HazardsData {
  quakes: NearbyQuake[];
  /** Fire detections within the search radius. */
  fireCount: number;
  nearestFireKm: number | null;
  /** False when the wildfire feed isn't configured, so "0 fires" isn't claimed. */
  firesChecked: boolean;
  quakeRadiusKm: number;
  fireRadiusKm: number;
}

export interface CurrencyData {
  home: string;
  code: string;
  /** Units of the local currency per 1 unit of home currency. */
  rate: number;
  date: string;
}

export type SightCategory = "viewpoint" | "culture" | "outdoors" | "landmark";

export interface Sight {
  id: string;
  name: string;
  description: string;
  category: SightCategory;
  /** How many Wikipedia language editions cover it: our free fame signal. */
  languages: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
  url: string;
  mapUrl: string;
}

export interface TripLink {
  id: string;
  label: string;
  hint: string;
  url: string;
  group: "stay" | "fly" | "move" | "do" | "connect";
}

export interface VerdictReason {
  severity: Severity;
  text: string;
  source: string;
  url?: string;
}

export interface Verdict {
  level: Severity;
  headline: string;
  reasons: VerdictReason[];
  /** Sections that couldn't be checked, so a quiet verdict is never read as "all clear". */
  unchecked: string[];
}

export interface NearbyAirportRef {
  iata: string;
  name: string;
  city: string;
  distanceKm: number;
  size: "large" | "medium" | "small";
}

export interface TripBrief {
  destination: Destination;
  generatedAt: string;
  verdict: Verdict;
  country: CountryEssentials;
  advisories: Section<AdvisoriesData>;
  health: Section<HealthData>;
  forecast: Section<ForecastData>;
  airQuality: Section<AirQualityData>;
  hazards: Section<HazardsData>;
  currency: Section<CurrencyData>;
  airports: NearbyAirportRef[];
  links: TripLink[];
}

export type TravelMode = "business" | "leisure";
