/**
 * Dots and Boxes on R×C boxes. Players take turns drawing a line between two neighbouring
 * dots; completing the fourth side of a box scores it and earns another line. Most boxes wins.
 * Edges: horizontal ones first ((R+1)·C), then vertical ones (R·(C+1)).
 */
import type { Level } from '../../core/match';

export interface DState { r: number; c: number; edges: number[]; owner: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
export const edgeCount = (r: number, c: number) => (r + 1) * c + r * (c + 1);
export const hEdge = (c: number, row: number, col: number) => row * c + col;
export const vEdge = (r: number, c: number, row: number, col: number) => (r + 1) * c + row * (c + 1) + col;
export function boxEdges(r: number, c: number, b: number): number[] {
  const row = Math.floor(b / c), col = b % c;
  return [hEdge(c, row, col), hEdge(c, row + 1, col), vEdge(r, c, row, col), vEdge(r, c, row, col + 1)];
}
const boxesOfEdge = (r: number, c: number) => {
  const map: number[][] = Array.from({ length: edgeCount(r, c) }, () => []);
  for (let b = 0; b < r * c; b++) for (const e of boxEdges(r, c, b)) map[e].push(b);
  return map;
};
const cache = new Map<string, number[][]>();
const adj = (r: number, c: number) => { const k = r + 'x' + c; if (!cache.has(k)) cache.set(k, boxesOfEdge(r, c)); return cache.get(k)!; };

export const newGame = (r: number, c: number): DState => ({ r, c, edges: new Array(edgeCount(r, c)).fill(0), owner: new Array(r * c).fill(0), moves: [], turn: 1, winner: 0, draw: false });
export const sides = (st: { r: number; c: number; edges: number[] }, b: number) => boxEdges(st.r, st.c, b).reduce((a, e) => a + st.edges[e], 0);
export const isLegal = (st: DState, e: number) => !st.winner && !st.draw && e >= 0 && e < st.edges.length && !st.edges[e];
export function play(st: DState, e: number): DState {
  if (!isLegal(st, e)) return st;
  const edges = st.edges.slice(), owner = st.owner.slice();
  edges[e] = 1;
  let scored = false;
  for (const b of adj(st.r, st.c)[e]) if (!owner[b] && boxEdges(st.r, st.c, b).every(x => edges[x])) { owner[b] = st.turn; scored = true; }
  const done = owner.every(o => o);
  const a = owner.filter(o => o === 1).length, z = owner.filter(o => o === 2).length;
  return { ...st, edges, owner, moves: [...st.moves, e], turn: scored ? st.turn : (3 - st.turn) as 1 | 2, winner: done && a !== z ? (a > z ? 1 : 2) : 0, draw: done && a === z };
}
export const replay = (r: number, c: number, moves: number[]) => moves.reduce(play, newGame(r, c));

export const LEVELS: (Level & { kind: number })[] = [
  { name: 'Beginner', rating: 700, kind: 0 }, { name: 'Easy', rating: 900, kind: 1 }, { name: 'Intermediate', rating: 1150, kind: 2 },
  { name: 'Advanced', rating: 1400, kind: 3 }, { name: 'Expert', rating: 1650, kind: 4 },
];
/** Lines that complete a box right now. */
const takers = (st: DState) => st.edges.map((v, e) => e).filter(e => !st.edges[e] && adj(st.r, st.c)[e].some(b => sides(st, b) === 3));
/** Lines that do not hand the opponent a box (no box would get its third side). */
const safe = (st: DState) => st.edges.map((v, e) => e).filter(e => !st.edges[e] && adj(st.r, st.c)[e].every(b => sides(st, b) < 2));
/** How many boxes the opponent could take in a row after we play e (the chain we would open). */
function chainGiven(st: DState, e: number): number {
  let s = play({ ...st, winner: 0, draw: false }, e);
  if (s.turn === st.turn) return 0;
  let n = 0;
  for (let t = takers(s); t.length; t = takers(s)) { s = play(s, t[0]); n++; if (s.winner || s.draw) break; }
  return n;
}
/** Exact search for the last moves: best final box difference for the player to move. */
function exact(st: DState, memo: Map<string, number>): number {
  const key = st.edges.join('') + st.turn;
  const m = memo.get(key);
  if (m !== undefined) return m;
  const free = st.edges.map((v, e) => e).filter(e => !st.edges[e]);
  if (!free.length) return 0;
  let best = -Infinity;
  for (const e of free) {
    const before = st.owner.filter(o => o).length, s = play(st, e), gained = s.owner.filter(o => o).length - before;
    const v = s.turn === st.turn ? gained + exact(s, memo) : gained - exact(s, memo);
    if (v > best) best = v;
  }
  memo.set(key, best);
  return best;
}
export function chooseMove(st: DState, level: number, rng: () => number = Math.random): number {
  const free = st.edges.map((v, e) => e).filter(e => !st.edges[e]);
  const pick = (arr: number[]) => arr[Math.floor(rng() * arr.length)];
  const kind = LEVELS[level].kind;
  if (kind === 0) { const t = takers(st); return t.length && rng() < 0.6 ? pick(t) : pick(free); }
  if (kind >= 4 && free.length <= 14) {
    const memo = new Map<string, number>();
    let best = free[0], bestV = -Infinity;
    for (const e of free) {
      const before = st.owner.filter(o => o).length, s = play(st, e), gained = s.owner.filter(o => o).length - before;
      const v = s.turn === st.turn ? gained + exact(s, memo) : gained - exact(s, memo);
      if (v > bestV) { bestV = v; best = e; }
    }
    return best;
  }
  const take = takers(st), safes = safe(st);
  if (take.length) {
    // Double-dealing: when taking would leave only unsafe lines and the chain ends in two
    // boxes, decline them to keep control of the next, longer chain.
    if (kind >= 3 && !safes.length) {
      const rest = free.filter(e => !take.includes(e));
      if (take.length === 1 && rest.length) {
        const s = play(st, take[0]);
        if (s.turn === st.turn && takers(s).length === 1) {
          const after = play(s, takers(s)[0]);
          const remainingChains = free.length > 4 && safe(after).length === 0 && takers(after).length === 0;
          if (remainingChains && chainGiven(after, pick(free.filter(e => !after.edges[e]))) >= 3) {
            const dd = free.find(e => e !== take[0] && adj(st.r, st.c)[e].some(b => adj(st.r, st.c)[take[0]].includes(b) && !st.owner[b]));
            if (dd !== undefined && !st.edges[dd]) return dd;
          }
        }
      }
    }
    return pick(take);
  }
  if (safes.length) return pick(safes);
  if (kind === 1) return pick(free);
  // Forced to give something: give away the shortest chain.
  let best = free[0], bestN = Infinity;
  for (const e of free) { const n = chainGiven(st, e); if (n < bestN) { bestN = n; best = e; } }
  return best;
}
