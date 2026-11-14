import type { Level } from '../../core/match';

/** Amiral Battı on a 10×10 grid. Cells are r * 10 + c. */
export const N = 10;
export const FLEET = [5, 4, 3, 3, 2];
export interface Ship { cells: number[]; size: number }
export interface Side { ships: Ship[]; shots: number[] } // shots this side has received
export const shipAt = (s: Side, i: number) => s.ships.findIndex(sh => sh.cells.includes(i));
export const sunk = (s: Side, k: number) => s.ships[k].cells.every(c => s.shots.includes(c));
export const allSunk = (s: Side) => s.ships.every((_, k) => sunk(s, k));

/** Ship cells from a bow square and a direction, or null if it runs off the board. */
export function shipCells(at: number, size: number, hor: boolean): number[] | null {
  const r = Math.floor(at / N), c = at % N;
  if (hor ? c + size > N : r + size > N) return null;
  return Array.from({ length: size }, (_, k) => (hor ? at + k : at + k * N));
}
/** Can a ship go here without overlapping or touching (even at a corner) the others? */
export function fits(ships: Ship[], cells: number[]): boolean {
  const near = new Set<number>();
  for (const sh of ships) for (const i of sh.cells) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = Math.floor(i / N) + dr, cc = (i % N) + dc; if (rr >= 0 && rr < N && cc >= 0 && cc < N) near.add(rr * N + cc);
  }
  return cells.every(i => !near.has(i));
}
/** A random legal fleet: no overlaps, and ships do not touch, even at corners. */
export function randomFleet(rng: () => number = Math.random): Ship[] {
  for (;;) {
    const taken = new Set<number>(), ships: Ship[] = [];
    let ok = true;
    for (const size of FLEET) {
      let placed = false;
      for (let t = 0; t < 200 && !placed; t++) {
        const hor = rng() < 0.5, r = Math.floor(rng() * (hor ? N : N - size + 1)), c = Math.floor(rng() * (hor ? N - size + 1 : N));
        const cells = Array.from({ length: size }, (_, k) => (hor ? r * N + c + k : (r + k) * N + c));
        if (cells.some(i => taken.has(i))) continue;
        ships.push({ cells, size }); placed = true;
        for (const i of cells) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const rr = Math.floor(i / N) + dr, cc = (i % N) + dc;
          if (rr >= 0 && rr < N && cc >= 0 && cc < N) taken.add(rr * N + cc);
        }
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return ships;
  }
}

export const LEVELS: (Level & { kind: number })[] = [
  { name: 'Beginner', rating: 700, kind: 0 }, { name: 'Easy', rating: 900, kind: 1 },
  { name: 'Intermediate', rating: 1150, kind: 2 }, { name: 'Advanced', rating: 1400, kind: 3 },
  { name: 'Expert', rating: 1650, kind: 4 },
];
const nb = (i: number) => {
  const r = Math.floor(i / N), c = i % N, out: number[] = [];
  if (r > 0) out.push(i - N); if (r < N - 1) out.push(i + N); if (c > 0) out.push(i - 1); if (c < N - 1) out.push(i + 1);
  return out;
};
/** What the shooter knows about the target: hits on ships not yet sunk, and sunk ship sizes. */
export function chooseShot(target: Side, level: number, rng: () => number = Math.random): number {
  const kind = LEVELS[level].kind, shot = new Set(target.shots);
  const open = Array.from({ length: N * N }, (_, i) => i).filter(i => !shot.has(i));
  const pickRand = (xs: number[]) => xs[Math.floor(rng() * xs.length)];
  if (kind === 0) return pickRand(open);
  const sunkCells = new Set(target.ships.flatMap((sh, k) => (sunk(target, k) ? sh.cells : [])));
  // Cells around a sunk ship cannot hold another ship (ships never touch).
  const dead = new Set<number>();
  for (const i of sunkCells) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const rr = Math.floor(i / N) + dr, cc = (i % N) + dc; if (rr >= 0 && rr < N && cc >= 0 && cc < N) dead.add(rr * N + cc);
  }
  const live = target.shots.filter(i => shipAt(target, i) >= 0 && !sunkCells.has(i));
  const usable = open.filter(i => kind < 2 || !dead.has(i));
  if (live.length) {
    // Hunt along the line if two hits line up, otherwise around any hit.
    let cand: number[] = [];
    if (kind >= 2 && live.length >= 2) {
      const sameRow = live.every(i => Math.floor(i / N) === Math.floor(live[0] / N));
      const sameCol = live.every(i => i % N === live[0] % N);
      if (sameRow || sameCol) {
        const sorted = live.slice().sort((a, b) => a - b), step = sameRow ? 1 : N;
        const ends = [sorted[0] - step, sorted[sorted.length - 1] + step].filter(i => i >= 0 && i < N * N && (!sameRow || Math.floor(i / N) === Math.floor(sorted[0] / N)));
        cand = ends.filter(i => usable.includes(i));
      }
    }
    if (!cand.length) cand = [...new Set(live.flatMap(nb))].filter(i => usable.includes(i));
    if (cand.length) return pickRand(cand);
  }
  if (kind <= 2) {
    const pool = kind === 2 ? usable.filter(i => (Math.floor(i / N) + (i % N)) % 2 === 0) : usable;
    return pickRand(pool.length ? pool : usable.length ? usable : open);
  }
  // Probability density: count the ways each remaining ship could lie over each cell.
  const left = target.ships.filter((_, k) => !sunk(target, k)).map(s => s.size);
  const blocked = new Set([...shot].filter(i => shipAt(target, i) < 0 || sunkCells.has(i)).concat([...dead].filter(i => !live.includes(i))));
  const heat = new Array(N * N).fill(0);
  for (const size of left) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const hor of [true, false]) {
    if (hor ? c + size > N : r + size > N) continue;
    const cells = Array.from({ length: size }, (_, k) => (hor ? r * N + c + k : (r + k) * N + c));
    if (cells.some(i => blocked.has(i))) continue;
    for (const i of cells) if (!shot.has(i)) heat[i] += 1 + (kind === 4 && (r + c) % 2 === 0 ? 0.2 : 0);
  }
  let best = -1, bestV = -1;
  for (const i of open) if (heat[i] > bestV || (heat[i] === bestV && rng() < 0.3)) { bestV = heat[i]; best = i; }
  return best >= 0 ? best : pickRand(open);
}
