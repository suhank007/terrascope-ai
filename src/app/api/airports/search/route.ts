import { searchAirports } from "@/features/airports/lib/dataset";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length > 60) return Response.json({ error: "Query too long" }, { status: 400 });

  return Response.json(
    { results: searchAirports(q, 8) },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
