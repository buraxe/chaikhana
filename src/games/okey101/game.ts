import { SLIP } from '../../core/game';
/**
 * One round of 101 Okey for four seats (anticlockwise; each seat discards to its right).
 * The seat to the dealer's right gets 22 tiles and opens by discarding; others get 21.
 * Open with sets worth at least 101 points, or with at least five pairs. After opening you
 * may lay more sets (pair openers lay only pairs) and add tiles to any set on the table.
 * A discard you take must be used in the same turn. Finish by laying everything but one
 * tile, then discarding it.
 */
import { shuffle, type Rng } from '../../core/rng';
import { isWild, okeyOf, TILES, type Okey } from '../okey/rules';
import { analyze, canAdd, leftover, planMelds, planPairs, type Kind } from './melds';

export interface Meld { id: number; owner: number; kind: Kind; tiles: number[] }
export type Opened = null | 'points' | 'pairs';
export interface Round {
  indicator: number; okey: Okey; dealer: number; hands: number[][]; pile: number[]; discards: number[][];
  turn: number; phase: 'draw' | 'play'; melds: Meld[]; opened: Opened[]; penalties: number[];
  mustUse: number | null; laidThisTurn: boolean; openedAtStartOfTurn: boolean[]; nextId: number;
  end: null | RoundEnd;
}
export interface RoundEnd { finisher: number; okeyFinish: boolean; pairsFinish: boolean; direct: boolean; scores: number[] }
export const OPEN_POINTS = 101, OPEN_PAIRS = 5;
export const next = (s: number) => (s + 1) % 4, prev = (s: number) => (s + 3) % 4;

export function deal(dealer: number, rng: Rng): Round {
  const ids = shuffle([...Array(106).keys()], rng);
  const k = ids.findIndex(i => !TILES[i].fake), ind = ids.splice(k, 1)[0];
  const starter = next(dealer), hands: number[][] = [[], [], [], []];
  for (let s = 0; s < 4; s++) hands[s] = ids.splice(0, s === starter ? 22 : 21);
  return { indicator: ind, okey: okeyOf(TILES[ind]), dealer, hands, pile: ids, discards: [[], [], [], []], turn: starter, phase: 'play',
    melds: [], opened: [null, null, null, null], penalties: [0, 0, 0, 0], mustUse: null, laidThisTurn: false, openedAtStartOfTurn: [false, false, false, false], nextId: 1, end: null };
}
const clone = (r: Round): Round => ({ ...r, hands: r.hands.map(h => h.slice()), pile: r.pile.slice(), discards: r.discards.map(d => d.slice()),
  melds: r.melds.map(m => ({ ...m, tiles: m.tiles.slice() })), opened: r.opened.slice(), penalties: r.penalties.slice(), openedAtStartOfTurn: r.openedAtStartOfTurn.slice() });

