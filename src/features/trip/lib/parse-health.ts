import { findCountryMentions } from "./countries";
import { parseRssItems, toIsoDate } from "./xml";
import type { HealthNotice, Outbreak, Severity } from "../types";

const CDC_LEVELS: Record<1 | 2 | 3 | 4, Severity> = { 1: "none", 2: "caution", 3: "high", 4: "critical" };

export interface CdcNotice extends HealthNotice {
  countries: string[];
}

/** "Level 2 - Yellow Fever in Ghana". Global notices list their countries in the body text. */
export function parseCdcNotices(xml: string): CdcNotice[] {
  const notices: CdcNotice[] = [];

  for (const item of parseRssItems(xml)) {
    const match = item.title.match(/^Level\s+([1-4])\s*-\s*(.+)$/i);
    if (!match) continue;

    const level = Number(match[1]) as 1 | 2 | 3 | 4;
    const summary = item.description ?? "";
    const countries = new Set([...findCountryMentions(match[2]), ...findCountryMentions(summary)]);

    notices.push({
      level,
      severity: CDC_LEVELS[level],
      title: match[2].trim(),
      summary: summary.length > 260 ? `${summary.slice(0, 257).trimEnd()}…` : summary,
      url: item.link ?? "https://wwwnc.cdc.gov/travel/notices",
      date: toIsoDate(item.pubDate),
      countries: [...countries],
    });
  }
  return notices;
}

export function noticesForCountry(notices: CdcNotice[], code: string): HealthNotice[] {
  return notices
    .filter((n) => n.countries.includes(code))
    .sort((a, b) => b.level - a.level || (b.date ?? "").localeCompare(a.date ?? ""))
    .map((n) => ({ level: n.level, severity: n.severity, title: n.title, summary: n.summary, url: n.url, date: n.date }));
}

interface WhoItem {
  Title?: string;
  PublicationDateAndTime?: string;
  ItemDefaultUrl?: string;
}

export interface WhoOutbreak extends Outbreak {
  countries: string[];
}

export function parseWhoOutbreaks(payload: { value?: WhoItem[] }): WhoOutbreak[] {
  const outbreaks: WhoOutbreak[] = [];
  for (const item of payload.value ?? []) {
    if (!item.Title || !item.PublicationDateAndTime || !item.ItemDefaultUrl) continue;
    outbreaks.push({
      title: item.Title.trim(),
      url: `https://www.who.int/emergencies/disease-outbreak-news/item${item.ItemDefaultUrl}`,
      date: item.PublicationDateAndTime,
      countries: [...findCountryMentions(item.Title)],
    });
  }
  return outbreaks;
}

export function outbreaksForCountry(outbreaks: WhoOutbreak[], code: string, now = Date.now(), maxAgeDays = 365): Outbreak[] {
  const cutoff = now - maxAgeDays * 86_400_000;
  return outbreaks
    .filter((o) => o.countries.includes(code) && Date.parse(o.date) >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((o) => ({ title: o.title, url: o.url, date: o.date }));
}
