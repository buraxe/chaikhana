import type { Level } from '../../core/match';

/**
 * Mangala, Turkish rules. Pits 0–5 belong to player 1 (left to right from their side) and
 * 6 is their treasure; pits 7–12 belong to player 2 and 13 is theirs. Stones travel
 * counter-clockwise (rising index), skipping the opponent's treasure.
 */
export interface MState { pits: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; last: number; captured: number[] }
export const STORE = [0, 6, 13] as const;
export const pitsOf = (p: 1 | 2) => (p === 1 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12]);
export const newGame = (): MState => ({ pits: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], moves: [], turn: 1, winner: 0, draw: false, last: -1, captured: [] });
export const isLegal = (st: MState, m: number) => !st.winner && !st.draw && Number.isInteger(m) && m >= 0 && m < 6 && st.pits[pitsOf(st.turn)[m]] > 0;
export const legal = (st: MState) => [0, 1, 2, 3, 4, 5].filter(m => isLegal(st, m));
const sideSum = (pits: number[], p: 1 | 2) => pitsOf(p).reduce((a, i) => a + pits[i], 0);

export function play(st: MState, m: number): MState {
  if (!isLegal(st, m)) return st;
  const pits = st.pits.slice(), me = st.turn, opp: 1 | 2 = me === 1 ? 2 : 1;
  const from = pitsOf(me)[m], skip = STORE[opp];
  let n = pits[from], i = from;
  pits[from] = 0;
  // The first stone goes back into the pit it came from, unless the pit held only one.
  if (n === 1) { i = (i + 1) % 14; if (i === skip) i = (i + 1) % 14; pits[i]++; n = 0; }
  else { pits[i]++; n--; }
  while (n > 0) { i = (i + 1) % 14; if (i === skip) continue; pits[i]++; n--; }
  const captured: number[] = [];
  let again = i === STORE[me];
  if (!again) {
    if (pitsOf(opp).includes(i) && pits[i] % 2 === 0) { pits[STORE[me]] += pits[i]; pits[i] = 0; captured.push(i); }
    else if (pitsOf(me).includes(i) && pits[i] === 1) {
      const across = 12 - i;
      if (pits[across] > 0) { pits[STORE[me]] += pits[across] + 1; pits[i] = 0; pits[across] = 0; captured.push(i, across); }
    }
  }
  const next: MState = { pits, moves: [...st.moves, m], turn: me, winner: 0, draw: false, last: i, captured };
  // The game ends when a side is empty; the player who emptied their own side takes the rest.
  if (sideSum(pits, me) === 0 || sideSum(pits, opp) === 0) {
    const taker = sideSum(pits, me) === 0 ? me : opp, other = taker === 1 ? 2 : 1;
    for (const k of pitsOf(other)) { pits[STORE[taker]] += pits[k]; pits[k] = 0; }
    if (pits[6] === pits[13]) next.draw = true; else next.winner = pits[6] > pits[13] ? 1 : 2;
    again = false;
  }
  next.turn = again ? me : opp;
  return next;
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());

export const LEVELS: (Level & { depth: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0 }, { name: 'Easy', rating: 900, depth: 1 },
  { name: 'Intermediate', rating: 1150, depth: 3 }, { name: 'Advanced', rating: 1400, depth: 5 },
  { name: 'Expert', rating: 1650, depth: 8 },
];
function evaluate(st: MState, p: 1 | 2): number {
  if (st.winner) return st.winner === p ? 1000 : -1000;
  if (st.draw) return 0;
  const o = p === 1 ? 2 : 1;
  return (st.pits[STORE[p]] - st.pits[STORE[o]]) * 4 + (sideSum(st.pits, p) - sideSum(st.pits, o));
}
function search(st: MState, depth: number, a: number, b: number, p: 1 | 2): number {
  if (depth === 0 || st.winner || st.draw) return evaluate(st, p);
  const maxing = st.turn === p;
  let best = maxing ? -Infinity : Infinity;
  for (const m of legal(st)) {
    const n = play(st, m);
    // An extra turn does not use up depth.
    const v = search(n, n.turn === st.turn && depth > 1 ? depth : depth - 1, a, b, p);
    if (maxing) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); b = Math.min(b, v); }
    if (b <= a) break;
  }
  return best;
}
export function chooseMove(st: MState, level: number, rng: () => number = Math.random): number {
  const moves = legal(st), L = LEVELS[level];
  if (moves.length <= 1 || L.depth === 0) return moves[Math.floor(rng() * moves.length)];
  let best = moves[0], bestV = -Infinity;
  for (const m of moves.sort(() => rng() - 0.5)) {
    const n = play(st, m), v = search(n, L.depth - 1, -Infinity, Infinity, st.turn);
    if (v > bestV) { bestV = v; best = m; }
  }
  return best;
}
