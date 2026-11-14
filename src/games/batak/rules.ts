/**
 * İhaleli Batak for four players, each for themselves. 13 cards each; players bid how many
 * tricks they will take (at least 5). The highest bidder names trump and leads. You must follow
 * suit and beat the best card if you can; out of the suit you must trump (over-trump if you
 * can). Trump may not be led until someone has trumped. Making the bid scores the tricks
 * taken; falling short costs the bid. Everyone else scores their tricks.
 */
import { A, K, Q, newDeck, rankOf, suitOf, type Card } from '../cards/deck';
import { chooseCard, handsDone, legal, playCard, startTricks, type Rules, type TrickState } from '../cards/trick';
import type { Rng } from '../../core/rng';

export const MIN_BID = 5;
export interface BHand {
  dealer: number; phase: 'bid' | 'trump' | 'play' | 'done';
  bids: (number | 'pass' | null)[]; bidTurn: number; high: { seat: number; bid: number } | null;
  trump: number | null; st: TrickState; forced: boolean;
}
export function dealHand(dealer: number, rng: Rng): BHand {
  const d = newDeck(rng), hands = [0, 1, 2, 3].map(i => d.slice(i * 13, i * 13 + 13));
  return { dealer, phase: 'bid', bids: [null, null, null, null], bidTurn: (dealer + 1) % 4, high: null, trump: null, st: startTricks(hands, (dealer + 1) % 4), forced: false };
}
export const rules = (h: BHand): Rules => ({ trump: h.trump, overtake: true, mustTrump: true, locked: h.trump });
/** Place a bid (a number) or pass. Bidding ends when everyone but the highest bidder has passed. */
export function bid(h: BHand, seat: number, b: number | 'pass'): BHand {
  if (h.phase !== 'bid' || seat !== h.bidTurn || h.bids[seat] === 'pass') return h;
  const min = h.high ? h.high.bid + 1 : MIN_BID;
  if (b !== 'pass' && (b < min || b > 13)) return h;
  const bids = h.bids.slice(); bids[seat] = b;
  const high = b === 'pass' ? h.high : { seat, bid: b };
  const active = [0, 1, 2, 3].filter(s => bids[s] !== 'pass');
  // Nobody bid at all: the dealer must play at four.
  if (!active.length) return toTrump({ ...h, bids, high: { seat: h.dealer, bid: 4 }, forced: true });
  // Everyone else has passed: the highest bidder takes it.
  if (high && active.length === 1) return toTrump({ ...h, bids, high });
  let next = (seat + 1) % 4; while (bids[next] === 'pass') next = (next + 1) % 4;
  return { ...h, bids, high, bidTurn: next };
}
const toTrump = (h: BHand): BHand => ({ ...h, phase: 'trump', bidTurn: h.high!.seat });
export function chooseTrump(h: BHand, seat: number, suit: number): BHand {
  if (h.phase !== 'trump' || seat !== h.high!.seat) return h;
  return { ...h, phase: 'play', trump: suit, st: { ...h.st, turn: seat, leader: seat } };
}
export function play(h: BHand, seat: number, c: Card): BHand {
  if (h.phase !== 'play') return h;
  const st = playCard(h.st, seat, c, rules(h));
  if (st === h.st) return h;
  return { ...h, st, phase: handsDone(st) ? 'done' : 'play' };
}
export const playable = (h: BHand, seat: number) => (h.phase === 'play' && h.st.turn === seat ? legal(h.st, seat, rules(h)) : []);
/** Points for each seat once the hand is over. */
export function score(h: BHand): number[] {
  return [0, 1, 2, 3].map(s => (h.high && s === h.high.seat ? (h.st.tricks[s] >= h.high.bid ? h.st.tricks[s] : -h.high.bid) : h.st.tricks[s]));
}

// ---- Computer ----
/** Rough count of tricks a hand should take with `trump` as trump. */
export function estimate(hand: Card[], trump: number): number {
  let n = 0;
  for (let s = 0; s < 4; s++) {
    const cs = hand.filter(c => suitOf(c) === s), len = cs.length, has = (r: number) => cs.some(c => rankOf(c) === r);
    if (has(A)) n += 1;
    if (has(K)) n += len >= 2 ? 0.8 : 0.25;
    if (has(Q)) n += len >= 3 ? 0.45 : 0.1;
    if (s === trump) n += Math.max(0, len - 3) * 0.9 + cs.filter(c => rankOf(c) < Q).length * 0.12;
    else if (len <= 1 && hand.filter(c => suitOf(c) === trump).length >= 3) n += len === 0 ? 0.9 : 0.5;
  }
  return n;
}
export const bestTrump = (hand: Card[]) => [0, 1, 2, 3].reduce((b, s) => (estimate(hand, s) > estimate(hand, b) ? s : b), 0);
export function aiBid(h: BHand, seat: number, skill: number, rng: Rng = Math.random): number | 'pass' {
  const hand = h.st.hands[seat], est = estimate(hand, bestTrump(hand)) + (rng() - 0.5) * [1.6, 1.1, 0.7, 0.4, 0.2][skill] - (skill >= 3 ? 0.2 : 0);
  const min = h.high ? h.high.bid + 1 : MIN_BID;
  return Math.floor(est) >= min ? min : 'pass';
}
export const aiPlay = (h: BHand, seat: number, skill: number, rng: Rng = Math.random) => chooseCard(h.st, seat, rules(h), 'win', skill, undefined, rng);
