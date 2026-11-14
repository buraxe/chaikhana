/**
 * Binary puzzle (Takuzu, 二进制数独): fill the grid with 0s and 1s so that no row or column has
 * three of the same in a line, every row and column has as many 0s as 1s, and no two rows (or
 * two columns) are the same. Puzzles are generated with exactly one solution.
 */
import { shuffle, type Rng } from '../../core/rng';

export interface BPuzzle { n: number; givens: number[]; solution: number[] } // -1 empty, 0 or 1

const lineOf = (g: number[], n: number, k: number, col: boolean) => Array.from({ length: n }, (_, j) => g[col ? j * n + k : k * n + j]);
/** A line breaks a rule so far: three in a row, or too many of one digit. */
function lineBad(line: number[], n: number): boolean {
  let z = 0, o = 0;
  for (let j = 0; j < n; j++) {
    if (line[j] === 0) z++; else if (line[j] === 1) o++;
    if (j >= 2 && line[j] >= 0 && line[j] === line[j - 1] && line[j] === line[j - 2]) return true;
  }
  return z > n / 2 || o > n / 2;
}
function linesDup(g: number[], n: number): boolean {
  const seen = new Set<string>();
  for (const col of [false, true]) {
    seen.clear();
    for (let k = 0; k < n; k++) { const l = lineOf(g, n, k, col); if (l.includes(-1)) continue; const s = l.join(''); if (seen.has(s)) return true; seen.add(s); }
  }
  return false;
}
/** Fills forced cells (pairs, gaps and full counts) until nothing changes; false on contradiction. */
function propagate(g: number[], n: number): boolean {
  for (let changed = true; changed;) {
    changed = false;
    for (const col of [false, true]) for (let k = 0; k < n; k++) {
      const idx = Array.from({ length: n }, (_, j) => (col ? j * n + k : k * n + j));
      const l = idx.map(i => g[i]);
      if (lineBad(l, n)) return false;
      const set = (j: number, v: number) => { if (l[j] === -1) { l[j] = v; g[idx[j]] = v; changed = true; } else if (l[j] !== v) throw 0; };
      try {
        for (let j = 0; j < n; j++) {
          if (j + 2 < n && l[j] >= 0 && l[j] === l[j + 1]) set(j + 2, 1 - l[j]);
          if (j >= 2 && l[j] >= 0 && l[j] === l[j - 1]) set(j - 2, 1 - l[j]);
          if (j + 2 < n && l[j] >= 0 && l[j] === l[j + 2]) set(j + 1, 1 - l[j]);
        }
        const z = l.filter(v => v === 0).length, o = l.filter(v => v === 1).length;
        if (z === n / 2) for (let j = 0; j < n; j++) if (l[j] === -1) set(j, 1);
        if (o === n / 2) for (let j = 0; j < n; j++) if (l[j] === -1) set(j, 0);
      } catch { return false; }
      if (lineBad(l, n)) return false;
    }
  }
  return !linesDup(g, n);
}
export function countSolutions(n: number, givens: number[], limit = 2): number {
  let found = 0;
  const go = (g: number[]) => {
    if (found >= limit || !propagate(g, n)) return;
    const i = g.indexOf(-1);
    if (i < 0) { found++; return; }
    for (const v of [0, 1]) { const h = g.slice(); h[i] = v; go(h); }
  };
  go(givens.slice());
  return found;
}
function fill(n: number, rng: Rng): number[] {
  const go = (g: number[]): number[] | null => {
    if (!propagate(g, n)) return null;
    const i = g.indexOf(-1);
    if (i < 0) return g;
    for (const v of rng() < 0.5 ? [0, 1] : [1, 0]) { const h = g.slice(); h[i] = v; const r = go(h); if (r) return r; }
    return null;
  };
  for (;;) { const r = go(new Array(n * n).fill(-1)); if (r) return r; }
}
export function generate(n: number, rng: Rng): BPuzzle {
  const sol = fill(n, rng), givens = sol.slice();
  for (const i of shuffle([...Array(n * n).keys()], rng)) {
    const v = givens[i]; givens[i] = -1;
    if (countSolutions(n, givens) !== 1) givens[i] = v;
  }
  return { n, givens, solution: sol };
}
/** Cells that break a rule: three in a line, too many of a digit, or a repeated full line. */
export function mistakes(n: number, g: number[]): Set<number> {
  const bad = new Set<number>();
  for (const col of [false, true]) for (let k = 0; k < n; k++) {
    const idx = Array.from({ length: n }, (_, j) => (col ? j * n + k : k * n + j)), l = idx.map(i => g[i]);
    for (let j = 2; j < n; j++) if (l[j] >= 0 && l[j] === l[j - 1] && l[j] === l[j - 2]) [j, j - 1, j - 2].forEach(x => bad.add(idx[x]));
    for (const v of [0, 1]) if (l.filter(x => x === v).length > n / 2) idx.forEach((i, j) => { if (l[j] === v) bad.add(i); });
  }
  for (const col of [false, true]) {
    const lines = Array.from({ length: n }, (_, k) => lineOf(g, n, k, col));
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (!lines[a].includes(-1) && lines[a].join() === lines[b].join())
      for (let j = 0; j < n; j++) { bad.add(col ? j * n + a : a * n + j); bad.add(col ? j * n + b : b * n + j); }
  }
  return bad;
}
export const solved = (n: number, g: number[]) => !g.includes(-1) && mistakes(n, g).size === 0;
