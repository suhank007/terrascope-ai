import { buildTripBrief, tripParamsSchema } from "@/features/trip/lib/build-brief";

export async function GET(request: Request) {
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = tripParamsSchema.safeParse(query);
  if (!parsed.success) {
    return Response.json({ error: "Invalid trip parameters" }, { status: 400 });
  }

  const brief = await buildTripBrief(parsed.data);
  if (!brief) {
    return Response.json({ error: "Unknown country" }, { status: 400 });
  }

  return Response.json(brief, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" },
  });
}
