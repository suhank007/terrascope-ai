import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { fetchEarthquakesData } from "@/features/earthquakes/lib/fetch-server";
import { fetchWildfiresData } from "@/features/wildfires/lib/fetch-server";
import { fetchWeatherData } from "@/features/weather/lib/fetch-server";
import { fetchAirQualityData } from "@/features/air-quality/lib/fetch-server";
import { fetchFlightsData } from "@/features/flights/lib/fetch-server";

const MAX_LIST_ITEMS = 15;
const FLIGHT_RADIUS_DEG = 2.5;

export const COPILOT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_earthquakes",
    description:
      "Get the current list of earthquakes M2.5+ from the past 24 hours worldwide, sorted by magnitude descending. Use this for any question about seismic activity, recent quakes, or a specific region's earthquake risk.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_wildfires",
    description:
      "Get currently detected active wildfire hotspots worldwide (satellite fire detections from the past day), sorted by radiative power (intensity) descending. May be unavailable if not configured.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_weather",
    description:
      "Get current weather conditions (temperature, wind, humidity, condition) at a specific latitude/longitude. Use your own knowledge of a place's coordinates to call this for named cities.",
    input_schema: {
      type: "object",
      properties: {
        lat: { type: "number", description: "Latitude, -90 to 90" },
        lon: { type: "number", description: "Longitude, -180 to 180" },
        label: { type: "string", description: "Human-readable place name, for display only" },
      },
      required: ["lat", "lon"],
      additionalProperties: false,
    },
  },
  {
    name: "get_air_quality",
    description: "Get current air quality (US AQI, PM2.5, PM10, ozone) at a specific latitude/longitude.",
    input_schema: {
      type: "object",
      properties: {
        lat: { type: "number", description: "Latitude, -90 to 90" },
        lon: { type: "number", description: "Longitude, -180 to 180" },
        label: { type: "string", description: "Human-readable place name, for display only" },
      },
      required: ["lat", "lon"],
      additionalProperties: false,
    },
  },
  {
    name: "get_flights_near",
    description:
      "Get live aircraft currently airborne near a specific latitude/longitude (within roughly a 5-degree box). Returns degraded/empty results if no aircraft are tracked there or the upstream provider is rate-limited.",
    input_schema: {
      type: "object",
      properties: {
        lat: { type: "number", description: "Latitude, -90 to 90" },
        lon: { type: "number", description: "Longitude, -180 to 180" },
      },
      required: ["lat", "lon"],
      additionalProperties: false,
    },
  },
];

const latLon = z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) });

export async function executeCopilotTool(name: string, input: unknown): Promise<unknown> {
  switch (name) {
    case "get_earthquakes": {
      const data = await fetchEarthquakesData();
      return {
        generatedAt: data.generatedAt,
        totalCount: data.count,
        quakes: data.quakes
          .slice()
          .sort((a, b) => b.magnitude - a.magnitude)
          .slice(0, MAX_LIST_ITEMS)
          .map((q) => ({
            magnitude: q.magnitude,
            place: q.place,
            time: q.time,
            depthKm: q.depthKm,
            latitude: q.latitude,
            longitude: q.longitude,
            tsunami: q.tsunami,
          })),
      };
    }
    case "get_wildfires": {
      const data = await fetchWildfiresData();
      if (!data.configured) {
        return { configured: false, note: "Wildfire detection is not configured (no NASA FIRMS API key set)." };
      }
      return {
        configured: true,
        generatedAt: data.generatedAt,
        totalCount: data.count,
        hotspots: data.hotspots
          .slice()
          .sort((a, b) => b.frp - a.frp)
          .slice(0, MAX_LIST_ITEMS)
          .map((h) => ({
            latitude: h.latitude,
            longitude: h.longitude,
            radiativePowerMw: h.frp,
            confidence: h.confidence,
            detectedAt: h.acquiredAt,
          })),
      };
    }
    case "get_weather": {
      const { lat, lon } = latLon.parse(input);
      const data = await fetchWeatherData(lat, lon);
      if (!data) return { error: "Weather data unavailable for this location." };
      return data.current;
    }
    case "get_air_quality": {
      const { lat, lon } = latLon.parse(input);
      const data = await fetchAirQualityData(lat, lon);
      if (!data) return { error: "Air quality data unavailable for this location." };
      return data.current;
    }
    case "get_flights_near": {
      const { lat, lon } = latLon.parse(input);
      const data = await fetchFlightsData({
        west: lon - FLIGHT_RADIUS_DEG,
        east: lon + FLIGHT_RADIUS_DEG,
        south: lat - FLIGHT_RADIUS_DEG,
        north: lat + FLIGHT_RADIUS_DEG,
      });
      return {
        degraded: data.degraded,
        totalCount: data.count,
        flights: data.flights.slice(0, MAX_LIST_ITEMS).map((f) => ({
          callsign: f.callsign,
          aircraftType: f.aircraftType,
          altitudeM: f.altitudeM,
          onGround: f.onGround,
        })),
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
