/**
 * Huarong Dao (华容道): a 4-wide, 5-tall sliding-block puzzle. Cao Cao (2×2) must reach
 * the exit at the middle of the bottom edge. Generals are 1×2 (upright) or 2×1 (lying),
 * soldiers 1×1, and two cells are empty.
 *
 * A move is one piece travelling any distance through empty cells, turns included, which
 * is the usual way Huarong Dao solutions are counted (the classic layout takes 81).
 */
import type { GameModule } from '../../core/game';

export type PType = 'C' | 'V' | 'H' | 'S';
export interface Piece { t: PType; r: number; c: number }
export interface HMove { r0: number; c0: number; r1: number; c1: number }
export const COLS = 4, ROWS = 5;
export const SIZE: Record<PType, [w: number, h: number]> = { C: [2, 2], V: [1, 2], H: [2, 1], S: [1, 1] };

/** Layout strings: rows of 4 cells. C Cao Cao, ^v upright general, <> lying general, s soldier, . empty. */
export function parse(rows: string): Piece[] {
  const g = rows.replace(/\s+/g, ''), out: Piece[] = [];
  if (g.length !== COLS * ROWS) throw new Error('layout must have 20 cells');
  let cao = false;
  for (let i = 0; i < g.length; i++) {
    const r = Math.floor(i / COLS), c = i % COLS, ch = g[i];
    if (ch === 'C' && !cao) { cao = true; out.unshift({ t: 'C', r, c }); }
    else if (ch === '^') out.push({ t: 'V', r, c });
    else if (ch === '<') out.push({ t: 'H', r, c });
    else if (ch === 's') out.push({ t: 'S', r, c });
  }
  return out;
}
const MARK: Record<PType, string[]> = { C: ['C', 'C', 'C', 'C'], V: ['^', 'v'], H: ['<', '>'], S: ['s'] };
export function cells(p: Piece): number[] {
  const [w, h] = SIZE[p.t], out: number[] = [];
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) out.push((p.r + dy) * COLS + p.c + dx);
  return out;
}
/** Canonical key: pieces of the same shape are interchangeable, so the grid of marks identifies a position. */
export function key(pieces: Piece[]): string {
  const g = new Array(COLS * ROWS).fill('.');
  for (const p of pieces) cells(p).forEach((i, k) => { g[i] = MARK[p.t][k]; });
  return g.join('');
}
export const solved = (pieces: Piece[]) => pieces.some(p => p.t === 'C' && p.r === ROWS - 2 && p.c === 1);

function occupied(pieces: Piece[], skip: number): boolean[] {
  const o = new Array(COLS * ROWS).fill(false);
  pieces.forEach((p, i) => { if (i !== skip) for (const k of cells(p)) o[k] = true; });
  return o;
}
const fits = (o: boolean[], t: PType, r: number, c: number) => {
  const [w, h] = SIZE[t];
  if (r < 0 || c < 0 || r + h > ROWS || c + w > COLS) return false;
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) if (o[(r + dy) * COLS + c + dx]) return false;
  return true;
};

/** Every place piece i can reach in one move, through single-cell steps. */
export function destinations(pieces: Piece[], i: number): { r: number; c: number }[] {
  const p = pieces[i], o = occupied(pieces, i), seen = new Set([p.r * COLS + p.c]), out: { r: number; c: number }[] = [];
  const queue = [[p.r, p.c]];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc, k = nr * COLS + nc;
      if (seen.has(k) || !fits(o, p.t, nr, nc)) continue;
      seen.add(k); out.push({ r: nr, c: nc }); queue.push([nr, nc]);
    }
  }
  return out;
}
/** Can piece i slide one cell in a direction? */
export const canStep = (pieces: Piece[], i: number, dr: number, dc: number) =>
  fits(occupied(pieces, i), pieces[i].t, pieces[i].r + dr, pieces[i].c + dc);

export function applyMove(pieces: Piece[], m: HMove): Piece[] {
  const i = pieces.findIndex(p => p.r === m.r0 && p.c === m.c0);
  if (i < 0 || !destinations(pieces, i).some(d => d.r === m.r1 && d.c === m.c1)) return pieces;
  return pieces.map((p, k) => (k === i ? { ...p, r: m.r1, c: m.c1 } : p));
}

/**
 * Breadth-first search over positions; the first solved position found is a shortest
 * solution. Returns the moves, or null if the layout cannot be solved.
 */
export function solve(start: Piece[], maxStates = 200000): HMove[] | null {
  const k0 = key(start);
  const parent = new Map<string, [string, HMove] | null>([[k0, null]]);
  let frontier: Piece[][] = [start];
  while (frontier.length) {
    const next: Piece[][] = [];
    for (const ps of frontier) {
      const kp = key(ps);
      if (solved(ps)) {
        const path: HMove[] = [];
        let k = kp;
        for (let e = parent.get(k); e; e = parent.get(k)) { path.push(e[1]); k = e[0]; }
        return path.reverse();
      }
      for (let i = 0; i < ps.length; i++) for (const d of destinations(ps, i)) {
        const np = ps.map((p, j) => (j === i ? { ...p, r: d.r, c: d.c } : p)), kn = key(np);
        if (parent.has(kn)) continue;
        parent.set(kn, [kp, { r0: ps[i].r, c0: ps[i].c, r1: d.r, c1: d.c }]);
        next.push(np);
      }
    }
    if (parent.size > maxStates) return null;
    frontier = next;
  }
  return null;
}

export interface HState { pieces: Piece[]; moves: number }
export const huarongRules: GameModule<HState, HMove, string> = {
  id: 'huarong',
  initializeGame: layout => ({ pieces: parse(layout), moves: 0 }),
  validateMove: (st, m) => applyMove(st.pieces, m) !== st.pieces,
  applyMove: (st, m) => { const p = applyMove(st.pieces, m); return p === st.pieces ? st : { pieces: p, moves: st.moves + 1 }; },
  checkGameOver: st => solved(st.pieces),
  calculateResult: st => (solved(st.pieces) ? { winner: 0, draw: false } : null),
  serializeState: st => JSON.stringify(st), deserializeState: raw => JSON.parse(raw) as HState,
};
