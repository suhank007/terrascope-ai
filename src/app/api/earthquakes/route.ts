import { fetchEarthquakesData } from "@/features/earthquakes/lib/fetch-server";

export async function GET() {
  const data = await fetchEarthquakesData();
  return Response.json(data);
}
