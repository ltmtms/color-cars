/** Normalised cartoon road centre-lines (viewBox 0 0 1000 560). */

export type Point = { x: number; y: number };

export type RoadPath = {
  id: string;
  points: Point[];
};

export const ROAD_VIEWBOX = { w: 1000, h: 560 };

export const ROAD_PATHS: RoadPath[] = [
  {
    id: "park-loop",
    points: [
      { x: 140, y: 400 },
      { x: 320, y: 430 },
      { x: 500, y: 410 },
      { x: 680, y: 430 },
      { x: 860, y: 380 },
      { x: 880, y: 260 },
      { x: 760, y: 150 },
      { x: 500, y: 120 },
      { x: 240, y: 150 },
      { x: 120, y: 260 },
      { x: 140, y: 400 },
    ],
  },
  {
    id: "main-avenue",
    points: [
      { x: 80, y: 300 },
      { x: 280, y: 300 },
      { x: 500, y: 280 },
      { x: 720, y: 300 },
      { x: 920, y: 300 },
    ],
  },
  {
    id: "hill-cut",
    points: [
      { x: 500, y: 120 },
      { x: 500, y: 280 },
      { x: 500, y: 410 },
      { x: 500, y: 500 },
    ],
  },
];

export function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    len += Math.hypot(dx, dy);
  }
  return len;
}

/** Position and heading (degrees) at t in [0,1] along closed/open polyline. */
export function samplePath(
  points: Point[],
  t: number,
  closed = true
): { x: number; y: number; angle: number } {
  const segs: { a: Point; b: Point; len: number }[] = [];
  const last = closed ? points.length : points.length - 1;
  let total = 0;
  for (let i = 0; i < last; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len });
    total += len;
  }
  let dist = ((t % 1) + 1) % 1 * total;
  for (const s of segs) {
    if (dist <= s.len) {
      const u = s.len === 0 ? 0 : dist / s.len;
      const x = s.a.x + (s.b.x - s.a.x) * u;
      const y = s.a.y + (s.b.y - s.a.y) * u;
      const angle = (Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x) * 180) / Math.PI;
      return { x, y, angle };
    }
    dist -= s.len;
  }
  const s = segs[segs.length - 1];
  return {
    x: s.b.x,
    y: s.b.y,
    angle: (Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x) * 180) / Math.PI,
  };
}
