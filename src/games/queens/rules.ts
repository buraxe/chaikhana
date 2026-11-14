/**
 * Queens. Two puzzles on one board:
 * - Regions: one queen in every row, every column and every coloured region, and no two
 *   queens touching, not even at a corner. Generated with exactly one solution.
 * - Classic: n queens on an n×n board with no two in the same row, column or diagonal. The
 *   eight-queens board has 92 solutions; find as many as you can.
 */
import { shuffle, type Rng } from '../../core/rng';

export interface RPuzzle { n: number; region: number[]; solution: number[] } // solution[row] = column

export function countRegion(n: number, region: number[], limit = 2): number {
  let found = 0;
  const cols = new Array(n).fill(false), regs = new Array(n).fill(false), pos: number[] = [];
  const go = (r: number) => {
    if (found >= limit) return;
    if (r === n) { found++; return; }
    for (let c = 0; c < n; c++) {
      const g = region[r * n + c];
      if (cols[c] || regs[g]) continue;
      if (r && Math.abs(pos[r - 1] - c) <= 1) continue;
      cols[c] = regs[g] = true; pos[r] = c;
      go(r + 1);
      cols[c] = regs[g] = false;
      if (found >= limit) return;
    }
  };
  go(0);
  return found;
}

/** A random placement with no two queens in a row, column, or touching. */
function placement(n: number, rng: Rng): number[] {
  for (;;) {
    const p: number[] = [], used = new Array(n).fill(false);
    const go = (r: number): boolean => {
      if (r === n) return true;
      for (const c of shuffle([...Array(n).keys()], rng)) {
        if (used[c] || (r && Math.abs(p[r - 1] - c) <= 1)) continue;
        used[c] = true; p[r] = c;
        if (go(r + 1)) return true;
        used[c] = false;
      }
      return false;
    };
    if (go(0)) return p;
  }
}

export function generate(n: number, rng: Rng): RPuzzle {
  for (;;) {
    const sol = placement(n, rng), region = new Array(n * n).fill(-1);
    sol.forEach((c, r) => { region[r * n + c] = r; });
    // Grow the regions from their queens at uneven speeds, so some are big and some tiny.
    const speed = Array.from({ length: n }, () => 0.15 + rng());
    let left = n * n - n;
    while (left) {
      const g = (() => { let t = rng() * speed.reduce((a, b) => a + b, 0); for (let k = 0; k < n; k++) { t -= speed[k]; if (t <= 0) return k; } return n - 1; })();
      const frontier: number[] = [];
      for (let i = 0; i < n * n; i++) if (region[i] === g) for (const j of [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1]) if (j >= 0 && j < n * n && region[j] < 0) frontier.push(j);
      if (!frontier.length) { speed[g] = 0.0001; continue; }
      region[frontier[Math.floor(rng() * frontier.length)]] = g; left--;
    }
    // Then, while another solution exists, hand one of its queens' squares to a neighbouring region.
    for (let fix = 0; fix < 40; fix++) {
      if (countRegion(n, region) === 1) return { n, region, solution: sol };
      const other = another(n, region, sol);
      if (!other) break;
      const r = other.findIndex((c, k) => c !== sol[k]), i = r * n + other[r];
      const near = [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1].filter(j => j >= 0 && j < n * n && region[j] !== region[i]);
      // Never take a queen's own square, and keep the region it leaves connected.
      if (sol[r] === other[r] || !near.length) break;
      const before = region[i];
      region[i] = region[near[Math.floor(rng() * near.length)]];
      if (!connectedRegion(n, region, before)) region[i] = before;
    }
  }
}
function another(n: number, region: number[], sol: number[]): number[] | null {
  let res: number[] | null = null;
  const cols = new Array(n).fill(false), regs = new Array(n).fill(false), pos: number[] = [];
  const go = (r: number): void => {
    if (res) return;
    if (r === n) { if (pos.some((c, k) => c !== sol[k])) res = pos.slice(); return; }
    for (let c = 0; c < n && !res; c++) {
      const g = region[r * n + c];
      if (cols[c] || regs[g] || (r && Math.abs(pos[r - 1] - c) <= 1)) continue;
      cols[c] = regs[g] = true; pos[r] = c; go(r + 1); cols[c] = regs[g] = false;
    }
  };
  go(0);
  return res;
}
function connectedRegion(n: number, region: number[], g: number): boolean {
  const cells = region.map((v, i) => (v === g ? i : -1)).filter(i => i >= 0);
  if (!cells.length) return false;
  const seen = new Set([cells[0]]), st = [cells[0]];
  while (st.length) { const i = st.pop()!; for (const j of [i - n, i + n, i % n ? i - 1 : -1, i % n < n - 1 ? i + 1 : -1]) if (j >= 0 && j < n * n && region[j] === g && !seen.has(j)) { seen.add(j); st.push(j); } }
  return seen.size === cells.length;
}

/** Queens that break a rule. `regions` turns on the region and no-touching rules. */
export function conflicts(n: number, queens: number[], region: number[] | null): Set<number> {
  const bad = new Set<number>();
  for (let a = 0; a < queens.length; a++) for (let b = a + 1; b < queens.length; b++) {
    const i = queens[a], j = queens[b], ri = Math.floor(i / n), ci = i % n, rj = Math.floor(j / n), cj = j % n;
    const clash = ri === rj || ci === cj || (region ? (Math.abs(ri - rj) <= 1 && Math.abs(ci - cj) <= 1) || region[i] === region[j] : Math.abs(ri - rj) === Math.abs(ci - cj));
    if (clash) { bad.add(i); bad.add(j); }
  }
  return bad;
}
export const complete = (n: number, queens: number[], region: number[] | null) => queens.length === n && conflicts(n, queens, region).size === 0;
/** Total solutions to the classic problem (known values). */
export const CLASSIC_TOTAL: Record<number, number> = { 4: 2, 5: 10, 6: 4, 7: 40, 8: 92, 9: 352, 10: 724 };
