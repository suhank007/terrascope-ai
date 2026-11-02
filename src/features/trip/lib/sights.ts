import { haversineKm } from "./geo";
import type { Sight, SightCategory } from "../types";

interface SparqlBinding {
  item?: { value: string };
  itemLabel?: { value: string };
  itemDescription?: { value: string };
  sitelinks?: { value: string };
  coord?: { value: string };
}

export interface SparqlResults {
  results?: { bindings?: SparqlBinding[] };
}

/** Wikidata gives no clean "type is a sight" filter that stays fast, so we read
 *  the one-line description. Order matters: the first rule that matches wins. */
const RULES: { category: SightCategory; pattern: RegExp }[] = [
  { category: "viewpoint", pattern: /\b(observation|lookout|viewpoint|belvedere|viewing|peak|summit|skyscraper|observatory)\b/i },
  {
    category: "culture",
    pattern:
      /\b(museum|gallery|theat(?:re|er)|opera|library|monument|memorial|palace|castle|cathedral|church|basilica|temple|shrine|mosque|synagogue|abbey|monastery|fort|fortress|ruins|tomb|mausoleum|pagoda|chapel|mansion|villa|heritage|archaeological|landmark|statue|cemetery|opera house|concert hall)\b/i,
  },
  {
    category: "outdoors",
    pattern: /\b(park|garden|gardens|beach|lake|mountain|hill|island|waterfall|zoo|aquarium|forest|trail|canyon|reserve|botanical|bay|cave|river|promenade)\b/i,
  },
  { category: "landmark", pattern: /\b(tower|bridge|gate|arch|square|avenue|street|boulevard|plaza|market|bazaar|district|quarter|neighbou?rhood|stadium|pier|port|harbou?r|fountain|dam)\b/i },
];

/** Things that match a category word ("island country", "public university
 *  with a library") but are not somewhere you visit. Settlements are caught by
 *  their opening words so "museum in the city of X" is unaffected. */
const NOT_A_SIGHT =
  /^(?:city|town|village|capital|commune|municipality|prefecture|province|county|district of|region|state|island country|country|sovereign|administrative|ward|borough)\b|\b(?:sovereign state|island country|continent|language|treaty|tournament|olympics|olympic games|world cup|battle|siege|attacks?|election|empire|dynasty|company|corporation|ministry|political party|university|college|faculty|school|football club|football team)\b/i;

export function classifySight(description: string): SightCategory | null {
  if (NOT_A_SIGHT.test(description)) return null;
  for (const { category, pattern } of RULES) {
    if (pattern.test(description)) return category;
  }
  return null;
}

function parsePoint(wkt: string): { latitude: number; longitude: number } | null {
  const match = wkt.match(/Point\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
  if (!match) return null;
  return { longitude: Number(match[1]), latitude: Number(match[2]) };
}

export function parseSights(
  payload: SparqlResults,
  center: { latitude: number; longitude: number },
  limit = 10
): Sight[] {
  const seen = new Set<string>();
  const sights: Sight[] = [];

  for (const row of payload.results?.bindings ?? []) {
    const uri = row.item?.value;
    const name = row.itemLabel?.value;
    const description = row.itemDescription?.value;
    const languages = Number(row.sitelinks?.value);
    const point = row.coord ? parsePoint(row.coord.value) : null;
    if (!uri || !name || !description || !point || Number.isNaN(languages)) continue;

    const id = uri.split("/").pop() ?? uri;
    // No English label means Wikidata returned the bare Q-number.
    if (/^Q\d+$/.test(name) || seen.has(id)) continue;

    const category = classifySight(description);
    if (!category) continue;
    seen.add(id);

    sights.push({
      id,
      name,
      description,
      category,
      languages,
      distanceKm: Math.round(haversineKm(center.latitude, center.longitude, point.latitude, point.longitude) * 10) / 10,
      latitude: point.latitude,
      longitude: point.longitude,
      url: `https://www.wikidata.org/wiki/Special:GoToLinkedPage/enwiki/${id}`,
      mapUrl: `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=17/${point.latitude}/${point.longitude}`,
    });
  }

  return sights.sort((a, b) => b.languages - a.languages || a.distanceKm - b.distanceKm).slice(0, limit);
}

/** The SPARQL for "notable things within `radiusKm`", ranked by Wikipedia language coverage. */
export function sightsQuery(latitude: number, longitude: number, radiusKm: number, minLanguages: number): string {
  return `SELECT ?item ?itemLabel ?itemDescription ?sitelinks ?coord WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${longitude} ${latitude})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm}" .
  }
  ?item wikibase:sitelinks ?sitelinks .
  FILTER(?sitelinks >= ${minLanguages})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks) LIMIT 150`;
}
