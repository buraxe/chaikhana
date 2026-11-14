/**
 * King, the Turkish trick game for four. Over the game each player names two trump hands
 * (koz) and three penalty hands (ceza); each penalty can be named at most twice in all. You
 * must follow suit and beat the best card if you can; in a trump hand a void player must trump.
 * Penalties: el (−50 a trick), kupa (−30 a heart), erkek (−60 a king or jack), kız (−100 a
 * queen), rıfkı (−320 for the king of hearts), son iki (−180 for each of the last two tricks).
 * Trump hands pay +50 a trick.
 */
import { HEARTS, J, K, Q, newDeck, rankOf, suitOf, type Card } from '../cards/deck';
import { chooseCard, handsDone, legal, playCard, startTricks, type Rules, type TrickState } from '../cards/trick';
import { estimate } from '../batak/rules';
import type { Rng } from '../../core/rng';

export type Contract = 'el' | 'kupa' | 'erkek' | 'kiz' | 'rifki' | 'son2' | 'koz';
export const PENALTIES: Contract[] = ['el', 'kupa', 'erkek', 'kiz', 'rifki', 'son2'];
export interface KGame {
  length: 'full' | 'short'; hand: number; scores: number[];
  /** contracts each seat still owes: koz and ceza counts */
  koz: number[]; ceza: number[];
  /** how many times each penalty has been played */
  used: Record<string, number>;
  history: { chooser: number; contract: Contract; trump: number | null; pts: number[] }[];
}
export interface KHand { chooser: number; phase: 'choose' | 'play' | 'done'; contract: Contract | null; trump: number | null; st: TrickState }
export const totalHands = (len: KGame['length']) => (len === 'full' ? 20 : 8);
export function newGame(length: KGame['length']): KGame {
  const k = length === 'full' ? 2 : 1, c = length === 'full' ? 3 : 1;
  return { length, hand: 0, scores: [0, 0, 0, 0], koz: [k, k, k, k], ceza: [c, c, c, c], used: {}, history: [] };
}
export function dealHand(g: KGame, rng: Rng): KHand {
  const d = newDeck(rng), hands = [0, 1, 2, 3].map(i => d.slice(i * 13, i * 13 + 13)), chooser = g.hand % 4;
  return { chooser, phase: 'choose', contract: null, trump: null, st: startTricks(hands, chooser) };
}
/** What the chooser may still name. */
export function options(g: KGame, seat: number): Contract[] {
  const out: Contract[] = [];
  if (g.ceza[seat] > 0) for (const p of PENALTIES) if ((g.used[p] ?? 0) < 2) out.push(p);
  if (g.koz[seat] > 0) out.push('koz');
  // A seat with ceza left but every penalty used up must take koz.
  return out.length ? out : ['koz'];
}
export function rules(h: KHand): Rules {
  const koz = h.contract === 'koz';
  return { trump: koz ? h.trump : null, overtake: true, mustTrump: koz, locked: koz ? h.trump : h.contract === 'kupa' || h.contract === 'rifki' ? HEARTS : null, rifki: h.contract === 'rifki' };
}
export function choose(h: KHand, g: KGame, seat: number, c: Contract, trump: number | null): KHand {
  if (h.phase !== 'choose' || seat !== h.chooser || !options(g, seat).includes(c)) return h;
  return { ...h, phase: 'play', contract: c, trump: c === 'koz' ? trump ?? 0 : null };
}
const isBad = (contract: Contract | null) => (c: Card): number => {
  switch (contract) {
    case 'kupa': return suitOf(c) === HEARTS ? 1 : 0;
    case 'erkek': return rankOf(c) === K || rankOf(c) === J ? 2 : 0;
    case 'kiz': return rankOf(c) === Q ? 3 : 0;
    case 'rifki': return c === HEARTS * 13 + K ? 9 : suitOf(c) === HEARTS ? 0.3 : 0;
    default: return 0;
  }
};
/** A penalty hand stops once every penalty card has been taken. */
function finished(h: KHand): boolean {
  if (handsDone(h.st)) return true;
  const won = h.st.won.flat(), n = (f: (c: Card) => boolean) => won.filter(f).length;
  switch (h.contract) {
    case 'kupa': return n(c => suitOf(c) === HEARTS) === 13;
    case 'erkek': return n(c => rankOf(c) === K || rankOf(c) === J) === 8;
    case 'kiz': return n(c => rankOf(c) === Q) === 4;
    case 'rifki': return won.includes(HEARTS * 13 + K);
    default: return false;
  }
}
export function play(h: KHand, seat: number, c: Card): KHand {
  if (h.phase !== 'play') return h;
  const st = playCard(h.st, seat, c, rules(h));
  if (st === h.st) return h;
  const next = { ...h, st };
  return { ...next, phase: !st.table.length && finished(next) ? 'done' : 'play' };
}
export const playable = (h: KHand, seat: number) => (h.phase === 'play' && h.st.turn === seat ? legal(h.st, seat, rules(h)) : []);
export function points(h: KHand): number[] {
  const { st } = h;
  return [0, 1, 2, 3].map(s => {
    const won = st.won[s], cnt = (f: (c: Card) => boolean) => won.filter(f).length;
    switch (h.contract) {
      case 'koz': return 50 * st.tricks[s];
      case 'el': return -50 * st.tricks[s];
      case 'kupa': return -30 * cnt(c => suitOf(c) === HEARTS);
      case 'erkek': return -60 * cnt(c => rankOf(c) === K || rankOf(c) === J);
      case 'kiz': return -100 * cnt(c => rankOf(c) === Q);
      case 'rifki': return won.includes(HEARTS * 13 + K) ? -320 : 0;
      case 'son2': return -180 * st.order.slice(11).filter(w => w === s).length;
      default: return 0;
    }
  });
}
/** Books a finished hand into the game. */
export function settle(g: KGame, h: KHand): KGame {
  const pts = points(h), c = h.contract!;
  const koz = g.koz.slice(), ceza = g.ceza.slice(), used = { ...g.used };
  if (c === 'koz') koz[h.chooser] = Math.max(0, koz[h.chooser] - 1); else { ceza[h.chooser]--; used[c] = (used[c] ?? 0) + 1; }
  return { ...g, hand: g.hand + 1, scores: g.scores.map((x, i) => x + pts[i]), koz, ceza, used, history: [...g.history, { chooser: h.chooser, contract: c, trump: h.trump, pts }] };
}
export const gameOver = (g: KGame) => g.hand >= totalHands(g.length);

