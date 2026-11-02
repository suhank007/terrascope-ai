import { buildPlaceReport, placeParamsSchema } from "@/features/place/lib/build-report";

export async function GET(request: Request) {
  const parsed = placeParamsSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return Response.json({ error: "Invalid place parameters" }, { status: 400 });
  }

  const report = await buildPlaceReport(parsed.data);
  return Response.json(report, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
  });
}