export function draw(r: Round, from: 'pile' | 'discard'): Round {
  if (r.end || r.phase !== 'draw') return r;
  const n = clone(r), s = r.turn;
  n.openedAtStartOfTurn = n.opened.map(o => o !== null);
  if (from === 'discard') {
    const src = n.discards[prev(s)];
    if (!src.length) return r;
    const t = src.pop()!;
    n.hands[s].push(t); n.mustUse = t;
  } else {
    if (!n.pile.length) return endEmpty(n);
    n.hands[s].push(n.pile.pop()!);
  }
  n.phase = 'play'; n.laidThisTurn = false;
  return n;
}
/** Put back a taken discard you have not used yet. */
export function putBack(r: Round): Round {
  if (r.mustUse === null || !r.hands[r.turn].includes(r.mustUse) || r.laidThisTurn) return r;
  const n = clone(r), t = r.mustUse;
  n.hands[r.turn].splice(n.hands[r.turn].indexOf(t), 1);
  n.discards[prev(r.turn)].push(t);
  n.mustUse = null; n.phase = 'draw';
  return n;
}
/** Check an opening: a list of sets, all runs/groups worth ≥ 101, or all pairs with ≥ 5 pairs. */
export function checkOpening(sets: number[][], ok: Okey): { ok: boolean; kind: Opened; points: number; pairs: number } {
  const shapes = sets.map(ids => analyze(ids, ok));
  if (shapes.some(s => !s)) return { ok: false, kind: null, points: 0, pairs: 0 };
  const pairs = shapes.filter(s => s!.kind === 'pair').length;
  const points = shapes.reduce((a, s) => a + s!.points, 0);
  if (pairs && pairs === shapes.length) return { ok: pairs >= OPEN_PAIRS, kind: 'pairs', points, pairs };
  if (pairs) return { ok: false, kind: null, points, pairs };
  return { ok: points >= OPEN_POINTS, kind: 'points', points, pairs: 0 };
}
/** Lay one or more sets. Before opening, the sets together must make a valid opening. */
export function lay(r: Round, sets: number[][]): Round {
  if (r.end || r.phase !== 'play' || !sets.length) return r;
  const s = r.turn, hand = r.hands[s], flat = sets.flat();
  if (new Set(flat).size !== flat.length || flat.some(id => !hand.includes(id))) return r;
  if (flat.length >= hand.length) return r; // one tile must remain to discard
  const shapes = sets.map(ids => analyze(ids, r.okey));
  if (shapes.some(x => !x)) return r;
  const n = clone(r);
  if (!r.opened[s]) {
    const o = checkOpening(sets, r.okey);
    if (!o.ok) return r;
    n.opened[s] = o.kind;
  } else {
    const wantPairs = r.opened[s] === 'pairs';
    if (shapes.some(x => (x!.kind === 'pair') !== wantPairs)) return r;
  }
  for (let k = 0; k < sets.length; k++) {
    n.melds.push({ id: n.nextId++, owner: s, kind: shapes[k]!.kind, tiles: sets[k].slice().sort((a, b) => orderKey(a, shapes[k]!, sets[k]) - orderKey(b, shapes[k]!, sets[k])) });
  }
  n.hands[s] = hand.filter(id => !flat.includes(id));
  if (n.mustUse !== null && flat.includes(n.mustUse)) n.mustUse = null;
  n.laidThisTurn = true;
  return n;
}
function orderKey(id: number, _shape: unknown, _set: number[]) { return id; }
/** Add one tile to a set on the table (only after opening). */
export function addTo(r: Round, meldId: number, tile: number): Round {
  if (r.end || r.phase !== 'play' || !r.opened[r.turn] || !r.hands[r.turn].includes(tile) || r.hands[r.turn].length <= 1) return r;
  const m = r.melds.find(x => x.id === meldId);
  if (!m || !canAdd(m, tile, r.okey)) return r;
  const n = clone(r), s = r.turn;
  n.melds.find(x => x.id === meldId)!.tiles.push(tile);
  n.hands[s] = n.hands[s].filter(id => id !== tile);
  if (n.mustUse === tile) n.mustUse = null;
  n.laidThisTurn = true;
  return n;
}
/** Tiles in hand that could be added to some set on the table. */
export const addable = (r: Round, tile: number) => r.melds.some(m => canAdd(m, tile, r.okey));
/** In-play penalty a discard would cost: 101 for an okey, 101 for a tile that fits a table set. */
export function discardPenalty(r: Round, tile: number): number {
  if (r.hands[r.turn].length === 1) return 0;
  return isWild(TILES[tile], r.okey) || addable(r, tile) ? 101 : 0;
}
export function discard(r: Round, tile: number): Round {
  if (r.end || r.phase !== 'play' || !r.hands[r.turn].includes(tile)) return r;
  if (r.mustUse !== null && r.hands[r.turn].includes(r.mustUse)) return r; // the taken tile must be used first
  const n = clone(r), s = r.turn, finishing = r.hands[s].length === 1;
  n.penalties[s] += discardPenalty(r, tile);
  n.hands[s] = n.hands[s].filter(id => id !== tile);
  if (finishing && n.opened[s]) return endFinish(n, s, tile);
  n.discards[s].push(tile);
  n.turn = next(s); n.phase = 'draw'; n.mustUse = null; n.laidThisTurn = false;
  return n;
}
function endFinish(n: Round, s: number, last: number): Round {
  const okeyFinish = isWild(TILES[last], n.okey), pairsFinish = n.opened[s] === 'pairs';
  const direct = !n.openedAtStartOfTurn.some(Boolean) && n.opened.filter(Boolean).length === 1;
  const mult = (okeyFinish ? 2 : 1) * (pairsFinish || direct ? 2 : 1);
  const scores = [0, 0, 0, 0];
  for (let k = 0; k < 4; k++) {
    if (k === s) { scores[k] = -101 * mult; continue; }
    if (!n.opened[k]) { scores[k] = 202 * mult; continue; }
    const l = leftover(n.hands[k], n.okey);
    scores[k] = l.face * (n.opened[k] === 'pairs' ? 2 : 1) + 101 * l.okeys;
  }
  n.end = { finisher: s, okeyFinish, pairsFinish, direct, scores: scores.map((v, k) => v + n.penalties[k]) };
  return n;
}
function endEmpty(n: Round): Round {
  const anyOpen = n.opened.some(Boolean);
  const scores = [0, 0, 0, 0].map((_, k) => {
    if (!anyOpen) return 0;
    if (!n.opened[k]) return 202;
    const l = leftover(n.hands[k], n.okey);
    return l.face * (n.opened[k] === 'pairs' ? 2 : 1) + 101 * l.okeys;
  });
  n.end = { finisher: -1, okeyFinish: false, pairsFinish: false, direct: false, scores: scores.map((v, k) => v + n.penalties[k]) };
  return n;
}

// ---- Computer players ----------------------------------------------------------

