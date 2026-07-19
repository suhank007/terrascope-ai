import "server-only";
import { normalizeFlights, type OpenSkyStatesResponse } from "./normalize";
import { capByCount, clampBbox } from "./sampling";
import type { BBox, FlightsResponse } from "../types";

const TOKEN_URL = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const STATES_URL = "https://opensky-network.org/api/states/all";

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

// OpenSky retired anonymous basic auth in March 2026 — the API now requires
// an OAuth2 client_credentials token (30 min lifetime). Cached in module
// scope so we don't request a fresh token on every flights poll.
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  let res: Response;
  try {
    res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
  } catch {
    return null;
  }

  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    // Refresh a bit early so a request never lands right on the expiry edge.
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

function degradedResponse(): FlightsResponse {
  return { generatedAt: new Date().toISOString(), count: 0, truncated: false, degraded: true, flights: [] };
}

async function fetchStates(url: string, token: string | null): Promise<Response | null> {
  try {
    return await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export async function fetchFlightsData(bbox: BBox): Promise<FlightsResponse> {
  const clamped = clampBbox(bbox);
  const url = `${STATES_URL}?lamin=${clamped.south}&lomin=${clamped.west}&lamax=${clamped.north}&lomax=${clamped.east}`;

  const token = await getAccessToken();
  let res = await fetchStates(url, token);

  if (res?.status === 401 && token) {
    // Token expired mid-flight — force a refresh and retry once.
    cachedToken = null;
    const freshToken = await getAccessToken();
    res = await fetchStates(url, freshToken);
  }

  if (!res || !res.ok) {
    // OpenSky's rate limits (429/503) still apply even when authenticated —
    // treat as a soft "degraded" state rather than a hard error so the UI
    // stays calm instead of showing a broken flights layer.
    return degradedResponse();
  }

  let raw: OpenSkyStatesResponse;
  try {
    raw = await res.json();
  } catch {
    return degradedResponse();
  }

  const normalized = normalizeFlights(raw);
  const { flights, truncated } = capByCount(normalized);

  return { generatedAt: new Date().toISOString(), count: flights.length, truncated, degraded: false, flights };
}
