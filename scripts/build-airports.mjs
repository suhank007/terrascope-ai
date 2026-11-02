#!/usr/bin/env node
/**
 * Builds src/features/airports/data/airports.json from OurAirports
 * (https://ourairports.com/data/, public domain).
 *
 *   curl -o airports.csv https://davidmegginson.github.io/ourairports-data/airports.csv
 *   node scripts/build-airports.mjs path/to/airports.csv
 *
 * Only airports with scheduled passenger service and an IATA code are kept
 * (the ones a traveller can actually fly from), as compact arrays to keep the
 * file small. The column order is documented in src/features/airports/lib/dataset.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const input = process.argv[2];
if (!input) {
  console.error("usage: node scripts/build-airports.mjs <airports.csv>");
  process.exit(1);
}

/** Minimal RFC 4180 parser: quoted fields, doubled quotes, embedded commas and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const [header, ...rows] = parseCsv(readFileSync(input, "utf8"));
const col = Object.fromEntries(header.map((name, i) => [name, i]));
const SIZE = { large_airport: "L", medium_airport: "M", small_airport: "S" };

const airports = [];
for (const r of rows) {
  const iata = r[col.iata_code]?.trim().toUpperCase();
  const size = SIZE[r[col.type]];
  if (!iata || iata.length !== 3 || !size || r[col.scheduled_service] !== "yes") continue;

  const lat = Number(r[col.latitude_deg]);
  const lon = Number(r[col.longitude_deg]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) continue;

  const icao = (r[col.icao_code] || r[col.gps_code] || r[col.ident] || "").trim().toUpperCase();
  airports.push([
    iata,
    icao,
    r[col.name].trim(),
    r[col.municipality].trim(),
    r[col.iso_country].trim().toUpperCase(),
    Math.round(lat * 10_000) / 10_000,
    Math.round(lon * 10_000) / 10_000,
    Math.round(Number(r[col.elevation_ft]) || 0),
    size,
    r[col.home_link].trim(),
    r[col.wikipedia_link].trim(),
  ]);
}

// Biggest first, so a search for a shared name ("International") surfaces hubs before strips.
const rank = { L: 0, M: 1, S: 2 };
airports.sort((a, b) => rank[a[8]] - rank[b[8]] || a[0].localeCompare(b[0]));

const out = join(dirname(fileURLToPath(import.meta.url)), "../src/features/airports/data/airports.json");
writeFileSync(out, JSON.stringify(airports));
console.log(`wrote ${airports.length} airports to ${out}`);
