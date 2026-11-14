/** 2048: slide the tiles; equal tiles that meet merge into one of double value. */
import type { Rng } from '../../core/rng';

export type Dir = 'up' | 'down' | 'left' | 'right';
export interface B48 { cells: number[]; score: number; moves: number }
export const N48 = 4;
export function spawn(cells: number[], rng: Rng): number[] {
  const empty = cells.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  if (!empty.length) return cells;
  const out = cells.slice(); out[empty[Math.floor(rng() * empty.length)]] = rng() < 0.9 ? 2 : 4; return out;
}
export const fresh48 = (rng: Rng): B48 => ({ cells: spawn(spawn(new Array(16).fill(0), rng), rng), score: 0, moves: 0 });
/** The lines of indices in the order tiles slide towards. */
function lines(d: Dir): number[][] {
  const out: number[][] = [];
  for (let k = 0; k < 4; k++) {
    const l: number[] = [];
    for (let j = 0; j < 4; j++) l.push(d === 'left' ? k * 4 + j : d === 'right' ? k * 4 + 3 - j : d === 'up' ? j * 4 + k : (3 - j) * 4 + k);
    out.push(l);
  }
  return out;
}
/** Slides without spawning; returns null if nothing moves. Also returns where merges happened. */
export function slide(b: B48, d: Dir): { b: B48; merged: number[] } | null {
  const cells = b.cells.slice(); let gain = 0, moved = false; const merged: number[] = [];
  for (const l of lines(d)) {
    const vals = l.map(i => cells[i]).filter(Boolean), out: number[] = [];
    for (let k = 0; k < vals.length; k++) {
      if (k + 1 < vals.length && vals[k] === vals[k + 1]) { out.push(vals[k] * 2); gain += vals[k] * 2; merged.push(l[out.length - 1]); k++; }
      else out.push(vals[k]);
    }
    l.forEach((i, k) => { const v = out[k] ?? 0; if (cells[i] !== v) moved = true; cells[i] = v; });
  }
  return moved ? { b: { cells, score: b.score + gain, moves: b.moves + 1 }, merged } : null;
}
export const canMove = (b: B48) => (['up', 'down', 'left', 'right'] as Dir[]).some(d => slide(b, d));
export const best = (b: B48) => Math.max(...b.cells);
