/**
 * Minesweeper. cell: 0 hidden, 1 open, 2 flagged.
 * Mines are placed on the first reveal, avoiding that cell and (when there is room)
 * its neighbours, so the first click always opens an area.
 */
import type { GameModule } from '../../core/game';

export interface MState {
  w: number; h: number; mines: number; mine: number[]; adj: number[]; cell: number[];
  placed: boolean; status: 'ready' | 'playing' | 'won' | 'lost'; exploded: number; opened: number; flags: number;
}
export const PRESETS = {
  beginner: { label: 'Beginner', w: 9, h: 9, mines: 10 },
  intermediate: { label: 'Intermediate', w: 16, h: 16, mines: 40 },
  expert: { label: 'Expert', w: 30, h: 16, mines: 99 },
} as const;

export function neighbors(w: number, h: number, i: number): number[] {
  const x = i % w, y = Math.floor(i / w), out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const xx = x + dx, yy = y + dy;
    if (xx >= 0 && yy >= 0 && xx < w && yy < h) out.push(yy * w + xx);
  }
  return out;
}
export function newBoard(w: number, h: number, mines: number): MState {
  const n = w * h, m = Math.max(1, Math.min(mines, n - 1));
  return { w, h, mines: m, mine: new Array(n).fill(0), adj: new Array(n).fill(0), cell: new Array(n).fill(0),
    placed: false, status: 'ready', exploded: -1, opened: 0, flags: 0 };
}
const clone = (s: MState): MState => ({ ...s, mine: s.mine.slice(), adj: s.adj.slice(), cell: s.cell.slice() });

export function placeMines(st: MState, safe: number, rng: () => number): MState {
  const s = clone(st), n = s.w * s.h;
  const around = [safe, ...neighbors(s.w, s.h, safe)];
  const banned = new Set(n - s.mines >= around.length ? around : [safe]);
  const pool: number[] = [];
  for (let i = 0; i < n; i++) if (!banned.has(i)) pool.push(i);
  for (let k = 0; k < s.mines; k++) {
    const j = k + Math.floor(rng() * (pool.length - k));
    [pool[k], pool[j]] = [pool[j], pool[k]];
    s.mine[pool[k]] = 1;
  }
  for (let i = 0; i < n; i++) s.adj[i] = neighbors(s.w, s.h, i).reduce((a, p) => a + s.mine[p], 0);
  s.placed = true;
  return s;
}

function openFrom(s: MState, start: number) {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    if (s.cell[i] !== 0) continue;
    s.cell[i] = 1; s.opened++;
    if (s.adj[i] === 0) for (const p of neighbors(s.w, s.h, i)) if (s.cell[p] === 0 && !s.mine[p]) stack.push(p);
  }
}
function settle(s: MState) {
  if (s.status === 'lost') return;
  s.status = 'playing';
  if (s.opened === s.w * s.h - s.mines) {
    s.status = 'won';
    for (let i = 0; i < s.mine.length; i++) if (s.mine[i]) s.cell[i] = 2;
    s.flags = s.mines;
  }
}

export function reveal(st: MState, i: number, rng: () => number = Math.random): MState {
  if (st.status === 'won' || st.status === 'lost' || st.cell[i] !== 0) return st;
  const s = st.placed ? clone(st) : placeMines(st, i, rng);
  if (s.mine[i]) { s.cell[i] = 1; s.status = 'lost'; s.exploded = i; return s; }
  openFrom(s, i); settle(s);
  return s;
}
export function toggleFlag(st: MState, i: number): MState {
  if (st.status === 'won' || st.status === 'lost' || st.cell[i] === 1) return st;
  const s = clone(st);
  s.cell[i] = s.cell[i] === 2 ? 0 : 2; s.flags += s.cell[i] === 2 ? 1 : -1;
  return s;
}
/** Clicking an open number whose flags are all placed opens its other neighbours. */
export function chord(st: MState, i: number): MState {
  if (st.status !== 'playing' || st.cell[i] !== 1 || !st.adj[i]) return st;
  const nb = neighbors(st.w, st.h, i);
  if (nb.filter(p => st.cell[p] === 2).length !== st.adj[i]) return st;
  const s = clone(st);
  for (const p of nb) {
    if (s.cell[p] !== 0) continue;
    if (s.mine[p]) { s.cell[p] = 1; s.status = 'lost'; s.exploded = p; } else openFrom(s, p);
  }
  settle(s);
  return s;
}

export type MMove = { kind: 'reveal' | 'flag' | 'chord'; cell: number };
export const minesweeperRules: GameModule<MState, MMove, { w: number; h: number; mines: number }> = {
  id: 'minesweeper',
  initializeGame: c => newBoard(c.w, c.h, c.mines),
  validateMove: (st, m) => m.cell >= 0 && m.cell < st.cell.length && st.status !== 'won' && st.status !== 'lost',
  applyMove: (st, m) => (m.kind === 'flag' ? toggleFlag(st, m.cell) : m.kind === 'chord' ? chord(st, m.cell) : reveal(st, m.cell)),
  checkGameOver: st => st.status === 'won' || st.status === 'lost',
  calculateResult: st => (st.status === 'won' ? { winner: 0, draw: false } : st.status === 'lost' ? { winner: null, draw: false, detail: 'mine' } : null),
  serializeState: st => JSON.stringify(st), deserializeState: raw => JSON.parse(raw) as MState,
};
