/**
 * KenKen: fill the n×n grid so each row and column has 1…n once, and the numbers in each
 * outlined cage make its target with its operation. Any filling that meets the rules wins.
 */
import { shuffle, type Rng } from '../../core/rng';

export type Op = '+' | '-' | '×' | '÷' | '';
export interface Cage { cells: number[]; op: Op; target: number }
export interface KPuzzle { n: number; cages: Cage[]; solution: number[] }
export function generate(n: number, rng: Rng): KPuzzle {
  // A Latin square: shifted rows, then shuffled rows, columns and symbols.
  const base = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => ((r + c) % n) + 1));
  const rows = shuffle([...Array(n).keys()], rng), cols = shuffle([...Array(n).keys()], rng), sym = shuffle([...Array(n).keys()].map(x => x + 1), rng);
  const sol: number[] = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) sol.push(sym[base[rows[r]][cols[c]] - 1]);
  // Cages: grow random connected groups of 1–4 cells (mostly 2–3).
  const owner = new Array(n * n).fill(-1), cages: Cage[] = [];
  for (const start of shuffle([...Array(n * n).keys()], rng)) {
    if (owner[start] >= 0) continue;
    const want = [1, 2, 2, 2, 3, 3, 3, 4][Math.floor(rng() * 8)], cells = [start]; owner[start] = cages.length;
    while (cells.length < want) {
      const opts: number[] = [];
      for (const x of cells) for (const d of [-n, n, -1, 1]) { const y = x + d; if (y < 0 || y >= n * n || (d === -1 && x % n === 0) || (d === 1 && x % n === n - 1) || owner[y] >= 0) continue; opts.push(y); }
      if (!opts.length) break;
      const y = opts[Math.floor(rng() * opts.length)]; owner[y] = cages.length; cells.push(y);
    }
    const v = cells.map(i => sol[i]);
    let op: Op, target: number;
    if (cells.length === 1) { op = ''; target = v[0]; }
    else if (cells.length === 2) {
      const [a, b] = [Math.max(...v), Math.min(...v)];
      if (a % b === 0 && rng() < 0.5) { op = '÷'; target = a / b; } else if (rng() < 0.5) { op = '-'; target = a - b; } else if (rng() < 0.5) { op = '+'; target = a + b; } else { op = '×'; target = a * b; }
    } else if (rng() < 0.55) { op = '+'; target = v.reduce((x, y) => x + y, 0); } else { op = '×'; target = v.reduce((x, y) => x * y, 1); }
    cages.push({ cells, op, target });
  }
  return { n, cages, solution: sol };
}
export function cageOk(c: Cage, grid: number[]): boolean | null {
  const v = c.cells.map(i => grid[i]); if (v.some(x => !x)) return null;
  switch (c.op) {
    case '': return v[0] === c.target;
    case '+': return v.reduce((a, b) => a + b, 0) === c.target;
    case '×': return v.reduce((a, b) => a * b, 1) === c.target;
    case '-': return Math.abs(v[0] - v[1]) === c.target;
    case '÷': return Math.max(...v) / Math.min(...v) === c.target;
  }
}
/** Cells that clash with another in their row or column. */
export function clashes(n: number, grid: number[]): Set<number> {
  const bad = new Set<number>();
  for (let i = 0; i < n * n; i++) { if (!grid[i]) continue; for (let j = i + 1; j < n * n; j++) if (grid[j] === grid[i] && (Math.floor(i / n) === Math.floor(j / n) || i % n === j % n)) { bad.add(i); bad.add(j); } }
  return bad;
}
export const solved = (p: KPuzzle, grid: number[]) => grid.every(Boolean) && !clashes(p.n, grid).size && p.cages.every(c => cageOk(c, grid));
