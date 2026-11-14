/** Tic-Tac-Toe on a 3×3 grid. Cells 0 empty, 1 X (moves first), 2 O. */
import type { GameModule } from '../../core/game';
import type { Level } from '../../core/match';

export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export interface TState { cells: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; line: number[] }

export const newGame = (): TState => ({ cells: new Array(9).fill(0), moves: [], turn: 1, winner: 0, draw: false, line: [] });
export const lineAt = (c: number[], i: number) => LINES.find(l => l.includes(i) && l.every(k => c[k] === c[i])) ?? null;
export const isLegal = (st: TState, i: number) => !st.winner && !st.draw && Number.isInteger(i) && i >= 0 && i < 9 && st.cells[i] === 0;
export function play(st: TState, i: number): TState {
  if (!isLegal(st, i)) return st;
  const cells = st.cells.slice(); cells[i] = st.turn;
  const moves = [...st.moves, i], line = lineAt(cells, i);
  return { cells, moves, turn: st.turn === 1 ? 2 : 1, winner: line ? st.turn : 0, draw: !line && moves.length === 9, line: line ?? [] };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());

/**
 * AI. Levels differ in how far ahead they look: Beginner only spots its own win,
 * Easy also blocks, Intermediate searches 3 plies (misses forks), Advanced 5, Expert
 * searches the whole tree and never loses.
 */
export const LEVELS: (Level & { depth: number })[] = [
  { name: 'Beginner', rating: 600, depth: 1 }, { name: 'Easy', rating: 800, depth: 2 },
  { name: 'Intermediate', rating: 1000, depth: 3 }, { name: 'Advanced', rating: 1200, depth: 5 },
  { name: 'Expert', rating: 1400, depth: 9 },
];
function negamax(c: number[], turn: number, depth: number, ply: number): number {
  let best = -Infinity, any = false;
  for (let i = 0; i < 9; i++) {
    if (c[i]) continue;
    any = true; c[i] = turn;
    const s = lineAt(c, i) ? 10 - ply : depth > 1 && c.includes(0) ? -negamax(c, 3 - turn, depth - 1, ply + 1) : 0;
    c[i] = 0;
    if (s > best) best = s;
  }
  return any ? best : 0;
}
export function chooseMove(st: TState, level: number, rng: () => number = Math.random): number {
  const c = st.cells.slice(), depth = LEVELS[level].depth;
  let best = -Infinity, picks: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (c[i]) continue;
    c[i] = st.turn;
    const s = lineAt(c, i) ? 10 : depth > 1 && c.includes(0) ? -negamax(c, 3 - st.turn, depth - 1, 1) : 0;
    c[i] = 0;
    if (s > best) { best = s; picks = [i]; } else if (s === best) picks.push(i);
  }
  return picks[Math.floor(rng() * picks.length)];
}

export const tictactoeRules: GameModule<TState, number> = {
  id: 'tictactoe', initializeGame: newGame, validateMove: isLegal, applyMove: play,
  undoMove: st => replay(st.moves.slice(0, -1)),
  getLegalMoves: st => st.cells.map((_, i) => i).filter(i => isLegal(st, i)),
  checkGameOver: st => st.winner !== 0 || st.draw,
  calculateResult: st => (st.winner ? { winner: st.winner - 1, draw: false } : st.draw ? { winner: null, draw: true } : null),
  serializeState: st => JSON.stringify(st.moves), deserializeState: raw => replay(JSON.parse(raw)),
};
