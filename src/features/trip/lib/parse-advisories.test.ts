import { describe, expect, it } from "vitest";
import { fcdoSeverity, parseFcdoCountry, parseFcdoIndex, parseStateAdvisories } from "./parse-advisories";

const STATE_RSS = `<?xml version="1.0"?><rss><channel>
<item><title>Iran - Level 4: Do Not Travel</title><link>https://travel.state.gov/iran</link><pubDate>Fri, 23 Oct 2026</pubDate><description><![CDATA[Do not travel]]></description></item>
<item><title>France - Level 2: Exercise Increased Caution</title><link>https://travel.state.gov/france</link><pubDate>Mon, 05 Oct 2026</pubDate></item>
<item><title>Israel, The West Bank and Gaza - Level 3: Reconsider Travel</title><link>https://travel.state.gov/il</link><pubDate>Mon, 05 Oct 2026</pubDate></item>
<item><title>Czechia - Level 1: Exercise Normal Precautions</title><link>https://travel.state.gov/cz</link></item>
<item><title>Not an advisory</title></item>
</channel></rss>`;

describe("parseStateAdvisories", () => {
  const result = parseStateAdvisories(STATE_RSS);

  it("maps level to severity and keeps the link and date", () => {
    expect(result.IR).toMatchObject({ level: 4, severity: "critical", label: "Do Not Travel", url: "https://travel.state.gov/iran" });
    expect(result.IR.updatedAt).toBe("2026-10-23T00:00:00.000Z");
    expect(result.FR).toMatchObject({ level: 2, severity: "caution" });
    expect(result.CZ).toMatchObject({ level: 1, severity: "none" });
  });

  it("applies a combined entry to each country it names", () => {
    expect(result.IL?.level).toBe(3);
    expect(result.PS?.level).toBe(3);
  });

  it("ignores items that are not advisories", () => {
    expect(Object.keys(result).sort()).toEqual(["CZ", "FR", "IL", "IR", "PS"]);
  });

  it("never lets a combined entry soften a stricter one", () => {
    const rss = `<rss><channel>
      <item><title>Israel - Level 4: Do Not Travel</title><link>x</link></item>
      <item><title>Israel, The West Bank and Gaza - Level 3: Reconsider Travel</title><link>y</link></item>
    </channel></rss>`;
    expect(parseStateAdvisories(rss).IL.level).toBe(4);
  });
});

describe("parseFcdoIndex", () => {
  it("maps ISO codes to page paths by title", () => {
    const map = parseFcdoIndex({
      links: {
        children: [
          { title: "USA travel advice", base_path: "/foreign-travel-advice/usa" },
          { title: "Czechia travel advice", base_path: "/foreign-travel-advice/czechia" },
          { title: "Democratic Republic of the Congo travel advice", base_path: "/foreign-travel-advice/democratic-republic-of-the-congo" },
          { title: "Congo travel advice", base_path: "/foreign-travel-advice/congo" },
          { title: "Nowhere travel advice", base_path: "/foreign-travel-advice/nowhere" },
        ],
      },
    });
    expect(map.US).toBe("/foreign-travel-advice/usa");
    expect(map.CZ).toBe("/foreign-travel-advice/czechia");
    expect(map.CD).toContain("democratic-republic");
    expect(map.CG).toBe("/foreign-travel-advice/congo");
    expect(Object.values(map)).not.toContain("/foreign-travel-advice/nowhere");
  });
});

describe("fcdoSeverity", () => {
  it("ranks the whole-country warnings above partial ones", () => {
    expect(fcdoSeverity(["avoid_all_travel_to_whole_country"])).toEqual({ severity: "critical", partial: false });
    expect(fcdoSeverity(["avoid_all_but_essential_travel_to_whole_country"])).toEqual({ severity: "high", partial: false });
    expect(fcdoSeverity(["avoid_all_travel_to_parts", "avoid_all_but_essential_travel_to_parts"])).toEqual({ severity: "caution", partial: true });
    expect(fcdoSeverity([])).toEqual({ severity: "none", partial: false });
  });
});

describe("parseFcdoCountry", () => {
  it("summarises the warnings section as plain text and links to the page", () => {
    const advisory = parseFcdoCountry({
      base_path: "/foreign-travel-advice/egypt",
      public_updated_at: "2026-10-01T10:00:00+01:00",
      details: {
        alert_status: ["avoid_all_travel_to_parts"],
        parts: [{ slug: "warnings-and-insurance", body: "<p>FCDO advises <strong>against</strong> all travel to parts of Egypt.</p>" }],
      },
    });
    expect(advisory.severity).toBe("caution");
    expect(advisory.partial).toBe(true);
    expect(advisory.summary).toBe("FCDO advises against all travel to parts of Egypt.");
    expect(advisory.url).toBe("https://www.gov.uk/foreign-travel-advice/egypt");
  });

  it("keeps a heading separate from the paragraph after it", () => {
    const advisory = parseFcdoCountry({
      details: { parts: [{ slug: "warnings-and-insurance", body: "<h3>Demonstrations</h3><p>There is an increased likelihood of protests.</p>" }] },
    });
    expect(advisory.summary).toBe("Demonstrations. There is an increased likelihood of protests.");
  });

  it("truncates long summaries", () => {
    const advisory = parseFcdoCountry({ details: { parts: [{ slug: "warnings-and-insurance", body: `<p>${"word ".repeat(200)}</p>` }] } });
    expect(advisory.summary.length).toBeLessThanOrEqual(320);
    expect(advisory.summary.endsWith("…")).toBe(true);
  });
});
