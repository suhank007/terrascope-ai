/** What a person typed into the flight box, understood three ways. */
export type FlightQuery =
  | { kind: "flight-number"; airline: string; number: string; text: string }
  | { kind: "callsign"; callsign: string; text: string }
  | { kind: "registration"; registration: string; text: string };

const REGISTRATION = [/^[A-Z0-9]{1,2}-[A-Z0-9]{2,5}$/, /^N\d{1,5}[A-Z]{0,2}$/];
const CALLSIGN = /^[A-Z]{3}\d{1,4}[A-Z]{0,2}$/;
const FLIGHT_NUMBER = /^([A-Z0-9]{2})(\d{1,4})$/;

/**
 * "BA117" or "BA 117" is an airline flight number (IATA code + number),
 * "BAW117" is a callsign (ICAO code + number), and "G-BODO" or "N12345" is an
 * aircraft registration. Anything else isn't something we can look up.
 */
export function parseFlightQuery(input: string): FlightQuery | null {
  const text = input.toUpperCase().replace(/[\s_]+/g, "");
  if (text.length < 3 || text.length > 10) return null;

  if (REGISTRATION.some((r) => r.test(text))) return { kind: "registration", registration: text, text };
  if (CALLSIGN.test(text)) return { kind: "callsign", callsign: text, text };

  const m = text.match(FLIGHT_NUMBER);
  // A bare number like "12345" has no airline in it.
  if (m && /[A-Z]/.test(m[1])) return { kind: "flight-number", airline: m[1], number: String(Number(m[2])), text };
  return null;
}
