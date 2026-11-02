import { countryCodeForName, findCountryMentions } from "./countries";
import { parseRssItems, stripHtml, toIsoDate } from "./xml";
import type { Severity, UkAdvisory, UsAdvisory } from "../types";

const US_LEVELS: Record<1 | 2 | 3 | 4, Severity> = { 1: "none", 2: "caution", 3: "high", 4: "critical" };

/** "Iran - Level 4: Do Not Travel", also "Israel, The West Bank and Gaza - Level 3: ...". */
export function parseStateAdvisories(xml: string): Record<string, UsAdvisory> {
  const result: Record<string, UsAdvisory> = {};

  for (const item of parseRssItems(xml)) {
    const match = item.title.match(/^(.*?)\s+-\s+Level\s+([1-4])\s*:\s*(.+)$/i);
    if (!match) continue;

    const level = Number(match[2]) as 1 | 2 | 3 | 4;
    const codes = new Set<string>();
    const exact = countryCodeForName(match[1]);
    if (exact) codes.add(exact);
    else for (const code of findCountryMentions(match[1])) codes.add(code);

    for (const code of codes) {
      const existing = result[code];
      // A combined entry must never soften a country's own, stricter advisory.
      if (existing && existing.level >= level) continue;
      result[code] = {
        level,
        severity: US_LEVELS[level],
        label: match[3].trim(),
        url: item.link ?? "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html",
        updatedAt: toIsoDate(item.pubDate),
      };
    }
  }
  return result;
}

interface FcdoIndexChild {
  title?: string;
  base_path?: string;
}

/** Maps ISO code to the FCDO page path, by matching the page titles ("Czechia travel advice"). */
export function parseFcdoIndex(index: { links?: { children?: FcdoIndexChild[] } }): Record<string, string> {
  const map: Record<string, string> = {};
  for (const child of index.links?.children ?? []) {
    if (!child.title || !child.base_path) continue;
    const code = countryCodeForName(child.title.replace(/\s+travel advice$/i, ""));
    if (code && !map[code]) map[code] = child.base_path;
  }
  return map;
}

export function fcdoSeverity(alerts: string[]): { severity: Severity; partial: boolean } {
  if (alerts.includes("avoid_all_travel_to_whole_country")) return { severity: "critical", partial: false };
  if (alerts.includes("avoid_all_but_essential_travel_to_whole_country")) return { severity: "high", partial: false };
  if (alerts.some((a) => a.includes("_to_parts"))) return { severity: "caution", partial: true };
  return { severity: "none", partial: false };
}

interface FcdoCountryDoc {
  base_path?: string;
  description?: string;
  public_updated_at?: string;
  details?: {
    alert_status?: string[];
    parts?: { slug?: string; body?: string }[];
  };
}

export function parseFcdoCountry(doc: FcdoCountryDoc): UkAdvisory {
  const alerts = doc.details?.alert_status ?? [];
  const { severity, partial } = fcdoSeverity(alerts);
  const warnings = doc.details?.parts?.find((p) => p.slug === "warnings-and-insurance")?.body;

  let summary = warnings ? stripHtml(warnings) : "";
  if (summary.length > 320) summary = `${summary.slice(0, 317).trimEnd()}…`;

  return {
    severity,
    alerts,
    partial,
    summary: summary || doc.description || "No specific warnings are published.",
    url: `https://www.gov.uk${doc.base_path ?? "/foreign-travel-advice"}`,
    updatedAt: doc.public_updated_at ?? null,
  };
}
