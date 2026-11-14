/**
 * Dama (Turkish draughts) on an 8×8 board. cells[r * 8 + c], row 0 at the top.
 * 1 white man, 2 white king, -1 black man, -2 black king. White starts on rows 5–6 and
 * moves up; Black starts on rows 1–2 and moves down. White moves first.
 *
 * Men move and capture one square forward or sideways, never backward or diagonally.
 * Kings move any distance orthogonally and capture a piece at any distance, landing on
 * any empty square beyond it. Capturing is compulsory and the sequence that takes the
 * most pieces must be chosen. Captured pieces leave the board at once, and a king may not
 * reverse direction between two captures. A man that ends its move on the far row is
 * crowned.
 */
import type { GameModule } from '../../core/game';
import type { Level } from '../../core/match';

export const N = 8;
export interface DMove { path: number[]; captured: number[] }
export interface DState { cells: number[]; turn: 1 | -1; quiet: number; history: DMove[] }
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function initial(): number[] {
  const c = new Array(64).fill(0);
  for (let i = 8; i < 24; i++) c[i] = -1;
  for (let i = 40; i < 56; i++) c[i] = 1;
  return c;
}
export const newGame = (): DState => ({ cells: initial(), turn: 1, quiet: 0, history: [] });
const inside = (r: number, c: number) => r >= 0 && r < N && c >= 0 && c < N;
const owner = (v: number) => Math.sign(v);
const manDirs = (side: number) => DIRS.filter(([dr]) => dr !== side); // white (1) moves up: no dr = +1

function captures(cells: number[], from: number, side: number): DMove[] {
  const king = Math.abs(cells[from]) === 2, out: DMove[] = [];
  const rec = (b: number[], at: number, path: number[], taken: number[], lastDir: number[] | null) => {
    let extended = false;
    const r0 = Math.floor(at / N), c0 = at % N;
    for (const d of king ? DIRS : manDirs(side)) {
      if (lastDir && d[0] === -lastDir[0] && d[1] === -lastDir[1]) continue;
      let r = r0 + d[0], c = c0 + d[1];
      if (king) while (inside(r, c) && b[r * N + c] === 0) { r += d[0]; c += d[1]; }
      if (!inside(r, c) || owner(b[r * N + c]) !== -side) continue;
      const victim = r * N + c;
      let lr = r + d[0], lc = c + d[1];
      while (inside(lr, lc) && b[lr * N + lc] === 0) {
        const land = lr * N + lc, nb = b.slice();
        nb[land] = nb[at]; nb[at] = 0; nb[victim] = 0;
        extended = true;
        rec(nb, land, [...path, land], [...taken, victim], d);
        if (!king) break;
        lr += d[0]; lc += d[1];
      }
    }
    if (!extended && taken.length) out.push({ path, captured: taken });
  };
  rec(cells, from, [from], [], null);
  return out;
}

export function legalMoves(st: DState): DMove[] {
  const { cells, turn } = st;
  let caps: DMove[] = [];
  for (let i = 0; i < 64; i++) if (owner(cells[i]) === turn) caps = caps.concat(captures(cells, i, turn));
  if (caps.length) {
    const most = Math.max(...caps.map(m => m.captured.length));
    return caps.filter(m => m.captured.length === most);
  }
  const out: DMove[] = [];
  for (let i = 0; i < 64; i++) {
    if (owner(cells[i]) !== turn) continue;
    const king = Math.abs(cells[i]) === 2, r0 = Math.floor(i / N), c0 = i % N;
    for (const d of king ? DIRS : manDirs(turn)) {
      let r = r0 + d[0], c = c0 + d[1];
      while (inside(r, c) && cells[r * N + c] === 0) {
        out.push({ path: [i, r * N + c], captured: [] });
        if (!king) break;
        r += d[0]; c += d[1];
      }
    }
  }
  return out;
}
export const sameMove = (a: DMove, b: DMove) => a.path.length === b.path.length && a.path.every((x, i) => x === b.path[i]) && a.captured.every((x, i) => x === b.captured[i]);
export const isLegal = (st: DState, m: DMove) => outcome(st) === null && legalMoves(st).some(x => sameMove(x, m));

export function play(st: DState, m: DMove): DState {
  const cells = st.cells.slice(), from = m.path[0], to = m.path[m.path.length - 1];
  const piece = cells[from], wasMan = Math.abs(piece) === 1;
  cells[from] = 0;
  for (const v of m.captured) cells[v] = 0;
  const row = Math.floor(to / N);
  cells[to] = wasMan && ((piece > 0 && row === 0) || (piece < 0 && row === N - 1)) ? piece * 2 : piece;
  return { cells, turn: (-st.turn) as 1 | -1, quiet: m.captured.length || wasMan ? 0 : st.quiet + 1, history: [...st.history, m] };
}
export const replay = (moves: DMove[]) => moves.reduce(play, newGame());

