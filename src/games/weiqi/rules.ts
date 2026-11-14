/**
 * Go (Weiqi) on 9×9 or 13×13 with Chinese area scoring and komi 6.5. A move is a point
 * index, or size² to pass. Simple ko is enforced and suicide is not allowed. Two passes in a
 * row end the game; dead stones are estimated by random playouts before counting.
 */
import type { Level } from '../../core/match';
import { mulberry32 } from '../../core/rng';

export const KOMI = 6.5;
export interface GState {
  n: number; cells: number[]; turn: 1 | 2; ko: number; passes: number; caps: [number, number];
  moves: number[]; winner: 0 | 1 | 2; draw: boolean; score: { black: number; white: number; dead: number[] } | null;
}
export function newGame(n = 9): GState { return { n, cells: new Array(n * n).fill(0), turn: 1, ko: -1, passes: 0, caps: [0, 0], moves: [], winner: 0, draw: false, score: null }; }
const nbrs = (n: number) => { const out: number[][] = []; for (let i = 0; i < n * n; i++) { const r = Math.floor(i / n), c = i % n, a: number[] = []; if (r) a.push(i - n); if (r < n - 1) a.push(i + n); if (c) a.push(i - 1); if (c < n - 1) a.push(i + 1); out.push(a); } return out; };
const NB: Record<number, number[][]> = {};
export const neighbours = (n: number) => (NB[n] ??= nbrs(n));
/** The group at i and whether it has a liberty; `libs` counts up to `stop`. */
function group(cells: ArrayLike<number>, n: number, i: number, stop = 99): { stones: number[]; libs: number } {
  const nb = neighbours(n), who = cells[i], seen = new Set([i]), stack = [i], stones: number[] = [], lib = new Set<number>();
  while (stack.length) {
    const x = stack.pop()!; stones.push(x);
    for (const y of nb[x]) { if (!cells[y]) { lib.add(y); if (lib.size >= stop) return { stones, libs: lib.size }; } else if (cells[y] === who && !seen.has(y)) { seen.add(y); stack.push(y); } }
  }
  return { stones, libs: lib.size };
}
export const libertiesOf = (cells: ArrayLike<number>, n: number, i: number) => group(cells, n, i).libs;
/** Places a stone; returns the new cells and captures, or null when illegal. */
export function place(cells: number[], n: number, i: number, who: number, ko: number): { cells: number[]; captured: number; ko: number } | null {
  if (cells[i] || i === ko) return null;
  const c = cells.slice(); c[i] = who; let captured = 0, lastCap = -1;
  for (const y of neighbours(n)[i]) if (c[y] === 3 - who) { const g = group(c, n, y, 1); if (!g.libs) { for (const s of g.stones) c[s] = 0; captured += g.stones.length; lastCap = g.stones[0]; } }
  const me = group(c, n, i, 1);
  if (!me.libs) return null;
  // Ko: a single stone that took a single stone, and now has one liberty.
  const newKo = captured === 1 && me.stones.length === 1 && group(c, n, i, 2).libs === 1 ? lastCap : -1;
  return { cells: c, captured, ko: newKo };
}
export function legal(st: GState): number[] {
  if (st.winner || st.draw) return [];
  const out: number[] = [];
  for (let i = 0; i < st.n * st.n; i++) if (place(st.cells, st.n, i, st.turn, st.ko)) out.push(i);
  out.push(st.n * st.n);
  return out;
}
export function play(st: GState, m: number): GState {
  if (st.winner || st.draw) return st;
  const P = st.n * st.n;
  if (m === P) {
    const next = { ...st, turn: (3 - st.turn) as 1 | 2, ko: -1, passes: st.passes + 1, moves: [...st.moves, m] };
    return next.passes >= 2 ? finishGame(next) : next;
  }
  const r = place(st.cells, st.n, m, st.turn, st.ko); if (!r) return st;
  const caps = st.caps.slice() as [number, number]; caps[st.turn - 1] += r.captured;
  return { ...st, cells: r.cells, turn: (3 - st.turn) as 1 | 2, ko: r.ko, passes: 0, caps, moves: [...st.moves, m] };
}
export const replay = (moves: number[], n = 9) => moves.reduce(play, newGame(n));
/** Is i an eye of `who`: all neighbours own stones and most diagonals too? */
function isEye(cells: ArrayLike<number>, n: number, i: number, who: number): boolean {
  if (cells[i]) return false;
  for (const y of neighbours(n)[i]) if (cells[y] !== who) return false;
  const r = Math.floor(i / n), c = i % n; let bad = 0, edge = false;
  for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const rr = r + dr, cc = c + dc; if (rr < 0 || cc < 0 || rr >= n || cc >= n) { edge = true; continue; } if (cells[rr * n + cc] === 3 - who) bad++; }
  return edge ? bad === 0 : bad <= 1;
}
/** Area score: stones plus empty regions bordered by one colour only. */
export function area(cells: ArrayLike<number>, n: number): [number, number] {
  const nb = neighbours(n), s = [0, 0], seen = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) {
    if (cells[i]) { s[cells[i] - 1]++; continue; }
    if (seen[i]) continue;
    const stack = [i], region: number[] = []; let touch = 0; seen[i] = 1;
    while (stack.length) { const x = stack.pop()!; region.push(x); for (const y of nb[x]) { if (cells[y]) touch |= cells[y]; else if (!seen[y]) { seen[y] = 1; stack.push(y); } } }
    if (touch === 1) s[0] += region.length; else if (touch === 2) s[1] += region.length;
  }
  return [s[0], s[1]];
}
/** One random game to the end, never filling its own eyes. Returns the final cells. */
function playout(cells0: number[], n: number, turn: number, ko: number, rng: () => number): number[] {
  let cells = cells0.slice(), who = turn, passes = 0, k = ko;
  const P = n * n, limit = P * 3;
  for (let t = 0; t < limit && passes < 2; t++) {
    let moved = false;
    const start = Math.floor(rng() * P);
    for (let j = 0; j < P; j++) {
      const i = (start + j * 7) % P;
      if (cells[i] || isEye(cells, n, i, who)) continue;
      const r = place(cells, n, i, who, k);
      if (!r) continue;
      cells = r.cells; k = r.ko; moved = true; break;
    }
    passes = moved ? 0 : passes + 1; if (!moved) k = -1;
    who = 3 - who;
  }
  return cells;
}
/** Fraction of playouts in which each point ends up Black (+1) or White (−1). */
export function ownership(st: GState, runs: number, seed = 1): number[] {
  const rng = mulberry32(seed), own = new Array(st.n * st.n).fill(0), nb = neighbours(st.n);
  for (let k = 0; k < runs; k++) {
    const end = playout(st.cells, st.n, st.turn, st.ko, rng);
    for (let i = 0; i < end.length; i++) {
      let v = end[i];
      if (!v) { const t = nb[i].map(y => end[y]).filter(Boolean); v = t.length && t.every(x => x === t[0]) ? t[0] : 0; }
      own[i] += v === 1 ? 1 : v === 2 ? -1 : 0;
    }
  }
  return own.map(x => x / runs);
}
/** Count the game: stones the playouts say are dead come off first. */
export function count(st: GState) {
  const own = ownership(st, 120, st.moves.length + 7), dead: number[] = [];
  const cells = st.cells.slice();
  for (let i = 0; i < cells.length; i++) if (cells[i] && (cells[i] === 1 ? own[i] < -0.4 : own[i] > 0.4)) { dead.push(i); cells[i] = 0; }
  const [b, w] = area(cells, st.n);
  return { black: b, white: w + KOMI, dead };
}
function finishGame(st: GState): GState {
  const sc = count(st);
  return { ...st, score: sc, winner: sc.black > sc.white ? 1 : 2 };
}

