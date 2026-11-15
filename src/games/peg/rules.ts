/**
 * Peg solitaire: jump a peg over a neighbour into an empty hole, removing the one jumped.
 * Finish with a single peg (in the centre, for the classic finish). Two boards: the English
 * cross of 33 holes and the triangle of 15.
 */
export type BoardId = 'english' | 'triangle';
export interface PBoard { id: BoardId; holes: [number, number][]; start: number; centre: number; dirs: [number, number][] }

const SQ: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const TRI: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
function cross(): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const arm = (r >= 2 && r <= 4) || (c >= 2 && c <= 4);
    if (arm) out.push([r, c]);
  }
  return out;
}
const tri = (): [number, number][] => { const o: [number, number][] = []; for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) o.push([r, c]); return o; };
const idx = (holes: [number, number][], r: number, c: number) => holes.findIndex(h => h[0] === r && h[1] === c);

export const BOARDS: Record<BoardId, PBoard> = (() => {
  const e = cross(), t = tri();
  return {
    english: { id: 'english', holes: e, start: idx(e, 3, 3), centre: idx(e, 3, 3), dirs: SQ },
    triangle: { id: 'triangle', holes: t, start: 0, centre: -1, dirs: TRI },
  };
})();

/** A move: from, over, to (hole indices). */
export type PMove = [number, number, number];
const neighbourCache = new Map<BoardId, PMove[]>();
/** Every jump that fits on the board, whatever is in the holes. */
export function allJumps(b: PBoard): PMove[] {
  const hit = neighbourCache.get(b.id); if (hit) return hit;
  const out: PMove[] = [];
  b.holes.forEach(([r, c], i) => {
    for (const [dr, dc] of b.dirs) {
      const o = idx(b.holes, r + dr, c + dc), t = idx(b.holes, r + 2 * dr, c + 2 * dc);
      if (o >= 0 && t >= 0) out.push([i, o, t]);
    }
  });
  neighbourCache.set(b.id, out);
  return out;
}
/** Pegs as a bit mask (33 holes, so a bigint keeps it simple). */
export type Pegs = bigint;
export const has = (p: Pegs, i: number) => ((p >> BigInt(i)) & 1n) === 1n;
export const startPegs = (b: PBoard): Pegs => { let p = 0n; b.holes.forEach((_, i) => { if (i !== b.start) p |= 1n << BigInt(i); }); return p; };
export const count = (p: Pegs) => { let n = 0; while (p) { n += Number(p & 1n); p >>= 1n; } return n; };
export const legal = (b: PBoard, p: Pegs) => allJumps(b).filter(([f, o, t]) => has(p, f) && has(p, o) && !has(p, t));
export const jump = (p: Pegs, [f, o, t]: PMove): Pegs => (p & ~(1n << BigInt(f)) & ~(1n << BigInt(o))) | (1n << BigInt(t));
export const won = (b: PBoard, p: Pegs) => count(p) === 1;
export const wonCentre = (b: PBoard, p: Pegs) => count(p) === 1 && (b.centre < 0 || has(p, b.centre));

/**
 * The moves from here to one peg left (in the centre where the board has one), or null if
 * there is none, or undefined if the search ran out of steps. Positions already shown to fail
 * are remembered, which makes the 33-hole board quick.
 */
export function solve(b: PBoard, p: Pegs, budget = 2_000_000): PMove[] | null | undefined {
  const dead = new Set<Pegs>(), path: PMove[] = [];
  let steps = 0, gaveUp = false;
  const rec = (q: Pegs): boolean => {
    if (wonCentre(b, q)) return true;
    if (dead.has(q)) return false;
    if (++steps > budget) { gaveUp = true; return false; }
    for (const m of legal(b, q)) {
      path.push(m);
      if (rec(jump(q, m))) return true;
      path.pop();
      if (gaveUp) return false;
    }
    dead.add(q);
    return false;
  };
  const ok = rec(p);
  return ok ? path : gaveUp ? undefined : null;
}
