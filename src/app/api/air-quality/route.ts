import { z } from "zod";
import { fetchAirQualityData } from "@/features/air-quality/lib/fetch-server";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
  });

  if (!parsed.success) {
    return Response.json({ error: "Invalid or missing lat/lon" }, { status: 400 });
  }

  const data = await fetchAirQualityData(parsed.data.lat, parsed.data.lon);
  if (!data) {
    return Response.json({ error: "Upstream air quality provider error" }, { status: 502 });
  }

  return Response.json(data);
}
