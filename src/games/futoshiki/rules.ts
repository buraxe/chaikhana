/**
 * Futoshiki (不等式数独): fill the n×n grid with 1…n once per row and column, obeying the
 * “<” and “>” signs between neighbours. Puzzles are generated with exactly one solution.
 */
import { shuffle, type Rng } from '../../core/rng';

/** A sign between cell a and its right or lower neighbour b: lt means a < b. */
export interface Sign { a: number; b: number; lt: boolean }
export interface FPuzzle { n: number; givens: number[]; signs: Sign[]; solution: number[] }

function latin(n: number, rng: Rng): number[] {
  // Random Latin square by backtracking (more varied than shuffled cyclic squares).
  const g = new Array(n * n).fill(0);
  const go = (i: number): boolean => {
    if (i === n * n) return true;
    const r = Math.floor(i / n), c = i % n;
    for (const v of shuffle([...Array(n).keys()].map(x => x + 1), rng)) {
      let ok = true;
      for (let k = 0; k < c && ok; k++) if (g[r * n + k] === v) ok = false;
      for (let k = 0; k < r && ok; k++) if (g[k * n + c] === v) ok = false;
      if (!ok) continue;
      g[i] = v; if (go(i + 1)) return true;
    }
    g[i] = 0; return false;
  };
  go(0); return g;
}

/** Counts solutions up to `limit`, given the clues. */
export function countSolutions(n: number, givens: number[], signs: Sign[], limit = 2): number {
  const full = (1 << (n + 1)) - 2, dom = givens.map(v => (v ? 1 << v : full));
  const nb: { o: number; lt: boolean }[][] = Array.from({ length: n * n }, () => []);
  for (const s of signs) { nb[s.a].push({ o: s.b, lt: s.lt }); nb[s.b].push({ o: s.a, lt: !s.lt }); }
  const g = new Array(n * n).fill(0);
  let found = 0;
  const ok = (i: number, v: number) => {
    const r = Math.floor(i / n), c = i % n;
    for (let k = 0; k < n; k++) { if (g[r * n + k] === v || g[k * n + c] === v) return false; }
    for (const { o, lt } of nb[i]) if (g[o] && (lt ? !(v < g[o]) : !(v > g[o]))) return false;
    return true;
  };
  const go = (): void => {
    if (found >= limit) return;
    // Pick the empty cell with the fewest candidates.
    let best = -1, bestC: number[] = [];
    for (let i = 0; i < n * n; i++) {
      if (g[i]) continue;
      const cand: number[] = [];
      for (let v = 1; v <= n; v++) if (dom[i] & (1 << v) && ok(i, v)) cand.push(v);
      if (!cand.length) return;
      if (best < 0 || cand.length < bestC.length) { best = i; bestC = cand; if (cand.length === 1) break; }
    }
    if (best < 0) { found++; return; }
    for (const v of bestC) { g[best] = v; go(); g[best] = 0; if (found >= limit) return; }
  };
  go();
  return found;
}

export function generate(n: number, rng: Rng): FPuzzle {
  const sol = latin(n, rng);
  const pairs: Sign[] = [];
  for (let i = 0; i < n * n; i++) {
    if (i % n < n - 1) pairs.push({ a: i, b: i + 1, lt: sol[i] < sol[i + 1] });
    if (i + n < n * n) pairs.push({ a: i, b: i + n, lt: sol[i] < sol[i + n] });
  }
  // Add signs (and the odd given) until the solution is unique, then drop what is not needed.
  const signs: Sign[] = [], givens = new Array(n * n).fill(0);
  const pool = shuffle(pairs, rng);
  while (countSolutions(n, givens, signs) > 1) {
    if (pool.length && rng() < 0.82) signs.push(pool.pop()!);
    else { const empty = [...Array(n * n).keys()].filter(i => !givens[i]); const i = empty[Math.floor(rng() * empty.length)]; givens[i] = sol[i]; }
  }
  for (const s of shuffle(signs.slice(), rng)) {
    const rest = signs.filter(x => x !== s);
    if (countSolutions(n, givens, rest) === 1) signs.splice(signs.indexOf(s), 1);
  }
  for (const i of shuffle([...Array(n * n).keys()], rng)) {
    if (!givens[i]) continue;
    const v = givens[i]; givens[i] = 0;
    if (countSolutions(n, givens, signs) !== 1) givens[i] = v;
  }
  return { n, givens, signs, solution: sol };
}

/** Cells in a row or column clash, or break a sign. */
export function mistakes(p: FPuzzle, grid: number[]): Set<number> {
  const n = p.n, bad = new Set<number>();
  for (let i = 0; i < n * n; i++) {
    if (!grid[i]) continue;
    const r = Math.floor(i / n), c = i % n;
    for (let k = 0; k < n; k++) {
      if (k !== c && grid[r * n + k] === grid[i]) bad.add(i);
      if (k !== r && grid[k * n + c] === grid[i]) bad.add(i);
    }
  }
  for (const s of p.signs) { const a = grid[s.a], b = grid[s.b]; if (a && b && (s.lt ? a >= b : a <= b)) { bad.add(s.a); bad.add(s.b); } }
  return bad;
}
export const solved = (p: FPuzzle, grid: number[]) => grid.every(v => v > 0) && mistakes(p, grid).size === 0;
