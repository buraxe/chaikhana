/**
 * Rubik's cube state for any size N (2–5 here). Each sticker has the position of its cubie
 * (in doubled coordinates, so centres sit on −(N−1)…(N−1) in steps of 2), the direction it
 * faces, and its colour. A move turns every sticker in one layer by 90° about an axis.
 * Whole-cube rotations turn every layer and do not change whether the cube is solved.
 */
export type Vec = [number, number, number];
export type Axis = 0 | 1 | 2;
export interface Sticker { p: Vec; n: Vec; color: number }
export interface Cube { size: number; stickers: Sticker[] }
/** layer −1 means the whole cube. dir is the sign of a 90° right-handed turn about +axis. */
export interface Move { axis: Axis; layer: number; dir: 1 | -1 }

// Colours by starting face: U white, D yellow, F green, B blue, R red, L orange.
export const FACE_NORMALS: Record<string, Vec> = { U: [0, 1, 0], D: [0, -1, 0], R: [1, 0, 0], L: [-1, 0, 0], F: [0, 0, 1], B: [0, 0, -1] };
export const FACE_COLOR: Record<string, number> = { U: 0, D: 1, F: 2, B: 3, R: 4, L: 5 };

export function solved(size: number): Cube {
  const stickers: Sticker[] = [], m = size - 1;
  for (const [face, nrm] of Object.entries(FACE_NORMALS)) {
    const axis = nrm.findIndex(v => v !== 0), sign = nrm[axis];
    for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) {
      const p: Vec = [0, 0, 0], others = [0, 1, 2].filter(k => k !== axis);
      p[axis] = sign * m; p[others[0]] = 2 * a - m; p[others[1]] = 2 * b - m;
      stickers.push({ p, n: [...nrm] as Vec, color: FACE_COLOR[face] });
    }
  }
  return { size, stickers };
}
export function rot(v: Vec, axis: Axis, s: number): Vec {
  const [x, y, z] = v;
  if (axis === 0) return [x, -s * z, s * y];
  if (axis === 1) return [s * z, y, -s * x];
  return [-s * y, s * x, z];
}
export const layerCoord = (size: number, layer: number) => 2 * layer - (size - 1);
export function apply(c: Cube, mv: Move): Cube {
  const coord = layerCoord(c.size, mv.layer);
  return {
    size: c.size,
    stickers: c.stickers.map(st => (mv.layer < 0 || st.p[mv.axis] === coord ? { p: rot(st.p, mv.axis, mv.dir), n: rot(st.n, mv.axis, mv.dir), color: st.color } : st)),
  };
}
export const applyAll = (c: Cube, moves: Move[]) => moves.reduce(apply, c);
export function isSolved(c: Cube): boolean {
  const seen = new Map<string, number>();
  for (const st of c.stickers) {
    const k = st.n.join(','), col = seen.get(k);
    if (col === undefined) seen.set(k, st.color); else if (col !== st.color) return false;
  }
  return true;
}
export const inverse = (m: Move): Move => ({ ...m, dir: (-m.dir) as 1 | -1 });
export const isRotation = (m: Move) => m.layer < 0;

/** Standard notation for the outer faces; prime turns counter-clockwise, 2 turns twice. */
export function faceMove(size: number, face: string, prime = false): Move {
  const top = size - 1;
  const base: Record<string, Move> = {
    U: { axis: 1, layer: top, dir: -1 }, D: { axis: 1, layer: 0, dir: 1 }, R: { axis: 0, layer: top, dir: -1 },
    L: { axis: 0, layer: 0, dir: 1 }, F: { axis: 2, layer: top, dir: -1 }, B: { axis: 2, layer: 0, dir: 1 },
    x: { axis: 0, layer: -1, dir: -1 }, y: { axis: 1, layer: -1, dir: -1 }, z: { axis: 2, layer: -1, dir: -1 },
  };
  const m = base[face];
  return prime ? inverse(m) : m;
}
/** "R U' F2" → moves. */
export function parse(size: number, text: string): Move[] {
  const out: Move[] = [];
  for (const tok of text.trim().split(/\s+/).filter(Boolean)) {
    const face = tok[0], m = faceMove(size, face, tok.includes("'"));
    out.push(m);
    if (tok.includes('2')) out.push(m);
  }
  return out;
}
export function scramble(size: number, length: number, rng: () => number = Math.random): Move[] {
  const out: Move[] = [];
  let lastAxis = -1;
  while (out.length < length) {
    const axis = Math.floor(rng() * 3) as Axis;
    if (axis === lastAxis) continue;
    lastAxis = axis;
    // On 4×4 and 5×5, inner layers are turned too.
    const layer = Math.floor(rng() * size);
    if (size === 3 && layer === 1 && rng() < 0.85) continue; // keep 3×3 scrambles mostly face turns
    out.push({ axis, layer, dir: rng() < 0.5 ? 1 : -1 });
  }
  return out;
}

