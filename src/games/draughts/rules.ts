/**
 * International draughts on the 10×10 board: men move diagonally forward and capture in all
 * four diagonal directions; kings fly along whole diagonals; capturing is compulsory and you
 * must take the most pieces possible. A man is crowned only if it ends its move on the far row.
 *
 * Cells 0–99, row 0 at the top. White (1, king 2) starts at the bottom and moves first;
 * black is −1 / −2.
 */
import type { Level } from '../../core/match';

export const N = 10;
export interface XMove { path: number[]; captured: number[] }
export interface XState { cells: number[]; turn: 1 | -1; quiet: number; history: XMove[] }
const dark = (i: number) => (Math.floor(i / N) + (i % N)) % 2 === 1;
export function initial(): number[] {
  const c = new Array(N * N).fill(0);
  for (let i = 0; i < N * N; i++) if (dark(i)) { const r = Math.floor(i / N); if (r < 4) c[i] = -1; else if (r > 5) c[i] = 1; }
  return c;
}
export const newGame = (): XState => ({ cells: initial(), turn: 1, quiet: 0, history: [] });
const DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const at = (r: number, c: number) => (r >= 0 && r < N && c >= 0 && c < N ? r * N + c : -1);
const side = (v: number) => Math.sign(v);

function captures(cells: number[], from: number, piece: number): XMove[] {
  const out: XMove[] = [], king = Math.abs(piece) === 2, me = side(piece);
  const go = (pos: number, path: number[], taken: number[]) => {
    let extended = false;
    const r0 = Math.floor(pos / N), c0 = pos % N;
    for (const [dr, dc] of DIRS) {
      let r = r0 + dr, c = c0 + dc;
      if (king) while (at(r, c) >= 0 && (cells[at(r, c)] === 0 || at(r, c) === from)) { r += dr; c += dc; }
      const j = at(r, c);
      if (j < 0 || side(cells[j]) !== -me || taken.includes(j)) continue;
      // Land beyond the captured piece: one square for a man, any free square for a king.
      let lr = r + dr, lc = c + dc;
      while (at(lr, lc) >= 0 && (cells[at(lr, lc)] === 0 || at(lr, lc) === from)) {
        extended = true;
        go(at(lr, lc), [...path, at(lr, lc)], [...taken, j]);
        if (!king) break;
        lr += dr; lc += dc;
      }
    }
    if (!extended && taken.length) out.push({ path, captured: taken });
  };
  go(from, [from], []);
  return out;
}
export function legalMoves(st: XState): XMove[] {
  const caps: XMove[] = [], quiet: XMove[] = [];
  st.cells.forEach((v, i) => {
    if (side(v) !== st.turn) return;
    caps.push(...captures(st.cells, i, v));
    const r0 = Math.floor(i / N), c0 = i % N, king = Math.abs(v) === 2;
    for (const [dr, dc] of DIRS) {
      if (!king && dr !== -st.turn) continue; // white goes up (−1), black down (+1)
      let r = r0 + dr, c = c0 + dc;
      while (at(r, c) >= 0 && st.cells[at(r, c)] === 0) { quiet.push({ path: [i, at(r, c)], captured: [] }); if (!king) break; r += dr; c += dc; }
    }
  });
  if (!caps.length) return quiet;
  const most = Math.max(...caps.map(m => m.captured.length));
  // The same jumps by another route are the same move.
  const seen = new Set<string>(), best: XMove[] = [];
  for (const m of caps) if (m.captured.length === most) { const k = m.path.join(',') + '|' + m.captured.slice().sort((a, b) => a - b).join(','); if (!seen.has(k)) { seen.add(k); best.push(m); } }
  return best;
}
export const sameMove = (a: XMove, b: XMove) => a.path.join() === b.path.join() && a.captured.join() === b.captured.join();
export function play(st: XState, m: XMove): XState {
  const cells = st.cells.slice(), from = m.path[0], to = m.path[m.path.length - 1], v = cells[from];
  cells[from] = 0; m.captured.forEach(i => { cells[i] = 0; });
  const r = Math.floor(to / N);
  cells[to] = Math.abs(v) === 1 && ((v > 0 && r === 0) || (v < 0 && r === N - 1)) ? v * 2 : v;
  const quiet = m.captured.length || Math.abs(v) === 1 ? 0 : st.quiet + 1;
  return { cells, turn: -st.turn as 1 | -1, quiet, history: [...st.history, m] };
}
export const replay = (moves: XMove[]) => moves.reduce(play, newGame());
/** 1 or −1 for a win, 0 for a draw, null while the game goes on. */
export function outcome(st: XState): 1 | -1 | 0 | null {
  const mine = st.cells.filter(v => side(v) === st.turn), theirs = st.cells.filter(v => side(v) === -st.turn);
  if (!mine.length) return -st.turn as 1 | -1;
  // Twenty-five moves each with only kings moving and nothing taken: a draw (the official rule).
  if (st.quiet >= 50) return 0;
  if (mine.length === 1 && theirs.length === 1 && Math.abs(mine[0]) === 2 && Math.abs(theirs[0]) === 2) return 0;
  if (!legalMoves(st).length) return -st.turn as 1 | -1;
  return null;
}

