import { z } from "zod";
import { fetchSights } from "@/features/trip/lib/fetch-trip";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  cc: z.string().length(2).transform((v) => v.toUpperCase()),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

/** The places list is the slowest part of a trip brief (it may widen its
 *  search), so it loads separately and the rest of the page never waits on it. */
export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "Invalid parameters" }, { status: 400 });

  const { name, cc, lat, lon } = parsed.data;
  const section = await fetchSights({ name, countryCode: cc, countryName: cc, latitude: lat, longitude: lon });

  return Response.json(section, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
