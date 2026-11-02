"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useAnimationFrame, useReducedMotion } from "framer-motion";
import type { Severity } from "@/features/trip/types";
import { AIRPORT_POINTS, ROUTES } from "../lib/routes";
import { arcPoint, orient, project, toPath, toVec } from "../lib/projection";

const SIZE = 640;
const C = SIZE / 2;
const R = 252;
const TILT = 16;
const MERIDIANS = Array.from({ length: 18 }, (_, i) => -180 + i * 20);
const PARALLELS = [-60, -40, -20, 0, 20, 40, 60];
const ARC_STEPS = 48;

const LEVEL_COLOR: Record<Severity | "unknown", string> = {
  none: "#35e0c8",
  caution: "#f5a623",
  high: "#ef233c",
  critical: "#ef233c",
  unknown: "#ffffff99",
};

/**
 * A slowly turning globe drawn as SVG, with live-looking flight arcs and airport
 * nodes. The geometry is recomputed every frame straight into the DOM (no React
 * re-render), and the node colours come from real airport conditions.
 */
export interface GlobePoint {
  latitude: number;
  longitude: number;
}

export function OrbitGlobe({ levels, fires = [], quakes = [] }: { levels?: Record<string, Severity>; fires?: GlobePoint[]; quakes?: GlobePoint[] }) {
  const reduce = useReducedMotion();
  const meridianRefs = useRef<(SVGPathElement | null)[]>([]);
  const parallelRefs = useRef<(SVGPathElement | null)[]>([]);
  const arcRefs = useRef<(SVGPathElement | null)[]>([]);
  const planeRefs = useRef<(SVGGElement | null)[]>([]);
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const fireRef = useRef<SVGPathElement | null>(null);
  const quakeRef = useRef<SVGPathElement | null>(null);

  const routes = useMemo(() => ROUTES.map((r) => ({ ...r, a: toVec(...AIRPORT_POINTS[r.from]), b: toVec(...AIRPORT_POINTS[r.to]) })), []);
  const nodes = useMemo(() => Object.entries(AIRPORT_POINTS).map(([code, [lat, lon]]) => ({ code, v: toVec(lat, lon) })), []);

  const fireVecs = useMemo(() => fires.slice(0, 500).map((f) => toVec(f.latitude, f.longitude)), [fires]);
  const quakeVecs = useMemo(() => quakes.map((q) => toVec(q.latitude, q.longitude)), [quakes]);

  const draw = useCallback(
    (ms: number) => {
      const lon = reduce ? 18 : (18 + ms * 0.0055) % 360;

      MERIDIANS.forEach((lo, i) => {
        const pts = [];
        for (let lat = -80; lat <= 80; lat += 8) pts.push(project(orient(toVec(lat, lo), lon, TILT), C, C, R));
        meridianRefs.current[i]?.setAttribute("d", toPath(pts));
      });
      PARALLELS.forEach((la, i) => {
        const pts = [];
        for (let lo = -180; lo <= 180; lo += 6) pts.push(project(orient(toVec(la, lo), lon, TILT), C, C, R));
        parallelRefs.current[i]?.setAttribute("d", toPath(pts));
      });

      routes.forEach((r, i) => {
        const pts = [];
        for (let s = 0; s <= ARC_STEPS; s++) pts.push(project(orient(arcPoint(r.a, r.b, s / ARC_STEPS), lon, TILT), C, C, R));
        arcRefs.current[i]?.setAttribute("d", toPath(pts));

        const t = reduce ? r.offset : (r.offset + (ms / 40000) * r.speed) % 1;
        const p = project(orient(arcPoint(r.a, r.b, t), lon, TILT), C, C, R);
        const plane = planeRefs.current[i];
        if (plane) {
          plane.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
          plane.setAttribute("opacity", p.visible ? String(Math.sin(Math.PI * t).toFixed(2)) : "0");
        }
      });

      // Real detections as zero-length round-capped segments: one path per kind, so one DOM write each.
      const dots = (vecs: typeof fireVecs) => {
        let d = "";
        for (const v of vecs) {
          const p = project(orient(v, lon, TILT), C, C, R);
          if (p.visible) d += `M${p.x.toFixed(1)} ${p.y.toFixed(1)}h0`;
        }
        return d;
      };
      fireRef.current?.setAttribute("d", dots(fireVecs));
      quakeRef.current?.setAttribute("d", dots(quakeVecs));

      nodes.forEach((n) => {
        const p = project(orient(n.v, lon, TILT), C, C, R);
        const el = nodeRefs.current[n.code];
        if (el) {
          el.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
          el.setAttribute("opacity", p.visible ? "1" : "0");
        }
      });
    },
    [reduce, routes, nodes, fireVecs, quakeVecs]
  );

  useEffect(() => draw(0), [draw]);
  useAnimationFrame((t) => {
    if (!reduce) draw(t);
  });

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="A rotating globe with flight routes between major airports; airports in trouble pulse red" className="h-full w-full">
      <defs>
        <radialGradient id="orb-body" cx="40%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#3a1217" />
          <stop offset="50%" stopColor="#12070a" />
          <stop offset="100%" stopColor="#060203" />
        </radialGradient>
        <radialGradient id="orb-halo" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#ef233c" stopOpacity="0" />
          <stop offset="92%" stopColor="#ef233c" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ef233c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orb-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef233c" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#ef233c" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#35e0c8" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <circle cx={C} cy={C} r={R + 36} fill="url(#orb-halo)" />
      <circle cx={C} cy={C} r={R} fill="url(#orb-body)" />
      <g fill="none" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="1">
        {MERIDIANS.map((lo, i) => (
          <path key={lo} ref={(el) => void (meridianRefs.current[i] = el)} />
        ))}
        {PARALLELS.map((la, i) => (
          <path key={la} ref={(el) => void (parallelRefs.current[i] = el)} />
        ))}
      </g>
      <circle cx={C} cy={C} r={R} fill="none" stroke="url(#orb-rim)" strokeWidth="1.5" />

      <path ref={fireRef} fill="none" stroke="#ef233c" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
      <path ref={quakeRef} fill="none" stroke="#fb923c" strokeWidth="4.2" strokeLinecap="round" opacity="0.9" />

      <g fill="none" strokeLinecap="round">
        {routes.map((r, i) => (
          <path key={`${r.from}-${r.to}`} ref={(el) => void (arcRefs.current[i] = el)} stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.2" strokeDasharray="2 5" />
        ))}
      </g>

      {routes.map((r, i) => (
        <g key={`plane-${r.from}-${r.to}`} ref={(el) => void (planeRefs.current[i] = el)}>
          <circle r="7" fill="#ffffff" opacity="0.14" />
          <circle r="2.4" fill="#ffffff" />
        </g>
      ))}

      {nodes.map((n) => {
        const level = levels?.[n.code] ?? "unknown";
        const color = LEVEL_COLOR[level];
        const alert = level === "caution" || level === "high" || level === "critical";
        return (
          <g key={n.code} ref={(el) => void (nodeRefs.current[n.code] = el)}>
            {alert && !reduce && (
              <motion.circle initial={{ r: 4, opacity: 0.9 }} fill="none" stroke={color} strokeWidth={1.5} animate={{ r: [4, 20], opacity: [0.9, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }} />
            )}
            <circle r="9" fill={color} opacity="0.16" />
            <circle r="3.4" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
