/**
 * Lu Ban lock (鲁班锁): six notched square sticks interlocked in three pairs, one pair along
 * each axis. Take it apart: slide one piece a step at a time; a piece that can slide clear
 * leaves the lock. A search finds the fewest moves and the hint.
 *
 * Geometry: unit voxels in a 6×6×6 box. Each stick is 2×2×6. The X pair lies along x at
 * y ∈ {2,3}, z ∈ {1,2} or {3,4}; the Y pair along y at z ∈ {2,3}, x ∈ {1,2} or {3,4}; the
 * Z pair along z at x ∈ {2,3}, y ∈ {1,2} or {3,4}. Where sticks would overlap, the design
 * says which piece keeps the cube (the others are notched there), or that none does.
 */
export type V3 = [number, number, number];
export interface Lock { id: string; pieces: V3[][]; level: number; moves: number }

/** The full, un-notched cubes of each stick. */
export function stickCells(): V3[][] {
  const out: V3[][] = [];
  const box = (xs: number[], ys: number[], zs: number[]) => { const c: V3[] = []; for (const x of xs) for (const y of ys) for (const z of zs) c.push([x, y, z]); return c; };
  const all = [0, 1, 2, 3, 4, 5];
  out.push(box(all, [2, 3], [1, 2]), box(all, [2, 3], [3, 4]));
  out.push(box([1, 2], all, [2, 3]), box([3, 4], all, [2, 3]));
  out.push(box([2, 3], [1, 2], all), box([2, 3], [3, 4], all));
  return out;
}
export const AXIS = [0, 0, 1, 1, 2, 2]; // the axis each stick lies along

const K = (x: number, y: number, z: number) => ((x + 64) << 14) | ((y + 64) << 7) | (z + 64);
export const DIRS: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/** A position: each piece's offset, or null once it has left the lock. */
export type Pos = (V3 | null)[];
export const startPos = (n: number): Pos => Array.from({ length: n }, () => [0, 0, 0] as V3);

function occupied(pieces: V3[][], pos: Pos, skip: number): Set<number> {
  const s = new Set<number>();
  pos.forEach((o, i) => { if (!o || i === skip) return; for (const [x, y, z] of pieces[i]) s.add(K(x + o[0], y + o[1], z + o[2])); });
  return s;
}
const hits = (cells: V3[], o: V3, d: V3, k: number, occ: Set<number>) => cells.some(([x, y, z]) => occ.has(K(x + o[0] + d[0] * k, y + o[1] + d[1] * k, z + o[2] + d[2] * k)));
/** Can piece i step once in direction d? */
export function canStep(pieces: V3[][], pos: Pos, i: number, d: V3): boolean {
  const o = pos[i]; if (!o) return false;
  return !hits(pieces[i], o, d, 1, occupied(pieces, pos, i));
}
/** Can piece i slide all the way out in direction d? */
export function canLeave(pieces: V3[][], pos: Pos, i: number, d: V3): boolean {
  const o = pos[i]; if (!o) return false;
  const occ = occupied(pieces, pos, i);
  for (let k = 1; k <= 14; k++) if (hits(pieces[i], o, d, k, occ)) return false;
  return true;
}
export interface Move { i: number; d: number; out?: boolean }
export function apply(pos: Pos, m: Move): Pos {
  return pos.map((o, k) => (k !== m.i || !o ? o : m.out ? null : [o[0] + DIRS[m.d][0], o[1] + DIRS[m.d][1], o[2] + DIRS[m.d][2]]));
}
/** All moves from a position: a piece that can slide clear leaves; others step one cube. */
export function moves(pieces: V3[][], pos: Pos): Move[] {
  const out: Move[] = [];
  pos.forEach((o, i) => {
    if (!o) return;
    const leave = DIRS.findIndex(d => canLeave(pieces, pos, i, d));
    if (leave >= 0) { out.push({ i, d: leave, out: true }); return; }
    DIRS.forEach((d, k) => { if (canStep(pieces, pos, i, d)) out.push({ i, d: k }); });
  });
  return out;
}
const keyOf = (pos: Pos) => pos.map(o => (o ? o.join(',') : 'x')).join('|');

/**
 * Fewest moves from `pos` until every piece has left. Pieces may wander at most `reach`
 * cubes from home, which keeps the search small. Returns the moves, or null if it cannot
 * be taken apart that way.
 */
