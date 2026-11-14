/**
 * Nim: rows of matches; take any number from one row. Whoever takes the last match wins.
 * A move is encoded as row * 16 + count.
 */
import type { Level } from '../../core/match';

export const START = [1, 3, 5, 7];
export interface NState { heaps: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
export const newGame = (): NState => ({ heaps: START.slice(), moves: [], turn: 1, winner: 0, draw: false });
export const encode = (row: number, count: number) => row * 16 + count;
export function legal(st: NState): number[] {
  if (st.winner) return [];
  const out: number[] = [];
  st.heaps.forEach((h, r) => { for (let k = 1; k <= h; k++) out.push(encode(r, k)); });
  return out;
}
export function play(st: NState, m: number): NState {
  const r = m >> 4, k = m & 15;
  if (st.winner || r >= st.heaps.length || k < 1 || k > st.heaps[r]) return st;
  const heaps = st.heaps.slice(); heaps[r] -= k;
  const done = heaps.every(h => !h);
  return { heaps, moves: [...st.moves, m], turn: st.turn === 1 ? 2 : 1, winner: done ? st.turn : 0, draw: false };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());
export const nimSum = (heaps: number[]) => heaps.reduce((a, b) => a ^ b, 0);
/** The move that leaves a nim-sum of zero, if there is one. */
export function perfect(heaps: number[]): number | null {
  const x = nimSum(heaps); if (!x) return null;
  for (let r = 0; r < heaps.length; r++) { const t = heaps[r] ^ x; if (t < heaps[r]) return encode(r, heaps[r] - t); }
  return null;
}
export const LEVELS: (Level & { sharp: number })[] = [
  { name: 'Beginner', rating: 700, sharp: 0 }, { name: 'Easy', rating: 900, sharp: 0.35 },
  { name: 'Intermediate', rating: 1150, sharp: 0.6 }, { name: 'Advanced', rating: 1400, sharp: 0.85 },
  { name: 'Expert', rating: 1650, sharp: 1 },
];
export function chooseMove(st: NState, level: number, rng: () => number = Math.random): number {
  const best = perfect(st.heaps), moves = legal(st);
  // The endgame is easy to see: anyone above a beginner takes the last row whole.
  if (level > 0 && st.heaps.filter(h => h).length === 1) return encode(st.heaps.findIndex(h => h), st.heaps.find(h => h)!);
  if (best !== null && rng() < LEVELS[level].sharp) return best;
  // Otherwise take a little from a big row, which keeps the game going.
  const small = moves.filter(m => (m & 15) <= 2);
  const pool = small.length ? small : moves;
  return pool[Math.floor(rng() * pool.length)];
}
