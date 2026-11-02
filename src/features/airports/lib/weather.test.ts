import { describe, expect, it } from "vitest";
import { ceilingFt, decodeWeather, decodeWeatherToken, flightCategory, parseMetar, parseVisibility, summarizeTaf, worseCategory } from "./weather";

describe("parseVisibility", () => {
  it("reads numbers and the 6+ / 10+ strings", () => {
    expect(parseVisibility(3.73)).toBe(3.73);
    expect(parseVisibility("6+")).toBe(6);
    expect(parseVisibility("10+")).toBe(10);
    expect(parseVisibility("")).toBeNull();
    expect(parseVisibility(undefined)).toBeNull();
    expect(parseVisibility("abc")).toBeNull();
  });
});

describe("ceilingFt", () => {
  it("is the lowest broken or overcast layer, ignoring few and scattered", () => {
    expect(ceilingFt([{ cover: "SCT", base: 800 }, { cover: "BKN", base: 2900 }, { cover: "OVC", base: 3900 }])).toBe(2900);
    expect(ceilingFt([{ cover: "FEW", base: 500 }])).toBeNull();
    expect(ceilingFt([])).toBeNull();
  });

  it("treats vertical visibility as a ceiling (in hundreds of feet)", () => {
    expect(ceilingFt([], 2)).toBe(200);
  });
});

describe("flightCategory", () => {
  it("applies the FAA thresholds", () => {
    expect(flightCategory(10, null)).toBe("VFR");
    expect(flightCategory(6, 5000)).toBe("VFR");
    expect(flightCategory(5, 5000)).toBe("MVFR");
    expect(flightCategory(10, 3000)).toBe("MVFR");
    expect(flightCategory(2.9, 5000)).toBe("IFR");
    expect(flightCategory(10, 900)).toBe("IFR");
    expect(flightCategory(0.5, 5000)).toBe("LIFR");
    expect(flightCategory(10, 400)).toBe("LIFR");
  });

  it("is null when nothing is known", () => {
    expect(flightCategory(null, null)).toBeNull();
  });
});

describe("worseCategory", () => {
  it("returns the more restrictive one and tolerates nulls", () => {
    expect(worseCategory("VFR", "IFR")).toBe("IFR");
    expect(worseCategory("LIFR", "MVFR")).toBe("LIFR");
    expect(worseCategory(null, "MVFR")).toBe("MVFR");
    expect(worseCategory("VFR", null)).toBe("VFR");
  });
});

describe("decodeWeatherToken", () => {
  it.each([
    ["-RA", "light rain"],
    ["+RA", "heavy rain"],
    ["RA", "rain"],
    ["TSRA", "thunderstorm with rain"],
    ["+TSRA", "heavy thunderstorm with rain"],
    ["TS", "thunderstorm"],
    ["-SHRA", "light rain showers"],
    ["SHRA", "rain showers"],
    ["BR", "mist"],
    ["FG", "fog"],
    ["FZFG", "freezing fog"],
    ["HZ", "haze"],
    ["BLSN", "blowing snow"],
    ["-SN", "light snow"],
    ["FZRA", "freezing rain"],
    ["VA", "volcanic ash"],
    ["VCTS", "nearby thunderstorm"],
  ])("%s -> %s", (token, expected) => {
    expect(decodeWeatherToken(token)).toBe(expected);
  });

  it("drops tokens it doesn't understand instead of guessing", () => {
    expect(decodeWeatherToken("XX")).toBeNull();
    expect(decodeWeatherToken("")).toBeNull();
    expect(decodeWeatherToken("RAXX")).toBeNull();
  });
});

describe("decodeWeather", () => {
  it("decodes several groups and skips empties", () => {
    expect(decodeWeather("-RA BR")).toEqual(["light rain", "mist"]);
    expect(decodeWeather(null)).toEqual([]);
    expect(decodeWeather("")).toEqual([]);
  });
});

describe("parseMetar", () => {
  it("parses the live Moscow LIFR report shape", () => {
    const m = parseMetar({ icaoId: "UUEE", obsTime: 1793628000, fltCat: "LIFR", visib: 1.49, wxString: "BR", wdir: 30, wspd: 6, wgst: null, temp: 2, clouds: [], rawOb: "METAR UUEE" })!;
    expect(m).toMatchObject({ icao: "UUEE", flightCategory: "LIFR", visibilitySm: 1.49, windKt: 6, gustKt: null, weather: ["mist"], tempC: 2 });
    expect(m.observedAt).toBe(new Date(1793628000 * 1000).toISOString());
  });

  it("keeps variable wind and computes the category when the feed omits it", () => {
    const m = parseMetar({ icaoId: "VIDP", wdir: "VRB", wspd: 2, visib: 1.55, wxString: "HZ", fltCat: null, clouds: [] })!;
    expect(m.windDir).toBe("VRB");
    expect(m.flightCategory).toBe("IFR");
  });

  it("returns null without a station id", () => {
    expect(parseMetar({})).toBeNull();
  });
});

describe("summarizeTaf", () => {
  const NOW = 1793620900 * 1000;
  const london = {
    rawTAF: "TAF EGLL 021059Z 0212/0318 02010KT 9999 SCT025 PROB30 TEMPO 0212/0218 03015G25KT 7000 -SHRA",
    issueTime: "2026-11-02T10:59:00.000Z",
    fcsts: [
      { timeFrom: 1793620800, timeTo: 1793728800, fcstChange: null, visib: "6+", clouds: [{ cover: "SCT", base: 2500 }] },
      { timeFrom: 1793620800, timeTo: 1793642400, fcstChange: "TEMPO", probability: 30, wgst: 25, visib: 4.35, wxString: "-SHRA", clouds: [] },
      { timeFrom: 1793900000, timeTo: 1793990000, fcstChange: "TEMPO", visib: 0.2, clouds: [] },
    ],
  };

  it("folds TEMPO periods in as temporary and ignores periods outside the window", () => {
    const t = summarizeTaf(london, NOW, 12)!;
    expect(t.worstCategory).toBe("MVFR");
    expect(t.worstIsTemporary).toBe(true);
    expect(t.maxGustKt).toBe(25);
    expect(t.weather).toEqual(["light rain showers"]);
    expect(t.thunderstorm).toBe(false);
  });

  it("flags thunderstorms anywhere in the window", () => {
    const t = summarizeTaf({ rawTAF: "x", fcsts: [{ timeFrom: 1793620800, timeTo: 1793700000, wxString: "TSRA", visib: "6+", clouds: [] }] }, NOW, 12)!;
    expect(t.thunderstorm).toBe(true);
  });

  it("returns null when there is no forecast", () => {
    expect(summarizeTaf({ rawTAF: "x", fcsts: [] }, NOW)).toBeNull();
    expect(summarizeTaf({}, NOW)).toBeNull();
  });
});
