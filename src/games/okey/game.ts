import { SLIP } from '../../core/game';
/**
 * One deal of Okey for four seats, played anticlockwise: seat 0, then 1 (to its right),
 * 2 and 3. Each seat discards to its right, so seat i takes from the pile of seat i − 1.
 * The seat to the dealer's right gets 15 tiles and opens by discarding.
 */
import { shuffle, type Rng } from '../../core/rng';
import { bestCover, isPairs, isSetsWin, isWild, okeyOf, TILES, valueOf, type Okey, type Tile } from './rules';

/** winner −1 means the tiles ran out. */
export interface DealEnd { winner: number; tile: number; pairs: boolean; joker: boolean; penalty: number }
export interface Deal {
  indicator: number; okey: Okey; dealer: number;
  hands: number[][]; pile: number[]; discards: number[][];
  turn: number; phase: 'draw' | 'discard'; acted: boolean[]; shown: boolean[];
  taken: number[][]; // tiles each seat picked up from discards, for the computer's defence
  end: null | DealEnd;
}
export const prev = (s: number) => (s + 3) % 4;
export const next = (s: number) => (s + 1) % 4;
export const tilesOf = (ids: number[]) => ids.map(i => TILES[i]);

export function deal(dealer: number, rng: Rng): Deal {
  const ids = shuffle([...Array(106).keys()], rng);
  const indicator = ids.findIndex(i => !TILES[i].fake);
  const ind = ids.splice(indicator, 1)[0];
  const starter = next(dealer), hands: number[][] = [[], [], [], []];
  for (let s = 0; s < 4; s++) hands[s] = ids.splice(0, s === starter ? 15 : 14);
  return { indicator: ind, okey: okeyOf(TILES[ind]), dealer, hands, pile: ids, discards: [[], [], [], []], turn: starter, phase: 'discard',
    acted: [false, false, false, false], shown: [false, false, false, false], taken: [[], [], [], []], end: null };
}
const clone = (d: Deal): Deal => ({ ...d, hands: d.hands.map(h => h.slice()), pile: d.pile.slice(), discards: d.discards.map(x => x.slice()), acted: d.acted.slice(), shown: d.shown.slice(), taken: d.taken.map(x => x.slice()) });

/** Showing the indicator's twin before your first action costs the others one point. */
export const canShow = (d: Deal, s: number) => !d.end && !d.acted[s] && !d.shown[s] && d.hands[s].some(i => !TILES[i].fake && TILES[i].c === TILES[d.indicator].c && TILES[i].n === TILES[d.indicator].n);
export function show(d: Deal, s: number): Deal { if (!canShow(d, s)) return d; const n = clone(d); n.shown[s] = true; return n; }

export function draw(d: Deal, from: 'pile' | 'discard'): Deal {
  if (d.end || d.phase !== 'draw') return d;
  const n = clone(d), s = d.turn;
  if (from === 'discard') {
    const src = n.discards[prev(s)];
    if (!src.length) return d;
    const t = src.pop()!;
    n.hands[s].push(t); n.taken[s].push(t);
  } else {
    if (!n.pile.length) { n.end = { winner: -1, tile: -1, pairs: false, joker: false, penalty: 0 }; return n; }
    n.hands[s].push(n.pile.pop()!);
  }
  n.phase = 'discard'; n.acted[s] = true;
  return n;
}
export function discard(d: Deal, tile: number): Deal {
  if (d.end || d.phase !== 'discard' || !d.hands[d.turn].includes(tile)) return d;
  const n = clone(d), s = d.turn;
  n.hands[s].splice(n.hands[s].indexOf(tile), 1);
  n.discards[s].push(tile); n.acted[s] = true;
  n.turn = next(s); n.phase = 'draw';
  // Nothing left to draw and nothing worth taking ends the deal with no score; the
  // next player can still take the discard, so the check happens on their draw.
  return n;
}
/** Points each other player loses when `tile` is discarded to finish, or 0 if it does not finish. */
export function finishValue(d: Deal, tile: number): number {
  const s = d.turn, rest = d.hands[s].filter(i => i !== tile);
  if (d.phase !== 'discard' || rest.length !== 14) return 0;
  const hand = tilesOf(rest), pairs = !isSetsWin(hand, d.okey) && isPairs(hand, d.okey);
  if (!pairs && !isSetsWin(hand, d.okey)) return 0;
  return (pairs ? 4 : 2) * (isWild(TILES[tile], d.okey) ? 2 : 1);
}
export function finish(d: Deal, tile: number): Deal {
  const v = finishValue(d, tile);
  if (!v) return d;
  const n = clone(d), s = d.turn;
  n.hands[s].splice(n.hands[s].indexOf(tile), 1);
  const hand = tilesOf(n.hands[s]);
  n.end = { winner: s, tile, pairs: !isSetsWin(hand, d.okey), joker: isWild(TILES[tile], d.okey), penalty: v };
  return n;
}

