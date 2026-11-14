/**
 * Tangram (七巧板) geometry. The seven pieces cut from a square of side 4:
 * two large triangles, one medium, two small, a square and a parallelogram (total area 16).
 * A placement is a rotation in 45° steps, an optional mirror, and a position of the
 * piece's centroid.
 */
export type PieceId = 'L1' | 'L2' | 'M' | 'S1' | 'S2' | 'Q' | 'P';
export type Pt = [number, number];
export interface Place { id: PieceId; x: number; y: number; rot: number; flip: boolean }

/** The pieces as they sit in the solved 4×4 square. */
export const STANDARD: Record<PieceId, Pt[]> = {
  L1: [[0, 0], [4, 0], [2, 2]],
  L2: [[0, 0], [2, 2], [0, 4]],
  M: [[2, 4], [4, 2], [4, 4]],
  S1: [[4, 0], [4, 2], [3, 1]],
  S2: [[2, 2], [3, 3], [1, 3]],
  Q: [[2, 2], [3, 1], [4, 2], [3, 3]],
  P: [[0, 4], [1, 3], [3, 3], [2, 4]],
};
export const IDS = Object.keys(STANDARD) as PieceId[];
export const centroid = (pts: Pt[]): Pt => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
const LOCAL = Object.fromEntries(IDS.map(id => {
  const [cx, cy] = centroid(STANDARD[id]);
  return [id, STANDARD[id].map(([x, y]) => [x - cx, y - cy] as Pt)];
})) as Record<PieceId, Pt[]>;

export function polygon(p: Place): Pt[] {
  const a = (p.rot * Math.PI) / 4, ca = Math.cos(a), sa = Math.sin(a);
  return LOCAL[p.id].map(([x0, y]) => {
    const x = p.flip ? -x0 : x0;
    return [p.x + x * ca - y * sa, p.y + x * sa + y * ca];
  });
}
export function inside(pt: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
export const area = (poly: Pt[]) => Math.abs(poly.reduce((a, [x, y], i) => { const [x2, y2] = poly[(i + 1) % poly.length]; return a + x * y2 - x2 * y; }, 0)) / 2;

export function bounds(polys: Pt[][]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of polys) for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1 };
}

/**
 * Compare a set of placed pieces against a target (the polygons of one known solution).
 * Samples a fine grid with offsets chosen so no sample falls on a 0° or 45° edge, and
 * counts target area left uncovered, piece area outside the target, and overlaps.
 * Any arrangement that fills the silhouette is accepted, not only the stored solution.
 */
export function compare(target: Pt[][], pieces: Pt[][], step = 0.1) {
  const b = bounds([...target, ...pieces]);
  let inTarget = 0, miss = 0, extra = 0, overlap = 0;
  for (let y = b.y0 + step * 0.37; y < b.y1; y += step) for (let x = b.x0 + step * 0.61; x < b.x1; x += step) {
    const t = target.some(p => inside([x, y], p));
    let n = 0;
    for (const p of pieces) if (inside([x, y], p)) n++;
    if (t) inTarget++;
    if (t && n === 0) miss++;
    if (!t && n > 0) extra++;
    if (n > 1) overlap++;
  }
  return { inTarget, miss, extra, overlap, error: (miss + extra + overlap) / Math.max(1, inTarget) };
}
export const SOLVED_ERROR = 0.025;

/** Snap a dragged piece so its nearest vertex meets a nearby target or piece vertex. */
export function snap(p: Place, anchors: Pt[], radius = 0.45): Place {
  let best: Pt | null = null, bestD = radius;
  for (const [vx, vy] of polygon(p)) for (const [ax, ay] of anchors) {
    const d = Math.hypot(ax - vx, ay - vy);
    if (d < bestD) { bestD = d; best = [ax - vx, ay - vy]; }
  }
  return best ? { ...p, x: p.x + best[0], y: p.y + best[1] } : p;
}