// ---- Computer ----
/** How risky a penalty is with this hand: lower is safer. */
function risk(hand: Card[], c: Contract): number {
  const by = (s: number) => hand.filter(x => suitOf(x) === s), high = hand.filter(x => rankOf(x) >= 9).length;
  switch (c) {
    case 'el': return high * 1.2 + hand.filter(x => rankOf(x) >= 7).length * 0.4;
    case 'kupa': return by(HEARTS).filter(x => rankOf(x) >= 8).length * 1.4 + Math.max(0, 4 - by(HEARTS).length) * -0.3 + 1;
    case 'erkek': return hand.filter(x => rankOf(x) === K || rankOf(x) === J).length * 1.3 + 0.5;
    case 'kiz': return hand.filter(x => rankOf(x) === Q).length * 1.8 + hand.filter(x => rankOf(x) >= K).length * 0.4;
    case 'rifki': return hand.includes(HEARTS * 13 + K) ? 4 - Math.min(3, by(HEARTS).length * 0.6) : by(HEARTS).length <= 2 ? 0.6 : 1;
    case 'son2': return hand.filter(x => rankOf(x) >= 10).length * 0.9 + 1;
    default: return 9;
  }
}
export function aiChoose(g: KGame, h: KHand, seat: number, skill: number, rng: Rng = Math.random): { c: Contract; trump: number | null } {
  const opts = options(g, seat), hand = h.st.hands[seat];
  const trumpBest = [0, 1, 2, 3].reduce((b, s) => (estimate(hand, s) > estimate(hand, b) ? s : b), 0), est = estimate(hand, trumpBest);
  const pens = opts.filter(o => o !== 'koz');
  // Take koz on a strong hand, or when there is no penalty left to name, or at the end of the quota.
  const handsLeft = totalHands(g.length) - g.hand, mustKoz = !pens.length || (g.koz[seat] > 0 && g.koz[seat] + g.ceza[seat] >= Math.ceil(handsLeft / 4) && g.ceza[seat] === 0);
  if (opts.includes('koz') && (mustKoz || est + (rng() - 0.5) * (4 - skill) * 0.4 >= 5.2)) return { c: 'koz', trump: trumpBest };
  if (!pens.length) return { c: 'koz', trump: trumpBest };
  const ranked = pens.map(p => ({ p, r: risk(hand, p) + (rng() - 0.5) * (4 - skill) })).sort((a, b) => a.r - b.r);
  return { c: ranked[0].p, trump: null };
}
export const aiPlay = (h: KHand, seat: number, skill: number, rng: Rng = Math.random) =>
  chooseCard(h.st, seat, rules(h), h.contract === 'koz' ? 'win' : 'avoid', skill, h.contract === 'el' || h.contract === 'son2' ? () => 1 : isBad(h.contract), rng);
