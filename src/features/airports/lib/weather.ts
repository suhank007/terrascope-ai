import type { FlightCategory, Metar, TafOutlook } from "../types";

interface Cloud {
  cover?: string;
  base?: number | null;
}

/** Aviation weather reports "6+" or "10+" when visibility is at least that. */
export function parseVisibility(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const n = Number.parseFloat(value.replace("+", ""));
  return Number.isNaN(n) ? null : n;
}

/** The ceiling is the lowest broken or overcast layer (or vertical visibility), in feet. */
export function ceilingFt(clouds: Cloud[] | undefined, vertVis?: number | null): number | null {
  const bases = (clouds ?? [])
    .filter((c) => (c.cover === "BKN" || c.cover === "OVC" || c.cover === "OVX") && typeof c.base === "number")
    .map((c) => c.base as number);
  if (typeof vertVis === "number") bases.push(vertVis * 100);
  return bases.length ? Math.min(...bases) : null;
}

/** FAA flight categories: LIFR below 1 sm or 500 ft, IFR below 3 sm or 1000 ft, MVFR up to 5 sm or 3000 ft. */
export function flightCategory(visibilitySm: number | null, ceiling: number | null): FlightCategory | null {
  if (visibilitySm === null && ceiling === null) return null;
  const vis = visibilitySm ?? Infinity;
  const ceil = ceiling ?? Infinity;
  if (vis < 1 || ceil < 500) return "LIFR";
  if (vis < 3 || ceil < 1000) return "IFR";
  if (vis <= 5 || ceil <= 3000) return "MVFR";
  return "VFR";
}

const CATEGORY_RANK: Record<FlightCategory, number> = { VFR: 0, MVFR: 1, IFR: 2, LIFR: 3 };
export function worseCategory(a: FlightCategory | null, b: FlightCategory | null): FlightCategory | null {
  if (!a) return b;
  if (!b) return a;
  return CATEGORY_RANK[b] > CATEGORY_RANK[a] ? b : a;
}

const DESCRIPTORS: Record<string, string> = {
  MI: "shallow",
  BC: "patchy",
  PR: "partial",
  DR: "low drifting",
  BL: "blowing",
  SH: "showers",
  TS: "thunderstorm",
  FZ: "freezing",
};
const PHENOMENA: Record<string, string> = {
  DZ: "drizzle",
  RA: "rain",
  SN: "snow",
  SG: "snow grains",
  IC: "ice crystals",
  PL: "ice pellets",
  GR: "hail",
  GS: "small hail",
  UP: "precipitation",
  BR: "mist",
  FG: "fog",
  FU: "smoke",
  VA: "volcanic ash",
  DU: "dust",
  SA: "sand",
  HZ: "haze",
  PY: "spray",
  PO: "dust whirls",
  SQ: "squalls",
  FC: "funnel cloud",
  SS: "sandstorm",
  DS: "duststorm",
};

/** "+TSRA" -> "heavy thunderstorm with rain". Unknown tokens are dropped, never guessed. */
export function decodeWeatherToken(token: string): string | null {
  let rest = token.trim().toUpperCase();
  if (!rest) return null;

  let intensity = "";
  if (rest.startsWith("+")) {
    intensity = "heavy ";
    rest = rest.slice(1);
  } else if (rest.startsWith("-")) {
    intensity = "light ";
    rest = rest.slice(1);
  } else if (rest.startsWith("VC")) {
    intensity = "nearby ";
    rest = rest.slice(2);
  }

  const descriptors: string[] = [];
  const phenomena: string[] = [];
  while (rest.length >= 2) {
    const code = rest.slice(0, 2);
    if (DESCRIPTORS[code]) descriptors.push(code);
    else if (PHENOMENA[code]) phenomena.push(PHENOMENA[code]);
    else return null;
    rest = rest.slice(2);
  }
  if (rest.length || (descriptors.length === 0 && phenomena.length === 0)) return null;

  const showers = descriptors.includes("SH");
  const thunder = descriptors.includes("TS");
  const others = descriptors.filter((d) => d !== "SH" && d !== "TS").map((d) => DESCRIPTORS[d]);
  const what = phenomena.join(" and ");

  let text: string;
  if (thunder) text = what ? `thunderstorm with ${what}` : "thunderstorm";
  else if (showers) text = what ? `${what} showers` : "showers";
  else text = [...others, what].filter(Boolean).join(" ");
  if (thunder && others.length) text = `${others.join(" ")} ${text}`;
  return `${intensity}${text}`.trim();
}

