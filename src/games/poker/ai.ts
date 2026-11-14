/** Computer poker players: Monte Carlo equity against random hands, weighed against pot odds. */
import { newDeck, type Card } from '../cards/deck';
import { evaluate } from './eval';
import { legalActions, pot, type Action, type PState } from './rules';
import type { Rng } from '../../core/rng';

export function equity(hole: Card[], board: Card[], opponents: number, iters: number, rng: Rng = Math.random): number {
  const known = new Set([...hole, ...board]);
  const rest = newDeck(rng).filter(c => !known.has(c));
  let win = 0;
  for (let it = 0; it < iters; it++) {
    // Partial shuffle of what we need.
    const need = 5 - board.length + opponents * 2;
    for (let k = 0; k < need; k++) { const j = k + Math.floor(rng() * (rest.length - k)); [rest[k], rest[j]] = [rest[j], rest[k]]; }
    const b = [...board, ...rest.slice(0, 5 - board.length)];
    const me = evaluate([...hole, ...b]);
    let best = 0, ties = 0, beaten = false;
    for (let o = 0; o < opponents; o++) {
      const v = evaluate([rest[5 - board.length + o * 2], rest[6 - board.length + o * 2], ...b]);
      if (v > me) { beaten = true; break; }
      if (v === me) ties++;
      best = Math.max(best, v);
    }
    if (!beaten) win += 1 / (ties + 1);
  }
  return win / iters;
}
const ITERS = [50, 90, 150, 220, 300];
const NOISE = [0.16, 0.1, 0.06, 0.035, 0.015];
const BLUFF = [0.02, 0.05, 0.08, 0.1, 0.12];
/** Loose players call with too little; tight ones fold more. */
const CALL_SLACK = [0.12, 0.06, 0.02, 0, -0.01];

export function decide(s: PState, i: number, level: number, rng: Rng = Math.random): Action {
  const x = s.seats[i], L = legalActions(s, i);
  const opp = s.seats.filter((o, k) => k !== i && !o.out && !o.folded).length;
  let eq = equity(x.cards, s.board, Math.max(1, opp), ITERS[level], rng);
  eq = Math.max(0, Math.min(1, eq + (rng() - 0.5) * 2 * NOISE[level]));
  const p = pot(s), odds = L.toCall / (p + L.toCall || 1), fair = 1 / (opp + 1), rel = eq / fair;
  const raiseTo = (frac: number) => ({ kind: 'raise' as const, to: Math.min(L.maxTo, Math.max(L.minTo, s.currentBet + Math.round((p * frac) / s.bb) * s.bb)) });
  if (L.canRaise && rel > 2.1 && eq > 0.55) return raiseTo(rel > 2.8 ? 1 : 0.7);
  if (L.canRaise && rel > 1.5 && rng() < 0.45) return raiseTo(0.5);
  if (L.canCheck) return L.canRaise && rng() < BLUFF[level] ? raiseTo(0.5) : { kind: 'check' };
  if (eq + CALL_SLACK[level] >= odds) return { kind: 'call' };
  // A short stack facing a small bet calls more readily.
  if (L.toCall <= s.bb && rel > 0.8) return { kind: 'call' };
  return { kind: 'fold' };
}
