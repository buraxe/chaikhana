/**
 * Kakuro (数和): a crossword of numbers. Each white run across or down holds different digits
 * 1–9 adding up to the clue in the black cell before it. Generated with exactly one solution.
 */
import { shuffle, type Rng } from '../../core/rng';

/** A cell: black (with optional sums for the run to its right and below) or white. */
export interface KCell { black: boolean; right?: number; down?: number }
export interface Run { cells: number[]; sum: number }
export interface KPuzzle { w: number; h: number; cells: KCell[]; runs: Run[]; solution: number[] }

const bits = (m: number) => { const o: number[] = []; for (let d = 1; d <= 9; d++) if (m & (1 << d)) o.push(d); return o; };
/** For each length and sum: the digits that appear in some set of distinct digits making it. */
const COMBO: number[][] = Array.from({ length: 10 }, () => new Array(46).fill(0));
for (let m = 0; m < 1 << 10; m += 2) { const ds = bits(m), s = ds.reduce((a, b) => a + b, 0); COMBO[ds.length][s] |= m; }

function pattern(w: number, h: number, rng: Rng): boolean[] | null {
  const black = new Array(w * h).fill(false);
  for (let x = 0; x < w; x++) black[x] = true;
  for (let y = 0; y < h; y++) black[y * w] = true;
  // Symmetric blocks inside, about a fifth of the cells.
  const inner: number[] = [];
  for (let y = 1; y < h; y++) for (let x = 1; x < w; x++) inner.push(y * w + x);
  for (const i of shuffle(inner, rng)) {
    if (rng() > 0.22) continue;
    const x = i % w, y = Math.floor(i / w), j = (h - y) * w + (w - x);
    black[i] = true; if (j > 0 && j < w * h && j % w > 0 && Math.floor(j / w) > 0) black[j] = true;
  }
  // Every run is 2–7 long, and the white cells are connected.
  const runs = runsOf(w, h, black);
  if (runs.some(r => r.length < 2 || r.length > 7)) return null;
  for (let i = 0; i < w * h; i++) if (!black[i] && runs.filter(r => r.includes(i)).length !== 2) return null;
  const white = [...Array(w * h).keys()].filter(i => !black[i]);
  if (white.length < (w - 1) * (h - 1) * 0.55) return null;
  const seen = new Set([white[0]]), stack = [white[0]];
  while (stack.length) { const i = stack.pop()!; for (const d of [-1, 1, -w, w]) { const j = i + d; if (j < 0 || j >= w * h || black[j] || seen.has(j) || (d === 1 && j % w === 0) || (d === -1 && i % w === 0)) continue; seen.add(j); stack.push(j); } }
  return seen.size === white.length ? black : null;
}
function runsOf(w: number, h: number, black: boolean[]): number[][] {
  const out: number[][] = [];
  for (let y = 0; y < h; y++) { let cur: number[] = []; for (let x = 0; x <= w; x++) { const i = y * w + x; if (x < w && !black[i]) cur.push(i); else { if (cur.length) out.push(cur); cur = []; } } }
  for (let x = 0; x < w; x++) { let cur: number[] = []; for (let y = 0; y <= h; y++) { const i = y * w + x; if (y < h && !black[i]) cur.push(i); else { if (cur.length) out.push(cur); cur = []; } } }
  return out;
}

