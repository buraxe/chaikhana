/**
 * Gomoku engine.
 *
 * Evaluation: every run of five adjacent points on the board is a "window". A window
 * holding stones of only one colour is worth more the fuller it is; a window holding
 * both colours is dead and worth nothing. The counts are kept up to date move by move.
 *
 * Search: negamax with alpha-beta pruning and iterative deepening over the most
 * promising moves near existing stones. Stronger levels first run a threat-space
 * search for a VCF — a win by continuous fours, where every move forces one reply.
 *
 * Levels differ in what they can see (depth, width, threat search), not in dice rolls.
 */
import { DIRS, N, isForbidden, isWinAt, type GomokuState, type Mode } from './rules';

const WINDOWS: number[][] = [];
const CELL_WINDOWS: number[][] = Array.from({ length: N * N }, () => []);
for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) for (const [dx, dy] of DIRS) {
  const ex = x + 4 * dx, ey = y + 4 * dy;
  if (ex < 0 || ex >= N || ey < 0 || ey >= N) continue;
  const w: number[] = [];
  for (let k = 0; k < 5; k++) w.push((y + dy * k) * N + x + dx * k);
  for (const i of w) CELL_WINDOWS[i].push(WINDOWS.length);
  WINDOWS.push(w);
}

const VAL = [0, 1, 12, 140, 1600, 1e6];
const ATT = [1, 14, 160, 2200, 1e7];
const DEF = [0, 9, 110, 1500, 1e6];
/** The beginner only reacts to fours; it does not see threes coming. */
const DEF_BEGINNER = [0, 2, 10, 60, 1e6];
const WIN = 1e8, INF = 1e9;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export const LEVELS = [
  { name: 'Beginner', rating: 700, depth: 0, width: 6, ms: 0, vcf: 0 },
  { name: 'Easy', rating: 950, depth: 1, width: 7, ms: 200, vcf: 0 },
  { name: 'Intermediate', rating: 1200, depth: 3, width: 8, ms: 500, vcf: 0 },
  { name: 'Advanced', rating: 1450, depth: 5, width: 9, ms: 900, vcf: 6 },
  { name: 'Expert', rating: 1700, depth: 8, width: 11, ms: 1600, vcf: 12 },
];

interface Scored { i: number; s: number }

export class Engine {
  b = new Uint8Array(N * N);
  private c1 = new Uint8Array(WINDOWS.length);
  private c2 = new Uint8Array(WINDOWS.length);
  private near = new Uint8Array(N * N);
  private score = 0;
  private n4 = [0, 0, 0];
  private nodes = 0;
  deadline = Infinity;
  aborted = false;
  constructor(public mode: Mode) {}

  private contrib(w: number, sign: number) {
    const a = this.c1[w], d = this.c2[w];
    if (a && d) return;
    if (a) { this.score += sign * VAL[a]; if (a === 4) this.n4[1] += sign; }
    else if (d) { this.score -= sign * VAL[d]; if (d === 4) this.n4[2] += sign; }
  }
  private touch(i: number, d: number) {
    const x = i % N, y = Math.floor(i / N);
    for (let yy = Math.max(0, y - 2); yy <= Math.min(N - 1, y + 2); yy++)
      for (let xx = Math.max(0, x - 2); xx <= Math.min(N - 1, x + 2); xx++) this.near[yy * N + xx] += d;
  }
  place(i: number, c: number) {
    this.b[i] = c;
    for (const w of CELL_WINDOWS[i]) { this.contrib(w, -1); if (c === 1) this.c1[w]++; else this.c2[w]++; this.contrib(w, 1); }
    this.touch(i, 1);
  }
  unplace(i: number) {
    const c = this.b[i];
    for (const w of CELL_WINDOWS[i]) { this.contrib(w, -1); if (c === 1) this.c1[w]--; else this.c2[w]--; this.contrib(w, 1); }
    this.b[i] = 0;
    this.touch(i, -1);
  }
  isWin(i: number) { return isWinAt(this.b, i, this.mode); }
  private illegal(i: number, color: number) { return this.mode === 'renju' && color === 1 && isForbidden(this.b, i); }

  /** Candidate moves for `color`, best first. Forced replies cut the list down. */
  gen(color: number, width: number, def = DEF): Scored[] {
    const own = color === 1 ? this.c1 : this.c2, opp = color === 1 ? this.c2 : this.c1;
    const all: Scored[] = [];
    for (let i = 0; i < N * N; i++) {
      if (this.b[i] !== 0 || !this.near[i]) continue;
      let s = 0;
      for (const w of CELL_WINDOWS[i]) {
        const a = own[w], d = opp[w];
        if (d === 0) s += ATT[a]; else if (a === 0) s += def[d];
      }
      all.push({ i, s });
    }
    all.sort((p, q) => q.s - p.s);
    const forced = all.length > 0 && all[0].s >= def[4];
    const out: Scored[] = [];
    for (const m of all) {
      if (out.length >= width || (forced && m.s < def[4])) break;
      if (!this.illegal(m.i, color)) out.push(m);
    }
    return out;
  }

  /** Empty points where `color` wins at once. */
  fivePoints(color: number): number[] {
    const own = color === 1 ? this.c1 : this.c2, opp = color === 1 ? this.c2 : this.c1;
    const set = new Set<number>();
    for (let w = 0; w < WINDOWS.length; w++) {
      if (own[w] === 4 && opp[w] === 0) for (const i of WINDOWS[w]) if (this.b[i] === 0) set.add(i);
    }
    const out: number[] = [];
    for (const i of set) { this.b[i] = color; if (this.isWin(i)) out.push(i); this.b[i] = 0; }
    return out;
  }

