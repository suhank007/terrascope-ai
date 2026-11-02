import { describe, expect, it } from "vitest";
import { countryCodeForName, countryEssentials, findCountryMentions, normalizeName } from "./countries";

describe("normalizeName", () => {
  it("strips diacritics, punctuation, case and a leading 'the'", () => {
    expect(normalizeName("Türkiye")).toBe("turkiye");
    expect(normalizeName("The Gambia")).toBe("gambia");
    expect(normalizeName("Côte d'Ivoire")).toBe("cote d ivoire");
  });
});

describe("countryCodeForName", () => {
  it("resolves names the way feeds print them", () => {
    expect(countryCodeForName("Czechia")).toBe("CZ");
    expect(countryCodeForName("Czech Republic")).toBe("CZ");
    expect(countryCodeForName("Türkiye")).toBe("TR");
    expect(countryCodeForName("United Arab Emirates")).toBe("AE");
    expect(countryCodeForName("Democratic Republic of the Congo")).toBe("CD");
    expect(countryCodeForName("Atlantis")).toBeNull();
  });
});

describe("findCountryMentions", () => {
  it("finds a country inside a headline", () => {
    expect([...findCountryMentions("Level 2 - Yellow Fever in Ghana")]).toEqual(["GH"]);
  });

  it("does not match Niger inside Nigeria", () => {
    const hits = findCountryMentions("Cholera outbreak in Nigeria");
    expect(hits.has("NG")).toBe(true);
    expect(hits.has("NE")).toBe(false);
  });

  it("prefers the longest name so Papua New Guinea is not Guinea", () => {
    const hits = findCountryMentions("Polio detected in Papua New Guinea");
    expect(hits.has("PG")).toBe(true);
    expect(hits.has("GN")).toBe(false);
  });

  it("separates South Sudan from Sudan", () => {
    const hits = findCountryMentions("Measles in South Sudan");
    expect(hits.has("SS")).toBe(true);
    expect(hits.has("SD")).toBe(false);
  });

  it("finds several countries in one list", () => {
    const hits = findCountryMentions("Country List : Colombia, Vietnam, Kenya, Sri Lanka");
    expect([...hits].sort()).toEqual(["CO", "KE", "LK", "VN"]);
  });
});

describe("countryEssentials", () => {
  it("returns currency, calling code and driving side", () => {
    const fr = countryEssentials("FR")!;
    expect(fr.currencyCode).toBe("EUR");
    expect(fr.drivesOn).toBe("right");
    expect(fr.flag).toBe("🇫🇷");
    expect(countryEssentials("GB")!.drivesOn).toBe("left");
    expect(countryEssentials("IN")!.drivesOn).toBe("left");
  });

  it("builds single-suffix calling codes and is case-insensitive", () => {
    expect(countryEssentials("fr")!.callingCode).toBe("+33");
  });

  it("returns null for unknown codes", () => {
    expect(countryEssentials("ZZ")).toBeNull();
  });
});