export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0, ms: 0 }, { name: 'Easy', rating: 900, depth: 2, ms: 0 },
  { name: 'Intermediate', rating: 1150, depth: 4, ms: 500 }, { name: 'Advanced', rating: 1400, depth: 6, ms: 1100 },
  { name: 'Expert', rating: 1650, depth: 9, ms: 2000 },
];
function evaluate(cells: number[], me: number): number {
  let s = 0;
  for (let i = 0; i < N * N; i++) {
    const v = cells[i]; if (!v) continue;
    const r = Math.floor(i / N), c = i % N;
    let w = Math.abs(v) === 2 ? 330 : 100;
    if (Math.abs(v) === 1) w += (v > 0 ? 9 - r : r) * 3 + (c >= 3 && c <= 6 ? 3 : 0) + ((v > 0 && r === 9) || (v < 0 && r === 0) ? 4 : 0);
    s += side(v) === me ? w : -w;
  }
  return s;
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export function chooseMove(st: XState, level: number, opts: { rng?: () => number; depth?: number; ms?: number } = {}): XMove {
  const rng = opts.rng ?? Math.random, P = { ...LEVELS[level], ...(opts.depth !== undefined ? { depth: opts.depth } : {}), ...(opts.ms !== undefined ? { ms: opts.ms } : {}) };
  const moves = legalMoves(st);
  if (moves.length === 1 || P.depth === 0) return moves[Math.floor(rng() * moves.length)];
  const deadline = P.ms ? now() + P.ms : Infinity;
  let nodes = 0, aborted = false;
  const search = (s: XState, depth: number, alpha: number, beta: number): number => {
    if ((++nodes & 511) === 0 && now() > deadline) aborted = true;
    if (aborted) return 0;
    const res = outcome(s);
    if (res !== null) return res === 0 ? 0 : res === s.turn ? 1e6 + depth : -1e6 - depth;
    const ms = legalMoves(s);
    // Keep searching through forced captures so a trade is not cut off halfway.
    if (depth <= 0 && !ms[0]?.captured.length) return evaluate(s.cells, s.turn);
    if (depth < -6) return evaluate(s.cells, s.turn);
    let best = -Infinity;
    for (const m of ms) {
      const v = -search(play(s, m), depth - 1, -beta, -alpha);
      if (v > best) best = v; if (best > alpha) alpha = best; if (alpha >= beta) break;
    }
    return best;
  };
  let order = moves.slice().sort(() => rng() - 0.5), best = order[0];
  for (let d = P.ms ? 1 : P.depth; d <= P.depth; d++) {
    let alpha = -Infinity, bestD = order[0], bestV = -Infinity;
    for (const m of order) {
      const v = -search(play(st, m), d - 1, -Infinity, -alpha);
      if (aborted) break;
      if (v > bestV) { bestV = v; bestD = m; } if (v > alpha) alpha = v;
    }
    if (aborted) break;
    best = bestD; order = [best, ...order.filter(m => m !== best)];
    if (Math.abs(bestV) >= 1e6) break;
  }
  return best;
}
