import type { FaaDelay, FaaStatus } from "../types";

/** "1 hour and 19 minutes" -> 79, "29 minutes" -> 29, "2 hours" -> 120. */
export function parseDurationMinutes(text: string | null | undefined): number | null {
  if (!text) return null;
  const hours = text.match(/(\d+)\s*hours?/i);
  const minutes = text.match(/(\d+)\s*minutes?/i);
  if (!hours && !minutes) return null;
  return (hours ? Number(hours[1]) * 60 : 0) + (minutes ? Number(minutes[1]) : 0);
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : null;
}

function blocks(xml: string, name: string): string[] {
  return [...xml.matchAll(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, "g"))].map((m) => m[1]);
}

/**
 * Pulls one airport's entries out of the FAA NAS status feed (US airports only,
 * keyed by IATA code). Ground stops and ground delay programs are the
 * authoritative "this airport is held" signals; closures are NOTAM text and are
 * passed through as notices rather than interpreted.
 */
export function parseFaaStatus(xml: string, iata: string): FaaStatus {
  const code = iata.toUpperCase();
  const status: FaaStatus = { groundStop: null, groundDelay: null, delays: [], notices: [], updatedAt: tag(xml, "Update_Time") };

  for (const program of blocks(xml, "Program")) {
    if (tag(program, "ARPT") === code) status.groundStop = { reason: tag(program, "Reason"), endTime: tag(program, "End_Time") };
  }

  for (const gd of blocks(xml, "Ground_Delay")) {
    if (tag(gd, "ARPT") === code) {
      status.groundDelay = { reason: tag(gd, "Reason"), avgMinutes: parseDurationMinutes(tag(gd, "Avg")), maxMinutes: parseDurationMinutes(tag(gd, "Max")) };
    }
  }

  for (const delay of blocks(xml, "Delay")) {
    if (tag(delay, "ARPT") !== code) continue;
    const reason = tag(delay, "Reason");
    for (const m of delay.matchAll(/<Arrival_Departure Type="(Arrival|Departure)">([\s\S]*?)<\/Arrival_Departure>/g)) {
      const entry: FaaDelay = {
        kind: m[1] as FaaDelay["kind"],
        minMinutes: parseDurationMinutes(tag(m[2], "Min")),
        maxMinutes: parseDurationMinutes(tag(m[2], "Max")),
        trend: tag(m[2], "Trend"),
        reason,
      };
      status.delays.push(entry);
    }
  }

  for (const airport of blocks(xml, "Airport")) {
    if (tag(airport, "ARPT") === code) {
      const text = tag(airport, "Reason");
      if (text) status.notices.push({ text, start: tag(airport, "Start"), reopen: tag(airport, "Reopen") });
    }
  }

  return status;
}
