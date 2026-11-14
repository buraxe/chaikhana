import type { Level } from '../../core/match';

/**
 * Dokuz Taş (Nine Men's Morris). Points 0–23: three squares of eight, numbered clockwise
 * from each square's top-left corner, outer square first. A move is one number:
 * (from * 24 + to) * 25 + remove, with from = 24 for a placement and remove = 24 for none.
 */
export interface NState { cells: number[]; hand: [number, number, number]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; quiet: number }
export const NONE = 24;
export const enc = (from: number, to: number, rem: number) => (from * 24 + to) * 25 + rem;
export const dec = (m: number) => ({ from: Math.floor(m / 25 / 24), to: Math.floor(m / 25) % 24, rem: m % 25 });

/** Coordinates on a 6×6 grid, for drawing. */
export const XY: [number, number][] = [];
for (const s of [0, 1, 2]) { const a = s, b = 6 - s, c = 3; XY.push([a, a], [c, a], [b, a], [b, c], [b, b], [c, b], [a, b], [a, c]); }
export const ADJ: number[][] = Array.from({ length: 24 }, () => []);
const link = (a: number, b: number) => { ADJ[a].push(b); ADJ[b].push(a); };
for (let s = 0; s < 3; s++) for (let k = 0; k < 8; k++) link(s * 8 + k, s * 8 + ((k + 1) % 8));
for (const k of [1, 3, 5, 7]) { link(k, 8 + k); link(8 + k, 16 + k); }
export const MILLS: number[][] = [];
for (let s = 0; s < 3; s++) for (const k of [0, 2, 4, 6]) MILLS.push([s * 8 + k, s * 8 + k + 1, s * 8 + ((k + 2) % 8)]);
for (const k of [1, 3, 5, 7]) MILLS.push([k, 8 + k, 16 + k]);

export const newGame = (): NState => ({ cells: new Array(24).fill(0), hand: [0, 9, 9], moves: [], turn: 1, winner: 0, draw: false, quiet: 0 });
export const count = (st: { cells: number[]; hand: number[] }, p: number) => st.cells.filter(v => v === p).length + st.hand[p];
export const inMill = (cells: number[], i: number) => cells[i] !== 0 && MILLS.some(m => m.includes(i) && m.every(k => cells[k] === cells[i]));
export const flying = (st: NState, p: number) => st.hand[p] === 0 && st.cells.filter(v => v === p).length === 3;

export function legalMoves(st: NState): number[] {
  if (st.winner || st.draw) return [];
  const p = st.turn, o = 3 - p, out: number[] = [];
  const steps: [number, number][] = [];
  if (st.hand[p] > 0) { for (let i = 0; i < 24; i++) if (!st.cells[i]) steps.push([NONE, i]); }
  else for (let i = 0; i < 24; i++) {
    if (st.cells[i] !== p) continue;
    const targets = flying(st, p) ? st.cells.map((v, k) => (v ? -1 : k)).filter(k => k >= 0) : ADJ[i].filter(k => !st.cells[k]);
    for (const k of targets) steps.push([i, k]);
  }
  const theirs = st.cells.map((v, k) => (v === o ? k : -1)).filter(k => k >= 0);
  const free = theirs.filter(k => !inMill(st.cells, k));
  const removable = free.length ? free : theirs;
  for (const [f, t] of steps) {
    const c = st.cells.slice(); if (f !== NONE) c[f] = 0; c[t] = p;
    if (inMill(c, t) && removable.length) for (const r of removable) out.push(enc(f, t, r));
    else out.push(enc(f, t, NONE));
  }
  return out;
}
export const play = (st: NState, m: number): NState => (legalMoves(st).includes(m) ? apply(st, m) : st);
function apply(st: NState, m: number): NState {
  const { from, to, rem } = dec(m), p = st.turn, o = (3 - p) as 1 | 2;
  const cells = st.cells.slice(), hand: [number, number, number] = [0, st.hand[1], st.hand[2]];
  if (from === NONE) hand[p]--; else cells[from] = 0;
  cells[to] = p;
  if (rem !== NONE) cells[rem] = 0;
  const placing = st.hand[1] + st.hand[2] > 0;
  const next: NState = { cells, hand, moves: [...st.moves, m], turn: o, winner: 0, draw: false, quiet: rem !== NONE || placing ? 0 : st.quiet + 1 };
  if (count(next, o) < 3) next.winner = p;
  else if (!legalMoves(next).length) next.winner = p;
  else if (next.quiet >= 50) next.draw = true;
  return next;
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());

export const LEVELS: (Level & { depth: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0 }, { name: 'Easy', rating: 900, depth: 1 },
  { name: 'Intermediate', rating: 1150, depth: 2 }, { name: 'Advanced', rating: 1400, depth: 3 },
  { name: 'Expert', rating: 1650, depth: 4 },
];
function evaluate(st: NState, p: number): number {
  if (st.winner) return st.winner === p ? 10000 : -10000;
  if (st.draw) return 0;
  const o = 3 - p;
  let s = (count(st, p) - count(st, o)) * 100;
  for (const m of MILLS) {
    const mine = m.filter(k => st.cells[k] === p).length, theirs = m.filter(k => st.cells[k] === o).length;
    if (mine === 3) s += 12; else if (mine === 2 && !theirs) s += 8;
    if (theirs === 3) s -= 12; else if (theirs === 2 && !mine) s -= 8;
  }
  if (st.hand[1] + st.hand[2] === 0) {
    const mob = (q: number) => st.cells.reduce((a, v, i) => a + (v === q ? ADJ[i].filter(k => !st.cells[k]).length : 0), 0);
    s += (mob(p) - mob(o)) * 3;
  }
  return s;
}
function search(st: NState, depth: number, a: number, b: number, p: number): number {
  if (depth === 0 || st.winner || st.draw) return evaluate(st, p);
  const maxing = st.turn === p, ms = legalMoves(st);
  // Captures first: better pruning.
  ms.sort((x, y) => (y % 25 !== NONE ? 1 : 0) - (x % 25 !== NONE ? 1 : 0));
  let best = maxing ? -Infinity : Infinity;
  for (const m of ms) {
    const v = search(apply(st, m), depth - 1, a, b, p);
    if (maxing) { if (v > best) best = v; if (v > a) a = v; } else { if (v < best) best = v; if (v < b) b = v; }
    if (b <= a) break;
  }
  return best;
}
export function chooseMove(st: NState, level: number, rng: () => number = Math.random): number {
  const ms = legalMoves(st), L = LEVELS[level];
  if (ms.length <= 1 || L.depth === 0) return ms[Math.floor(rng() * ms.length)];
  let best = ms[0], bestV = -Infinity;
  for (const m of ms.sort(() => rng() - 0.5)) {
    const v = search(apply(st, m), L.depth - 1, -Infinity, Infinity, st.turn);
    if (v > bestV) { bestV = v; best = m; }
  }
  return best;
}