/** Counts solutions (up to limit); with `rng` and no sums it fills a random valid grid instead. */
function search(n: number, runs: { cells: number[]; sum: number }[], white: number[], limit: number, rng?: Rng, fixed?: number[]): { count: number; grid: number[]; other: number[] } {
  const g = fixed ? fixed.slice() : new Array(n).fill(0), byCell: number[][] = Array.from({ length: n }, () => []);
  runs.forEach((r, k) => r.cells.forEach(i => byCell[i].push(k)));
  let count = 0, first: number[] = [], other: number[] = [];
  const cand = (i: number) => {
    let m = 0x3fe;
    for (const k of byCell[i]) {
      const r = runs[k];
      let used = 0, s = 0, empty = 0;
      for (const c of r.cells) { if (g[c]) { used |= 1 << g[c]; s += g[c]; } else empty++; }
      m &= ~used;
      if (r.sum) {
        m &= COMBO[r.cells.length][r.sum];
        // The remaining digits must be able to make up the rest of the sum.
        const left = r.sum - s, ok: number[] = [];
        for (const d of bits(m)) {
          const rest = empty - 1, free = bits(0x3fe & ~used & ~(1 << d));
          const lo = free.slice(0, rest).reduce((a, b) => a + b, 0), hi = free.slice(free.length - rest).reduce((a, b) => a + b, 0);
          if (left - d >= (rest ? lo : 0) && left - d <= (rest ? hi : 0)) ok.push(d);
        }
        m = ok.reduce((a, d) => a | (1 << d), 0);
      }
    }
    return m;
  };
  const go = () => {
    if (count >= limit) return;
    let best = -1, bm = 0, bn = 99;
    for (const i of white) { if (g[i]) continue; const m = cand(i), c = bits(m).length; if (!c) return; if (c < bn) { best = i; bm = m; bn = c; if (c === 1) break; } }
    if (best < 0) { count++; if (!first.length) first = g.slice(); else if (!other.length) other = g.slice(); return; }
    const ds = rng ? shuffle(bits(bm), rng) : bits(bm);
    for (const d of ds) { g[best] = d; go(); g[best] = 0; if (count >= limit) return; }
  };
  go();
  return { count, grid: first, other };
}

export function generate(size: number, rng: Rng): KPuzzle {
  const w = size, h = size;
  for (let tries = 0; ; tries++) {
    const black = pattern(w, h, rng);
    if (!black) continue;
    const runCells = runsOf(w, h, black), white = [...Array(w * h).keys()].filter(i => !black[i]);
    let { grid } = search(w * h, runCells.map(c => ({ cells: c, sum: 0 })), white, 1, rng);
    if (!grid.length) continue;
    let runs: Run[] = [], unique = false;
    // Repair: while a second solution exists, refill the runs through a cell where the two differ.
    for (let fix = 0; fix < 60 && grid.length; fix++) {
      runs = runCells.map(c => ({ cells: c, sum: c.reduce((a, i) => a + grid[i], 0) }));
      const r = search(w * h, runs, white, 2);
      if (r.count === 1) { unique = true; break; }
      const diff = white.filter(i => r.grid[i] !== r.other[i]);
      const c = diff[Math.floor(rng() * diff.length)];
      const keep = grid.slice();
      for (const run of runCells) if (run.includes(c) || (rng() < 0.15 && run.some(i => diff.includes(i)))) run.forEach(i => { keep[i] = 0; });
      grid = search(w * h, runCells.map(cc => ({ cells: cc, sum: 0 })), white, 1, rng, keep).grid;
    }
    if (!unique) continue;
    {
      const cells: KCell[] = black.map(b => ({ black: b }));
      for (const r of runs) {
        const first = r.cells[0], horiz = r.cells.length > 1 && r.cells[1] === first + 1;
        const clue = horiz ? first - 1 : first - w;
        if (horiz) cells[clue].right = r.sum; else cells[clue].down = r.sum;
      }
      return { w, h, cells, runs, solution: grid };
    }
  }
}

/** Cells in a run that repeat a digit, or a full run with the wrong sum. */
export function mistakes(p: KPuzzle, g: number[]): Set<number> {
  const bad = new Set<number>();
  for (const r of p.runs) {
    const vals = r.cells.map(i => g[i]);
    r.cells.forEach((i, k) => { if (vals[k] && vals.indexOf(vals[k]) !== k) { bad.add(i); bad.add(r.cells[vals.indexOf(vals[k])]); } });
    const s = vals.reduce((a, b) => a + b, 0);
    if (vals.every(v => v) ? s !== r.sum : s >= r.sum) r.cells.forEach(i => { if (g[i]) bad.add(i); });
  }
  return bad;
}
export const solved = (p: KPuzzle, g: number[]) => p.cells.every((c, i) => c.black || g[i] > 0) && mistakes(p, g).size === 0;
