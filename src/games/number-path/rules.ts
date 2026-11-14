/**
 * Hidato (数字蛇): fill the grid with 1…N so that each number touches the next one, sideways
 * or diagonally. Some numbers are given, always including the first and the last. Generated
 * with exactly one solution.
 */
import { shuffle, type Rng } from '../../core/rng';

export interface HPuzzle { w: number; h: number; givens: number[]; solution: number[] } // 0 empty
const nbrs = (w: number, h: number, i: number) => {
  const x = i % w, y = Math.floor(i / w), out: number[] = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const a = x + dx, b = y + dy;
    if (a >= 0 && a < w && b >= 0 && b < h) out.push(b * w + a);
  }
  return out;
};
export const touches = (w: number, a: number, b: number) => a !== b && Math.abs((a % w) - (b % w)) <= 1 && Math.abs(Math.floor(a / w) - Math.floor(b / w)) <= 1;

/** A random path through every square (Warnsdorff's rule with random ties, restarting on dead ends). */
function hamPath(w: number, h: number, rng: Rng): number[] {
  const N = w * h;
  for (;;) {
    const used = new Array(N).fill(false), path = [Math.floor(rng() * N)];
    used[path[0]] = true;
    while (path.length < N) {
      const cur = path[path.length - 1];
      const opts = shuffle(nbrs(w, h, cur).filter(j => !used[j]), rng);
      if (!opts.length) break;
      const deg = (j: number) => nbrs(w, h, j).filter(k => !used[k]).length;
      opts.sort((a, b) => deg(a) - deg(b));
      const next = rng() < 0.85 ? opts[0] : opts[Math.floor(rng() * opts.length)];
      used[next] = true; path.push(next);
    }
    if (path.length === N) return path;
  }
}

/** Counts fillings up to `limit`. */
export function countSolutions(w: number, h: number, givens: number[], limit = 2): number {
  const N = w * h, where = new Array(N + 2).fill(-1);
  givens.forEach((v, i) => { if (v) where[v] = i; });
  const fixed = where.slice(), cell = givens.slice();
  const nextGiven = new Array(N + 2).fill(0);
  for (let k = N, ng = 0; k >= 1; k--) { if (fixed[k] >= 0) ng = k; nextGiven[k] = ng; }
  const cheb = (a: number, b: number) => Math.max(Math.abs((a % w) - (b % w)), Math.abs(Math.floor(a / w) - Math.floor(b / w)));
  let found = 0;
  const go = (k: number, pos: number) => {
    if (found >= limit) return;
    if (k === N) { found++; return; }
    const nk = k + 1;
    if (fixed[nk] >= 0) { if (touches(w, pos, fixed[nk])) go(nk, fixed[nk]); return; }
    const ng = nextGiven[nk];
    for (const j of nbrs(w, h, pos)) {
      if (cell[j]) continue;
      if (ng && cheb(j, fixed[ng]) > ng - nk) continue;
      cell[j] = nk; go(nk, j); cell[j] = 0;
      if (found >= limit) return;
    }
  };
  if (fixed[1] >= 0) go(1, fixed[1]);
  else for (let i = 0; i < N && found < limit; i++) if (!cell[i]) { cell[i] = 1; go(1, i); cell[i] = 0; }
  return found;
}

export function generate(w: number, h: number, rng: Rng): HPuzzle {
  const N = w * h, path = hamPath(w, h, rng), sol = new Array(N).fill(0);
  path.forEach((i, k) => { sol[i] = k + 1; });
  const givens = sol.slice();
  for (const i of shuffle([...Array(N).keys()], rng)) {
    if (sol[i] === 1 || sol[i] === N) continue;
    const v = givens[i]; givens[i] = 0;
    if (countSolutions(w, h, givens) !== 1) givens[i] = v;
  }
  return { w, h, givens, solution: sol };
}
/** Numbers that do not touch their neighbours in sequence, or repeat. */
export function mistakes(p: HPuzzle, g: number[]): Set<number> {
  const at = new Map<number, number[]>(), bad = new Set<number>();
  g.forEach((v, i) => { if (v) at.set(v, [...(at.get(v) ?? []), i]); });
  for (const [v, is] of at) {
    if (is.length > 1) is.forEach(i => bad.add(i));
    for (const n of [v - 1, v + 1]) { const js = at.get(n); if (js?.length === 1 && is.length === 1 && !touches(p.w, is[0], js[0])) { bad.add(is[0]); } }
  }
  return bad;
}
export const solved = (p: HPuzzle, g: number[]) => g.every(v => v > 0) && mistakes(p, g).size === 0;
