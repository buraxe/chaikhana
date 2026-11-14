/**
 * No-limit Texas Hold'em for 2–6 players, played as a sit-and-go: everyone starts with the
 * same stack, the blinds double every eight hands, and the last player with chips wins.
 */
import { newDeck, type Card } from '../cards/deck';
import { evaluate } from './eval';
import type { Rng } from '../../core/rng';

export interface Seat { who?: number; name: string; chips: number; bet: number; total: number; cards: Card[]; folded: boolean; allIn: boolean; out: boolean; acted: boolean; human: boolean; level: number }
export type Action = { kind: 'fold' } | { kind: 'check' } | { kind: 'call' } | { kind: 'raise'; to: number };
export interface Event { seat: number; kind: Action['kind'] | 'blind' | 'win' | 'allin'; amount: number }
export interface Showdown { pots: { amount: number; winners: number[] }[]; shown: number[]; scores: Record<number, number> }
export interface PState {
  seats: Seat[]; dealer: number; hand: number; sb: number; bb: number; deck: Card[]; board: Card[];
  street: 0 | 1 | 2 | 3; turn: number; currentBet: number; minRaise: number;
  phase: 'betting' | 'showdown' | 'over'; events: Event[]; result: Showdown | null;
}
export const START_CHIPS = 1000;
export const blindsFor = (hand: number) => { const k = Math.floor(hand / 8); return { sb: 10 * 2 ** k, bb: 20 * 2 ** k }; };
const live = (s: PState) => s.seats.map((x, i) => i).filter(i => !s.seats[i].out);
const nextFrom = (s: PState, i: number, ok: (k: number) => boolean) => { const n = s.seats.length; for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (ok(j)) return j; } return -1; };
export const pot = (s: PState) => s.seats.reduce((a, x) => a + x.total, 0);

