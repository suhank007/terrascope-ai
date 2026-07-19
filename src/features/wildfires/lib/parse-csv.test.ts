import { describe, expect, it } from "vitest";
import { parseFirmsCsv } from "./parse-csv";

describe("parseFirmsCsv", () => {
  it("parses a well-formed FIRMS CSV into hotspots", () => {
    const csv = [
      "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight",
      "34.05,-118.24,320.5,0.4,0.4,2026-07-18,1230,N,VIIRS,h,2.0NRT,290.1,15.6,D",
      "-3.12,-60.02,310.0,0.4,0.4,2026-07-18,1400,N,VIIRS,n,2.0NRT,280.0,8.2,D",
    ].join("\n");

    const hotspots = parseFirmsCsv(csv);

    expect(hotspots).toHaveLength(2);
    expect(hotspots[0]).toMatchObject({
      latitude: 34.05,
      longitude: -118.24,
      brightnessK: 320.5,
      frp: 15.6,
      confidence: "high",
      satellite: "N",
    });
    expect(hotspots[0].acquiredAt).toBe(new Date("2026-07-18T12:30:00Z").toISOString());
    expect(hotspots[1].confidence).toBe("nominal");
  });

  it("returns an empty array for a header-only or empty CSV", () => {
    expect(parseFirmsCsv("latitude,longitude,frp")).toEqual([]);
    expect(parseFirmsCsv("")).toEqual([]);
  });

  it("skips malformed rows with the wrong column count", () => {
    const csv = ["latitude,longitude,frp", "1.0,2.0", "3.0,4.0,5.0"].join("\n");
    const hotspots = parseFirmsCsv(csv);
    expect(hotspots).toHaveLength(1);
    expect(hotspots[0].latitude).toBe(3.0);
  });

  it("caps output at 400 hotspots, keeping the highest FRP", () => {
    const header = "latitude,longitude,acq_date,acq_time,satellite,confidence,frp";
    const rows = Array.from(
      { length: 450 },
      (_, i) => `1.0,2.0,2026-07-18,1200,N,n,${i}`
    );
    const hotspots = parseFirmsCsv([header, ...rows].join("\n"));

    expect(hotspots).toHaveLength(400);
    expect(hotspots[0].frp).toBe(449);
  });
});
