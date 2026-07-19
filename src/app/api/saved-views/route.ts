import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SavedView } from "@/features/saved-views/types";

const cameraSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  height: z.number(),
  heading: z.number(),
  pitch: z.number(),
  roll: z.number(),
});

const layersSchema = z.object({
  earthquakes: z.boolean(),
  weather: z.boolean(),
  flights: z.boolean(),
  airQuality: z.boolean(),
  wildfires: z.boolean(),
});

const createViewSchema = z.object({
  name: z.string().min(1).max(80),
  camera: cameraSchema,
  layers: layersSchema,
  selectedAirlines: z.array(z.string()).max(50),
});

interface SavedViewRow {
  id: string;
  name: string;
  camera: SavedView["camera"];
  layers: SavedView["layers"];
  selected_airlines: string[];
  created_at: string;
}

function rowToSavedView(row: SavedViewRow): SavedView {
  return {
    id: row.id,
    name: row.name,
    camera: row.camera,
    layers: row.layers,
    selectedAirlines: row.selected_airlines,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("saved_views")
    .select("id, name, camera, layers, selected_airlines, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ views: (data as SavedViewRow[]).map(rowToSavedView) });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createViewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("saved_views")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      camera: parsed.data.camera,
      layers: parsed.data.layers,
      selected_airlines: parsed.data.selectedAirlines,
    })
    .select("id, name, camera, layers, selected_airlines, created_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ view: rowToSavedView(data as SavedViewRow) });
}
