import { SLIP } from '../../core/game';
/**
 * Tavla (Turkish backgammon). Each player's checkers are stored in that player's own
 * numbering: points 1–24 counted from their home end, 25 = bar, 0 = borne off. A player
 * always moves from higher to lower numbers. My point q is the opponent's point 25 − q.
 *
 * Rules as commonly played in Turkey: the winner of the opening roll rolls again for the
 * first move; a win where the loser has borne off nothing is mars (2 points); there is no
 * triple score. The doubling cube is an optional variant.
 */
import type { GameModule } from '../../core/game';
import type { Level } from '../../core/match';

export type Board = [number[], number[]];
export interface Step { from: number; to: number; die: number; hit: boolean }
export const BAR = 25, OFF = 0;

export function initialBoard(): Board {
  const side = () => { const a = new Array(26).fill(0); a[24] = 2; a[13] = 5; a[8] = 3; a[6] = 5; return a; };
  return [side(), side()];
}
export const copy = (b: Board): Board => [b[0].slice(), b[1].slice()];
export const key = (b: Board) => b[0].join(',') + '|' + b[1].join(',');
export const pips = (b: Board, p: number) => b[p].reduce((a, n, i) => a + n * i, 0);
const allHome = (side: number[]) => { for (let i = 7; i <= 25; i++) if (side[i]) return false; return true; };

/** Every single checker move available to player p with one die. */
export function singleMoves(b: Board, p: number, die: number): Step[] {
  const me = b[p], opp = b[1 - p], out: Step[] = [];
  const target = (to: number) => (to >= 1 ? opp[25 - to] : 0);
  const sources = me[BAR] > 0 ? [BAR] : me.map((n, i) => (n > 0 && i >= 1 && i <= 24 ? i : -1)).filter(i => i > 0);
  for (const from of sources) {
    const to = from - die;
    if (to >= 1) { if (target(to) < 2) out.push({ from, to, die, hit: target(to) === 1 }); continue; }
    if (from === BAR || !allHome(me)) continue;
    if (to === 0) { out.push({ from, to: OFF, die, hit: false }); continue; }
    // Bearing off with a larger die is allowed only from the highest occupied point.
    let higher = false;
    for (let i = from + 1; i <= 6; i++) if (me[i]) { higher = true; break; }
    if (!higher) out.push({ from, to: OFF, die, hit: false });
  }
  return out;
}
export function applyStep(b: Board, p: number, s: Step): Board {
  const n = copy(b), me = n[p], opp = n[1 - p];
  me[s.from]--;
  if (s.to === OFF) me[OFF]++;
  else {
    if (opp[25 - s.to] === 1) { opp[25 - s.to] = 0; opp[BAR]++; }
    me[s.to]++;
  }
  return n;
}

/**
 * All legal ways to play a roll. A player must use as many dice as possible; if only one of
 * two different dice can be used, it must be the larger one when that is possible.
 */
export function sequences(b: Board, p: number, roll: number[]): Step[][] {
  const dice = roll[0] === roll[1] ? [roll[0], roll[0], roll[0], roll[0]] : roll.slice();
  const out: Step[][] = [];
  let best = 0;
  const seen = new Set<string>();
  const rec = (bd: Board, left: number[], path: Step[]) => {
    const memo = key(bd) + ':' + left.join('') + ':' + path.length;
    if (seen.has(memo)) return;
    seen.add(memo);
    let moved = false;
    for (const d of new Set(left)) {
      for (const s of singleMoves(bd, p, d)) {
        moved = true;
        const rest = left.slice(); rest.splice(rest.indexOf(d), 1);
        rec(applyStep(bd, p, s), rest, [...path, s]);
      }
    }
    if (!moved) {
      if (path.length > best) { best = path.length; out.length = 0; }
      if (path.length === best) out.push(path);
    }
  };
  rec(b, dice, []);
  if (best === 1 && dice.length === 2 && dice[0] !== dice[1]) {
    const hi = Math.max(...dice), withHi = out.filter(q => q[0].die === hi);
    if (withHi.length) return withHi;
  }
  return best === 0 ? [[]] : out;
}
/** Distinct end positions of a roll, with one sequence for each. */
export function endPositions(b: Board, p: number, roll: number[]): { board: Board; seq: Step[] }[] {
  const map = new Map<string, { board: Board; seq: Step[] }>();
  for (const seq of sequences(b, p, roll)) {
    let bd = b;
    for (const s of seq) bd = applyStep(bd, p, s);
    const k = key(bd);
    if (!map.has(k)) map.set(k, { board: bd, seq });
  }
  return [...map.values()];
}
export const winner = (b: Board): -1 | 0 | 1 => (b[0][OFF] === 15 ? 0 : b[1][OFF] === 15 ? 1 : -1);
/** 1 for a plain win, 2 for mars (the loser has borne off nothing). */
export const gameValue = (b: Board, w: number) => (b[1 - w][OFF] === 0 ? 2 : 1);

// ---- AI ---------------------------------------------------------------------

export const LEVELS: (Level & { kind: number; ply: number })[] = [
  { name: 'Beginner', rating: 700, kind: 0, ply: 0 }, { name: 'Easy', rating: 900, kind: 1, ply: 0 },
  { name: 'Intermediate', rating: 1150, kind: 2, ply: 0 }, { name: 'Advanced', rating: 1400, kind: 2, ply: 3 },
  { name: 'Expert', rating: 1600, kind: 2, ply: 6 },
];
const ROLLS: [number, number, number][] = [];
for (let a = 1; a <= 6; a++) for (let c = a; c <= 6; c++) ROLLS.push([a, c, a === c ? 1 : 2]);

