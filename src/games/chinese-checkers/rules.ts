/**
 * Chinese checkers for two (跳棋): ten marbles each on the six-pointed star. A marble steps to
 * a neighbouring hole, or hops over one neighbouring marble (either colour) to the hole beyond,
 * and may chain hops. Bring all ten into the opposite point.
 *
 * Holes use cube coordinates (x, y, z), x + y + z = 0: the star is every point where all three
 * are ≥ −4 or all three are ≤ 4 (121 holes). Player 1 starts in the point z ≥ 5 (bottom) and
 * heads for z ≤ −5; player 2 the reverse.
 */
import type { Level } from '../../core/match';

export const HOLES: [number, number, number][] = [];
for (let x = -8; x <= 8; x++) for (let y = -8; y <= 8; y++) {
  const z = -x - y; if (z < -8 || z > 8) continue;
  if ((x >= -4 && y >= -4 && z >= -4) || (x <= 4 && y <= 4 && z <= 4)) HOLES.push([x, y, z]);
}
const IDX = new Map(HOLES.map((h, i) => [h.join(','), i]));
const DIRS: [number, number, number][] = [[1, -1, 0], [-1, 1, 0], [1, 0, -1], [-1, 0, 1], [0, 1, -1], [0, -1, 1]];
const nb = (i: number, d: [number, number, number], k = 1) => IDX.get([HOLES[i][0] + d[0] * k, HOLES[i][1] + d[1] * k, HOLES[i][2] + d[2] * k].join(',')) ?? -1;
export const HOME: Record<1 | 2, number[]> = { 1: HOLES.map((h, i) => (h[2] >= 5 ? i : -1)).filter(i => i >= 0), 2: HOLES.map((h, i) => (h[2] <= -5 ? i : -1)).filter(i => i >= 0) };
export const GOAL = { 1: HOME[2], 2: HOME[1] } as const;
const TIP = { 1: IDX.get('4,4,-8')!, 2: IDX.get('-4,-4,8')! };
/** Screen position of a hole: x across, y down (player 1's point at the bottom). */
export const xy = (i: number): [number, number] => { const [x, , z] = HOLES[i]; return [x + z / 2, z * 0.866]; };

export interface CMove { path: number[] }
export interface CState { cells: number[]; turn: 1 | 2; ply: number; history: CMove[] }
export function newGame(): CState { const cells = new Array(HOLES.length).fill(0); HOME[1].forEach(i => { cells[i] = 1; }); HOME[2].forEach(i => { cells[i] = 2; }); return { cells, turn: 1, ply: 0, history: [] }; }

/** Every destination of the marble at `from`, with one shortest path to it. */
export function movesFrom(cells: number[], from: number): CMove[] {
  const out: CMove[] = [];
  for (const d of DIRS) { const j = nb(from, d); if (j >= 0 && !cells[j]) out.push({ path: [from, j] }); }
  const seen = new Map<number, number[]>([[from, [from]]]), q = [from];
  while (q.length) {
    const p = q.shift()!;
    for (const d of DIRS) {
      const over = nb(p, d), land = nb(p, d, 2);
      if (over < 0 || land < 0 || !cells[over] || (cells[land] && land !== from) || seen.has(land)) continue;
      const path = [...seen.get(p)!, land]; seen.set(land, path); q.push(land); out.push({ path });
    }
  }
  return out.filter(m => m.path[m.path.length - 1] !== from);
}
export function legalMoves(st: CState): CMove[] {
  const out: CMove[] = [];
  st.cells.forEach((v, i) => { if (v === st.turn) for (const m of movesFrom(st.cells, i)) { const to = m.path[m.path.length - 1]; if (!out.some(o => o.path[0] === i && o.path[o.path.length - 1] === to)) out.push(m); } });
  return out;
}
export function play(st: CState, m: CMove): CState {
  const cells = st.cells.slice(); cells[m.path[m.path.length - 1]] = cells[m.path[0]]; cells[m.path[0]] = 0;
  return { cells, turn: st.turn === 1 ? 2 : 1, ply: st.ply + 1, history: [...st.history, m] };
}
export const replay = (moves: CMove[]) => moves.reduce(play, newGame());
/**
 * A side wins when its goal point is full and at least one marble there is its own. Usually
 * that means all ten are home; the rule also stops a player from blocking by leaving a marble
 * in the other's goal for ever. The side that has just moved is checked first.
 */