/** 1 white wins, -1 black wins, 0 draw, null still playing. */
export function outcome(st: DState): 1 | -1 | 0 | null {
  const mine = st.cells.filter(v => owner(v) === st.turn), theirs = st.cells.filter(v => owner(v) === -st.turn);
  if (!mine.length) return (-st.turn) as 1 | -1;
  // A lone king against a lone king or a lone man is a draw by convention.
  if (mine.length === 1 && theirs.length === 1 && (Math.abs(mine[0]) === 2 || Math.abs(theirs[0]) === 2)) return 0;
  // To stop endless king shuffles: 50 moves in a row with no capture and no man moved is a draw.
  if (st.quiet >= 50) return 0;
  if (!legalMoves(st).length) return (-st.turn) as 1 | -1;
  return null;
}

// ---- AI: negamax with alpha-beta and iterative deepening ----
export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0, ms: 0 }, { name: 'Easy', rating: 900, depth: 2, ms: 0 },
  { name: 'Intermediate', rating: 1150, depth: 4, ms: 500 }, { name: 'Advanced', rating: 1400, depth: 6, ms: 1000 },
  { name: 'Expert', rating: 1650, depth: 10, ms: 1800 },
];
function evaluate(cells: number[], side: number): number {
  let s = 0;
  for (let i = 0; i < 64; i++) {
    const v = cells[i];
    if (!v) continue;
    const r = Math.floor(i / N), c = i % N;
    let w = Math.abs(v) === 2 ? 320 : 100;
    if (Math.abs(v) === 1) w += (v > 0 ? 6 - r : r - 1) * 4 + (c >= 2 && c <= 5 ? 2 : 0);
    s += owner(v) === side ? w : -w;
  }
  return s;
}
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export function chooseMove(st: DState, level: number, opts: { rng?: () => number; timeScale?: number; depth?: number } = {}): DMove {
  const rng = opts.rng ?? Math.random, P = opts.depth ? { ...LEVELS[level], depth: opts.depth, ms: 0 } : LEVELS[level];
  const moves = legalMoves(st);
  if (moves.length === 1 || P.depth === 0) return moves[Math.floor(rng() * moves.length)];
  const deadline = P.ms ? now() + P.ms * (opts.timeScale ?? 1) : Infinity;
  let nodes = 0, aborted = false;
  const search = (s: DState, depth: number, alpha: number, beta: number): number => {
    if ((++nodes & 1023) === 0 && now() > deadline) aborted = true;
    if (aborted) return 0;
    const res = outcome(s);
    if (res !== null) return res === 0 ? 0 : res === s.turn ? 1e6 : -1e6 - depth;
    if (depth === 0) return evaluate(s.cells, s.turn);
    let best = -Infinity;
    for (const m of legalMoves(s)) {
      const v = -search(play(s, m), depth - 1, -beta, -alpha);
      if (v > best) best = v;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  };
  let order = moves.slice().sort(() => rng() - 0.5), best = order[0];
  for (let d = P.ms ? 1 : P.depth; d <= P.depth; d++) {
    let alpha = -Infinity, bestD = order[0], bestV = -Infinity;
    for (const m of order) {
      const v = -search(play(st, m), d - 1, -Infinity, -alpha);
      if (aborted) break;
      if (v > bestV) { bestV = v; bestD = m; }
      if (v > alpha) alpha = v;
    }
    if (aborted) break;
    best = bestD;
    order = [best, ...order.filter(m => m !== best)];
    if (Math.abs(bestV) >= 1e6) break;
  }
  return best;
}

export const damaRules: GameModule<DState, DMove> = {
  id: 'dama', initializeGame: newGame, validateMove: isLegal, applyMove: (s, m) => (isLegal(s, m) ? play(s, m) : s),
  undoMove: s => replay(s.history.slice(0, -1)), getLegalMoves: legalMoves,
  checkGameOver: s => outcome(s) !== null,
  calculateResult: s => { const o = outcome(s); return o === null ? null : o === 0 ? { winner: null, draw: true } : { winner: o === 1 ? 0 : 1, draw: false }; },
  serializeState: s => JSON.stringify(s.history), deserializeState: raw => replay(JSON.parse(raw)),
};