export function decodeWeather(wxString: string | null | undefined): string[] {
  if (!wxString) return [];
  return wxString
    .split(/\s+/)
    .map(decodeWeatherToken)
    .filter((w): w is string => w !== null);
}

interface MetarRow {
  icaoId?: string;
  obsTime?: number;
  reportTime?: string;
  fltCat?: string | null;
  temp?: number | null;
  wdir?: number | string | null;
  wspd?: number | null;
  wgst?: number | null;
  visib?: number | string | null;
  vertVis?: number | null;
  wxString?: string | null;
  clouds?: Cloud[];
  rawOb?: string;
}

const CATEGORIES = new Set<string>(["VFR", "MVFR", "IFR", "LIFR"]);

export function parseMetar(row: MetarRow): Metar | null {
  if (!row.icaoId) return null;
  const visibilitySm = parseVisibility(row.visib);
  const ceiling = ceilingFt(row.clouds, row.vertVis);
  const reported = row.fltCat && CATEGORIES.has(row.fltCat) ? (row.fltCat as FlightCategory) : null;

  return {
    icao: row.icaoId,
    observedAt: typeof row.obsTime === "number" ? new Date(row.obsTime * 1000).toISOString() : (row.reportTime ?? ""),
    flightCategory: reported ?? flightCategory(visibilitySm, ceiling),
    tempC: typeof row.temp === "number" ? row.temp : null,
    windDir: row.wdir === "VRB" ? "VRB" : typeof row.wdir === "number" ? row.wdir : null,
    windKt: typeof row.wspd === "number" ? row.wspd : null,
    gustKt: typeof row.wgst === "number" ? row.wgst : null,
    visibilitySm,
    ceilingFt: ceiling,
    weather: decodeWeather(row.wxString),
    raw: row.rawOb ?? "",
  };
}

interface TafPeriod {
  timeFrom?: number;
  timeTo?: number;
  fcstChange?: string | null;
  probability?: number | null;
  wgst?: number | null;
  visib?: number | string | null;
  vertVis?: number | null;
  wxString?: string | null;
  clouds?: Cloud[];
}

interface TafRow {
  rawTAF?: string;
  issueTime?: string;
  fcsts?: TafPeriod[];
}

/** What a TAF says about the next `hours` hours, folding TEMPO and PROB groups in as "at times". */
export function summarizeTaf(taf: TafRow, now = Date.now(), hours = 12): TafOutlook | null {
  if (!taf.fcsts?.length || !taf.rawTAF) return null;
  const startS = Math.floor(now / 1000);
  const endS = startS + hours * 3600;

  let worst: FlightCategory | null = null;
  let worstTemporary = false;
  let thunderstorm = false;
  let maxGust: number | null = null;
  const weather = new Set<string>();

  for (const p of taf.fcsts) {
    if (p.timeFrom === undefined || p.timeTo === undefined || p.timeTo < startS || p.timeFrom > endS) continue;
    const temporary = p.fcstChange === "TEMPO" || p.fcstChange === "PROB" || (p.probability ?? 0) > 0;
    const category = flightCategory(parseVisibility(p.visib), ceilingFt(p.clouds, p.vertVis));
    const next = worseCategory(worst, category);
    if (next !== worst) {
      worst = next;
      worstTemporary = temporary;
    } else if (category && category === worst && !temporary) {
      worstTemporary = false;
    }

    for (const w of decodeWeather(p.wxString)) {
      weather.add(w);
      if (w.includes("thunderstorm")) thunderstorm = true;
    }
    if (typeof p.wgst === "number") maxGust = Math.max(maxGust ?? 0, p.wgst);
  }

  return {
    hours,
    worstCategory: worst,
    worstIsTemporary: worstTemporary,
    thunderstorm,
    maxGustKt: maxGust,
    weather: [...weather],
    raw: taf.rawTAF,
    issuedAt: taf.issueTime ?? "",
  };
}
