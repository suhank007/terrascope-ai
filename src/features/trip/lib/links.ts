import { nameCandidates } from "./countries";
import type { Destination, TripLink } from "../types";

export interface TripDates {
  from?: string | null;
  to?: string | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value: string | null | undefined): string | null {
  return value && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)) ? value : null;
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Deep links into the places people actually book. They are plain search
 * links (no affiliate IDs, so TerraScope earns nothing from them yet); every
 * URL is built from encoded inputs and never from free text we didn't escape.
 */
export function buildTripLinks(dest: Destination, dates: TripDates = {}): TripLink[] {
  const place = encodeURIComponent(`${dest.name}, ${dest.countryName}`);
  const city = encodeURIComponent(dest.name);
  const from = validDate(dates.from);
  const to = validDate(dates.to);
  // An end before the start is a typo, and a booking site would reject or "fix" it unpredictably.
  const stayDates = from && to && to >= from ? { booking: `&checkin=${from}&checkout=${to}`, airbnb: `?checkin=${from}&checkout=${to}` } : { booking: "", airbnb: "" };
  const lat = dest.latitude.toFixed(4);
  const lon = dest.longitude.toFixed(4);
  const countrySlug = slug(nameCandidates(dest.countryCode)[0] ?? dest.countryName);

  const links: TripLink[] = [
    { id: "booking", group: "stay", label: "Booking.com", hint: "Hotels and apartments", url: `https://www.booking.com/searchresults.html?ss=${place}${stayDates.booking}` },
    { id: "airbnb", group: "stay", label: "Airbnb", hint: "Homes and stays", url: `https://www.airbnb.com/s/${city}/homes${stayDates.airbnb}` },
    { id: "flights", group: "fly", label: "Google Flights", hint: `Flights to ${dest.name}`, url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights to ${dest.name}${from ? ` on ${from}` : ""}`)}` },
    { id: "rome2rio", group: "move", label: "Rome2rio", hint: "Every way to get there: train, bus, ferry", url: `https://www.rome2rio.com/s/${city}` },
    { id: "transit", group: "move", label: "Transit map", hint: "Metro, tram and rail lines on OpenStreetMap", url: `https://www.openstreetmap.org/#map=13/${lat}/${lon}&layers=O` },
    { id: "uber", group: "move", label: "Uber", hint: "Ride to the city centre", url: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=${lat}&dropoff%5Blongitude%5D=${lon}&dropoff%5Bnickname%5D=${city}` },
    { id: "getyourguide", group: "do", label: "GetYourGuide", hint: "Tours and tickets", url: `https://www.getyourguide.com/s/?q=${city}` },
    { id: "viator", group: "do", label: "Viator", hint: "Tours and day trips", url: `https://www.viator.com/searchResults/all?text=${city}` },
    { id: "food", group: "do", label: "Restaurants on Google Maps", hint: "Ratings, hours and reviews", url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`restaurants in ${dest.name}`)}` },
    { id: "airalo", group: "connect", label: "Airalo eSIM", hint: `Data for ${dest.countryName}`, url: `https://www.airalo.com/${countrySlug}-esim` },
    { id: "holafly", group: "connect", label: "Holafly eSIM", hint: `Data for ${dest.countryName}`, url: `https://esim.holafly.com/esim-${countrySlug}/` },
  ];

  return links;
}
