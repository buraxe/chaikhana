/**
 * Lights Out. Pressing a light toggles it and its four orthogonal neighbours; the goal is
 * to switch every light off. Over GF(2) (arithmetic mod 2) the order of presses does not
 * matter and pressing twice cancels, so a position is a linear system A·x = b, where
 * column j of A is the effect of pressing j. Gaussian elimination solves it.
 */
import type { GameModule } from '../../core/game';

export function press(cells: number[], n: number, i: number): number[] {
  const out = cells.slice(), x = i % n, y = Math.floor(i / n);
  for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const xx = x + dx, yy = y + dy;
    if (xx >= 0 && yy >= 0 && xx < n && yy < n) out[yy * n + xx] ^= 1;
  }
  return out;
}

/** Presses (0/1 per cell) that switch everything off, using as few presses as possible; null if unsolvable. */
export function solve(n: number, cells: number[]): number[] | null {
  const N = n * n;
  const M: number[][] = [];
  for (let r = 0; r < N; r++) {
    const row = new Array(N + 1).fill(0);
    for (let j = 0; j < N; j++) row[j] = press(new Array(N).fill(0), n, j)[r];
    row[N] = cells[r];
    M.push(row);
  }
  const pivots: number[] = [];
  let r = 0;
  for (let c = 0; c < N && r < N; c++) {
    const p = M.findIndex((row, k) => k >= r && row[c]);
    if (p < 0) continue;
    [M[r], M[p]] = [M[p], M[r]];
    for (let k = 0; k < N; k++) if (k !== r && M[k][c]) for (let j = c; j <= N; j++) M[k][j] ^= M[r][j];
    pivots.push(c); r++;
  }
  for (let k = r; k < N; k++) if (M[k][N]) return null;
  const free = [...Array(N).keys()].filter(c => !pivots.includes(c));
  let best: number[] | null = null, bestW = Infinity;
  for (let mask = 0; mask < 1 << Math.min(free.length, 12); mask++) {
    const x = new Array(N).fill(0);
    free.forEach((f, k) => { x[f] = (mask >> k) & 1; });
    pivots.forEach((c, k) => {
      let v = M[k][N];
      for (const f of free) if (M[k][f] && x[f]) v ^= 1;
      x[c] = v;
    });
    const w = x.reduce((a, v) => a + v, 0);
    if (w < bestW) { bestW = w; best = x; }
  }
  return best;
}

/** A solvable puzzle: random presses applied to a dark board. */
export function scramble(n: number, rng: () => number): number[] {
  for (;;) {
    let cells = new Array(n * n).fill(0);
    for (let i = 0; i < n * n; i++) if (rng() < 0.5) cells = press(cells, n, i);
    const sol = solve(n, cells);
    if (sol && sol.reduce((a, v) => a + v, 0) >= Math.max(3, n)) return cells;
  }
}

export interface LState { n: number; cells: number[]; presses: number }
export const lightsOutRules: GameModule<LState, number, { n: number; cells: number[] }> = {
  id: 'lights-off',
  initializeGame: c => ({ n: c.n, cells: c.cells.slice(), presses: 0 }),
  validateMove: (st, i) => Number.isInteger(i) && i >= 0 && i < st.n * st.n,
  applyMove: (st, i) => ({ ...st, cells: press(st.cells, st.n, i), presses: st.presses + 1 }),
  checkGameOver: st => st.cells.every(v => v === 0),
  calculateResult: st => (st.cells.every(v => v === 0) ? { winner: 0, draw: false } : null),
  serializeState: st => JSON.stringify(st), deserializeState: raw => JSON.parse(raw) as LState,
};