export function newTable(players: { name: string; human: boolean; level: number; who?: number }[]): PState {
  const seats = players.map(p => ({ ...p, chips: START_CHIPS, bet: 0, total: 0, cards: [], folded: false, allIn: false, out: false, acted: false }));
  return { seats, dealer: -1, hand: -1, sb: 10, bb: 20, deck: [], board: [], street: 0, turn: 0, currentBet: 0, minRaise: 20, phase: 'showdown', events: [], result: null };
}
function put(seat: Seat, amount: number): number {
  const a = Math.min(amount, seat.chips);
  seat.chips -= a; seat.bet += a; seat.total += a; if (seat.chips === 0) seat.allIn = true;
  return a;
}
export function startHand(prev: PState, rng: Rng): PState {
  const s: PState = JSON.parse(JSON.stringify(prev));
  for (const x of s.seats) { if (x.chips <= 0) x.out = true; Object.assign(x, { bet: 0, total: 0, cards: [], folded: x.out, allIn: false, acted: false }); }
  if (live(s).length < 2) return { ...s, phase: 'over' };
  s.hand++; const bl = blindsFor(s.hand); s.sb = bl.sb; s.bb = bl.bb;
  s.dealer = nextFrom(s, s.dealer, i => !s.seats[i].out);
  const heads = live(s).length === 2;
  const sbSeat = heads ? s.dealer : nextFrom(s, s.dealer, i => !s.seats[i].out), bbSeat = nextFrom(s, sbSeat, i => !s.seats[i].out);
  s.deck = newDeck(rng); s.board = []; s.street = 0; s.events = []; s.result = null; s.phase = 'betting';
  for (const i of live(s)) s.seats[i].cards = [s.deck.pop()!, s.deck.pop()!];
  s.events.push({ seat: sbSeat, kind: 'blind', amount: put(s.seats[sbSeat], s.sb) }, { seat: bbSeat, kind: 'blind', amount: put(s.seats[bbSeat], s.bb) });
  s.currentBet = s.bb; s.minRaise = s.bb;
  s.turn = nextFrom(s, bbSeat, i => canAct(s, i));
  if (s.turn < 0 || roundDone(s)) return advance(s);
  return s;
}
const canAct = (s: PState, i: number) => !s.seats[i].out && !s.seats[i].folded && !s.seats[i].allIn;
function roundDone(s: PState): boolean {
  const actors = s.seats.map((_, i) => i).filter(i => canAct(s, i));
  if (actors.every(i => s.seats[i].acted && s.seats[i].bet === s.currentBet)) return true;
  // One player left with chips and nobody to bet against.
  return actors.length === 1 && s.seats[actors[0]].bet >= s.currentBet && s.seats.filter((x, i) => !x.out && !x.folded && i !== actors[0]).every(x => x.allIn);
}
export function legalActions(s: PState, i: number) {
  const x = s.seats[i], toCall = Math.max(0, s.currentBet - x.bet);
  const minTo = Math.min(x.bet + x.chips, s.currentBet + s.minRaise), maxTo = x.bet + x.chips;
  return { toCall, canCheck: toCall === 0, canRaise: x.chips > toCall, minTo, maxTo };
}
export function act(prev: PState, i: number, a: Action): PState {
  if (prev.phase !== 'betting' || prev.turn !== i) return prev;
  const s: PState = JSON.parse(JSON.stringify(prev)), x = s.seats[i], L = legalActions(prev, i);
  if (a.kind === 'fold') { x.folded = true; s.events.push({ seat: i, kind: 'fold', amount: 0 }); }
  else if (a.kind === 'check') { if (!L.canCheck) return prev; s.events.push({ seat: i, kind: 'check', amount: 0 }); }
  else if (a.kind === 'call') { if (L.toCall === 0) return act(prev, i, { kind: 'check' }); s.events.push({ seat: i, kind: x.chips <= L.toCall ? 'allin' : 'call', amount: put(x, L.toCall) }); }
  else {
    if (!L.canRaise) return act(prev, i, { kind: 'call' });
    const to = Math.max(L.minTo, Math.min(L.maxTo, Math.round(a.to)));
    const raise = to - s.currentBet;
    put(x, to - x.bet);
    if (raise >= s.minRaise) s.minRaise = raise;
    if (to > s.currentBet) { s.currentBet = to; for (const [k, o] of s.seats.entries()) if (k !== i && canAct(s, k)) o.acted = false; }
    s.events.push({ seat: i, kind: x.allIn ? 'allin' : 'raise', amount: to });
  }
  x.acted = true;
  const inHand = s.seats.map((_, k) => k).filter(k => !s.seats[k].out && !s.seats[k].folded);
  if (inHand.length === 1) return award(s, [{ amount: pot(s), winners: inHand }], []);
  if (roundDone(s)) return advance(s);
  s.turn = nextFrom(s, i, k => canAct(s, k));
  return s;
}
/** Close the betting round and deal the next street, or go to the showdown. */
function advance(s: PState): PState {
  for (const x of s.seats) { x.bet = 0; x.acted = false; }
  s.currentBet = 0; s.minRaise = s.bb;
  const actors = s.seats.map((_, i) => i).filter(i => canAct(s, i));
  if (s.street === 3) return showdown(s);
  s.street = (s.street + 1) as PState['street'];
  s.board.push(...s.deck.splice(-(s.street === 1 ? 3 : 1)));
  // With at most one player able to bet, deal the rest out.
  if (actors.length < 2) return advance(s);
  s.turn = nextFrom(s, s.dealer, i => canAct(s, i));
  return s;
}
function showdown(s: PState): PState {
  const inHand = s.seats.map((_, i) => i).filter(i => !s.seats[i].out && !s.seats[i].folded);
  const scores: Record<number, number> = {};
  for (const i of inHand) scores[i] = evaluate([...s.seats[i].cards, ...s.board]);
  // Side pots: one layer for each distinct amount put in.
  const levels = [...new Set(s.seats.map(x => x.total).filter(v => v > 0))].sort((a, b) => a - b);
  const pots: { amount: number; winners: number[] }[] = [];
  let prevLvl = 0;
  for (const lvl of levels) {
    const amount = s.seats.reduce((a, x) => a + Math.max(0, Math.min(x.total, lvl) - prevLvl), 0);
    const elig = inHand.filter(i => s.seats[i].total >= lvl);
    prevLvl = lvl;
    if (!amount) continue;
    if (!elig.length) { if (pots.length) pots[pots.length - 1].amount += amount; continue; }
    const best = Math.max(...elig.map(i => scores[i]));
    pots.push({ amount, winners: elig.filter(i => scores[i] === best) });
  }
  return award(s, pots, inHand, scores);
}
function award(s: PState, pots: { amount: number; winners: number[] }[], shown: number[], scores: Record<number, number> = {}): PState {
  for (const p of pots) {
    const share = Math.floor(p.amount / p.winners.length); let odd = p.amount - share * p.winners.length;
    // Odd chips go to the first winner left of the dealer.
    const order = p.winners.slice().sort((a, b) => ((a - s.dealer + s.seats.length) % s.seats.length) - ((b - s.dealer + s.seats.length) % s.seats.length));
    for (const w of order) { s.seats[w].chips += share + (odd > 0 ? 1 : 0); odd--; }
    for (const w of p.winners) s.events.push({ seat: w, kind: 'win', amount: share });
  }
  for (const x of s.seats) { x.bet = 0; }
  s.phase = 'showdown'; s.result = { pots, shown, scores };
  if (s.seats.filter(x => x.chips > 0).length < 2) s.phase = 'over';
  return s;
}
