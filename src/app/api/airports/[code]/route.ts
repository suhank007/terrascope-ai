import { getAirport } from "@/features/airports/lib/dataset";
import { buildAirportBrief } from "@/features/airports/lib/fetch-airport";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const airport = /^[A-Za-z0-9]{3,4}$/.test(code) ? getAirport(code) : null;
  if (!airport) return Response.json({ error: "Unknown airport" }, { status: 404 });

  return Response.json(await buildAirportBrief(airport), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