export function solve(pieces: V3[][], pos: Pos, reach = 4, maxStates = 200000): Move[] | null {
  const start = keyOf(pos), prev = new Map<string, [string, Move] | null>([[start, null]]);
  let frontier: Pos[] = [pos];
  while (frontier.length && prev.size < maxStates) {
    const next: Pos[] = [];
    for (const p of frontier) {
      if (p.every(o => !o)) {
        const path: Move[] = []; let k = keyOf(p);
        while (prev.get(k)) { const [pk, m] = prev.get(k)!; path.unshift(m); k = pk; }
        return path;
      }
      for (const m of moves(pieces, p)) {
        const q = apply(p, m);
        if (q.some(o => o && Math.max(Math.abs(o[0]), Math.abs(o[1]), Math.abs(o[2])) > reach)) continue;
        const kq = keyOf(q); if (prev.has(kq)) continue;
        prev.set(kq, [keyOf(p), m]); next.push(q);
      }
    }
    frontier = next;
  }
  return null;
}
/** Moves needed before the first piece can leave (the puzzle's level). */
export function level(path: Move[]): number { return path.findIndex(m => m.out) + 1; }

/** Turns a design (who keeps each shared cube) into notched pieces, or null if a piece falls apart. */
export function build(design: Map<number, number>): V3[][] | null {
  const sticks = stickCells(), count = new Map<number, number[]>();
  sticks.forEach((cs, i) => cs.forEach(([x, y, z]) => { const k = K(x, y, z); count.set(k, [...(count.get(k) ?? []), i]); }));
  const pieces = sticks.map((cs, i) => cs.filter(([x, y, z]) => { const k = K(x, y, z), who = count.get(k)!; return who.length === 1 ? (design.get(k) ?? i) === i : design.get(k) === i; }));
  for (const p of pieces) if (!connected(p)) return null;
  return pieces;
}
function connected(cells: V3[]): boolean {
  if (!cells.length) return false;
  const set = new Set(cells.map(c => K(...c))), seen = new Set([K(...cells[0])]), st = [cells[0]];
  while (st.length) { const [x, y, z] = st.pop()!; for (const d of DIRS) { const k = K(x + d[0], y + d[1], z + d[2]); if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([x + d[0], y + d[1], z + d[2]]); } } }
  return seen.size === cells.length;
}
/** The cubes two or more sticks would share, with who could keep each. */
export function sharedCells(): { k: number; who: number[] }[] {
  const count = new Map<number, number[]>();
  stickCells().forEach((cs, i) => cs.forEach(([x, y, z]) => { const k = K(x, y, z); count.set(k, [...(count.get(k) ?? []), i]); }));
  return [...count.entries()].filter(([, w]) => w.length > 1).map(([k, who]) => ({ k, who }));
}

// ---------- Putting it together (the Kongming lock) ----------

/**
 * A piece outside is pushed in from direction `d`. It is lined up, within three cubes either
 * side, wherever it gets in deepest (towards home along that axis), and slides until the next
 * step would hit something. Returns its offset, or null if it cannot get into the box.
 */
export function insertAt(pieces: V3[][], pos: Pos, i: number, d: number): V3 | null {
  if (pos[i]) return null;
  const dir = DIRS[d], axis = dir.findIndex(v => v !== 0), side = [0, 1, 2].filter(a => a !== axis), occ = occupied(pieces, pos, i);
  const free = (q: V3) => !pieces[i].some(([x, y, z]) => occ.has(K(x + q[0], y + q[1], z + q[2])));
  let best: V3 | null = null, bestScore = Infinity;
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
    let o: V3 = [0, 0, 0]; o[axis] = -dir[axis] * 12; o[side[0]] = a; o[side[1]] = b;
    if (!free(o)) continue;
    while (o[axis] !== 0) { const n: V3 = [o[0] + dir[0], o[1] + dir[1], o[2] + dir[2]]; if (!free(n)) break; o = n; }
    if (Math.abs(o[axis]) >= 6) continue;
    const score = Math.abs(o[axis]) * 100 + Math.abs(a) + Math.abs(b);
    if (score < bestScore) { bestScore = score; best = o; }
  }
  return best;
}
export const isHome = (pos: Pos) => pos.every(o => o && !o[0] && !o[1] && !o[2]);
export const outPos = (n: number): Pos => Array.from({ length: n }, () => null);
/** The positions along a take-apart solution, from home to all out. */
export function trail(pieces: V3[][]): { at: Pos[]; moves: Move[] } {
  const moves = solve(pieces, startPos(pieces.length), 3, 120000) ?? [];
  const at: Pos[] = [startPos(pieces.length)];
  for (const m of moves) at.push(apply(at[at.length - 1], m));
  return { at, moves };
}
export const samePos = (a: Pos, b: Pos) => a.every((o, i) => (o === null) === (b[i] === null) && (!o || (o[0] === b[i]![0] && o[1] === b[i]![1] && o[2] === b[i]![2])));
