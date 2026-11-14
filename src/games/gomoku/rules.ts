/**
 * Gomoku on a 15×15 board. Cells: 0 empty, 1 black, 2 white. Black moves first.
 *
 * Three rule sets, kept strictly apart:
 *  - freestyle: five or more in a row wins, for both colours.
 *  - standard:  exactly five wins; six or more (an overline) does not.
 *  - renju:     Black wins with exactly five and may not play an overline, a double-four
 *               or a double-three. White has no restrictions and wins with five or more.
 */
import type { GameModule } from '../../core/game';

export const N = 15;
export type Mode = 'freestyle' | 'standard' | 'renju';
export type Board = { [i: number]: number; readonly length: number };
export interface GomokuState {
  mode: Mode; cells: number[]; moves: number[]; turn: 1 | 2;
  winner: 0 | 1 | 2; draw: boolean; line: number[];
}

export const DIRS: readonly (readonly [number, number])[] = [[1, 0], [0, 1], [1, 1], [1, -1]];
const at = (b: Board, x: number, y: number) => (x < 0 || y < 0 || x >= N || y >= N ? 3 : b[y * N + x]);

/** How far the run of `color` through (x,y) extends backwards and forwards along a direction. */
function extent(b: Board, x: number, y: number, dx: number, dy: number, color: number): [number, number] {
  let back = 0, fwd = 0;
  while (at(b, x - dx * (back + 1), y - dy * (back + 1)) === color) back++;
  while (at(b, x + dx * (fwd + 1), y + dy * (fwd + 1)) === color) fwd++;
  return [back, fwd];
}

const winsWith = (len: number, color: number, mode: Mode) =>
  mode === 'freestyle' ? len >= 5 : mode === 'standard' ? len === 5 : color === 1 ? len === 5 : len >= 5;

/** The winning line through an occupied point, or null. */
export function winLine(b: Board, idx: number, mode: Mode): number[] | null {
  const color = b[idx], x = idx % N, y = Math.floor(idx / N);
  for (const [dx, dy] of DIRS) {
    const [back, fwd] = extent(b, x, y, dx, dy, color);
    if (winsWith(back + fwd + 1, color, mode)) {
      const out: number[] = [];
      for (let k = -back; k <= fwd; k++) out.push((y + dy * k) * N + x + dx * k);
      return out;
    }
  }
  return null;
}
export function isWinAt(b: Board, idx: number, mode: Mode): boolean {
  const color = b[idx], x = idx % N, y = Math.floor(idx / N);
  for (const [dx, dy] of DIRS) {
    const [back, fwd] = extent(b, x, y, dx, dy, color);
    if (winsWith(back + fwd + 1, color, mode)) return true;
  }
  return false;
}

/**
 * Renju: is this empty point forbidden for Black?
 *
 * A move that makes exactly five is always allowed. Otherwise it is forbidden if it makes
 *  - an overline (six or more in a row),
 *  - two or more fours (a four = one more black stone would make exactly five), or
 *  - two or more open threes (a three that can become a straight four — four in a row
 *    with both ends free to make five — by a move that is not itself forbidden).
 * The board is modified while checking and restored before returning.
 */
export function isForbidden(b: Board, idx: number, depth = 0): boolean {
  if (b[idx] !== 0) return false;
  const x = idx % N, y = Math.floor(idx / N);
  b[idx] = 1;
  try {
    let overline = false;
    for (const [dx, dy] of DIRS) {
      const [back, fwd] = extent(b, x, y, dx, dy, 1), len = back + fwd + 1;
      if (len === 5) return false;
      if (len > 5) overline = true;
    }
    if (overline) return true;

    let fours = 0, threes = 0;
    for (const [dx, dy] of DIRS) {
      // Points on this line that would complete exactly five through the new stone.
      const completes: number[] = [];
      for (let k = -4; k <= 4; k++) {
        if (!k) continue;
        const qx = x + dx * k, qy = y + dy * k;
        if (at(b, qx, qy) !== 0) continue;
        const q = qy * N + qx;
        b[q] = 1;
        const [back, fwd] = extent(b, qx, qy, dx, dy, 1);
        b[q] = 0;
        if (back + fwd + 1 === 5 && -k >= -back && -k <= fwd) completes.push(k);
      }
      if (completes.length === 1) { fours++; continue; }
      if (completes.length >= 2) {
        // Two completion points five apart are the two ends of one straight four.
        fours += completes.length === 2 && Math.abs(completes[0] - completes[1]) === 5 ? 1 : 2;
        continue;
      }
      for (let k = -3; k <= 3; k++) {
        if (!k) continue;
        const qx = x + dx * k, qy = y + dy * k;
        if (at(b, qx, qy) !== 0) continue;
        const q = qy * N + qx;
        b[q] = 1;
        const [back, fwd] = extent(b, qx, qy, dx, dy, 1);
        const straight = back + fwd + 1 === 4 && -k >= -back && -k <= fwd
          && at(b, qx - dx * (back + 1), qy - dy * (back + 1)) === 0
          && at(b, qx + dx * (fwd + 1), qy + dy * (fwd + 1)) === 0
          && at(b, qx - dx * (back + 2), qy - dy * (back + 2)) !== 1
          && at(b, qx + dx * (fwd + 2), qy + dy * (fwd + 2)) !== 1;
        b[q] = 0;
        if (straight && (depth >= 2 || !isForbidden(b, q, depth + 1))) { threes++; break; }
      }
    }
    return fours >= 2 || threes >= 2;
  } finally {
    b[idx] = 0;
  }
}

export function newGame(mode: Mode): GomokuState {
  return { mode, cells: new Array<number>(N * N).fill(0), moves: [], turn: 1, winner: 0, draw: false, line: [] };
}
export function isLegal(st: GomokuState, idx: number): boolean {
  if (st.winner || st.draw || !Number.isInteger(idx) || idx < 0 || idx >= N * N || st.cells[idx] !== 0) return false;
  return !(st.mode === 'renju' && st.turn === 1 && isForbidden(st.cells.slice(), idx));
}
export function play(st: GomokuState, idx: number): GomokuState {
  if (!isLegal(st, idx)) return st;
  const cells = st.cells.slice();
  cells[idx] = st.turn;
  const moves = [...st.moves, idx], line = winLine(cells, idx, st.mode);
  return { mode: st.mode, cells, moves, turn: st.turn === 1 ? 2 : 1, winner: line ? st.turn : 0,
    draw: !line && moves.length === N * N, line: line ?? [] };
}
export function replay(mode: Mode, moves: number[]): GomokuState {
  let st = newGame(mode);
  for (const m of moves) st = play(st, m);
  return st;
}
export const coord = (idx: number) => 'ABCDEFGHIJKLMNO'[idx % N] + (N - Math.floor(idx / N));

export const gomokuRules: GameModule<GomokuState, number, { mode: Mode }> = {
  id: 'gomoku',
  initializeGame: c => newGame(c.mode),
  validateMove: isLegal,
  applyMove: play,
  undoMove: st => replay(st.mode, st.moves.slice(0, -1)),
  getLegalMoves: st => st.cells.map((_, i) => i).filter(i => isLegal(st, i)),
  checkGameOver: st => st.winner !== 0 || st.draw,
  calculateResult: st => (st.winner ? { winner: st.winner - 1, draw: false, detail: 'five in a row' }
    : st.draw ? { winner: null, draw: true, detail: 'board full' } : null),
  serializeState: st => JSON.stringify({ mode: st.mode, moves: st.moves }),
  deserializeState: raw => { const d = JSON.parse(raw) as { mode: Mode; moves: number[] }; return replay(d.mode, d.moves); },
};