/** Is there still contact, or is it a pure race? */
export function contact(b: Board): boolean {
  let myBack = 0, oppBack = 0;
  for (let i = 25; i >= 1; i--) if (b[0][i]) { myBack = i; break; }
  for (let i = 25; i >= 1; i--) if (b[1][i]) { oppBack = i; break; }
  return myBack + oppBack > 25;
}
/** How many of the 36 rolls let the opponent hit a checker of p's on point q (direct shots and simple combinations). */
function shots(b: Board, p: number, q: number): number {
  const opp = b[1 - p], dists = new Set<number>();
  const target = 25 - q;
  for (let r = 1; r <= 25; r++) if (opp[r] && r > target) dists.add(r - target);
  let n = 0;
  for (let a = 1; a <= 6; a++) for (let c = 1; c <= 6; c++) {
    if (dists.has(a) || dists.has(c) || dists.has(a + c) || (a === c && (dists.has(3 * a) || dists.has(4 * a)))) n++;
  }
  return n;
}
/** Heuristic value of a position for player p (higher is better). */
export function evaluate(b: Board, p: number, kind = 2): number {
  const me = b[p], opp = b[1 - p];
  const race = pips(b, 1 - p) - pips(b, p);
  if (kind === 1) {
    let blots = 0;
    for (let i = 1; i <= 24; i++) if (me[i] === 1) blots++;
    return race + 2 * opp[BAR] - 2 * blots + 3 * me[OFF];
  }
  if (!contact(b)) return race * 1.2 + me[OFF] * 4 - opp[OFF] * 4;
  let s = race;
  let prime = 0, run = 0;
  for (let i = 1; i <= 24; i++) {
    if (me[i] >= 2) {
      run++; prime = Math.max(prime, run);
      if (i <= 6) s += 6 + (i >= 4 ? 2 : 0);
      else if (i <= 9) s += 4;
      else if (i >= 19) s += 2.5;
    } else run = 0;
    if (me[i] === 1) s -= (shots(b, p, i) / 36) * (8 + (25 - i) * 0.6);
  }
  s += prime >= 3 ? (prime - 2) * 6 : 0;
  let homeMade = 0;
  for (let i = 1; i <= 6; i++) if (me[i] >= 2) homeMade++;
  s += opp[BAR] * (4 + homeMade * 3);
  s -= me[BAR] * 6;
  s += (me[OFF] - opp[OFF]) * 3;
  return s;
}
function bestReply(b: Board, p: number, roll: number[]): number {
  let best = -Infinity;
  for (const e of endPositions(b, p, roll)) best = Math.max(best, evaluate(e.board, p));
  return best === -Infinity ? evaluate(b, p) : best;
}
/** Picks a full-turn sequence for player p. */
export function chooseSequence(b: Board, p: number, roll: number[], level: number, rng: () => number = Math.random): Step[] {
  const ends = endPositions(b, p, roll), L = LEVELS[level];
  if (ends.length <= 1) return ends[0]?.seq ?? [];
  if (L.kind === 0 || rng() < SLIP[level]) return ends[Math.floor(rng() * ends.length)].seq;
  const scored = ends.map(e => ({ e, s: winner(e.board) === p ? 1e9 : evaluate(e.board, p, L.kind) })).sort((a, c) => c.s - a.s);
  if (!L.ply) return scored[0].e.seq;
  let best = scored[0].e.seq, bestV = -Infinity;
  for (const { e, s } of scored.slice(0, L.ply)) {
    if (s >= 1e9) return e.seq;
    let v = 0;
    for (const [d1, d2, w] of ROLLS) v -= w * bestReply(e.board, 1 - p, [d1, d2]);
    if (v > bestV) { bestV = v; best = e.seq; }
  }
  return best;
}
/** Rough chance that p wins, used for doubling-cube decisions. */
export function winChance(b: Board, p: number): number {
  if (!contact(b)) {
    const mine = pips(b, p) - 4, theirs = pips(b, 1 - p);
    return 1 / (1 + Math.exp((mine - theirs) / Math.max(6, theirs * 0.09)));
  }
  return 1 / (1 + Math.exp(-evaluate(b, p) / 28));
}

export interface TavlaState { board: Board; turn: 0 | 1; roll: number[]; }
export const tavlaRules: GameModule<TavlaState, Step[]> = {
  id: 'tavla',
  initializeGame: () => ({ board: initialBoard(), turn: 0, roll: [] }),
  validateMove: (st, seq) => sequences(st.board, st.turn, st.roll).some(q => JSON.stringify(q) === JSON.stringify(seq)),
  applyMove: (st, seq) => ({ board: seq.reduce((bd, s) => applyStep(bd, st.turn, s), st.board), turn: (1 - st.turn) as 0 | 1, roll: [] }),
  getLegalMoves: st => sequences(st.board, st.turn, st.roll),
  checkGameOver: st => winner(st.board) >= 0,
  calculateResult: st => { const w = winner(st.board); return w < 0 ? null : { winner: w, draw: false, detail: gameValue(st.board, w) === 2 ? 'mars' : 'single' }; },
  serializeState: st => JSON.stringify(st), deserializeState: raw => JSON.parse(raw) as TavlaState,
};