export const LEVELS = [
  { name: 'Beginner', rating: 700 }, { name: 'Easy', rating: 900 }, { name: 'Intermediate', rating: 1150 },
  { name: 'Advanced', rating: 1400 }, { name: 'Expert', rating: 1600 },
];
import { valueOf } from '../okey/rules';
function usefulness(hand: number[], id: number, ok: Okey): number {
  const v = valueOf(TILES[id], ok);
  let u = 0;
  for (const o of hand) {
    if (o === id || isWild(TILES[o], ok)) continue;
    const w = valueOf(TILES[o], ok);
    if (w.c === v.c && w.n !== v.n && Math.abs(w.n - v.n) <= 2) u += 2;
    else if (w.n === v.n && w.c !== v.c) u += 2;
    else if (w.n === v.n && w.c === v.c) u += 1;
  }
  return u;
}
/** Everything the computer does in one turn, as a list of intermediate rounds (for animation). */
export function aiTurn(r: Round, level: number, rng: Rng): Round[] {
  const steps: Round[] = [];
  let cur = r;
  const s = r.turn, push = (x: Round) => { if (x !== cur) { cur = x; steps.push(x); } };
  if (cur.phase === 'draw') {
    const top = cur.discards[prev(s)][cur.discards[prev(s)].length - 1];
    let take = false;
    if (top !== undefined && level >= 1) {
      const withIt = [...cur.hands[s], top];
      if (!cur.opened[s]) { const p = planMelds(withIt, cur.okey); take = p.points >= OPEN_POINTS && p.melds.some(m => m.includes(top)) && p.tiles < withIt.length; }
      else if (cur.opened[s] === 'points') take = cur.melds.some(m => canAdd(m, top, cur.okey)) || planMelds(withIt, cur.okey).melds.some(m => m.includes(top));
    }
    // With the pile empty, declining the discard ends the round.
    push(draw(cur, take ? 'discard' : 'pile'));
    if (cur.end) return steps;
  }
  // Open or lay sets.
  if (!cur.opened[s]) {
    const p = planMelds(cur.hands[s], cur.okey), pairs = planPairs(cur.hands[s], cur.okey);
    const pairsFirst = pairs.length >= (level >= 4 ? 5 : 6) && p.points < OPEN_POINTS;
    if (p.points >= OPEN_POINTS && p.tiles < cur.hands[s].length) push(lay(cur, p.melds));
    else if (pairsFirst || pairs.length >= OPEN_PAIRS && level >= 2 && p.points < OPEN_POINTS) push(lay(cur, pairs.slice(0, Math.min(pairs.length, cur.hands[s].length > pairs.length * 2 ? pairs.length : pairs.length - 1))));
  } else if (cur.opened[s] === 'points') {
    const p = planMelds(cur.hands[s], cur.okey);
    if (p.melds.length) {
      let sets = p.melds;
      while (sets.flat().length >= cur.hands[s].length) sets = sets.slice(0, -1);
      if (sets.length) push(lay(cur, sets));
    }
  } else {
    const pairs = planPairs(cur.hands[s], cur.okey);
    let use = pairs;
    while (use.flat().length >= cur.hands[s].length) use = use.slice(0, -1);
    if (use.length) push(lay(cur, use));
  }
  // Add single tiles to sets on the table.
  if (cur.opened[s]) {
    let again = true;
    while (again && cur.hands[s].length > 1) {
      again = false;
      for (const t of cur.hands[s]) {
        if (isWild(TILES[t], cur.okey) && cur.hands[s].length > 2) continue;
        const m = cur.melds.find(x => canAdd(x, t, cur.okey));
        if (m) { push(addTo(cur, m.id, t)); again = true; break; }
      }
    }
  }
  // If the taken discard is still unused, return it (only possible before laying anything).
  if (cur.mustUse !== null && cur.hands[s].includes(cur.mustUse)) {
    const back = putBack(cur);
    if (back !== cur) { push(back); push(draw(cur, 'pile')); if (cur.end) return steps; }
  }
  // Discard: never an okey (unless last), never a tile that fits a table set; prefer useless, high tiles.
  const hand = cur.hands[s];
  if (cur.mustUse !== null && hand.includes(cur.mustUse)) return steps; // cannot happen in practice
  let choice = hand[0];
  if (hand.length === 1) choice = hand[0];
  else {
    const safe = hand.filter(t => discardPenalty(cur, t) === 0);
    const pool = safe.length ? safe : hand;
    if (level === 0 || rng() < SLIP[level]) choice = pool[Math.floor(rng() * pool.length)];
    else {
      const score = (t: number) => usefulness(hand, t, cur.okey) * 3 - (level >= 2 ? valueOf(TILES[t], cur.okey).n * 0.3 : 0);
      choice = pool.slice().sort((a, b) => score(a) - score(b))[0];
    }
  }
  push(discard(cur, choice));
  return steps;
}
