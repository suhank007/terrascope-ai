import { describe, expect, it } from "vitest";
import { describeRate } from "../components/essentials-card";

describe("describeRate", () => {
  it("states the home currency in the destination currency when the rate is usable", () => {
    expect(describeRate("USD", "EUR", 0.895)).toBe("1 USD = 0.8950 EUR");
    expect(describeRate("EUR", "USD", 1.1)).toBe("1 EUR = 1.10 USD");
    expect(describeRate("USD", "JPY", 150.4)).toBe("1 USD = 150 JPY");
  });

  it("flips tiny rates so the number is readable", () => {
    expect(describeRate("INR", "EUR", 0.0094)).toBe("1 EUR = 106 INR");
  });
});