// ---- Computer: flat Monte Carlo with UCB at the root, plus a few shape rules ----
export const LEVELS: (Level & { runs: number })[] = [
  { name: 'Beginner', rating: 700, runs: 120 }, { name: 'Easy', rating: 950, runs: 350 }, { name: 'Intermediate', rating: 1200, runs: 800 },
  { name: 'Advanced', rating: 1450, runs: 1500 }, { name: 'Expert', rating: 1700, runs: 2400 },
];
export function chooseMove(st: GState, level: number, seed = Date.now()): number {
  const n = st.n, P = n * n, who = st.turn, rng = mulberry32(seed >>> 0);
  const cands: number[] = [];
  for (let i = 0; i < P; i++) if (!st.cells[i] && !isEye(st.cells, n, i, who) && place(st.cells, n, i, who, st.ko)) cands.push(i);
  // Opponent passed and we are ahead on the board: pass to finish.
  if (st.passes === 1) { const sc = count(st); if ((who === 1 ? sc.black - sc.white : sc.white - sc.black) > 0) return P; }
  if (!cands.length) return P;
  // Urgent: capture, or save a group in atari.
  const nb = neighbours(n);
  for (const i of cands) {
    for (const y of nb[i]) if (st.cells[y] === 3 - who && libertiesOf(st.cells, n, y) === 1 && level >= 1) return i;
  }
  const runs = Math.round(LEVELS[level].runs * (n === 9 ? 1 : 0.45));
  const w = new Array(cands.length).fill(0), v = new Array(cands.length).fill(0);
  for (let k = 0; k < runs; k++) {
    let bi = 0, bu = -Infinity;
    for (let j = 0; j < cands.length; j++) { const u = v[j] ? w[j] / v[j] + Math.sqrt(2 * Math.log(k + 1) / v[j]) : 1e9 + rng(); if (u > bu) { bu = u; bi = j; } }
    const r = place(st.cells, n, cands[bi], who, st.ko)!;
    const end = playout(r.cells, n, 3 - who, r.ko, rng);
    const [b, wh] = area(end, n), win = who === 1 ? b > wh + KOMI : wh + KOMI > b;
    v[bi]++; if (win) w[bi]++;
  }
  let best = 0; for (let j = 1; j < cands.length; j++) if (v[j] > v[best]) best = j;
  // Hopeless positions: pass rather than fill our own territory.
  if (w[best] / Math.max(1, v[best]) < 0.03 && st.moves.length > P) return P;
  return cands[best];
}
/** Daily puzzles: the move that captures the most stones, if it is unique. */
export function bestCapture(st: GState): { moves: number[]; stones: number } {
  let best = 0, moves: number[] = [];
  for (let i = 0; i < st.n * st.n; i++) { const r = place(st.cells, st.n, i, st.turn, st.ko); if (!r || !r.captured) continue; if (r.captured > best) { best = r.captured; moves = [i]; } else if (r.captured === best) moves.push(i); }
  return { moves, stones: best };
}
