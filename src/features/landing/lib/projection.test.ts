import { describe, expect, it } from "vitest";
import { arcPoint, orient, project, slerp, toPath, toVec } from "./projection";

const len = (v: { x: number; y: number; z: number }) => Math.hypot(v.x, v.y, v.z);

describe("toVec", () => {
  it("puts lat 0 lon 0 at the viewer and the poles on the vertical axis", () => {
    expect(toVec(0, 0)).toEqual({ x: 0, y: 0, z: 1 });
    expect(toVec(90, 0).y).toBeCloseTo(1);
    expect(toVec(-90, 0).y).toBeCloseTo(-1);
  });

  it("always lands on the unit sphere", () => {
    for (const [la, lo] of [[51.5, -0.1], [-33.9, 151.2], [35.7, 139.7], [0, 180]]) expect(len(toVec(la, lo))).toBeCloseTo(1);
  });
});

describe("orient and project", () => {
  it("brings the chosen longitude to the middle of the screen", () => {
    const p = project(orient(toVec(0, 40), 40, 0), 300, 300, 200);
    expect(p.x).toBeCloseTo(300);
    expect(p.y).toBeCloseTo(300);
    expect(p.visible).toBe(true);
  });

  it("hides the far side", () => {
    expect(project(orient(toVec(0, 140), 0, 0), 0, 0, 100).visible).toBe(false);
    expect(project(orient(toVec(0, 0), 180, 0), 0, 0, 100).visible).toBe(false);
  });

  it("puts north above the middle and east to the right", () => {
    const north = project(orient(toVec(60, 0), 0, 0), 300, 300, 200);
    const east = project(orient(toVec(0, 60), 0, 0), 300, 300, 200);
    expect(north.y).toBeLessThan(300);
    expect(east.x).toBeGreaterThan(300);
  });

  it("tipping the pole toward the viewer brings the far side of the Arctic into view", () => {
    // 80N on the back of the globe: hidden face-on, visible once the north pole tips toward us.
    expect(project(orient(toVec(80, 180), 0, 0), 0, 0, 100).visible).toBe(false);
    expect(project(orient(toVec(80, 180), 0, 30), 0, 0, 100).visible).toBe(true);
  });

  it("keeps points on the sphere", () => {
    expect(len(orient(toVec(20, 70), 25, 18))).toBeCloseTo(1);
  });
});

describe("slerp and arcPoint", () => {
  it("meets both ends and the midpoint of a quarter circle is at 45 degrees", () => {
    const a = toVec(0, 0);
    const b = toVec(0, 90);
    expect(slerp(a, b, 0)).toEqual(a);
    const m = slerp(a, b, 0.5);
    expect(m.x).toBeCloseTo(Math.sin(Math.PI / 4));
    expect(m.z).toBeCloseTo(Math.cos(Math.PI / 4));
    expect(len(m)).toBeCloseTo(1);
  });

  it("returns the point itself when both ends coincide", () => {
    const a = toVec(10, 10);
    expect(slerp(a, a, 0.5)).toEqual(a);
  });

  it("lifts the middle of an arc off the surface and keeps the ends on it", () => {
    const a = toVec(51.5, -0.1);
    const b = toVec(40.6, -73.8);
    expect(len(arcPoint(a, b, 0))).toBeCloseTo(1);
    expect(len(arcPoint(a, b, 1))).toBeCloseTo(1);
    expect(len(arcPoint(a, b, 0.5, 0.2))).toBeCloseTo(1.2);
  });
});

describe("toPath", () => {
  it("starts a new subpath after the line passes behind the globe", () => {
    const d = toPath([
      { x: 1, y: 1, visible: true },
      { x: 2, y: 2, visible: true },
      { x: 3, y: 3, visible: false },
      { x: 4, y: 4, visible: true },
      { x: 5, y: 5, visible: true },
    ]);
    expect(d).toBe("M1.0 1.0L2.0 2.0M4.0 4.0L5.0 5.0");
  });

  it("is empty when nothing is visible", () => {
    expect(toPath([{ x: 0, y: 0, visible: false }])).toBe("");
  });
});
