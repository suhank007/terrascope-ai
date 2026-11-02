import { trackFlight } from "@/features/flight-tracker/lib/fetch-track";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const track = await trackFlight(q);
  if (!track) return Response.json({ error: "Enter a flight number like BA117, a callsign like BAW117, or a registration like G-BODO." }, { status: 400 });

  return Response.json(track, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } });
}
