import { describe, expect, it } from "vitest";
import { noticesForCountry, outbreaksForCountry, parseCdcNotices, parseWhoOutbreaks } from "./parse-health";

const CDC_RSS = `<rss><channel>
<item><title>Level 1 - Ebola Bundibugyo Virus Disease in Kenya</title><description><![CDATA[Confirmed case in Nairobi, Kenya.]]></description><link>https://cdc/kenya</link><pubDate>Mon, 19 Oct 2026 04:00:00 GMT</pubDate></item>
<item><title>Level 2 - Yellow Fever in Ghana</title><description><![CDATA[Outbreak in the Upper West Region of Ghana.]]></description><link>https://cdc/ghana</link><pubDate>Fri, 16 Oct 2026 04:00:00 GMT</pubDate></item>
<item><title>Level 1 - Global Dengue</title><description><![CDATA[Dengue is a year-round risk. Country List : Colombia, Vietnam, Kenya, Sri Lanka]]></description><link>https://cdc/dengue</link><pubDate>Sun, 11 Oct 2026 04:00:00 GMT</pubDate></item>
<item><title>Level 3 - Measles in Papua New Guinea</title><description><![CDATA[Large outbreak.]]></description><link>https://cdc/png</link></item>
</channel></rss>`;

describe("parseCdcNotices / noticesForCountry", () => {
  const notices = parseCdcNotices(CDC_RSS);

  it("parses level, title and link", () => {
    expect(notices).toHaveLength(4);
    expect(notices[1]).toMatchObject({ level: 2, severity: "caution", title: "Yellow Fever in Ghana", url: "https://cdc/ghana" });
  });

  it("finds notices by country, including global ones that list it", () => {
    const kenya = noticesForCountry(notices, "KE");
    expect(kenya.map((n) => n.title)).toEqual(["Ebola Bundibugyo Virus Disease in Kenya", "Global Dengue"]);
  });

  it("orders by level first, then by date", () => {
    const withBoth = parseCdcNotices(`<rss><channel>
      <item><title>Level 1 - A in Ghana</title><link>a</link><pubDate>Mon, 19 Oct 2026 04:00:00 GMT</pubDate></item>
      <item><title>Level 3 - B in Ghana</title><link>b</link><pubDate>Mon, 01 Jun 2026 04:00:00 GMT</pubDate></item>
    </channel></rss>`);
    expect(noticesForCountry(withBoth, "GH").map((n) => n.level)).toEqual([3, 1]);
  });

  it("does not confuse Papua New Guinea with Guinea", () => {
    expect(noticesForCountry(notices, "PG")).toHaveLength(1);
    expect(noticesForCountry(notices, "GN")).toHaveLength(0);
  });

  it("returns an empty list for a country with no notices", () => {
    expect(noticesForCountry(notices, "FR")).toEqual([]);
  });
});

describe("parseWhoOutbreaks / outbreaksForCountry", () => {
  const outbreaks = parseWhoOutbreaks({
    value: [
      { Title: "Ebola disease caused by Bundibugyo virus - Democratic Republic of the Congo", PublicationDateAndTime: "2026-10-08T00:00:00Z", ItemDefaultUrl: "/2026-DON619" },
      { Title: "Middle East respiratory syndrome coronavirus - Kingdom of Saudi Arabia", PublicationDateAndTime: "2026-10-15T00:00:00Z", ItemDefaultUrl: "/mers-saudi" },
      { Title: "Old cholera report - Nigeria", PublicationDateAndTime: "2024-01-01T00:00:00Z", ItemDefaultUrl: "/old" },
      { Title: "Missing url" },
    ],
  });
  const now = Date.parse("2026-11-01T00:00:00Z");

  it("builds the WHO item URL and skips incomplete items", () => {
    expect(outbreaks).toHaveLength(3);
    expect(outbreaks[0].url).toBe("https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON619");
  });

  it("matches the country named in the headline", () => {
    expect(outbreaksForCountry(outbreaks, "SA", now).map((o) => o.url)).toEqual([
      "https://www.who.int/emergencies/disease-outbreak-news/item/mers-saudi",
    ]);
    expect(outbreaksForCountry(outbreaks, "CD", now)).toHaveLength(1);
  });

  it("drops reports older than a year", () => {
    expect(outbreaksForCountry(outbreaks, "NG", now)).toEqual([]);
  });
});
