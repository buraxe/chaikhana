import type { Level } from '../../core/match';

/** 3D tic-tac-toe on a 4×4×4 cube (Qubic). Cell index = layer * 16 + row * 4 + col. */
export const SIZE = 4, CELLS = 64;
export const idx = (x: number, y: number, z: number) => y * 16 + z * 4 + x;
export const LINES: number[][] = [];
{
  const dirs: [number, number, number][] = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
    if (!dx && !dy && !dz) continue;
    const first = dx || dy || dz; if (first < 0) continue; // one of each opposite pair
    dirs.push([dx, dy, dz]);
  }
  for (const [dx, dy, dz] of dirs) for (let x = 0; x < 4; x++) for (let y = 0; y < 4; y++) for (let z = 0; z < 4; z++) {
    const ex = x + 3 * dx, ey = y + 3 * dy, ez = z + 3 * dz;
    if (ex < 0 || ex > 3 || ey < 0 || ey > 3 || ez < 0 || ez > 3) continue;
    LINES.push([0, 1, 2, 3].map(k => idx(x + k * dx, y + k * dy, z + k * dz)));
  }
}
export const LINES_AT: number[][] = Array.from({ length: CELLS }, (_, i) => LINES.map((l, k) => (l.includes(i) ? k : -1)).filter(k => k >= 0));

export interface QState { cells: number[]; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean; line: number[] }
export const newGame = (): QState => ({ cells: new Array(CELLS).fill(0), moves: [], turn: 1, winner: 0, draw: false, line: [] });
export const isLegal = (st: QState, i: number) => !st.winner && !st.draw && Number.isInteger(i) && i >= 0 && i < CELLS && !st.cells[i];
export function play(st: QState, i: number): QState {
  if (!isLegal(st, i)) return st;
  const cells = st.cells.slice(); cells[i] = st.turn;
  const won = LINES_AT[i].map(k => LINES[k]).find(l => l.every(c => cells[c] === st.turn));
  return { cells, moves: [...st.moves, i], turn: st.turn === 1 ? 2 : 1, winner: won ? st.turn : 0, draw: !won && st.moves.length + 1 === CELLS, line: won ?? [] };
}
export const replay = (moves: number[]) => moves.reduce(play, newGame());
export const legal = (st: QState) => st.cells.map((v, i) => (v || st.winner || st.draw ? -1 : i)).filter(i => i >= 0);

export const LEVELS: (Level & { depth: number })[] = [
  { name: 'Beginner', rating: 700, depth: 0 }, { name: 'Easy', rating: 900, depth: 1 },
  { name: 'Intermediate', rating: 1150, depth: 2 }, { name: 'Advanced', rating: 1400, depth: 3 },
  { name: 'Expert', rating: 1650, depth: 4 },
];
const W = [0, 1, 10, 120, 100000];
function evaluate(cells: number[], p: number): number {
  let s = 0;
  for (const l of LINES) {
    let a = 0, b = 0;
    for (const c of l) { if (cells[c] === p) a++; else if (cells[c]) b++; }
    if (a && !b) s += W[a]; else if (b && !a) s -= W[b] * 1.1;
  }
  return s;
}
/** Cells that finish a line for `p` right now. */
function wins(cells: number[], p: number): number[] {
  const out = new Set<number>();
  for (const l of LINES) {
    let a = 0, empty = -1, bad = false;
    for (const c of l) { if (cells[c] === p) a++; else if (cells[c]) { bad = true; break; } else empty = c; }
    if (!bad && a === 3) out.add(empty);
  }
  return [...out];
}
function search(cells: number[], toMove: number, me: number, depth: number, a: number, b: number): number {
  const opp = 3 - toMove;
  if (depth === 0) return evaluate(cells, me);
  const w = wins(cells, toMove);
  if (w.length) return toMove === me ? 1e6 + depth : -1e6 - depth;
  const block = wins(cells, opp);
  let moves = block.length ? block : cells.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  if (!moves.length) return 0;
  if (moves.length > 10) {
    moves = moves.map(i => { cells[i] = toMove; const v = evaluate(cells, toMove); cells[i] = 0; return { i, v }; }).sort((x, y) => y.v - x.v).slice(0, 10).map(x => x.i);
  }
  let best = toMove === me ? -Infinity : Infinity;
  for (const i of moves) {
    cells[i] = toMove;
    const v = search(cells, opp, me, depth - 1, a, b);
    cells[i] = 0;
    if (toMove === me) { if (v > best) best = v; if (v > a) a = v; } else { if (v < best) best = v; if (v < b) b = v; }
    if (b <= a) break;
  }
  return best;
}
export function chooseMove(st: QState, level: number, rng: () => number = Math.random): number {
  const L = LEVELS[level], me = st.turn, cells = st.cells.slice(), free = legal(st);
  const w = wins(cells, me); if (w.length) return w[0];
  const block = wins(cells, 3 - me);
  if (L.depth === 0) return block.length && rng() < 0.5 ? block[0] : free[Math.floor(rng() * free.length)];
  if (block.length) return block[0];
  const cand = free.map(i => { cells[i] = me; const v = evaluate(cells, me); cells[i] = 0; return { i, v: v + rng() * 2 }; }).sort((x, y) => y.v - x.v).slice(0, 14).map(x => x.i);
  if (L.depth === 1) return cand[0];
  let best = cand[0], bestV = -Infinity;
  for (const i of cand) {
    cells[i] = me;
    const v = search(cells, 3 - me, me, L.depth - 1, -Infinity, Infinity) + rng();
    cells[i] = 0;
    if (v > bestV) { bestV = v; best = i; }
  }
  return best;
}
