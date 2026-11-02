import { describe, expect, it } from "vitest";
import { describeCeiling, describeVisibility, describeWind, flagEmoji, formatDuration, summarizeWeather } from "./format";

describe("flagEmoji", () => {
  it("builds a flag from an ISO code", () => {
    expect(flagEmoji("GB")).toBe("🇬🇧");
    expect(flagEmoji("us")).toBe("🇺🇸");
  });

  it("returns nothing for junk", () => {
    expect(flagEmoji("")).toBe("");
    expect(flagEmoji("USA")).toBe("");
    expect(flagEmoji("1?")).toBe("");
  });
});

describe("describeWind", () => {
  it("formats direction, speed and gusts", () => {
    expect(describeWind(230, 12, 24)).toBe("230° at 12 kt, gusting 24");
    expect(describeWind(30, 6, null)).toBe("030° at 6 kt");
    expect(describeWind("VRB", 2, null)).toBe("Variable at 2 kt");
    expect(describeWind(null, 5, null)).toBe("5 kt");
    expect(describeWind(180, 0, null)).toBe("Calm");
    expect(describeWind(null, null, null)).toBe("—");
  });
});

describe("describeVisibility / describeCeiling", () => {
  it("formats statute miles", () => {
    expect(describeVisibility(10)).toBe("6+ mi");
    expect(describeVisibility(1.49)).toBe("1.5 mi");
    expect(describeVisibility(0.25)).toBe("0.25 mi");
    expect(describeVisibility(3)).toBe("3 mi");
    expect(describeVisibility(null)).toBe("—");
  });

  it("says when there is no low cloud", () => {
    expect(describeCeiling(null)).toBe("No low cloud");
    expect(describeCeiling(2900)).toBe("2,900 ft");
  });
});

describe("formatDuration", () => {
  it("reads naturally", () => {
    expect(formatDuration(12)).toBe("12 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(173)).toBe("2 h 53 min");
    expect(formatDuration(125)).toBe("2 h 05 min");
  });
});

describe("summarizeWeather", () => {
  it("collapses repeats and sub-phrases into one", () => {
    expect(summarizeWeather(["nearby thunderstorm", "light thunderstorm with rain", "thunderstorm with rain"])).toEqual(["thunderstorm with rain"]);
  });

  it("keeps distinct conditions and caps the list", () => {
    expect(summarizeWeather(["light rain showers", "mist", "fog", "haze"])).toEqual(["rain showers", "mist", "fog"]);
    expect(summarizeWeather(["mist", "mist"])).toEqual(["mist"]);
    expect(summarizeWeather([])).toEqual([]);
  });
});
