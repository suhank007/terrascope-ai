/** Just enough RSS handling for the three public feeds we read. A full XML
 *  parser would be a dependency for five tag names. */

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

export function decodeEntities(value: string): string {
  return value
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#39);/g, (m) => ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

export function stripHtml(html: string): string {
  // A heading followed by a paragraph would otherwise run together ("Demonstrations There is...").
  const withBreaks = html.replace(/<\/h[1-6]>/gi, ". ");
  return decodeEntities(withBreaks.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .replace(/([.!?])\./g, "$1")
    .trim();
}

function cdata(value: string): string {
  const match = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return match ? match[1] : value;
}

export function tagText(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return match ? decodeEntities(cdata(match[1].trim())).trim() : null;
}

export interface RssItem {
  title: string;
  link: string | null;
  description: string | null;
  pubDate: string | null;
}

export function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1];
    const title = tagText(block, "title");
    if (!title) continue;
    const description = tagText(block, "description");
    items.push({
      title,
      link: tagText(block, "link"),
      description: description ? stripHtml(description) : null,
      pubDate: tagText(block, "pubDate"),
    });
  }
  return items;
}

export function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  // A date with no time or zone ("Fri, 23 Oct 2026") would be read in the
  // machine's local zone, so the same feed would give different instants on a
  // laptop and on a server. Pin those to UTC.
  const hasZone = /(?:GMT|UTC|Z|[+-]\d{2}:?\d{2})\s*$/i.test(value.trim());
  const time = Date.parse(hasZone ? value : `${value} GMT`);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}
