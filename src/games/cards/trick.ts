/**
 * Trick-taking for four players (King, Batak). Each game passes its own rules: whether you
 * must beat the cards already played, whether a void player must trump, which suit may not be
 * led until broken, and any forced card (King's rıfkı).
 */
import { A, HEARTS, K, rankOf, suitOf, type Card } from './deck';

export interface Rules {
  trump: number | null;
  /** you must beat the best card so far when you can (yükseltme) */
  overtake: boolean;
  /** a player out of the led suit must trump, and over-trump if they can */
  mustTrump: boolean;
  /** a suit that may not be led until someone has discarded it (or you hold nothing else) */
  locked: number | null;
  /** King's rıfkı: the king of hearts must go as soon as it can */
  rifki?: boolean;
}
export interface Play { seat: number; card: Card }
export interface TrickState {
  hands: Card[][]; turn: number; leader: number; table: Play[];
  /** cards won, per seat, and the order tricks were won in */
  won: Card[][]; tricks: number[]; order: number[];
  broken: boolean; last: Play[] | null;
}
export function startTricks(hands: Card[][], leader: number): TrickState {
  return { hands: hands.map(h => h.slice()), turn: leader, leader, table: [], won: [[], [], [], []], tricks: [0, 0, 0, 0], order: [], broken: false, last: null };
}
/** The play that currently wins the cards on the table. */
export function winning(table: Play[], trump: number | null): Play {
  const led = suitOf(table[0].card);
  let best = table[0];
  for (const p of table.slice(1)) {
    const s = suitOf(p.card), bs = suitOf(best.card);
    if (s === bs) { if (rankOf(p.card) > rankOf(best.card)) best = p; }
    else if (trump !== null && s === trump && bs !== trump) best = p;
    else if (s !== led && s !== trump) continue;
  }
  return best;
}
export function legal(st: TrickState, seat: number, R: Rules): Card[] {
  const hand = st.hands[seat];
  if (!hand.length) return [];
  if (!st.table.length) {
    // Leading: a locked suit only once it is broken or nothing else is left.
    if (R.locked !== null && !st.broken) { const other = hand.filter(c => suitOf(c) !== R.locked); if (other.length) return other; }
    return hand;
  }
  const led = suitOf(st.table[0].card), best = winning(st.table, R.trump), follow = hand.filter(c => suitOf(c) === led);
  if (follow.length) {
    let out = follow;
    if (R.overtake && suitOf(best.card) === led) { const higher = follow.filter(c => rankOf(c) > rankOf(best.card)); if (higher.length) out = higher; }
    if (R.rifki && led === HEARTS && out.includes(HEARTS * 13 + K) && st.table.some(p => p.card === HEARTS * 13 + A)) return [HEARTS * 13 + K];
    return out;
  }
  if (R.rifki && hand.includes(HEARTS * 13 + K)) return [HEARTS * 13 + K];
  if (R.mustTrump && R.trump !== null) {
    const trumps = hand.filter(c => suitOf(c) === R.trump);
    if (trumps.length) {
      if (suitOf(best.card) === R.trump) { const over = trumps.filter(c => rankOf(c) > rankOf(best.card)); if (over.length) return over; }
      return trumps;
    }
  }
  return hand;
}
/** Plays a card; after the fourth, the trick goes to its winner, who leads next. */
export function playCard(st: TrickState, seat: number, c: Card, R: Rules): TrickState {
  if (seat !== st.turn || !legal(st, seat, R).includes(c)) return st;
  const hands = st.hands.map((h, i) => (i === seat ? h.filter(x => x !== c) : h));
  const table = [...st.table, { seat, card: c }];
  let broken = st.broken || (R.locked !== null && suitOf(c) === R.locked);
  if (table.length < 4) return { ...st, hands, table, turn: (seat + 1) % 4, broken };
  const w = winning(table, R.trump).seat;
  const won = st.won.map((x, i) => (i === w ? [...x, ...table.map(p => p.card)] : x));
  const tricks = st.tricks.map((n, i) => (i === w ? n + 1 : n));
  if (R.locked !== null && table.some(p => suitOf(p.card) === R.locked)) broken = true;
  return { hands, table: [], turn: w, leader: w, won, tricks, order: [...st.order, w], broken, last: table };
}
export const handsDone = (st: TrickState) => st.hands.every(h => !h.length) && !st.table.length;

