import { fetchJson } from "@/lib/fetcher";
import type { WildfiresResponse } from "./types";

export function fetchWildfires(): Promise<WildfiresResponse> {
  return fetchJson<WildfiresResponse>("/api/wildfires");
}
