/**
 * Rock paper scissors as a turn game: player 1 picks, then player 2, then the round is shown.
 * A move is the choice: 0 rock, 1 paper, 2 scissors. First to three round wins takes the
 * match; tied rounds do not count. The computer only ever looks at finished rounds, never
 * at a pick that is still hidden.
 */
import type { Level } from '../../core/match';

export const TARGET = 3;
export type Pick = 0 | 1 | 2;
export interface RState { moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; rounds: [Pick, Pick][]; score: [number, number]; pending: Pick | null }

export const beats = (a: Pick, b: Pick) => (a - b + 3) % 3 === 1;
export const counter = (p: Pick): Pick => ((p + 1) % 3) as Pick;
export const newGame = (): RState => ({ moves: [], turn: 1, winner: 0, draw: false, rounds: [], score: [0, 0], pending: null });
export const legal = (st: RState): number[] => (st.winner ? [] : [0, 1, 2]);

export function play(st: RState, m: number): RState {
  if (st.winner || m < 0 || m > 2) return st;
  const p = m as Pick, moves = [...st.moves, m];
  if (st.pending === null) return { ...st, moves, pending: p, turn: 2 };
  const round: [Pick, Pick] = [st.pending, p];
  const score: [number, number] = [st.score[0] + (beats(round[0], round[1]) ? 1 : 0), st.score[1] + (beats(round[1], round[0]) ? 1 : 0)];
  const winner = score[0] >= TARGET ? 1 : score[1] >= TARGET ? 2 : 0;
  return { moves, turn: 1, winner, draw: false, rounds: [...st.rounds, round], score, pending: null };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());

/** What one side has shown, oldest first, from finished rounds only. */
const shown = (st: RState, side: 1 | 2) => st.rounds.map(r => r[side - 1]);

/** Predict the opponent's next pick from their history; null when there is nothing to go on. */
export function predict(hist: Pick[], mine: Pick[], order: 0 | 1 | 2, rng: () => number = Math.random): Pick | null {
  if (!hist.length) return null;
  const n: number[] = [0, 0, 0];
  if (order === 0) hist.forEach(p => n[p]++);
  else {
    // Find earlier moments that look like now (their last `order` picks and my last pick) and see what followed.
    const ctx = (i: number) => hist.slice(i - order, i).join() + '|' + (mine[i - 1] ?? '');
    const now = ctx(hist.length);
    for (let i = order; i < hist.length; i++) if (ctx(i) === now) n[hist[i]] += 1 + i / hist.length;
    if (!n.some(Boolean)) return null;
  }
  const top = Math.max(...n), best = [0, 1, 2].filter(k => n[k] === top);
  return best[Math.floor(rng() * best.length)] as Pick;
}

export const LEVELS: (Level & { orders: (0 | 1 | 2)[]; trust: number })[] = [
  { name: 'Beginner', rating: 700, orders: [], trust: 0 },
  { name: 'Easy', rating: 850, orders: [0], trust: 0.35 },
  { name: 'Intermediate', rating: 1000, orders: [0, 1], trust: 0.6 },
  { name: 'Advanced', rating: 1150, orders: [0, 1, 2], trust: 0.75 },
  { name: 'Expert', rating: 1300, orders: [0, 1, 2], trust: 0.85 },
];

/**
 * The computer keeps several predictors (how often you play each sign; what you play after
 * the same last pick; after the same last two) and trusts whichever would have done best in
 * the recent rounds. Even the best player keeps some randomness so it cannot be read back.
 */
export function chooseMove(st: RState, level: number, rng: () => number = Math.random): number {
  const me = st.turn, them = (3 - me) as 1 | 2, L = LEVELS[level];
  const hist = shown(st, them) as Pick[], mine = shown(st, me) as Pick[];
  if (!L.orders.length || rng() > L.trust) return Math.floor(rng() * 3);
  // Score each predictor on the last few rounds it could have played.
  let best: Pick | null = null, bestScore = -Infinity;
  for (const o of L.orders) {
    let s = 0;
    for (let i = Math.max(1, hist.length - 8); i < hist.length; i++) {
      const g = predict(hist.slice(0, i), mine.slice(0, i), o, rng);
      if (g !== null) s += g === hist[i] ? 1 : beats(hist[i], counter(g)) ? -1 : 0;
    }
    const g = predict(hist, mine, o, rng);
    if (g !== null && s > bestScore) { bestScore = s; best = g; }
  }
  // The expert also knows the habit of switching after a loss to what would have won.
  if (level === 4 && hist.length && bestScore <= 0) {
    const last = st.rounds[st.rounds.length - 1], theyLost = beats(last[me - 1], last[them - 1]);
    if (theyLost) best = counter(last[me - 1]);
  }
  return best === null ? Math.floor(rng() * 3) : counter(best);
}
