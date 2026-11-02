import countries from "world-countries";
import type { CountryEssentials } from "../types";

/** Countries (and territories) where traffic keeps left. */
const LEFT_HAND = new Set(
  "GB IE AU NZ JP IN PK BD LK NP TH ID MY SG ZA KE TZ UG ZM ZW MZ NA BW MT CY JM BS BB TT GY SR HK MO BN BT MV FJ PG WS TO LS SZ MW MU SC TL AG DM GD LC VC KN BM KY FK GG JE IM AI MS VG TC SH CK NU KI SB TV NR".split(
    " "
  )
);

/** Names the public feeds use that the dataset's own spellings miss. */
const ALIASES: Record<string, string[]> = {
  US: ["usa", "united states of america"],
  GB: ["uk", "great britain", "england", "scotland", "wales", "northern ireland"],
  TR: ["turkey", "turkiye"],
  CZ: ["czech republic", "czechia"],
  MM: ["burma", "myanmar burma"],
  CV: ["cape verde", "cabo verde"],
  CI: ["ivory coast", "cote d ivoire"],
  SZ: ["swaziland", "eswatini"],
  MK: ["macedonia", "north macedonia"],
  TL: ["east timor", "timor leste"],
  CD: ["democratic republic of the congo", "congo kinshasa", "drc", "dr congo"],
  CG: ["republic of the congo", "congo brazzaville", "congo"],
  KR: ["south korea", "republic of korea"],
  KP: ["north korea"],
  RU: ["russia", "russian federation"],
  VN: ["vietnam", "viet nam"],
  LA: ["laos"],
  IR: ["iran"],
  SY: ["syria"],
  BO: ["bolivia"],
  VE: ["venezuela"],
  TZ: ["tanzania"],
  PS: ["palestine", "occupied palestinian territories", "gaza", "west bank"],
  HK: ["hong kong"],
  MO: ["macau", "macao"],
  GM: ["the gambia", "gambia"],
  BS: ["the bahamas", "bahamas"],
  AE: ["uae", "united arab emirates"],
  SA: ["kingdom of saudi arabia", "saudi arabia"],
  FM: ["micronesia"],
  BA: ["bosnia", "bosnia and herzegovina"],
  NL: ["the netherlands", "netherlands", "holland"],
};

export function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^the /, "");
}

interface CountryRecord {
  code: string;
  names: string[];
}

const RECORDS: CountryRecord[] = countries.map((c) => {
  const names = new Set<string>();
  names.add(normalizeName(c.name.common));
  names.add(normalizeName(c.name.official));
  for (const spelling of c.altSpellings) {
    // Two-letter spellings are ISO codes ("FR"): far too ambiguous to match in prose.
    if (spelling.length > 3) names.add(normalizeName(spelling));
  }
  for (const alias of ALIASES[c.cca2] ?? []) names.add(normalizeName(alias));
  names.delete("");
  return { code: c.cca2, names: [...names] };
});

/** Every candidate name, longest first, so "papua new guinea" is consumed
 *  before "guinea" and "south sudan" before "sudan". */
const NAME_TABLE: { name: string; code: string }[] = RECORDS.flatMap((r) =>
  r.names.map((name) => ({ name, code: r.code }))
).sort((a, b) => b.name.length - a.name.length);

const EXACT = new Map<string, string>();
for (const { name, code } of NAME_TABLE) {
  // Longest-first order means the first writer wins on any clash.
  if (!EXACT.has(name)) EXACT.set(name, code);
}

/** Resolves a whole country name as printed by a feed ("Czechia", "Türkiye"). */
export function countryCodeForName(name: string): string | null {
  return EXACT.get(normalizeName(name)) ?? null;
}

/** Finds every country mentioned in free text such as a CDC or WHO headline. */
export function findCountryMentions(text: string): Set<string> {
  let remaining = ` ${normalizeName(text)} `;
  const found = new Set<string>();

  for (const { name, code } of NAME_TABLE) {
    const needle = ` ${name} `;
    if (remaining.includes(needle)) {
      found.add(code);
      remaining = remaining.split(needle).join(" ");
    }
  }
  return found;
}

export function countryEssentials(code: string): CountryEssentials | null {
  const c = countries.find((x) => x.cca2 === code.toUpperCase());
  if (!c) return null;

  const [currencyCode, currency] = Object.entries(c.currencies ?? {})[0] ?? [null, null];
  const calling = c.idd?.root
    ? c.idd.suffixes?.length === 1
      ? `${c.idd.root}${c.idd.suffixes[0]}`
      : c.idd.root
    : null;

  return {
    code: c.cca2,
    name: c.name.common,
    officialName: c.name.official,
    flag: c.flag,
    capital: c.capital?.[0] ?? null,
    languages: Object.values(c.languages ?? {}),
    currencyCode,
    currencyName: currency?.name ?? null,
    currencySymbol: currency?.symbol ?? null,
    callingCode: calling,
    drivesOn: LEFT_HAND.has(c.cca2) ? "left" : "right",
  };
}

/** Names to try when looking a country up in a feed that keys by name. */
export function nameCandidates(code: string): string[] {
  return RECORDS.find((r) => r.code === code.toUpperCase())?.names ?? [];
}
