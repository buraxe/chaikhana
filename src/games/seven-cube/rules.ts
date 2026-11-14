/**
 * Soma cube (索玛立方体): seven pieces, every irregular shape of three or four cubes, that
 * build a 3×3×3 cube and hundreds of other figures. An exact-cover search checks that each
 * figure here can be built and gives the hint.
 */
export type V3 = [number, number, number];
export interface Piece { id: string; name: [string, string, string]; cells: V3[]; color: number }
export const PIECES: Piece[] = [
  { id: 'V', name: ['V (corner)', 'V（三块角）', 'V (köşe)'], cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0]], color: 0xc0392b },
  { id: 'L', name: ['L', 'L', 'L'], cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 1, 0]], color: 0x2471a3 },
  { id: 'T', name: ['T', 'T', 'T'], cells: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [1, 1, 0]], color: 0x229954 },
  { id: 'Z', name: ['Z (step)', 'Z（阶梯）', 'Z (basamak)'], cells: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]], color: 0xd68910 },
  { id: 'A', name: ['Right screw', '右螺旋', 'Sağ vida'], cells: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]], color: 0x7d3c98 },
  { id: 'B', name: ['Left screw', '左螺旋', 'Sol vida'], cells: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [1, 1, 0]], color: 0x17a589 },
  { id: 'P', name: ['Branch', '三叉', 'Çatal'], cells: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]], color: 0x8e5a2b },
];

const key = ([x, y, z]: V3) => `${x},${y},${z}`;
/** Moves the cells so their smallest corner is at the origin, sorted. */
export function normal(cells: V3[]): V3[] {
  const m = [0, 1, 2].map(a => Math.min(...cells.map(c => c[a])));
  return cells.map(c => [c[0] - m[0], c[1] - m[1], c[2] - m[2]] as V3).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}
export const rotX = ([x, y, z]: V3): V3 => [x, -z, y];
export const rotY = ([x, y, z]: V3): V3 => [z, y, -x];
export const rotZ = ([x, y, z]: V3): V3 => [-y, x, z];
/** The 24 turns of a piece (duplicates removed), each normalised. */
export function orientations(cells: V3[]): V3[][] {
  const seen = new Set<string>(), out: V3[][] = [];
  let c = cells;
  for (let i = 0; i < 6; i++) {
    // Point each face up in turn, then spin four times around the vertical.
    let f = i < 4 ? Array.from({ length: i }).reduce<V3[]>(a => a.map(rotX), c) : i === 4 ? c.map(rotZ) : c.map(rotZ).map(rotZ).map(rotZ);
    for (let j = 0; j < 4; j++) { const n = normal(f), k = n.map(key).join(';'); if (!seen.has(k)) { seen.add(k); out.push(n); } f = f.map(rotY); }
  }
  void c; c = cells;
  return out;
}

/** A figure to build. Figures without their own pieces use the seven Soma pieces. */
export interface Figure { id: string; name: [string, string, string]; cells: V3[]; pieces?: Piece[]; solutions?: number }
const box = (w: number, h: number, d: number, at: V3 = [0, 0, 0]) => { const o: V3[] = []; for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) o.push([x + at[0], y + at[1], z + at[2]]); return o; };
const minus = (a: V3[], b: V3[]) => { const s = new Set(b.map(key)); return a.filter(c => !s.has(key(c))); };
export const FIGURES: Figure[] = [
  { id: 'cube', name: ['The cube', '立方体', 'Küp'], cells: box(3, 3, 3) },
  { id: 'steps', name: ['Staircase', '楼梯', 'Merdiven'], cells: [...box(5, 1, 3), ...box(3, 1, 3, [0, 1, 0]), ...box(1, 1, 3, [0, 2, 0])] },
  { id: 'bath', name: ['Bathtub', '浴缸', 'Küvet'], cells: [...box(5, 1, 3), ...minus(box(5, 1, 3, [0, 1, 0]), box(3, 1, 1, [1, 1, 1]))] },
  { id: 'pyramid', name: ['Pyramid', '金字塔', 'Piramit'], cells: [...box(4, 1, 4), ...box(3, 1, 3, [0, 1, 0]), ...box(2, 1, 1, [0, 2, 0])] },
  { id: 'tower', name: ['Tower', '高塔', 'Kule'], cells: [...box(2, 4, 3), ...box(1, 1, 3, [0, 4, 0])] },
  { id: 'sofa', name: ['Sofa', '沙发', 'Kanepe'], cells: [...box(5, 1, 3), ...box(5, 2, 1, [0, 1, 0]), ...box(1, 1, 1, [0, 1, 2]), ...box(1, 1, 1, [4, 1, 2])] },
  { id: 'wall', name: ['Castle wall', '城墙', 'Kale duvarı'], cells: [...box(6, 2, 2), ...box(1, 1, 2, [0, 2, 0]), ...box(1, 1, 1, [5, 2, 0])] },
  { id: 'well', name: ['Well', '井', 'Kuyu'], cells: minus(box(3, 3, 3).concat(box(3, 1, 3, [0, 3, 0])), [[1, 1, 1], [1, 2, 1], [1, 3, 1], [0, 3, 0], [2, 3, 2], [1, 0, 1], [0, 0, 0], [2, 0, 2], [0, 3, 2]] as V3[]) },
];

