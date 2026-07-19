# TerraScope AI

Real-time global intelligence platform — an interactive 3D globe streaming live earthquakes, weather, air quality, wildfires, and flight activity from public data feeds, with an AI copilot that can answer questions about what it's showing. Enterprise/Palantir-style dark UI: glassmorphism panels, a floating KPI ticker, an alerts bell, and a click-anywhere detail side panel.

**Status: core platform complete.** Globe + five live data modules + AI copilot, Docker/CI, unit tests. No auth, no persistence layer — see [What's not built](#whats-not-built-and-why).

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4
- CesiumJS + [resium](https://resium.reearth.io) for the 3D globe (OpenStreetMap basemap, no Cesium ion account needed)
- TanStack React Query for client polling/caching
- Framer Motion for panel/HUD transitions
- `@anthropic-ai/sdk` for the AI copilot (server-side tool-use loop)
- Route Handlers proxy every public data source server-side (avoids CORS, controls cache lifetime, keeps the copilot's tools and the map's fetches sharing one code path)
- Vitest for unit tests, GitHub Actions for CI, Docker (multi-stage, `output: "standalone"`) for deployment

No backend service, no database, no auth — see [What's not built](#whats-not-built-and-why) for why, and what it would take to add them.

## Live data sources

| Module | Source | Refresh | Key required? |
| --- | --- | --- | --- |
| Earthquakes | [USGS](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson) — M2.5+, past 24h | 60s | No |
| Weather | [Open-Meteo](https://open-meteo.com) — 20 preset cities + click-anywhere | 10min | No |
| Air quality | [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api) — US AQI at the same 20 cities | 15min | No |
| Flights | [OpenSky Network](https://opensky-network.org) — live state vectors | 60s | No (viewport-gated, see below) |
| Wildfires | [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/) — VIIRS active fire detections | 30min | **Yes** — free, instant signup |

Every source is proxied through `src/app/api/*/route.ts` — nothing calls third-party APIs directly from the browser, and each route delegates to a `lib/fetch-server.ts` function that the AI copilot's tools call directly (no self-HTTP round trip).

### Flights: viewport gating

OpenSky's anonymous tier prices by queried area, not aircraft count. To stay well inside the daily budget:

- Flights only load when zoomed in (camera height < 6,000km) — zoomed-out views show a "zoom in to see live flights" hint instead of querying.
- The query bbox is clamped to a fixed 10°×10° window around wherever the camera is looking, and rounded to the nearest 0.5° so small pans don't refetch.
- The server caps rendered aircraft at 300, prioritizing by speed, as a safety net independent of the bbox math.
- Fetches pause when the browser tab isn't visible.

At the default 60s poll interval this uses well under half the free daily quota for a multi-hour demo session. Upgrade path: a free OpenSky account (OAuth2 client-credentials) raises the limit to 4,000+ credits/day — swap the fetch call in `src/features/flights/lib/fetch-server.ts`.

### Wildfires: free key, graceful without it

NASA FIRMS requires a free, instant API key ([firms.modaps.eosdis.nasa.gov/api/map_key](https://firms.modaps.eosdis.nasa.gov/api/map_key)). Without `NASA_FIRMS_MAP_KEY` set, the layer shows a "add a free NASA_FIRMS_MAP_KEY to enable" hint instead of failing — the rest of the platform is unaffected.

### Globe: no Cesium ion account needed

The base imagery is OpenStreetMap (`OpenStreetMapImageryProvider`), set directly as the Viewer's `baseLayer` — this avoids Cesium's default Ion-backed World Imagery/Terrain, so nothing here requires a Cesium ion token or account. Terrain is the default flat ellipsoid (no elevation exaggeration).

Upgrade path: add `NEXT_PUBLIC_CESIUM_ION_TOKEN` to `.env.local`, call `Ion.defaultAccessToken` with it, and swap the base layer for `createWorldImageryAsync()` / `createWorldTerrainAsync()` for photorealistic imagery and real terrain relief.

## AI Copilot

A floating chat launcher (bottom-right) that answers questions like "summarize today's strongest earthquakes" or "what's the air quality in Beijing" using **`claude-opus-4-8`** via a server-side tool-use loop (`src/app/api/copilot/route.ts`). It has five tools — `get_earthquakes`, `get_wildfires`, `get_weather`, `get_air_quality`, `get_flights_near` — each backed by the same `lib/fetch-server.ts` functions the map itself uses, so the copilot is always answering from the same live data on screen, not from training knowledge.

Requires `ANTHROPIC_API_KEY` in `.env.local`. Without it, the panel shows a clear "not configured" state instead of erroring.

## Getting started

```bash
npm install   # postinstall copies Cesium's static assets into public/cesium
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The globe, earthquakes, weather, air quality, and flights work with **zero environment variables**.

To enable the optional pieces, create `.env.local`:

```bash
NASA_FIRMS_MAP_KEY=...       # free at firms.modaps.eosdis.nasa.gov/api/map_key — enables wildfires
ANTHROPIC_API_KEY=sk-ant-... # enables the AI copilot
```

```bash
npm run build && npm run start   # production build
npm run lint
npm run test                     # unit tests (Vitest)
```

### Docker

```bash
docker compose up --build
```

Builds a multi-stage image (`output: "standalone"` — traced server bundle only, no `node_modules` in the final image) and serves on `localhost:3001` (mapped to the container's port 3000 — 3001 to sidestep a common local port-3000 conflict; change the mapping in `docker-compose.yml` if you'd rather use 3000). Pass `NASA_FIRMS_MAP_KEY` / `ANTHROPIC_API_KEY` via a `.env` file or the shell environment; both are optional. Confirmed working end-to-end: static Cesium assets, live earthquake data, and graceful degradation for the two optional keys all verified against a running container.

## Project structure

```
src/
  app/
    page.tsx, layout.tsx, globals.css
    api/{earthquakes,weather,air-quality,flights,wildfires,copilot}/route.ts
  features/
    globe/          — Cesium viewer, click routing, camera tracking, shared UI context
    earthquakes/  weather/  air-quality/  flights/  wildfires/   — one folder per data domain:
                     types → lib/normalize.ts → lib/fetch-server.ts (shared by route + copilot)
                     → api.ts (client fetch) → hooks/use-*.ts (React Query)
                     → components/*-layer.tsx (Cesium entities) → components/*-panel-content.tsx
    alerts/          — derives severe-event alerts from the quakes/wildfires feeds already in flight
    copilot/         — chat UI + tool definitions/executors for the Anthropic tool-use loop
    kpi-bar/         — derived stats + ticker
    side-panel/      — glass detail panel, dispatches by selected entity type
  lib/               — fetch helper, format helpers, cn(), React Query provider
.github/workflows/ci.yml   — lint, typecheck, test, build on push/PR
Dockerfile, docker-compose.yml, .dockerignore
```

## What's not built (and why)

Deliberately out of scope, not oversights:

- **Auth + persistence (Supabase).** Needs a real Supabase project. The Supabase MCP connector available in this workspace requires interactive authorization (`/mcp` or `claude mcp`) that a non-interactive build session can't grant, and reusing an unrelated project's existing Supabase instance would mix unrelated app data into it. Nothing here is gated, so this was deferred rather than faked.
- **Shipping / AIS vessel tracking.** No viable free or keyless global AIS data source exists — real-time worldwide vessel tracking is a paid commercial data product (MarineTraffic, Datalastic, etc.). Not faked with mock data.
- **Ocean/marine layer.** Open-Meteo's Marine API is free and would follow the exact same pattern as weather/air-quality — genuinely just not built yet, lowest priority of the "easy" additions.

## Roadmap

- Ocean/marine data layer (Open-Meteo Marine API — same pattern as weather)
- Auth + saved views (once a Supabase project is provisioned/authorized)
- Executive/analytics dashboard view (charts over the KPI data already being fetched)
- Deployment (Vercel for the app; the Dockerfile is the self-hosted alternative)
