/**
 * Snake cube (蛇形立方): 27 wooden cubes on an elastic string. Some cubes let the chain turn;
 * twisting a joint swings the rest of the chain around. Fold it into a 3×3×3 cube.
 *
 * A snake is a list of straight runs (each run's cube count includes the corner it shares
 * with the next). The shape is one twist per joint, 0–3, each a quarter turn.
 */
export type V3 = [number, number, number];
export interface Snake { id: string; name: [string, string, string]; runs: number[] }
export const SNAKES: Snake[] = [
  { id: 'classic', name: ['Classic', '经典', 'Klasik'], runs: [3, 2, 2, 3, 2, 3, 2, 2, 3, 3, 2, 2, 2, 3, 3, 3, 3] },
];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const neg = (a: V3): V3 => [-a[0], -a[1], -a[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Turns `u` a quarter turn `k` times around axis `d` (both unit axis vectors, u ⊥ d). */
function turn(u: V3, d: V3, k: number): V3 { let v = u; for (let i = 0; i < k; i++) v = cross(d, v); return v; }

/** Positions of every cube for a set of twists. */
export function layout(runs: number[], twists: number[]): V3[] {
  let p: V3 = [0, 0, 0], d: V3 = [1, 0, 0], up: V3 = [0, 1, 0];
  const out: V3[] = [p];
  runs.forEach((len, r) => {
    if (r > 0) {
      // The new direction is perpendicular to the old one, chosen by the twist.
      const nd = turn(up, d, twists[r - 1] ?? 0);
      up = neg(d); d = nd;
    }
    for (let k = 1; k < len; k++) { p = add(p, d); out.push(p); }
  });
  return out;
}
export const cubes = (runs: number[]) => runs.reduce((a, b) => a + b, 0) - (runs.length - 1);
/** Which cube indexes are joints (where run r+1 starts). */
export function joints(runs: number[]): number[] { const o: number[] = []; let i = 0; runs.forEach((len, r) => { i += len - 1; if (r < runs.length - 1) o.push(i); }); return o; }
export function collides(pos: V3[]): Set<number> {
  const seen = new Map<string, number>(), bad = new Set<number>();
  pos.forEach((p, i) => { const k = p.join(','); if (seen.has(k)) { bad.add(i); bad.add(seen.get(k)!); } else seen.set(k, i); });
  return bad;
}
const span = (pos: V3[]) => [0, 1, 2].map(a => Math.max(...pos.map(p => p[a])) - Math.min(...pos.map(p => p[a])) + 1);
export function solved(runs: number[], twists: number[]): boolean {
  const pos = layout(runs, twists);
  return collides(pos).size === 0 && span(pos).every(s => s <= 3);
}
/** A folding into the cube, keeping the given twists for the first `keep` joints. */
export function solve(runs: number[], twists: number[] = [], keep = 0): number[] | null {
  const n = runs.length - 1, tw = twists.slice(0, keep);
  const go = (j: number): boolean => {
    const pos = layout(runs.slice(0, j + 1), tw);
    if (collides(pos).size || span(pos).some(s => s > 3)) return false;
    if (j === n) return true;
    for (let k = 0; k < 4; k++) { tw[j] = k; if (go(j + 1)) return true; }
    tw.length = j;
    return false;
  };
  return go(keep) ? tw.slice() : null;
}
/** A random snake that is sure to fold: a random path through the cube, cut into runs. */
export function randomSnake(rng: () => number): number[] {
  const inCube = (p: V3) => p.every(v => v >= 0 && v < 3);
  for (;;) {
    const start: V3 = [Math.floor(rng() * 3), Math.floor(rng() * 3), Math.floor(rng() * 3)];
    const path: V3[] = [start], seen = new Set([start.join(',')]);
    const dirs: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    const go = (): boolean => {
      if (path.length === 27) return true;
      const cur = path[path.length - 1];
      for (const d of dirs.slice().sort(() => rng() - 0.5)) {
        const nx = add(cur, d), k = nx.join(',');
        if (!inCube(nx) || seen.has(k)) continue;
        path.push(nx); seen.add(k);
        if (go()) return true;
        path.pop(); seen.delete(k);
      }
      return false;
    };
    if (!go()) continue;
    const runs: number[] = []; let len = 2;
    for (let i = 2; i < 27; i++) {
      const a = path[i - 1].map((v, k) => v - path[i - 2][k]).join(), b = path[i].map((v, k) => v - path[i - 1][k]).join();
      if (a === b) len++; else { runs.push(len); len = 2; }
    }
    runs.push(len);
    // Runs of three or less, like the real toys, and plenty of joints.
    if (runs.every(r => r <= 3) && runs.length >= 14) return runs;
  }
}
