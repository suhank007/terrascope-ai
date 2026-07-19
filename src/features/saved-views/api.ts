import { fetchJson } from "@/lib/fetcher";
import type { CreateSavedViewInput, SavedView } from "./types";

export function fetchSavedViews(): Promise<{ views: SavedView[] }> {
  return fetchJson<{ views: SavedView[] }>("/api/saved-views");
}

export function createSavedView(input: CreateSavedViewInput): Promise<{ view: SavedView }> {
  return fetchJson<{ view: SavedView }>("/api/saved-views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteSavedView(id: string): Promise<{ success: boolean }> {
  return fetchJson<{ success: boolean }>(`/api/saved-views/${id}`, { method: "DELETE" });
}
