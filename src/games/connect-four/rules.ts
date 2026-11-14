/**
 * Connect Four: 7 columns × 6 rows, discs drop to the lowest empty cell.
 * cells[r * 7 + c], row 0 at the top. 1 = Red (moves first), 2 = Gold.
 */
import type { GameModule } from '../../core/game';
import type { Level } from '../../core/match';

export const COLS = 7, ROWS = 6;
export interface C4State { cells: number[]; heights: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; line: number[] }
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];

export const newGame = (): C4State => ({ cells: new Array(COLS * ROWS).fill(0), heights: new Array(COLS).fill(0), moves: [], turn: 1, winner: 0, draw: false, line: [] });
export const isLegal = (st: C4State, col: number) => !st.winner && !st.draw && Number.isInteger(col) && col >= 0 && col < COLS && st.heights[col] < ROWS;

/** The run of four or more through cell idx, or null. */
export function lineAt(cells: ArrayLike<number>, idx: number): number[] | null {
  const color = cells[idx], r0 = Math.floor(idx / COLS), c0 = idx % COLS;
  for (const [dc, dr] of DIRS) {
    const run = [idx];
    for (const s of [1, -1]) {
      let r = r0 + dr * s, c = c0 + dc * s;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[r * COLS + c] === color) { run.push(r * COLS + c); r += dr * s; c += dc * s; }
    }
    if (run.length >= 4) return run;
  }
  return null;
}
export function play(st: C4State, col: number): C4State {
  if (!isLegal(st, col)) return st;
  const cells = st.cells.slice(), heights = st.heights.slice();
  const idx = (ROWS - 1 - heights[col]) * COLS + col;
  cells[idx] = st.turn; heights[col]++;
  const moves = [...st.moves, col], line = lineAt(cells, idx);
  return { cells, heights, moves, turn: st.turn === 1 ? 2 : 1, winner: line ? st.turn : 0, draw: !line && moves.length === COLS * ROWS, line: line ?? [] };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());
/** Cell index where the disc from move k landed. */
export function landing(moves: number[], k: number): number {
  let h = 0;
  for (let j = 0; j < k; j++) if (moves[j] === moves[k]) h++;
  return (ROWS - 1 - h) * COLS + moves[k];
}

// ---- Engine: negamax with alpha-beta, centre-first move order, iterative deepening ----

const WINDOWS: number[][] = [];
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dc, dr] of DIRS) {
  const er = r + dr * 3, ec = c + dc * 3;
  if (er < 0 || er >= ROWS || ec < 0 || ec >= COLS) continue;
  WINDOWS.push([0, 1, 2, 3].map(k => (r + dr * k) * COLS + c + dc * k));
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
const W = [0, 1, 6, 40, 0], WIN = 1e6;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/**
 * Window score from Red's side: open lines of 2 and 3 count, centre discs get a bonus.
 * A threat (three plus an empty cell) is worth more on the row its owner can expect to
 * get: odd rows from the bottom for Red, even rows for Gold. This "odd-even" rule decides
 * most endgames, where players are forced to fill columns under each other's threats.
 */
function evaluate(b: Int8Array): number {
  let s = 0;
  for (const w of WINDOWS) {
    let a = 0, d = 0, gap = -1;
    for (const i of w) { if (b[i] === 1) a++; else if (b[i] === 2) d++; else gap = i; }
    if (a && !d) {
      s += W[a];
      if (a === 3 && Math.floor(gap / COLS) % 2 === 1) s += 60;
    } else if (d && !a) {
      s -= W[d];
      if (d === 3 && Math.floor(gap / COLS) % 2 === 0) s -= 60;
    }
  }
  for (let r = 0; r < ROWS; r++) { const v = b[r * COLS + 3]; if (v === 1) s += 3; else if (v === 2) s -= 3; }
  return s;
}

export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 1, ms: 0 }, { name: 'Easy', rating: 900, depth: 2, ms: 0 },
  { name: 'Intermediate', rating: 1150, depth: 5, ms: 400 }, { name: 'Advanced', rating: 1400, depth: 7, ms: 900 },
  { name: 'Expert', rating: 1650, depth: 13, ms: 1600 },
];

