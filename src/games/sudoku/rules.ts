/**
 * Sudoku rules for any box shape: 4×4 (2×2 boxes), 6×6 (2×3), 9×9 (3×3), 16×16 (4×4).
 * Grids are flat arrays, 0 = empty, values 1..n. Candidate sets are bitmasks.
 */
import type { GameModule } from '../../core/game';
import type { Rng } from '../../core/rng';

export interface Shape { n: number; br: number; bc: number }
export const SHAPES: Record<number, Shape> = {
  4: { n: 4, br: 2, bc: 2 }, 6: { n: 6, br: 2, bc: 3 }, 9: { n: 9, br: 3, bc: 3 }, 16: { n: 16, br: 4, bc: 4 },
};
export const SYMBOLS = '123456789ABCDEFG';

interface Units { boxOf: number[]; all: number[][]; kind: ('box' | 'row' | 'column')[]; peers: number[][] }
const cache = new Map<number, Units>();

export function units(s: Shape): Units {
  let u = cache.get(s.n);
  if (u) return u;
  const n = s.n, perRow = n / s.bc;
  const rows: number[][] = [], cols: number[][] = [], boxes: number[][] = [];
  for (let i = 0; i < n; i++) { rows.push([]); cols.push([]); boxes.push([]); }
  const boxOf: number[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const i = r * n + c, b = Math.floor(r / s.br) * perRow + Math.floor(c / s.bc);
    boxOf.push(b); rows[r].push(i); cols[c].push(i); boxes[b].push(i);
  }
  const peers = boxOf.map((b, i) => {
    const set = new Set<number>([...rows[Math.floor(i / n)], ...cols[i % n], ...boxes[b]]);
    set.delete(i);
    return [...set];
  });
  u = { boxOf, all: [...boxes, ...rows, ...cols], peers,
    kind: [...boxes.map(() => 'box' as const), ...rows.map(() => 'row' as const), ...cols.map(() => 'column' as const)] };
  cache.set(s.n, u);
  return u;
}

export const popcount = (m: number) => { let c = 0; while (m) { m &= m - 1; c++; } return c; };

/** Values still allowed in a cell, given the rest of the grid. */
export function candMask(s: Shape, grid: number[], cell: number): number {
  let used = 0;
  for (const p of units(s).peers[cell]) if (grid[p]) used |= 1 << (grid[p] - 1);
  return ((1 << s.n) - 1) & ~used;
}

/** Cells whose value repeats in their row, column or box. */
export function conflicts(s: Shape, grid: number[]): Set<number> {
  const out = new Set<number>(), U = units(s);
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i]) continue;
    for (const p of U.peers[i]) if (grid[p] === grid[i]) { out.add(i); break; }
  }
  return out;
}

/**
 * Backtracking solver that always branches on the cell with the fewest candidates.
 * Counts solutions up to `limit` (2 is enough to test uniqueness). Returns -1 on timeout.
 */
