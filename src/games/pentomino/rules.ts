/**
 * Pentominoes: the twelve shapes of five squares, named by the letters they resemble.
 * Fill a rectangle with them. Small boards use a random handful of pieces chosen by solving
 * the board in a random order, so every puzzle has a known answer; the big boards use all twelve.
 */
export type Letter = 'F' | 'I' | 'L' | 'N' | 'P' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export type Cell = [x: number, y: number];
export const SHAPES: Record<Letter, Cell[]> = {
  F: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], I: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  L: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], N: [[1, 0], [1, 1], [0, 2], [1, 2], [0, 3]],
  P: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], T: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
  U: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], V: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  W: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], X: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
  Y: [[1, 0], [0, 1], [1, 1], [1, 2], [1, 3]], Z: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]],
};
export const LETTERS = Object.keys(SHAPES) as Letter[];

/** Orientation o in 0..7: o & 3 quarter turns, o & 4 mirrored. Cells normalised to the top-left, sorted row by row. */
export function orient(l: Letter, o: number): Cell[] {
  let c = SHAPES[l].map(([x, y]) => (o & 4 ? [-x, y] : [x, y]) as Cell);
  for (let k = 0; k < (o & 3); k++) c = c.map(([x, y]) => [-y, x] as Cell);
  const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1]));
  return c.map(([x, y]) => [x - mx, y - my] as Cell).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}
/** The distinct orientations of each piece (X has one, I two, …). */
export const ORIENTS: Record<Letter, number[]> = Object.fromEntries(LETTERS.map(l => {
  const seen = new Set<string>(), out: number[] = [];
  for (let o = 0; o < 8; o++) { const k = JSON.stringify(orient(l, o)); if (!seen.has(k)) { seen.add(k); out.push(o); } }
  return [l, out];
})) as Record<Letter, number[]>;

export interface Placed { l: Letter; o: number; x: number; y: number }
export const cellsOf = (p: Placed): Cell[] => orient(p.l, p.o).map(([x, y]) => [x + p.x, y + p.y]);

export interface Board { id: string; w: number; h: number; pieces: Letter[] }
export const BOARDS: { id: string; w: number; h: number; k: number }[] = [
  { id: '5×4', w: 5, h: 4, k: 4 }, { id: '5×6', w: 5, h: 6, k: 6 }, { id: '8×5', w: 8, h: 5, k: 8 },
  { id: '10×6', w: 10, h: 6, k: 12 }, { id: '12×5', w: 12, h: 5, k: 12 }, { id: '15×4', w: 15, h: 4, k: 12 }, { id: '20×3', w: 20, h: 3, k: 12 },
];

/** Does the piece fit on the board without leaving it or covering a taken cell? */
export function fits(w: number, h: number, taken: Set<number>, p: Placed): boolean {
  return cellsOf(p).every(([x, y]) => x >= 0 && y >= 0 && x < w && y < h && !taken.has(y * w + x));
}

/**
 * Fills the board's empty cells with unused pieces from `avail`, always covering the first
 * empty cell next. `order` shuffles the tries. Returns the new placements, or null if there
 * is no way (or the budget of steps runs out: then `out.gaveUp` is set).
 */
export function solve(w: number, h: number, placed: Placed[], avail: Letter[], rnd?: () => number, budget = 3_000_000, out: { gaveUp?: boolean } = {}): Placed[] | null {
  const taken = new Set<number>();
  for (const p of placed) for (const [x, y] of cellsOf(p)) taken.add(y * w + x);
  const free = w * h - taken.size;
  if (free % 5) return null;
  const used = new Set(placed.map(p => p.l));
  const pool = avail.filter(l => !used.has(l));
  if (pool.length < free / 5) return null;
  const shuf = <T,>(a: T[]) => { if (!rnd) return a; const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const shapes = Object.fromEntries(pool.map(l => [l, ORIENTS[l].map(o => ({ o, cells: orient(l, o) }))]));
  const res: Placed[] = [];
  let steps = 0;
  // Every walled-off pocket of empty cells must hold whole pieces: a multiple of five cells.
  const seen = new Int32Array(w * h); let stamp = 0; const stack: number[] = [];
  const pocketsOk = () => {
    stamp++;
    for (let s0 = 0; s0 < w * h; s0++) {
      if (taken.has(s0) || seen[s0] === stamp) continue;
      let n = 0; stack.push(s0); seen[s0] = stamp;
      while (stack.length) {
        const c = stack.pop()!; n++;
        const x = c % w;
        for (const d of [x > 0 ? c - 1 : -1, x < w - 1 ? c + 1 : -1, c - w, c + w]) {
          if (d < 0 || d >= w * h || taken.has(d) || seen[d] === stamp) continue;
          seen[d] = stamp; stack.push(d);
        }
      }
      if (n % 5) return false;
    }
    return true;
  };
  const rec = (start: number): boolean => {
    let i = start; while (i < w * h && taken.has(i)) i++;
    if (i === w * h) return true;
    if (++steps > budget) { out.gaveUp = true; return false; }
    const cx = i % w, cy = Math.floor(i / w);
    for (const l of shuf(pool)) {
      if (used.has(l)) continue;
      for (const { o, cells } of shuf(shapes[l])) {
        // Put the piece's first cell (in reading order) on the first empty cell.
        const p: Placed = { l, o, x: cx - cells[0][0], y: cy - cells[0][1] };
        if (!fits(w, h, taken, p)) continue;
        const cs = cellsOf(p).map(([x, y]) => y * w + x);
        cs.forEach(c => taken.add(c)); used.add(l); res.push(p);
        if (pocketsOk() && rec(i + 1)) return true;
        if (out.gaveUp) return false;
        res.pop(); used.delete(l); cs.forEach(c => taken.delete(c));
      }
    }
    return false;
  };
  return rec(0) ? res : null;
}

/** A board to fill: the big ones take all twelve pieces; small ones a random set that is known to fit. */
export function makeBoard(id: string, rnd: () => number = Math.random): Board {
  const b = BOARDS.find(x => x.id === id) ?? BOARDS[1];
  if (b.k === 12) return { id: b.id, w: b.w, h: b.h, pieces: LETTERS.slice() };
  for (;;) {
    const sol = solveFast(b.w, b.h, [], LETTERS, rnd, 200_000);
    if (sol) return { id: b.id, w: b.w, h: b.h, pieces: sol.map(p => p.l).sort() };
  }
}

/** The orientation of a piece seen in a mirror along the diagonal (x and y swapped). */
function transposeO(l: Letter, o: number): number {
  const want = JSON.stringify(orient(l, o).map(([x, y]) => [y, x] as Cell).sort((a, b) => a[1] - b[1] || a[0] - b[0]));
  return ORIENTS[l].find(k => JSON.stringify(orient(l, k)) === want) ?? o;
}
const transpose = (p: Placed): Placed => ({ l: p.l, o: transposeO(p.l, p.o), x: p.y, y: p.x });

/** solve(), but wide boards are searched on their side: filling across the short way is far quicker. */
export function solveFast(w: number, h: number, placed: Placed[], avail: Letter[], rnd?: () => number, budget?: number, out: { gaveUp?: boolean } = {}): Placed[] | null {
  if (w <= h) return solve(w, h, placed, avail, rnd, budget, out);
  const r = solve(h, w, placed.map(transpose), avail, rnd, budget, out);
  return r && r.map(transpose);
}
