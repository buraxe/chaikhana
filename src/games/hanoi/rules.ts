/** Tower of Hanoi. Pegs hold disk sizes bottom to top; move every disk to the right-hand peg. */
import type { GameModule } from '../../core/game';

export interface HState { n: number; pegs: number[][]; moves: number }
export type HMove = [from: number, to: number];
export const TARGET = 2;

export const newGame = (n: number): HState => ({ n, pegs: [Array.from({ length: n }, (_, k) => n - k), [], []], moves: 0 });
const top = (p: number[]) => p[p.length - 1];
export const canMove = (st: HState, [f, t]: HMove) => f !== t && f >= 0 && f < 3 && t >= 0 && t < 3
  && st.pegs[f].length > 0 && (st.pegs[t].length === 0 || top(st.pegs[t]) > top(st.pegs[f]));
export function move(st: HState, m: HMove): HState {
  if (!canMove(st, m)) return st;
  const pegs = st.pegs.map(p => p.slice());
  pegs[m[1]].push(pegs[m[0]].pop()!);
  return { n: st.n, pegs, moves: st.moves + 1 };
}
export const solved = (st: HState) => st.pegs[TARGET].length === st.n;
export const minimum = (n: number) => 2 ** n - 1;

/**
 * The next move on a shortest path to the goal, from any legal position.
 * To put disk k on peg T: if it is already there, solve for k-1; otherwise first move
 * disks 1..k-1 to the third peg, then move k.
 */
export function nextMove(st: HState): HMove | null {
  const pos: number[] = [];
  st.pegs.forEach((p, i) => p.forEach(d => { pos[d] = i; }));
  const rec = (k: number, target: number): HMove | null => {
    if (k === 0) return null;
    if (pos[k] === target) return rec(k - 1, target);
    return rec(k - 1, 3 - pos[k] - target) ?? [pos[k], target];
  };
  return rec(st.n, TARGET);
}

export const hanoiRules: GameModule<HState, HMove, number> = {
  id: 'hanoi', initializeGame: newGame, validateMove: canMove, applyMove: move,
  getLegalMoves: st => ([[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]] as HMove[]).filter(m => canMove(st, m)),
  checkGameOver: solved, calculateResult: st => (solved(st) ? { winner: 0, draw: false } : null),
  serializeState: st => JSON.stringify(st), deserializeState: raw => JSON.parse(raw) as HState,
};
