/**
 * Untangle: dots joined by threads, all tangled up. Drag the dots until no two threads cross.
 * Each puzzle is built from n random straight lines: every place two lines cross is a dot, and
 * each line is cut into threads between its dots. That drawing has no crossings, so every
 * puzzle can be untangled; the dots are then dealt round a circle in random order.
 */
export type Pt = { x: number; y: number };
/** answer: the line drawing the puzzle was made from, which has no crossings. */
export interface UPuzzle { lines: number; pts: Pt[]; edges: [number, number][]; answer: Pt[] }

export function generate(lines: number, rnd: () => number = Math.random): UPuzzle {
  for (;;) {
    // Lines as a point and a direction, through the middle of the board.
    const L = Array.from({ length: lines }, () => { const a = rnd() * Math.PI; return { px: 0.5 + (rnd() - 0.5) * 0.5, py: 0.5 + (rnd() - 0.5) * 0.5, dx: Math.cos(a), dy: Math.sin(a) }; });
    const pts: Pt[] = [], on: { t: number; v: number }[][] = L.map(() => []);
    let bad = false;
    for (let i = 0; i < lines; i++) for (let j = i + 1; j < lines; j++) {
      const a = L[i], b = L[j], den = a.dx * b.dy - a.dy * b.dx;
      if (Math.abs(den) < 0.08) { bad = true; continue; } // nearly parallel: try again
      const t = ((b.px - a.px) * b.dy - (b.py - a.py) * b.dx) / den, s = ((b.px - a.px) * a.dy - (b.py - a.py) * a.dx) / den;
      const v = pts.length; pts.push({ x: a.px + a.dx * t, y: a.py + a.dy * t });
      on[i].push({ t, v }); on[j].push({ t: s, v });
    }
    if (bad) continue;
    const edges: [number, number][] = [];
    for (const list of on) { list.sort((a, b) => a.t - b.t); for (let k = 1; k < list.length; k++) edges.push([list[k - 1].v, list[k].v]); }
    // Deal the dots round a circle in random order.
    const order = pts.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const dealt: Pt[] = pts.map(() => ({ x: 0, y: 0 }));
    order.forEach((v, k) => { const a = (k / order.length) * Math.PI * 2 - Math.PI / 2; dealt[v] = { x: 0.5 + 0.42 * Math.cos(a), y: 0.5 + 0.42 * Math.sin(a) }; });
    const p = { lines, pts: dealt, edges, answer: pts };
    if (crossings(p.pts, edges).size > 0) return p;
  }
}

const orient = (a: Pt, b: Pt, c: Pt) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
/** Do segments ab and cd cross (not counting a shared end)? */
export function cross(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  return ((o1 > 1e-12 && o2 < -1e-12) || (o1 < -1e-12 && o2 > 1e-12)) && ((o3 > 1e-12 && o4 < -1e-12) || (o3 < -1e-12 && o4 > 1e-12));
}
/** Indices of the edges that cross some other edge. */
export function crossings(pts: Pt[], edges: [number, number][]): Set<number> {
  const out = new Set<number>();
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const [a, b] = edges[i], [c, d] = edges[j];
    if (a === c || a === d || b === c || b === d) continue;
    if (cross(pts[a], pts[b], pts[c], pts[d])) { out.add(i); out.add(j); }
  }
  return out;
}
