import type { WildfireHotspot } from "../types";

const MAX_HOTSPOTS = 400;

function parseCsvRows(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",");
    if (cells.length !== headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx]?.trim() ?? "";
    });
    rows.push(row);
  }

  return rows;
}

function confidenceOf(raw: string | undefined): WildfireHotspot["confidence"] {
  const value = (raw ?? "").toLowerCase();
  if (value === "h" || value === "high") return "high";
  if (value === "l" || value === "low") return "low";
  return "nominal";
}

/**
 * NASA FIRMS' CSV column set/order varies slightly by product (VIIRS vs MODIS,
 * with/without a country_id column), so rows are mapped by header name rather
 * than fixed position.
 */
export function parseFirmsCsv(csv: string): WildfireHotspot[] {
  const rows = parseCsvRows(csv);
  const hotspots: WildfireHotspot[] = [];

  for (const row of rows) {
    const latitude = Number(row.latitude);
    const longitude = Number(row.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

    const brightnessK = Number(row.bright_ti4 ?? row.brightness ?? 0);
    const frp = Number(row.frp ?? 0);
    const acqDate = row.acq_date ?? "";
    const acqTime = (row.acq_time ?? "0000").padStart(4, "0");
    const acquiredAt = acqDate
      ? new Date(`${acqDate}T${acqTime.slice(0, 2)}:${acqTime.slice(2)}:00Z`).toISOString()
      : new Date().toISOString();

    hotspots.push({
      id: `${latitude.toFixed(4)},${longitude.toFixed(4)},${acqDate}${acqTime}`,
      latitude,
      longitude,
      brightnessK,
      frp,
      confidence: confidenceOf(row.confidence),
      acquiredAt,
      satellite: row.satellite ?? "unknown",
    });
  }

  if (hotspots.length <= MAX_HOTSPOTS) return hotspots;
  return [...hotspots].sort((a, b) => b.frp - a.frp).slice(0, MAX_HOTSPOTS);
}
