/**
 * Ultimate tic-tac-toe: nine small boards in a big one. Where you play in a small board sends
 * your opponent to the matching small board; if that board is finished they may play anywhere.
 * Win three small boards in a row.
 *
 * Cells 0–80: board b = floor(i / 9), square s = i % 9.
 */
import type { Level } from '../../core/match';

export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export interface UState { cells: number[]; boards: number[]; next: number; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; line: number[] }
export const newGame = (): UState => ({ cells: new Array(81).fill(0), boards: new Array(9).fill(0), next: -1, moves: [], turn: 1, winner: 0, draw: false, line: [] });
/** A small board's state: 0 open, 1 or 2 won, 3 full with no winner. */
function boardState(cells: number[], b: number): number {
  for (const l of LINES) { const v = cells[b * 9 + l[0]]; if (v && v === cells[b * 9 + l[1]] && v === cells[b * 9 + l[2]]) return v; }
  for (let s = 0; s < 9; s++) if (!cells[b * 9 + s]) return 0;
  return 3;
}
export function legal(st: UState): number[] {
  if (st.winner || st.draw) return [];
  const out: number[] = [];
  for (let b = 0; b < 9; b++) {
    if (st.boards[b] || (st.next >= 0 && st.next !== b)) continue;
    for (let s = 0; s < 9; s++) if (!st.cells[b * 9 + s]) out.push(b * 9 + s);
  }
  return out;
}
export function play(st: UState, i: number): UState {
  if (!legal(st).includes(i)) return st;
  const cells = st.cells.slice(), boards = st.boards.slice(), b = Math.floor(i / 9), s = i % 9;
  cells[i] = st.turn; boards[b] = boardState(cells, b);
  let winner: 0 | 1 | 2 = 0, line: number[] = [];
  for (const l of LINES) { const v = boards[l[0]]; if ((v === 1 || v === 2) && v === boards[l[1]] && v === boards[l[2]]) { winner = v; line = l; } }
  const next = boards[s] ? -1 : s;
  const nx: UState = { cells, boards, next, moves: [...st.moves, i], turn: st.turn === 1 ? 2 : 1, winner, draw: false, line };
  if (!winner && !legal(nx).length) nx.draw = true;
  return nx;
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());

export const LEVELS: (Level & { iters: number })[] = [
  { name: 'Beginner', rating: 700, iters: 0 }, { name: 'Easy', rating: 900, iters: 250 },
  { name: 'Intermediate', rating: 1150, iters: 1500 }, { name: 'Advanced', rating: 1400, iters: 6000 },
  { name: 'Expert', rating: 1650, iters: 20000 },
];
/** Monte Carlo tree search: random playouts decide which moves are good. */
export function chooseMove(st: UState, level: number, opts: { rng?: () => number; iters?: number; ms?: number } = {}): number {
  const rng = opts.rng ?? Math.random, moves = legal(st), iters = opts.iters ?? LEVELS[level].iters;
  if (!iters || moves.length === 1) return moves[Math.floor(rng() * moves.length)];
  // An immediate win is always taken.
  for (const m of moves) if (play(st, m).winner === st.turn) return m;
  interface Node { m: number; p: Node | null; kids: Node[]; untried: number[]; w: number; n: number; who: number }
  const root: Node = { m: -1, p: null, kids: [], untried: moves.slice(), w: 0, n: 0, who: st.turn === 1 ? 2 : 1 };
  const deadline = Date.now() + (opts.ms ?? 2500);
  for (let k = 0; k < iters && (k & 63 || Date.now() < deadline); k++) {
    let node = root, s = st;
    while (!node.untried.length && node.kids.length) {
      const ln = Math.log(node.n);
      node = node.kids.reduce((a, b) => (b.w / b.n + 1.2 * Math.sqrt(ln / b.n) > a.w / a.n + 1.2 * Math.sqrt(ln / a.n) ? b : a));
      s = play(s, node.m);
    }
    if (node.untried.length) {
      const m = node.untried.splice(Math.floor(rng() * node.untried.length), 1)[0];
      const who = s.turn; s = play(s, m);
      const kid: Node = { m, p: node, kids: [], untried: legal(s), w: 0, n: 0, who };
      node.kids.push(kid); node = kid;
    }
    let r = s;
    while (!r.winner && !r.draw) { const ls = legal(r); r = play(r, ls[Math.floor(rng() * ls.length)]); }
    for (let x: Node | null = node; x; x = x.p) { x.n++; x.w += r.draw ? 0.5 : r.winner === x.who ? 1 : 0; }
  }
  return root.kids.reduce((a, b) => (b.n > a.n ? b : a)).m;
}
