import { fetchWildfiresData } from "@/features/wildfires/lib/fetch-server";

export async function GET() {
  const data = await fetchWildfiresData();
  return Response.json(data);
}
