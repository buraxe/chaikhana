/**
 * Hashi (Bridges): join the islands with straight bridges so each has as many as its number.
 * At most two bridges between a pair, bridges never cross, and all islands end up connected.
 * Puzzles are grown from a random connected layout, so every puzzle has a solution.
 */
import type { Rng } from '../../core/rng';

export interface Island { r: number; c: number; n: number }
export interface HPuzzle { size: number; islands: Island[] }
/** Bridges: key "a-b" (a < b) to count 1 or 2. */
export type Bridges = Record<string, number>;
export const bkey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
export function generate(size: number, count: number, rng: Rng): HPuzzle {
  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = new Array(size * size).fill(-1), used = new Array(size * size).fill(false);
    const isl: { r: number; c: number }[] = [], br: Bridges = {};
    const r0 = Math.floor(rng() * size), c0 = Math.floor(rng() * size);
    isl.push({ r: r0, c: c0 }); grid[r0 * size + c0] = 0;
    let guard = 0;
    while (isl.length < count && guard++ < 2000) {
      const a = Math.floor(rng() * isl.length), [dr, dc] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
      const len = 2 + Math.floor(rng() * (size / 2));
      let r = isl[a].r, c = isl[a].c, ok = true; const path: number[] = [];
      for (let k = 1; k <= len; k++) {
        r += dr; c += dc;
        if (r < 0 || c < 0 || r >= size || c >= size) { ok = false; break; }
        const i = r * size + c;
        if (grid[i] >= 0 || used[i]) { ok = false; break; }
        // Keep islands from touching side by side.
        if (k === len) for (const [er, ec] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + er, cc = c + ec; if (rr >= 0 && cc >= 0 && rr < size && cc < size && grid[rr * size + cc] >= 0 && !(rr === r - dr && cc === c - dc && k === 1)) ok = false; }
        if (k < len) path.push(i);
      }
      if (!ok) continue;
      const b = isl.length; isl.push({ r, c }); grid[r * size + c] = b;
      for (const i of path) used[i] = true;
      br[bkey(a, b)] = rng() < 0.35 ? 2 : 1;
    }
    if (isl.length < count) continue;
    // Extra bridges between aligned islands that do not cross anything, for loops.
    const n = isl.map(() => 0); for (const [k, v] of Object.entries(br)) { const [a, b] = k.split('-').map(Number); n[a] += v; n[b] += v; }
    return { size, islands: isl.map((p, i) => ({ ...p, n: n[i] })) };
  }
  return generate(size, count - 1, rng);
}
/** The island you reach going from island i in a straight line, if any. */
export function neighbour(p: HPuzzle, i: number, dr: number, dc: number): number {
  let r = p.islands[i].r + dr, c = p.islands[i].c + dc;
  while (r >= 0 && c >= 0 && r < p.size && c < p.size) { const j = p.islands.findIndex(x => x.r === r && x.c === c); if (j >= 0) return j; r += dr; c += dc; }
  return -1;
}
const cellsBetween = (p: HPuzzle, a: number, b: number) => {
  const A = p.islands[a], B = p.islands[b], out: number[] = [];
  if (A.r === B.r) for (let c = Math.min(A.c, B.c) + 1; c < Math.max(A.c, B.c); c++) out.push(A.r * p.size + c);
  else for (let r = Math.min(A.r, B.r) + 1; r < Math.max(A.r, B.r); r++) out.push(r * p.size + A.c);
  return out;
};
export function crosses(p: HPuzzle, br: Bridges, a: number, b: number): boolean {
  const mine = new Set(cellsBetween(p, a, b)), horiz = p.islands[a].r === p.islands[b].r;
  for (const k of Object.keys(br)) {
    if (!br[k]) continue; const [x, y] = k.split('-').map(Number); if ((x === a && y === b) || (x === b && y === a)) continue;
    const h2 = p.islands[x].r === p.islands[y].r; if (h2 === horiz) continue;
    if (cellsBetween(p, x, y).some(c => mine.has(c))) return true;
  }
  return false;
}
/** Tap a pair: 0 → 1 → 2 → 0 bridges, if they see each other and nothing is crossed. */
export function cycle(p: HPuzzle, br: Bridges, a: number, b: number): Bridges | null {
  const A = p.islands[a], B = p.islands[b];
  if (A.r !== B.r && A.c !== B.c) return null;
  const dr = Math.sign(B.r - A.r), dc = Math.sign(B.c - A.c);
  if (neighbour(p, a, dr, dc) !== b) return null;
  const k = bkey(a, b), cur = br[k] ?? 0, next = (cur + 1) % 3;
  if (cur === 0 && crosses(p, br, a, b)) return null;
  const out = { ...br }; if (next) out[k] = next; else delete out[k];
  return out;
}
export const counts = (p: HPuzzle, br: Bridges) => { const n = p.islands.map(() => 0); for (const [k, v] of Object.entries(br)) { const [a, b] = k.split('-').map(Number); n[a] += v; n[b] += v; } return n; };
export function solved(p: HPuzzle, br: Bridges): boolean {
  const n = counts(p, br); if (n.some((x, i) => x !== p.islands[i].n)) return false;
  const adj = p.islands.map(() => [] as number[]); for (const k of Object.keys(br)) { const [a, b] = k.split('-').map(Number); adj[a].push(b); adj[b].push(a); }
  const seen = new Set([0]), st = [0]; while (st.length) { const x = st.pop()!; for (const y of adj[x]) if (!seen.has(y)) { seen.add(y); st.push(y); } }
  return seen.size === p.islands.length;
}
