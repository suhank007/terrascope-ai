import { z } from "zod";
import { fetchGeocodeResults } from "@/features/search/lib/fetch-server";

const querySchema = z.object({
  q: z.string().trim().min(2).max(200),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") });

  if (!parsed.success) {
    return Response.json({ results: [] });
  }

  const data = await fetchGeocodeResults(parsed.data.q);
  return Response.json(data);
}
