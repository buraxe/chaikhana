/**
 * Reversi (Othello) on 8×8. 1 black (moves first), 2 white. A move must outflank at least
 * one line of opposing discs, which then flip. A player with no move passes automatically;
 * when neither can move the game ends and the most discs wins.
 */
import type { Level } from '../../core/match';

export interface RState { cells: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; passed: boolean }
const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export function newGame(): RState {
  const cells = new Array(64).fill(0);
  cells[27] = 2; cells[36] = 2; cells[28] = 1; cells[35] = 1;
  return { cells, moves: [], turn: 1, winner: 0, draw: false, passed: false };
}
export function flips(cells: ArrayLike<number>, i: number, who: number): number[] {
  if (cells[i]) return [];
  const out: number[] = [], r0 = Math.floor(i / 8), c0 = i % 8, opp = 3 - who;
  for (const [dr, dc] of DIRS) {
    const line: number[] = [];
    let r = r0 + dr, c = c0 + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && cells[r * 8 + c] === opp) { line.push(r * 8 + c); r += dr; c += dc; }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && cells[r * 8 + c] === who) out.push(...line);
  }
  return out;
}
export const legal = (cells: ArrayLike<number>, who: number) => { const out: number[] = []; for (let i = 0; i < 64; i++) if (!cells[i] && flips(cells, i, who).length) out.push(i); return out; };
export const isLegal = (st: RState, i: number) => !st.winner && !st.draw && flips(st.cells, i, st.turn).length > 0;
export function play(st: RState, i: number): RState {
  if (!isLegal(st, i)) return st;
  const cells = st.cells.slice();
  for (const f of flips(cells, i, st.turn)) cells[f] = st.turn;
  cells[i] = st.turn;
  let turn = (3 - st.turn) as 1 | 2, passed = false;
  if (!legal(cells, turn).length) {
    if (legal(cells, st.turn).length) { turn = st.turn; passed = true; }
    else {
      const b = cells.filter(v => v === 1).length, w = cells.filter(v => v === 2).length;
      return { cells, moves: [...st.moves, i], turn, winner: b > w ? 1 : w > b ? 2 : 0, draw: b === w, passed: false };
    }
  }
  return { cells, moves: [...st.moves, i], turn, winner: 0, draw: false, passed };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());
export const count = (cells: number[], who: number) => cells.filter(v => v === who).length;

// ---- AI: negamax, alpha-beta, iterative deepening; exact endgame for the strongest level ----
export const LEVELS: (Level & { depth: number; ms: number; exact: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0, ms: 0, exact: 0 }, { name: 'Easy', rating: 900, depth: 1, ms: 0, exact: 0 },
  { name: 'Intermediate', rating: 1150, depth: 3, ms: 400, exact: 0 }, { name: 'Advanced', rating: 1400, depth: 5, ms: 900, exact: 8 },
  { name: 'Expert', rating: 1650, depth: 9, ms: 1600, exact: 12 },
];
const W = [
  100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5, 10, -2, 1, 1, 1, 1, -2, 10, -20, -50, -2, -2, -2, -2, -50, -20, 100, -20, 10, 5, 5, 10, -20, 100,
];
function evaluate(cells: number[], who: number): number {
  let s = 0;
  for (let i = 0; i < 64; i++) if (cells[i]) s += cells[i] === who ? W[i] : -W[i];
  return s + 4 * (legal(cells, who).length - legal(cells, 3 - who).length);
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export function chooseMove(st: RState, level: number, opts: { rng?: () => number; depth?: number } = {}): number {
  const rng = opts.rng ?? Math.random, L = opts.depth ? { ...LEVELS[level], depth: opts.depth, ms: 0 } : LEVELS[level];
  const moves = legal(st.cells, st.turn);
  if (moves.length <= 1) return moves[0] ?? -1;
  if (L.depth === 0) return moves[Math.floor(rng() * moves.length)];
  const empties = st.cells.filter(v => !v).length, exact = L.exact && empties <= L.exact;
  const deadline = L.ms && !exact ? now() + L.ms : Infinity;
  let nodes = 0, aborted = false;
  const search = (cells: number[], who: number, depth: number, alpha: number, beta: number, passed: boolean): number => {
    if ((++nodes & 1023) === 0 && now() > deadline) aborted = true;
    if (aborted) return 0;
    const ms = legal(cells, who);
    if (!ms.length) {
      if (passed) { const d = count(cells, who) - count(cells, 3 - who); return d * 1000; }
      return -search(cells, 3 - who, depth, -beta, -alpha, true);
    }
    if (depth === 0) return evaluate(cells, who);
    let best = -Infinity;
    for (const m of ms) {
      const c = cells.slice();
      for (const f of flips(c, m, who)) c[f] = who;
      c[m] = who;
      const v = -search(c, 3 - who, depth - 1, -beta, -alpha, false);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  };
  let order = moves.slice().sort((a, b) => W[b] - W[a] || rng() - 0.5), best = order[0];
  const maxD = exact ? 64 : L.depth;
  for (let d = exact ? maxD : L.ms ? 1 : L.depth; d <= maxD; d++) {
    let alpha = -Infinity, bestM = order[0], bestV = -Infinity;
    for (const m of order) {
      const c = st.cells.slice();
      for (const f of flips(c, m, st.turn)) c[f] = st.turn;
      c[m] = st.turn;
      const v = -search(c, 3 - st.turn, d - 1, -Infinity, -alpha, false);
      if (aborted) break;
      if (v > bestV) { bestV = v; bestM = m; }
      if (v > alpha) alpha = v;
    }
    if (aborted) break;
    best = bestM;
    order = [best, ...order.filter(m => m !== best)];
  }
  return best;
}
