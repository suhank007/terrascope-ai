import { describe, expect, it } from "vitest";
import { formatNoticeDate } from "./dates";

const NOW = Date.parse("2026-11-02T12:00:00Z");

describe("formatNoticeDate", () => {
  it("is relative while fresh", () => {
    expect(formatNoticeDate("2026-10-30T12:00:00Z", NOW)).toBe("3d ago");
  });

  it("is an absolute date once older than a month", () => {
    expect(formatNoticeDate("2025-05-12T04:00:00Z", NOW)).toBe("12 May 2025");
  });

  it("returns an empty string for junk", () => {
    expect(formatNoticeDate("not a date", NOW)).toBe("");
  });
});
