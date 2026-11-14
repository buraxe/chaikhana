/**
 * Pişti for two. Four cards go to the middle (the top one face up) and four to each player.
 * Play a card on the pile: the same rank, or any jack, takes the whole pile. Taking a pile of
 * exactly one card with the same rank is a pişti (10 points; a jack on a lone jack is 20).
 * When hands are empty, four more each until the deck runs out; the last player to take a
 * pile gets whatever is left. Points: aces and jacks 1, 2♣ 2, 10♦ 3, most cards 3.
 */
import { A, J, card, newDeck, rankOf, type Card } from '../cards/deck';
import type { Rng } from '../../core/rng';

export interface PDeal {
  deck: Card[]; hands: [Card[], Card[]]; table: Card[]; taken: [Card[], Card[]]; pisti: [number, number];
  turn: 0 | 1; last: -1 | 0 | 1; done: boolean; log: { seat: number; card: Card; took: number; pisti: number }[];
  /** cards seen face up by both players (for the computer's memory) */
  seen: Card[];
}
export function deal(first: 0 | 1, rng: Rng): PDeal {
  const d = newDeck(rng);
  const table = d.slice(0, 4), hands: [Card[], Card[]] = [d.slice(4, 8), d.slice(8, 12)];
  return { deck: d.slice(12), hands, table, taken: [[], []], pisti: [0, 0], turn: first, last: -1, done: false, log: [], seen: [table[3]] };
}
export function play(s: PDeal, seat: 0 | 1, c: Card): PDeal {
  if (s.done || seat !== s.turn || !s.hands[seat].includes(c)) return s;
  const hands = s.hands.map((h, i) => (i === seat ? h.filter(x => x !== c) : h)) as [Card[], Card[]];
  const top = s.table[s.table.length - 1];
  let table = [...s.table, c], taken = s.taken, pisti = s.pisti, last = s.last, took = 0, pp = 0;
  if (top !== undefined && (rankOf(c) === rankOf(top) || rankOf(c) === J)) {
    took = table.length;
    if (s.table.length === 1 && rankOf(c) === rankOf(top)) { pp = rankOf(c) === J ? 20 : 10; pisti = pisti.map((p, i) => (i === seat ? p + pp : p)) as [number, number]; }
    taken = taken.map((t, i) => (i === seat ? [...t, ...table] : t)) as [Card[], Card[]];
    table = []; last = seat;
  }
  let next: PDeal = { ...s, hands, table, taken, pisti, last, turn: (1 - seat) as 0 | 1, log: [...s.log, { seat, card: c, took, pisti: pp }], seen: [...s.seen, c] };
  if (!hands[0].length && !hands[1].length) {
    if (next.deck.length) next = { ...next, hands: [next.deck.slice(0, 4), next.deck.slice(4, 8)], deck: next.deck.slice(8) };
    else {
      // The last taker sweeps the rest.
      if (next.table.length && next.last >= 0) { const tk = next.taken.map((t, i) => (i === next.last ? [...t, ...next.table] : t)) as [Card[], Card[]]; next = { ...next, taken: tk, table: [] }; }
      next = { ...next, done: true };
    }
  }
  return next;
}
export const cardPoints = (c: Card) => (c === card(3, 0) ? 2 : c === card(2, 8) ? 3 : rankOf(c) === A || rankOf(c) === J ? 1 : 0);
export function score(s: PDeal): { total: [number, number]; cards: [number, number]; most: -1 | 0 | 1 } {
  const cards = [s.taken[0].length, s.taken[1].length] as [number, number];
  const most = cards[0] > cards[1] ? 0 : cards[1] > cards[0] ? 1 : -1;
  const total = [0, 1].map(i => s.taken[i].reduce((a, c) => a + cardPoints(c), 0) + s.pisti[i] + (most === i ? 3 : 0)) as [number, number];
  return { total, cards, most };
}

// ---- Computer ----
export function choose(s: PDeal, seat: 0 | 1, skill: number, rng: Rng = Math.random): Card {
  const hand = s.hands[seat], top = s.table[s.table.length - 1];
  if (hand.length === 1) return hand[0];
  if (rng() < [0.35, 0.2, 0.1, 0.04, 0.01][skill]) return hand[Math.floor(rng() * hand.length)];
  const value = (cs: Card[]) => cs.reduce((a, c) => a + cardPoints(c) + 0.15, 0);
  if (top !== undefined) {
    const same = hand.filter(c => rankOf(c) === rankOf(top));
    if (same.length) return same[0];
    const jacks = hand.filter(c => rankOf(c) === J);
    // A jack is worth using when the pile is rich or long; better players wait for a bigger pile.
    if (jacks.length && (value(s.table) >= [0.5, 1, 1.5, 1.8, 2][skill] || s.table.length >= [2, 3, 3, 4, 4][skill])) return jacks[0];
  }
  // Throw a card the opponent is least likely to match: its rank seen most, and of low value.
  const seenCount = (c: Card) => (skill >= 2 ? s.seen.filter(x => rankOf(x) === rankOf(c)).length + hand.filter(x => x !== c && rankOf(x) === rankOf(c)).length : 0);
  const plain = hand.filter(c => rankOf(c) !== J), pool = plain.length ? plain : hand;
  return pool.reduce((b, c) => {
    const sc = (x: Card) => seenCount(x) * 2 - cardPoints(x) * 1.5 - (s.table.length === 0 ? 0 : value(s.table) * 0) + (rankOf(x) < 9 ? 0.3 : 0);
    return sc(c) > sc(b) ? c : b;
  });
}