export function winner(st: CState): 0 | 1 | 2 {
  const last = st.turn === 1 ? 2 : 1;
  for (const p of [last, st.turn] as (1 | 2)[]) {
    const g = GOAL[p];
    if (g.every(i => st.cells[i]) && g.some(i => st.cells[i] === p)) return p;
  }
  return 0;
}
export const MAX_PLY = 400;

export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0, ms: 0 }, { name: 'Easy', rating: 900, depth: 1, ms: 0 },
  { name: 'Intermediate', rating: 1150, depth: 2, ms: 0 }, { name: 'Advanced', rating: 1400, depth: 3, ms: 900 },
  { name: 'Expert', rating: 1650, depth: 4, ms: 1800 },
];
const dist = (a: number, b: number) => { const p = HOLES[a], q = HOLES[b]; return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])); };
/** How far a side still has to go: distance to the far tip, with stragglers costing extra. */
function cost(cells: number[], p: 1 | 2): number {
  let s = 0, worst = 0;
  cells.forEach((v, i) => { if (v === p) { const d = dist(i, TIP[p]); s += d; worst = Math.max(worst, d); } });
  return s + worst * 1.5;
}
const evaluate = (cells: number[], me: 1 | 2) => cost(cells, me === 1 ? 2 : 1) - cost(cells, me);
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
export function chooseMove(st: CState, level: number, opts: { rng?: () => number; depth?: number } = {}): CMove {
  const rng = opts.rng ?? Math.random, P = { ...LEVELS[level], ...(opts.depth !== undefined ? { depth: opts.depth, ms: 0 } : {}) };
  const moves = legalMoves(st), me = st.turn;
  const gain = (m: CMove) => dist(m.path[0], TIP[me]) - dist(m.path[m.path.length - 1], TIP[me]);
  if (P.depth === 0) { const fwd = moves.filter(m => gain(m) > 0); const pool = fwd.length && rng() < 0.75 ? fwd : moves; return pool[Math.floor(rng() * pool.length)]; }
  // Only the most promising moves are searched at each level of the tree.
  const top = (s: CState, ms: CMove[], k: number) => ms.map(m => ({ m, g: dist(m.path[0], TIP[s.turn]) - dist(m.path[m.path.length - 1], TIP[s.turn]) })).sort((a, b) => b.g - a.g).slice(0, k).map(x => x.m);
  const deadline = P.ms ? now() + P.ms : Infinity; let aborted = false, nodes = 0;
  const search = (s: CState, depth: number, alpha: number, beta: number): number => {
    if ((++nodes & 255) === 0 && now() > deadline) aborted = true;
    if (aborted) return 0;
    const w = winner(s); if (w) return w === s.turn ? 1e5 + depth : -1e5 - depth;
    if (depth === 0) return evaluate(s.cells, s.turn);
    let best = -Infinity;
    for (const m of top(s, legalMoves(s), 12)) { const v = -search(play(s, m), depth - 1, -beta, -alpha); if (v > best) best = v; if (best > alpha) alpha = best; if (alpha >= beta) break; }
    return best;
  };
  let order = top(st, moves, 30).sort(() => rng() - 0.5).sort((a, b) => gain(b) - gain(a)), best = order[0];
  for (let d = P.ms ? 1 : P.depth; d <= P.depth; d++) {
    let alpha = -Infinity, bestD = order[0], bestV = -Infinity;
    for (const m of order) { const v = -search(play(st, m), d - 1, -Infinity, -alpha) + gain(m) * 0.01; if (aborted) break; if (v > bestV) { bestV = v; bestD = m; } if (v > alpha) alpha = v; }
    if (aborted) break;
    best = bestD; order = [best, ...order.filter(m => m !== best)];
  }
  return best;
}
