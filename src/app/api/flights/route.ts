import { z } from "zod";
import { fetchFlightsData } from "@/features/flights/lib/fetch-server";

const querySchema = z.object({
  laMin: z.coerce.number().min(-90).max(90),
  loMin: z.coerce.number().min(-180).max(180),
  laMax: z.coerce.number().min(-90).max(90),
  loMax: z.coerce.number().min(-180).max(180),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    laMin: searchParams.get("laMin"),
    loMin: searchParams.get("loMin"),
    laMax: searchParams.get("laMax"),
    loMax: searchParams.get("loMax"),
  });

  if (!parsed.success) {
    return Response.json({ error: "Invalid bounding box" }, { status: 400 });
  }

  const data = await fetchFlightsData({
    west: parsed.data.loMin,
    south: parsed.data.laMin,
    east: parsed.data.loMax,
    north: parsed.data.laMax,
  });

  return Response.json(data);
}