/** Every way to place each piece inside the figure: piece index and the cells it covers. */
export function placements(fig: V3[], pieces: Piece[] = PIECES): { piece: number; cells: number[]; orient: number; at: V3 }[] {
  const idx = new Map(fig.map((c, i) => [key(c), i])), out: { piece: number; cells: number[]; orient: number; at: V3 }[] = [];
  pieces.forEach((p, pi) => orientations(p.cells).forEach((o, oi) => {
    for (const anchor of fig) {
      const at: V3 = [anchor[0] - o[0][0], anchor[1] - o[0][1], anchor[2] - o[0][2]];
      const cells = o.map(c => idx.get(key([c[0] + at[0], c[1] + at[1], c[2] + at[2]])));
      if (cells.every(c => c !== undefined)) out.push({ piece: pi, cells: cells as number[], orient: oi, at });
    }
  }));
  return out;
}
/** A complete build, given pieces already in place (cell lists in figure indexes). Null if none. */
export function solve(fig: V3[], fixed: Map<number, number[]> = new Map(), limit = 1, pieces: Piece[] = PIECES): { piece: number; cells: number[] }[][] {
  const pl = placements(fig, pieces), used = new Array(fig.length).fill(false), have = new Array(pieces.length).fill(false);
  const sols: { piece: number; cells: number[] }[][] = [], cur: { piece: number; cells: number[] }[] = [];
  for (const [p, cells] of fixed) { have[p] = true; cells.forEach(c => { used[c] = true; }); cur.push({ piece: p, cells }); }
  const byCell: number[][] = fig.map(() => []);
  pl.forEach((p, k) => p.cells.forEach(c => byCell[c].push(k)));
  const go = () => {
    if (sols.length >= limit) return;
    // The empty cell with the fewest ways to fill it.
    let best = -1, bestOpts: number[] = [];
    for (let c = 0; c < fig.length; c++) {
      if (used[c]) continue;
      const opts = byCell[c].filter(k => !have[pl[k].piece] && pl[k].cells.every(x => !used[x]));
      if (!opts.length) return;
      if (best < 0 || opts.length < bestOpts.length) { best = c; bestOpts = opts; }
    }
    if (best < 0) { sols.push(cur.slice()); return; }
    for (const k of bestOpts) {
      const p = pl[k];
      have[p.piece] = true; p.cells.forEach(c => { used[c] = true; }); cur.push({ piece: p.piece, cells: p.cells });
      go();
      cur.pop(); have[p.piece] = false; p.cells.forEach(c => { used[c] = false; });
      if (sols.length >= limit) return;
    }
  };
  go();
  return sols;
}
export const cellKey = key;

/** Identical pieces (the same shape in some turn) — the search treats them as one choice. */
export const shapeKey = (cells: V3[]) => orientations(cells).map(o => o.map(key).join(';')).sort()[0];
const PALETTE = [0xc0392b, 0x2471a3, 0x229954, 0xd68910, 0x7d3c98, 0x17a589, 0x8e5a2b, 0xcb4f8a, 0x5d6d7e, 0xa9a23a, 0x2e86c1, 0xe67e22, 0x6c3483];
/**
 * Cuts a figure into random connected pieces of `min`–`max` cubes. Returns null if a
 * leftover scrap is too small to make a piece.
 */
export function cut(fig: V3[], min: number, max: number, rng: () => number): Piece[] | null {
  const idx = new Map(fig.map((c, i) => [key(c), i])), owner = new Array(fig.length).fill(-1), groups: number[][] = [];
  const nb = (i: number) => { const [x, y, z] = fig[i]; return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(([a, b, c]) => idx.get(key([x + a, y + b, z + c]))).filter((j): j is number => j !== undefined); };
  const freeDeg = (i: number) => nb(i).filter(j => owner[j] < 0).length;
  while (owner.includes(-1)) {
    const empties = owner.map((o, i) => (o < 0 ? i : -1)).filter(i => i >= 0);
    const tight = Math.min(...empties.map(freeDeg)), starts = empties.filter(i => freeDeg(i) === tight);
    const id = groups.length, g = [starts[Math.floor(rng() * starts.length)]]; owner[g[0]] = id;
    const want = min + Math.floor(rng() * (max - min + 1));
    while (g.length < want) {
      const front = [...new Set(g.flatMap(nb))].filter(j => owner[j] < 0);
      if (!front.length) break;
      front.sort((a, b) => freeDeg(a) - freeDeg(b));
      const j = rng() < 0.6 ? front[0] : front[Math.floor(rng() * front.length)];
      owner[j] = id; g.push(j);
    }
    if (g.length < min) {
      // Hand a short scrap to a neighbouring piece if that keeps it within size.
      const near = [...new Set(g.flatMap(nb))].map(j => owner[j]).filter(o => o >= 0 && o !== id && groups[o].length + g.length <= max);
      if (!near.length) return null;
      g.forEach(i => { owner[i] = near[0]; groups[near[0]].push(i); });
      continue;
    }
    groups.push(g);
  }
  return groups.map((g, k) => ({ id: String.fromCharCode(65 + k), name: [`Piece ${String.fromCharCode(65 + k)}`, `${String.fromCharCode(65 + k)}块`, `${String.fromCharCode(65 + k)} parçası`] as [string, string, string], cells: normal(g.map(i => fig[i])), color: PALETTE[k % PALETTE.length] }));
}
