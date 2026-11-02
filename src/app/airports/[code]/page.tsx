import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AirportPage } from "@/features/airports/components/airport-page";
import { getAirport } from "@/features/airports/lib/dataset";

type Props = { params: Promise<{ code: string }> };

function resolve(code: string) {
  return /^[A-Za-z0-9]{3,4}$/.test(code) ? getAirport(code) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const airport = resolve((await params).code);
  if (!airport) return { title: "Airport not found | TerraScope AI" };
  return {
    title: `${airport.name} (${airport.iata}): conditions and delays | TerraScope AI`,
    description: `Live weather, delays and traffic at ${airport.name}, ${airport.city}.`,
  };
}

export default async function Page({ params }: Props) {
  const airport = resolve((await params).code);
  if (!airport) notFound();
  return <AirportPage code={airport.iata} />;
}
