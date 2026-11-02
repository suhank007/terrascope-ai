/**
 * Just enough 3D maths to draw a rotating globe as flat SVG: points on a unit
 * sphere, a turn about the vertical axis, and an orthographic squash to the screen.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

const RAD = Math.PI / 180;

/** Latitude and longitude in degrees to a point on the unit sphere (y up, z toward the viewer at lon 0). */
export function toVec(lat: number, lon: number): Vec3 {
  const la = lat * RAD;
  const lo = lon * RAD;
  return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
}

/** Turn the globe so that `lonDeg` faces the viewer, then tip the north pole toward them by `tiltDeg`. */
export function orient(v: Vec3, lonDeg: number, tiltDeg: number): Vec3 {
  const a = -lonDeg * RAD;
  const x1 = v.x * Math.cos(a) + v.z * Math.sin(a);
  const z1 = -v.x * Math.sin(a) + v.z * Math.cos(a);
  const t = tiltDeg * RAD;
  return { x: x1, y: v.y * Math.cos(t) - z1 * Math.sin(t), z: v.y * Math.sin(t) + z1 * Math.cos(t) };
}

export interface Projected {
  x: number;
  y: number;
  /** False on the far side of the globe. */
  visible: boolean;
}

export function project(v: Vec3, cx: number, cy: number, radius: number): Projected {
  return { x: cx + v.x * radius, y: cy - v.y * radius, visible: v.z > 0 };
}

/** Spherical interpolation along the great circle between two unit vectors. */
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const k1 = Math.sin((1 - t) * omega) / s;
  const k2 = Math.sin(t * omega) / s;
  return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2 };
}

/** A flight path: the great circle, lifted off the surface in the middle so it reads as an arc, not a line on the ground. */
export function arcPoint(a: Vec3, b: Vec3, t: number, lift = 0.18): Vec3 {
  const p = slerp(a, b, t);
  const scale = 1 + lift * Math.sin(Math.PI * t);
  return { x: p.x * scale, y: p.y * scale, z: p.z * scale };
}

/** Builds an SVG path from points, starting a new subpath wherever the line goes behind the globe. */
export function toPath(points: Projected[]): string {
  let d = "";
  let drawing = false;
  for (const p of points) {
    if (!p.visible) {
      drawing = false;
      continue;
    }
    d += `${drawing ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    drawing = true;
  }
  return d;
}
