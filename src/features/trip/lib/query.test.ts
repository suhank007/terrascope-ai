import { describe, expect, it } from "vitest";
import { apiParams, paramsFromQuery, queryFromParams } from "./query";

const params = (s: string) => new URLSearchParams(s);

describe("queryFromParams", () => {
  it("reads a complete trip and applies defaults", () => {
    expect(queryFromParams(params("name=Paris&cc=fr&lat=48.8566&lon=2.3522"))).toEqual({
      name: "Paris",
      cc: "FR",
      lat: 48.8566,
      lon: 2.3522,
      home: "USD",
      mode: "leisure",
      from: undefined,
      to: undefined,
    });
  });

  it("keeps business mode, home currency and valid dates", () => {
    const q = queryFromParams(params("name=Tokyo&cc=JP&lat=35&lon=139&mode=business&home=inr&from=2026-12-01&to=2026-12-09"))!;
    expect(q).toMatchObject({ mode: "business", home: "INR", from: "2026-12-01", to: "2026-12-09" });
  });

  it("rejects missing or out-of-range destinations", () => {
    expect(queryFromParams(params(""))).toBeNull();
    expect(queryFromParams(params("name=X&cc=FR&lat=999&lon=1"))).toBeNull();
    expect(queryFromParams(params("name=X&cc=FRA&lat=1&lon=1"))).toBeNull();
    expect(queryFromParams(params("name=X&cc=FR&lat=abc&lon=1"))).toBeNull();
  });

  it("drops malformed dates and currencies instead of failing", () => {
    const q = queryFromParams(params("name=X&cc=FR&lat=1&lon=1&from=soon&home=dollars"))!;
    expect(q.from).toBeUndefined();
    expect(q.home).toBe("USD");
  });
});

describe("paramsFromQuery / apiParams", () => {
  const q = { name: "Paris", cc: "FR", lat: 48.8566, lon: 2.3522, home: "EUR", mode: "business" as const, from: "2026-12-01" };

  it("round-trips through the URL", () => {
    expect(queryFromParams(paramsFromQuery(q))).toMatchObject({ name: "Paris", cc: "FR", mode: "business", from: "2026-12-01", home: "EUR" });
  });

  it("leaves mode out of API calls so toggling it never refetches", () => {
    expect(apiParams(q).has("mode")).toBe(false);
    expect(apiParams(q).get("name")).toBe("Paris");
  });
});
