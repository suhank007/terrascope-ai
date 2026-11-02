import { fetchBoard } from "@/features/airports/lib/fetch-board";

/** Hubs picked for spread: three continents' worth of weather, plus two US airports the FAA reports on. */
const BOARD = ["LHR", "CDG", "FRA", "DXB", "DEL", "SIN", "JFK", "MIA"];

export async function GET() {
  const rows = await fetchBoard(BOARD);
  return Response.json({ generatedAt: new Date().toISOString(), rows }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } });
}