  /** Threat-space search: can `color` win by playing only fours? Returns the first move or -1. */
  vcf(color: number, depth: number): number {
    if ((++this.nodes & 31) === 0 && now() > this.deadline) this.aborted = true;
    if (this.aborted) return -1;
    const other = 3 - color;
    const mine = this.fivePoints(color);
    if (mine.length) return mine[0];
    if (depth <= 0) return -1;
    const threat = this.fivePoints(other);
    if (threat.length > 1) return -1;
    const own = color === 1 ? this.c1 : this.c2, opp = color === 1 ? this.c2 : this.c1;
    const cand = new Set<number>();
    for (let w = 0; w < WINDOWS.length; w++) {
      if (own[w] === 3 && opp[w] === 0) for (const i of WINDOWS[w]) if (this.b[i] === 0) cand.add(i);
    }
    for (const m of cand) {
      if ((threat.length && m !== threat[0]) || this.illegal(m, color)) continue;
      this.place(m, color);
      const fp = this.fivePoints(color);
      let win = fp.length >= 2;
      if (fp.length === 1) {
        const block = fp[0];
        this.place(block, other);
        if (!this.isWin(block) && this.vcf(color, depth - 1) >= 0) win = true;
        this.unplace(block);
      }
      this.unplace(m);
      if (win && !this.aborted) return m;
    }
    return -1;
  }

  negamax(depth: number, alpha: number, beta: number, color: number, ply: number, width: number): number {
    if ((++this.nodes & 1023) === 0 && now() > this.deadline) this.aborted = true;
    if (this.aborted) return 0;
    if (depth === 0) {
      if (this.n4[color] > 0) return WIN - ply - 1; // side to move completes a five
      return color === 1 ? this.score : -this.score;
    }
    const moves = this.gen(color, width);
    if (!moves.length) return 0;
    let best = -INF;
    for (const m of moves) {
      this.place(m.i, color);
      const s = this.isWin(m.i) ? WIN - ply : -this.negamax(depth - 1, -beta, -alpha, 3 - color, ply + 1, width);
      this.unplace(m.i);
      if (s > best) best = s;
      if (best > alpha) alpha = best;
      if (alpha >= beta) break;
    }
    return best;
  }
}

export function chooseMove(st: GomokuState, level: number,
  opts: { rng?: () => number; timeScale?: number } = {}): number {
  const rng = opts.rng ?? Math.random, scale = opts.timeScale ?? 1;
  const P = LEVELS[level], color = st.turn, renju = st.mode === 'renju';
  if (!st.moves.length) return 7 * N + 7;
  const e = new Engine(st.mode);
  st.moves.forEach((m, k) => e.place(m, k % 2 === 0 ? 1 : 2));
  const legal = (i: number) => e.b[i] === 0 && !(renju && color === 1 && isForbidden(e.b, i));
  const anyLegal = () => { for (let i = 0; i < N * N; i++) if (legal(i)) return i; return -1; };

  if (st.moves.length === 1) {
    const x = st.moves[0] % N, y = Math.floor(st.moves[0] / N), opts8: number[] = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if ((dx || dy) && xx >= 0 && yy >= 0 && xx < N && yy < N) opts8.push(yy * N + xx);
    }
    return opts8[Math.floor(rng() * opts8.length)];
  }

  if (P.depth === 0) {
    const moves = e.gen(color, P.width, DEF_BEGINNER);
    if (!moves.length) return anyLegal();
    if (moves[0].s >= 1e6) return moves[0].i;
    const pool = moves.filter(m => m.s >= moves[0].s * 0.7).slice(0, 3);
    return pool[Math.floor(rng() * pool.length)].i;
  }

  const mine = e.fivePoints(color);
  if (mine.length) return mine[0];
  const block = e.fivePoints(3 - color).filter(legal);
  if (block.length) return block[0];

  if (P.vcf) {
    e.deadline = now() + 400 * scale;
    const v = e.vcf(color, P.vcf);
    if (v >= 0 && !e.aborted) return v;
    e.aborted = false;
  }

  let moves = e.gen(color, P.width);
  if (!moves.length) return anyLegal();
  if (moves.length === 1) return moves[0].i;
  moves = moves.map(m => ({ i: m.i, s: m.s * (1 + rng() * 0.04) })).sort((p, q) => q.s - p.s);
  let best = moves[0].i;
  e.deadline = now() + P.ms * scale;
  for (let d = 2; d <= P.depth; d += 2) {
    let alpha = -INF, bestD = -1, bestS = -INF;
    for (const m of moves) {
      e.place(m.i, color);
      const s = e.isWin(m.i) ? WIN : -e.negamax(d - 1, -INF, -alpha, 3 - color, 1, P.width);
      e.unplace(m.i);
      if (e.aborted) break;
      if (s > bestS) { bestS = s; bestD = m.i; }
      if (s > alpha) alpha = s;
    }
    if (e.aborted) break;
    best = bestD;
    moves = [moves.find(m => m.i === best)!, ...moves.filter(m => m.i !== best)];
    if (Math.abs(bestS) >= WIN - 1000) break;
  }
  return best;
}