/**
 * Kociemba facelet string for a 3×3 (URFDLB, 9 each, read as seen from outside with the
 * usual orientation). Letters come from the centre colours, so any whole-cube orientation works.
 */
export function facelets3(c: Cube): string {
  if (c.size !== 3) throw new Error('3x3 only');
  const at = (n: Vec, p: Vec) => c.stickers.find(s => s.n[0] === n[0] && s.n[1] === n[1] && s.n[2] === n[2] && s.p[0] === p[0] * 2 && s.p[1] === p[1] * 2 && s.p[2] === p[2] * 2)!.color;
  const index: Record<string, (r: number, k: number) => Vec> = {
    U: (r, k) => [k - 1, 1, r - 1], R: (r, k) => [1, 1 - r, 1 - k], F: (r, k) => [k - 1, 1 - r, 1],
    D: (r, k) => [k - 1, -1, 1 - r], L: (r, k) => [-1, 1 - r, k - 1], B: (r, k) => [1 - k, 1 - r, -1],
  };
  const centre: Record<number, string> = {};
  for (const f of 'URFDLB') centre[at(FACE_NORMALS[f], FACE_NORMALS[f])] = f;
  let s = '';
  for (const f of 'URFDLB') for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) s += centre[at(FACE_NORMALS[f], index[f](r, k))];
  return s;
}
/**
 * A 2×2 seen as the corners of a 3×3. The corner at down-back-left fixes the orientation;
 * edges and centres are filled in solved, with two edges swapped if the corner permutation
 * is odd, so the result is always a legal 3×3 position.
 */
export function facelets2as3(c: Cube): string {
  const corner = (x: number, y: number, z: number) => c.stickers.filter(s => s.p[0] === x && s.p[1] === y && s.p[2] === z);
  const ref = corner(-1, -1, -1);
  const colorOn = (stks: Sticker[], n: Vec) => stks.find(s => s.n[0] === n[0] && s.n[1] === n[1] && s.n[2] === n[2])!.color;
  const opposite = (col: number) => [1, 0, 3, 2, 5, 4][col];
  const D = colorOn(ref, [0, -1, 0]), B = colorOn(ref, [0, 0, -1]), L = colorOn(ref, [-1, 0, 0]);
  const scheme: Record<string, number> = { U: opposite(D), D, F: opposite(B), B, R: opposite(L), L };
  const letter: Record<number, string> = {};
  for (const f of 'URFDLB') letter[scheme[f]] = f;
  // Build a 3×3 by placing the 2×2 corner stickers at the 3×3 corners.
  const big = solved(3);
  const stickers = big.stickers.map(st => {
    const cornerPos = st.p.every(v => v !== 0);
    if (!cornerPos) {
      const face = Object.keys(FACE_NORMALS).find(f => FACE_NORMALS[f].every((v, i) => v === st.n[i]))!;
      return { ...st, color: scheme[face] };
    }
    const src = c.stickers.find(s => s.n.every((v, i) => v === st.n[i]) && s.p.every((v, i) => Math.sign(v) === Math.sign(st.p[i])))!;
    return { ...st, color: src.color };
  });
  let s = facelets3({ size: 3, stickers });
  // Centres in this 3×3 always match the scheme, so letters are already right. Fix parity.
  const cornerSlots: Vec[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) cornerSlots.push([x, y, z]);
  const faceOfColor = (col: number) => FACE_NORMALS[letter[col]];
  const perm = cornerSlots.map(slot => {
    const cols = corner(slot[0], slot[1], slot[2]).map(x => x.color);
    const home: Vec = [0, 0, 0];
    for (const col of cols) { const n = faceOfColor(col); const ax = n.findIndex(v => v !== 0); home[ax] = n[ax]; }
    return cornerSlots.findIndex(q => q[0] === home[0] && q[1] === home[1] && q[2] === home[2]);
  });
  let parity = 0;
  const seen = new Array(8).fill(false);
  for (let i = 0; i < 8; i++) { if (seen[i]) continue; let j = i, len = 0; while (!seen[j]) { seen[j] = true; j = perm[j]; len++; } parity += len - 1; }
  if (parity % 2) {
    // Swap the UF and UR edges: facelets U8/F2 and U6/R2 (1-based within each face).
    const a = s.split('');
    const swap = (i: number, j: number) => { const t = a[i]; a[i] = a[j]; a[j] = t; };
    swap(7, 5); swap(18 + 1, 9 + 1);
    s = a.join('');
  }
  void letter;
  return s;
}