// ---- Computer play ----
/** Cards already seen: played to earlier tricks or lying on the table now. */
export function seen(st: TrickState): Set<Card> { return new Set([...st.won.flat(), ...st.table.map(p => p.card)]); }
/** True when no unseen card of that suit outranks c (so c wins if that suit is led and not trumped). */
export function master(c: Card, st: TrickState, mine: Card[]): boolean {
  const s = suitOf(c), gone = seen(st);
  for (let r = rankOf(c) + 1; r <= A; r++) { const x = s * 13 + r; if (!gone.has(x) && !mine.includes(x)) return false; }
  return true;
}
/**
 * Choose a card. `want`: 'win' to take tricks (trump games), 'avoid' to dodge them (penalty
 * games); `bad` scores how much taking a card hurts in a penalty game. `skill` 0–4.
 */
export function chooseCard(st: TrickState, seat: number, R: Rules, want: 'win' | 'avoid', skill: number, bad: (c: Card) => number = () => 0, rng = Math.random): Card {
  const opts = legal(st, seat, R), hand = st.hands[seat];
  if (opts.length === 1) return opts[0];
  if (rng() < [0.35, 0.2, 0.1, 0.04, 0.01][skill]) return opts[Math.floor(rng() * opts.length)];
  const low = (xs: Card[]) => xs.reduce((a, b) => (rankOf(b) < rankOf(a) ? b : a));
  const high = (xs: Card[]) => xs.reduce((a, b) => (rankOf(b) > rankOf(a) ? b : a));
  const remember = skill >= 2;
  if (!st.table.length) {
    if (want === 'win') {
      const sure = opts.filter(c => (remember ? master(c, st, hand) : rankOf(c) === A));
      if (sure.length) return high(sure);
      // Lead from the longest plain suit, low, to set up winners later.
      const plain = opts.filter(c => suitOf(c) !== R.trump);
      const pool = plain.length ? plain : opts;
      const bySuit = [0, 1, 2, 3].map(s => pool.filter(c => suitOf(c) === s)).filter(x => x.length).sort((a, b) => b.length - a.length);
      return low(bySuit[0]);
    }
    // Avoid: lead the lowest card, preferring suits where we hold only low cards.
    const safe = opts.filter(c => bad(c) === 0);
    const pool = safe.length ? safe : opts;
    return low(pool);
  }
  const lastToPlay = st.table.length === 3;
  const wins = (c: Card) => winning([...st.table, { seat, card: c }], R.trump).seat === seat;
  const winners = opts.filter(wins), losers = opts.filter(c => !wins(c));
  const tableBad = st.table.reduce((n, p) => n + bad(p.card), 0);
  if (want === 'win') {
    if (winners.length) {
      // Win cheaply when last, or when our card is the master of its suit.
      const cheap = low(winners);
      if (lastToPlay || (remember && master(high(winners), st, hand))) return lastToPlay ? cheap : high(winners);
      return skill >= 1 ? (rankOf(high(winners)) >= K ? high(winners) : cheap) : cheap;
    }
    return low(opts);
  }
  // Avoid: duck under the winning card if we can; dump the worst card if we can't follow.
  if (losers.length) {
    const led = suitOf(st.table[0].card), following = losers.filter(c => suitOf(c) === led);
    if (following.length) return high(following);
    // Void: throw away penalty cards first, then high cards.
    return losers.reduce((a, b) => (bad(b) * 20 + rankOf(b) > bad(a) * 20 + rankOf(a) ? b : a));
  }
  // Forced to win: if the trick is clean and we are last, win with the highest to unload it.
  if (lastToPlay && tableBad === 0) return winners.reduce((a, b) => (bad(b) === 0 && rankOf(b) > rankOf(a) ? b : a));
  return winners.reduce((a, b) => (bad(b) < bad(a) || (bad(b) === bad(a) && rankOf(b) > rankOf(a)) ? b : a));
}