// ---- Computer players --------------------------------------------------------

export const LEVELS = [
  { name: 'Beginner', rating: 700 }, { name: 'Easy', rating: 900 }, { name: 'Intermediate', rating: 1150 },
  { name: 'Advanced', rating: 1400 }, { name: 'Expert', rating: 1600 },
];
/** Tiles placed in sets count most; tiles one step from a set and wild tiles count too. */
export function handValue(ids: number[], ok: Okey, level: number): number {
  const hand = tilesOf(ids);
  let v = bestCover(hand, ok) * 10;
  const plain = hand.filter(t => !isWild(t, ok)).map(t => valueOf(t, ok));
  for (let i = 0; i < plain.length; i++) {
    let near = 0;
    for (let j = 0; j < plain.length; j++) {
      if (i === j) continue;
      const a = plain[i], b = plain[j];
      if (a.c === b.c && Math.abs(a.n - b.n) <= 2 && a.n !== b.n) near++;
      else if (a.n === b.n && a.c !== b.c) near++;
    }
    v += Math.min(near, 2) * (level >= 2 ? 1.5 : 1);
  }
  v += hand.filter(t => isWild(t, ok)).length * 6;
  if (level >= 4) {
    // Keep the seven-pairs route in mind when the hand is already rich in pairs.
    const key = (t: Tile) => `${valueOf(t, ok).c}:${valueOf(t, ok).n}`;
    const counts = new Map<string, number>();
    for (const t of hand) if (!isWild(t, ok)) counts.set(key(t), (counts.get(key(t)) ?? 0) + 1);
    const pairs = [...counts.values()].reduce((a, c) => a + Math.floor(c / 2), 0);
    if (pairs >= 5) v = Math.max(v, pairs * 20 + hand.filter(t => isWild(t, ok)).length * 18);
  }
  return v;
}
function bestDiscard(d: Deal, s: number, level: number, rng: Rng): { tile: number; value: number } {
  const hand = d.hands[s], ok = d.okey;
  const candidates = hand.filter(i => !isWild(TILES[i], ok));
  if (level === 0) { const t = candidates[Math.floor(rng() * candidates.length)] ?? hand[0]; return { tile: t, value: 0 }; }
  let best = candidates[0] ?? hand[0], bestV = -Infinity;
  const wanted = d.taken[next(s)].map(i => valueOf(TILES[i], ok));
  for (const t of candidates) {
    let v = handValue(hand.filter(i => i !== t), ok, level);
    if (level >= 3) {
      // Do not feed the next player tiles that fit what they have been collecting.
      const x = valueOf(TILES[t], ok);
      if (wanted.some(w => (w.c === x.c && Math.abs(w.n - x.n) <= 2) || (w.n === x.n && w.c !== x.c))) v -= 4;
    }
    if (v > bestV) { bestV = v; best = t; }
  }
  return { tile: best, value: bestV };
}
/** The computer's whole turn: maybe show the indicator, draw, then finish or discard. */
export function aiTurn(d: Deal, level: number, rng: Rng): { deal: Deal; steps: ('show' | 'pile' | 'discard-take' | 'finish' | 'discard')[] } {
  let n = d;
  const s = d.turn, steps: ('show' | 'pile' | 'discard-take' | 'finish' | 'discard')[] = [];
  if (canShow(n, s)) { n = show(n, s); steps.push('show'); }
  if (n.phase === 'draw') {
    const top = n.discards[prev(s)][n.discards[prev(s)].length - 1];
    let take = false;
    if (top !== undefined) {
      const withIt = { ...n, hands: n.hands.map((h, k) => (k === s ? [...h, top] : h)), phase: 'discard' as const };
      const wins = withIt.hands[s].some(t => finishValue(withIt, t) > 0);
      if (wins) take = true;
      else if (level >= 1 && !isWild(TILES[top], n.okey)) {
        const now = handValue(n.hands[s], n.okey, level);
        const after = bestDiscard(withIt, s, level, rng).value;
        take = after - now >= (level >= 3 ? 7 : 9);
      }
      if (top !== undefined && isWild(TILES[top], n.okey)) take = true;
    }
    if (!take && !n.pile.length && top !== undefined) take = true;
    n = draw(n, take ? 'discard' : 'pile');
    steps.push(take ? 'discard-take' : 'pile');
    if (n.end) return { deal: n, steps };
  }
  // Finish if any discard completes the hand; prefer discarding a wild tile for double.
  const finishers = n.hands[s].map(t => ({ t, v: finishValue(n, t) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
  if (finishers.length) { steps.push('finish'); return { deal: finish(n, finishers[0].t), steps }; }
  steps.push('discard');
  const loose = n.hands[s].filter(i => !isWild(TILES[i], n.okey));
  const slip = level > 0 && loose.length > 0 && rng() < SLIP[level];
  return { deal: discard(n, slip ? loose[Math.floor(rng() * loose.length)] : bestDiscard(n, s, level, rng).tile), steps };
}
