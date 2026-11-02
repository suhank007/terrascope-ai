"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { formatMagnitude, formatRelativeTime } from "@/lib/format";
import { CountUp } from "./count-up";

const W = 720;
const H = 360;
const X = (lon: number) => (lon + 180) * (W / 360);
const Y = (lat: number) => (90 - lat) * (H / 180);

function quakeColor(m: number): string {
  return m >= 6 ? "#ef233c" : m >= 4.5 ? "#fb923c" : m >= 3 ? "#facc15" : "#4ade80";
}

export function ThreatPanel() {
  const reduce = useReducedMotion();
  const quakes = useEarthquakes();
  const fires = useWildfires();
  const [active, setActive] = useState<string | null>(null);

  const list = useMemo(() => quakes.data?.quakes ?? [], [quakes.data]);
  const top = useMemo(() => [...list].sort((a, b) => b.magnitude - a.magnitude).slice(0, 6), [list]);
  const hotspots = fires.data?.configured ? fires.data.hotspots : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={`World map of ${list.length} earthquakes and ${hotspots.length} fire detections in the last 24 hours`}>
          {[-60, -30, 0, 30, 60].map((lat) => (
            <line key={lat} x1="0" x2={W} y1={Y(lat)} y2={Y(lat)} stroke="#fff" strokeOpacity={lat === 0 ? 0.12 : 0.05} />
          ))}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
            <line key={lon} x1={X(lon)} x2={X(lon)} y1="0" y2={H} stroke="#fff" strokeOpacity={lon === 0 ? 0.12 : 0.05} />
          ))}
          {hotspots.slice(0, 500).map((h) => (
            <circle key={h.id} cx={X(h.longitude)} cy={Y(h.latitude)} r="1.5" fill="#ef233c" opacity="0.55" />
          ))}
          {list.map((q) => {
            const on = active === q.id;
            const r = 2.5 + Math.max(0, q.magnitude - 2.5) * 1.5;
            return (
              <g key={q.id} onMouseEnter={() => setActive(q.id)} onMouseLeave={() => setActive(null)}>
                {q.magnitude >= 5 && !reduce && (
                  <motion.circle cx={X(q.longitude)} cy={Y(q.latitude)} initial={{ r, opacity: 0.8 }} fill="none" stroke={quakeColor(q.magnitude)} strokeWidth="1.2" animate={{ r: [r, r + 16], opacity: [0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }} />
                )}
                <circle cx={X(q.longitude)} cy={Y(q.latitude)} r={on ? r + 3 : r} fill={quakeColor(q.magnitude)} fillOpacity={on ? 1 : 0.8} stroke="#000" strokeOpacity="0.5">
                  <title>{`${formatMagnitude(q.magnitude)} ${q.place}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
        <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-noir" aria-hidden />Fire detection (NASA)</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#fb923c]" aria-hidden />Earthquake, sized by magnitude (USGS)</span>
          <span>Pulsing ring: M5 and above</span>
        </p>
      </div>

      <div>
        <dl className="grid grid-cols-3 gap-4 border-b border-white/10 pb-5">
          <div>
            <dt className="text-sm text-zinc-500">Earthquakes</dt>
            <dd className="font-mono text-2xl font-semibold text-white">{quakes.data ? <CountUp to={list.length} /> : "…"}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Fires</dt>
            <dd className="font-mono text-2xl font-semibold text-white">{fires.data ? fires.data.configured ? <CountUp to={fires.data.count} /> : "n/a" : "…"}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Strongest</dt>
            <dd className="font-mono text-2xl font-semibold text-white">{top[0] ? formatMagnitude(top[0].magnitude) : "…"}</dd>
          </div>
        </dl>

        <h3 className="mt-5 text-sm font-medium text-white">Strongest in the last 24 hours</h3>
        <ul className="mt-2">
          {top.map((q) => (
            <li key={q.id} onMouseEnter={() => setActive(q.id)} onMouseLeave={() => setActive(null)} className="flex items-center justify-between gap-4 border-b border-white/10 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block truncate text-zinc-200">{q.place}</span>
                <span className="block text-xs text-zinc-500">{formatRelativeTime(q.time)} · {q.depthKm.toFixed(0)} km deep</span>
              </span>
              <span className="shrink-0 font-mono font-semibold" style={{ color: quakeColor(q.magnitude) }}>{formatMagnitude(q.magnitude)}</span>
            </li>
          ))}
          {quakes.isLoading && <li className="py-3 text-sm text-zinc-500">Reading the USGS feed…</li>}
        </ul>
        <Link href="/globe" className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-noir hover:underline">
          See every event on the globe →
        </Link>
      </div>
    </div>
  );
}
