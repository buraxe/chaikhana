/**
 * Chinese knot: a grid of tiles, each carrying a piece of red cord (a bend, a straight, or two
 * cords crossing). Turn the tiles until every cord end meets another, so the cord forms closed
 * loops with no loose ends and nothing runs off the board. Puzzles are made by laying several
 * rectangular loops that cross each other square-on, then turning every tile at random.
 */
export const N = 1, E = 2, S = 4, Wb = 8;
export type Mask = number;
export const rot = (m: Mask): Mask => ((m << 1) | (m >> 3)) & 15;
export interface KPuzzle { w: number; h: number; goal: Mask[]; start: Mask[] }

function layLoops(w: number, h: number, rnd: () => number): Mask[] | null {
  const m: Mask[] = Array(w * h).fill(0);
  const want = Math.round(w * h * 0.6);
  let placed = 0, filled = 0;
  for (let tries = 0; tries < 400 && filled < want; tries++) {
    const r0 = Math.floor(rnd() * (h - 1)), c0 = Math.floor(rnd() * (w - 1));
    const r1 = r0 + 1 + Math.floor(rnd() * (h - r0 - 1)), c1 = c0 + 1 + Math.floor(rnd() * (w - c0 - 1));
    // The rectangle's outline through cell centres, as bits per cell.
    const add = new Map<number, Mask>();
    const put = (r: number, c: number, b: Mask) => add.set(r * w + c, (add.get(r * w + c) ?? 0) | b);
    for (let c = c0; c < c1; c++) { put(r0, c, E); put(r0, c + 1, Wb); put(r1, c, E); put(r1, c + 1, Wb); }
    for (let r = r0; r < r1; r++) { put(r, c0, S); put(r + 1, c0, N); put(r, c1, S); put(r + 1, c1, N); }
    // It may only meet existing cord by crossing it square-on: straight over straight.
    let ok = true;
    for (const [i, b] of add) {
      if (!m[i]) continue;
      const crossOk = (m[i] === (N | S) && b === (E | Wb)) || (m[i] === (E | Wb) && b === (N | S));
      if (!crossOk) { ok = false; break; }
    }
    if (!ok) continue;
    for (const [i, b] of add) { if (!m[i]) filled++; m[i] |= b; }
    placed++;
  }
  return placed >= 2 ? m : null;
}

export function generate(w: number, h: number, rnd: () => number = Math.random): KPuzzle {
  for (;;) {
    const goal = layLoops(w, h, rnd);
    if (!goal || !goal.some(x => x === 15)) continue; // at least one crossing, or it is no knot
    const start = goal.map(m => { let x = m; const k = Math.floor(rnd() * 4); for (let i = 0; i < k; i++) x = rot(x); return x; });
    if (!closed(w, h, start)) return { w, h, goal, start };
  }
}

/** Every cord end meets a matching end, and none runs off the board. */
export function closed(w: number, h: number, m: Mask[]): boolean {
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const x = m[r * w + c];
    if (x & N && (r === 0 || !(m[(r - 1) * w + c] & S))) return false;
    if (x & S && (r === h - 1 || !(m[(r + 1) * w + c] & N))) return false;
    if (x & Wb && (c === 0 || !(m[r * w + c - 1] & E))) return false;
    if (x & E && (c === w - 1 || !(m[r * w + c + 1] & Wb))) return false;
  }
  return true;
}
/** Loose ends at a cell: bits that point at nothing. */
export function loose(w: number, h: number, m: Mask[], i: number): Mask {
  const r = Math.floor(i / w), c = i % w, x = m[i];
  let out = 0;
  if (x & N && (r === 0 || !(m[i - w] & S))) out |= N;
  if (x & S && (r === h - 1 || !(m[i + w] & N))) out |= S;
  if (x & Wb && (c === 0 || !(m[i - 1] & E))) out |= Wb;
  if (x & E && (c === w - 1 || !(m[i + 1] & Wb))) out |= E;
  return out;
}