export function solveCount(s: Shape, grid: number[], limit = 2,
  opts: { rng?: Rng; out?: number[]; deadline?: number } = {}): number {
  const n = s.n, full = (1 << n) - 1, g = grid.slice(), U = units(s);
  const row = new Array<number>(n).fill(0), col = new Array<number>(n).fill(0), box = new Array<number>(n).fill(0);
  for (let i = 0; i < g.length; i++) {
    if (!g[i]) continue;
    const bit = 1 << (g[i] - 1), r = Math.floor(i / n), c = i % n, b = U.boxOf[i];
    if ((row[r] | col[c] | box[b]) & bit) return 0;
    row[r] |= bit; col[c] |= bit; box[b] |= bit;
  }
  let count = 0, nodes = 0, timedOut = false;
  const rec = (): boolean => {
    if (opts.deadline && (++nodes & 255) === 0 && Date.now() > opts.deadline) { timedOut = true; return true; }
    let best = -1, bestMask = 0, bestCnt = 99;
    for (let i = 0; i < g.length; i++) {
      if (g[i]) continue;
      const m = full & ~(row[Math.floor(i / n)] | col[i % n] | box[U.boxOf[i]]);
      if (!m) return false;
      const pc = popcount(m);
      if (pc < bestCnt) { best = i; bestMask = m; bestCnt = pc; if (pc === 1) break; }
    }
    if (best < 0) {
      count++;
      if (opts.out && count === 1) for (let i = 0; i < g.length; i++) opts.out[i] = g[i];
      return count >= limit;
    }
    const vals: number[] = [];
    for (let v = 0; v < n; v++) if ((bestMask >> v) & 1) vals.push(v);
    if (opts.rng) for (let i = vals.length - 1; i > 0; i--) {
      const j = Math.floor(opts.rng() * (i + 1)); [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    const r = Math.floor(best / n), c = best % n, b = U.boxOf[best];
    for (const v of vals) {
      const bit = 1 << v;
      g[best] = v + 1; row[r] |= bit; col[c] |= bit; box[b] |= bit;
      if (rec()) return true;
      g[best] = 0; row[r] &= ~bit; col[c] &= ~bit; box[b] &= ~bit;
    }
    return false;
  };
  rec();
  return timedOut ? -1 : count;
}

export interface Single { cell: number; value: number; kind: 'naked' | 'hidden'; unit?: 'box' | 'row' | 'column' }

/**
 * The next forced placement, if one exists.
 * Hidden single: a value has only one possible cell in a box, row or column.
 * Naked single: a cell has only one possible value.
 */
export function findSingle(s: Shape, grid: number[]): Single | null {
  const U = units(s), cand = grid.map((v, i) => (v ? 0 : candMask(s, grid, i)));
  for (let u = 0; u < U.all.length; u++) {
    for (let v = 0; v < s.n; v++) {
      const bit = 1 << v; let where = -1, cnt = 0;
      for (const cell of U.all[u]) if (cand[cell] & bit) { cnt++; where = cell; if (cnt > 1) break; }
      if (cnt === 1) return { cell: where, value: v + 1, kind: 'hidden', unit: U.kind[u] };
    }
  }
  for (let i = 0; i < grid.length; i++) {
    if (!grid[i] && popcount(cand[i]) === 1) return { cell: i, value: 32 - Math.clz32(cand[i]), kind: 'naked' };
  }
  return null;
}

/** True if naked and hidden singles alone finish the grid (constraint propagation, no guessing). */
export function logicSolve(s: Shape, grid: number[]): boolean {
  const U = units(s), g = grid.slice(), n = s.n;
  const cand = g.map((v, i) => (v ? 0 : candMask(s, g, i)));
  let empty = 0;
  for (const v of g) if (!v) empty++;
  const put = (cell: number, v: number) => {
    g[cell] = v + 1; cand[cell] = 0; empty--;
    for (const p of U.peers[cell]) cand[p] &= ~(1 << v);
  };
  let progress = true;
  while (empty && progress) {
    progress = false;
    for (let i = 0; i < g.length; i++) {
      if (g[i]) continue;
      const m = cand[i];
      if (!m) return false;
      if ((m & (m - 1)) === 0) { put(i, 31 - Math.clz32(m)); progress = true; }
    }
    for (const cells of U.all) for (let v = 0; v < n; v++) {
      const bit = 1 << v; let where = -1, cnt = 0;
      for (const cell of cells) if (cand[cell] & bit) { cnt++; where = cell; if (cnt > 1) break; }
      if (cnt === 1) { put(where, v); progress = true; }
    }
  }
  return empty === 0;
}

// ---- Module interface -------------------------------------------------------

export interface SudokuState { size: number; givens: number[]; values: number[]; solution: number[] }
export interface SudokuMove { cell: number; value: number }

export const sudokuRules: GameModule<SudokuState, SudokuMove, { size: number; givens: number[]; solution: number[] }> = {
  id: 'sudoku',
  initializeGame: c => ({ size: c.size, givens: c.givens.slice(), values: c.givens.slice(), solution: c.solution.slice() }),
  validateMove: (st, m) => m.cell >= 0 && m.cell < st.values.length && !st.givens[m.cell]
    && Number.isInteger(m.value) && m.value >= 0 && m.value <= st.size,
  applyMove(st, m) {
    if (!this.validateMove(st, m)) return st;
    const values = st.values.slice(); values[m.cell] = m.value;
    return { ...st, values };
  },
  getLegalMoves(st) {
    const s = SHAPES[st.size], out: SudokuMove[] = [];
    st.values.forEach((v, cell) => {
      if (v) return;
      const mask = candMask(s, st.values, cell);
      for (let k = 0; k < st.size; k++) if ((mask >> k) & 1) out.push({ cell, value: k + 1 });
    });
    return out;
  },
  checkGameOver: st => st.values.every((v, i) => v === st.solution[i]),
  calculateResult(st) { return this.checkGameOver(st) ? { winner: null, draw: false, detail: 'solved' } : null; },
  serializeState: st => JSON.stringify(st),
  deserializeState: raw => JSON.parse(raw) as SudokuState,
};
