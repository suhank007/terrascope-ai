import type { TravelMode, TripLink } from "../types";

const ORDER: Record<TravelMode, TripLink["group"][]> = {
  // Business travellers lead with getting there and getting around.
  business: ["fly", "move", "stay", "connect", "do"],
  leisure: ["stay", "do", "fly", "move", "connect"],
};

export const GROUP_LABELS: Record<TripLink["group"], string> = {
  fly: "Get there",
  move: "Get around",
  stay: "Stay",
  do: "Do and eat",
  connect: "Stay connected",
};

/** Pure and dependency-free, so the client can reorder without a refetch. */
export function orderLinkGroups(links: TripLink[], mode: TravelMode): { group: TripLink["group"]; label: string; links: TripLink[] }[] {
  return ORDER[mode]
    .map((group) => ({ group, label: GROUP_LABELS[group], links: links.filter((l) => l.group === group) }))
    .filter((g) => g.links.length > 0);
}

export const OFFICIAL_RULE_LINKS: { label: string; hint: string; url: string }[] = [
  { label: "TSA: what can I bring?", hint: "Carry-on and checked rules for US flights", url: "https://www.tsa.gov/travel/security-screening/whatcanibring/all-list" },
  { label: "UK hand luggage rules", hint: "Liquids, batteries and restricted items", url: "https://www.gov.uk/hand-luggage-restrictions" },
];