/** opts.depth fixes the search depth with no clock, so tests give the same result on any machine. */
export function chooseMove(st: C4State, level: number, opts: { rng?: () => number; timeScale?: number; depth?: number } = {}): number {
  const rng = opts.rng ?? Math.random, P = opts.depth ? { ...LEVELS[level], depth: opts.depth, ms: 0 } : LEVELS[level];
  const b = Int8Array.from(st.cells), h = st.heights.slice(), color = st.turn;
  let filled = st.moves.length, nodes = 0, aborted = false;
  const deadline = P.ms ? now() + P.ms * (opts.timeScale ?? 1) : Infinity;
  const put = (c: number, v: number) => { const i = (ROWS - 1 - h[c]) * COLS + c; b[i] = v; h[c]++; filled++; return i; };
  const take = (c: number) => { h[c]--; b[(ROWS - 1 - h[c]) * COLS + c] = 0; filled--; };

  const negamax = (depth: number, alpha: number, beta: number, who: number, ply: number): number => {
    if ((++nodes & 2047) === 0 && now() > deadline) aborted = true;
    if (aborted) return 0;
    let best = -Infinity;
    for (const c of ORDER) {
      if (h[c] >= ROWS) continue;
      const i = put(c, who);
      const s = lineAt(b, i) ? WIN - ply : filled === COLS * ROWS ? 0
        : depth <= 1 ? (who === 1 ? evaluate(b) : -evaluate(b)) : -negamax(depth - 1, -beta, -alpha, 3 - who, ply + 1);
      take(c);
      if (s > best) best = s;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best === -Infinity ? 0 : best;
  };

  const legal = ORDER.filter(c => h[c] < ROWS);
  // Beginner: wins when it can, otherwise drifts toward the centre. It does not defend.
  if (level === 0) {
    for (const c of legal) { const i = put(c, color); const w = lineAt(b, i); take(c); if (w) return c; }
    const weights = legal.map(c => 4 - Math.abs(3 - c));
    let x = rng() * weights.reduce((a, v) => a + v, 0);
    for (let k = 0; k < legal.length; k++) { x -= weights[k]; if (x <= 0) return legal[k]; }
    return legal[0];
  }
  // Variety: columns at the same distance from the centre start in random order. The search
  // itself stays exact; random noise on scores would let refuted moves through alpha-beta.
  let order = legal.slice().sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b) || rng() - 0.5), best = order[0];
  const start = P.ms ? 1 : P.depth;
  // Odd depths only: every horizon ends on this side's move, so iterations compare like with like.
  for (let d = start; d <= P.depth; d += P.ms ? 2 : 1) {
    let alpha = -Infinity, bestD = order[0], bestS = -Infinity;
    for (const c of order) {
      const i = put(c, color);
      const s = (lineAt(b, i) ? WIN : filled === COLS * ROWS ? 0
        : d <= 1 ? (color === 1 ? evaluate(b) : -evaluate(b)) : -negamax(d - 1, -Infinity, -alpha, 3 - color, 1));
      take(c);
      if (aborted) break;
      if (s > bestS) { bestS = s; bestD = c; }
      if (s > alpha) alpha = s;
    }
    if (aborted) break;
    best = bestD;
    order = [best, ...order.filter(c => c !== best)];
    if (Math.abs(bestS) > WIN / 2) break;
  }
  return best;
}

export const connectFourRules: GameModule<C4State, number> = {
  id: 'connect-four', initializeGame: newGame, validateMove: isLegal, applyMove: play,
  undoMove: st => replay(st.moves.slice(0, -1)),
  getLegalMoves: st => [...Array(COLS).keys()].filter(c => isLegal(st, c)),
  checkGameOver: st => st.winner !== 0 || st.draw,
  calculateResult: st => (st.winner ? { winner: st.winner - 1, draw: false } : st.draw ? { winner: null, draw: true } : null),
  serializeState: st => JSON.stringify(st.moves), deserializeState: raw => replay(JSON.parse(raw)),
};
