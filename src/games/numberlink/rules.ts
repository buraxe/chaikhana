/**
 * Numberlink (数字连线): join each pair of equal numbers with a path through neighbouring
 * squares. Paths may not cross or share squares, and together they fill the whole grid.
 * Any filling that meets the rules wins.
 */
import { shuffle, type Rng } from '../../core/rng';

export interface NPuzzle { n: number; ends: number[]; solution: number[]; paths: number[][] } // ends: pair id+1 at both ends, else 0; solution: pair id per square
const nb = (n: number, i: number) => { const x = i % n, y = Math.floor(i / n), o: number[] = []; if (x > 0) o.push(i - 1); if (x < n - 1) o.push(i + 1); if (y > 0) o.push(i - n); if (y < n - 1) o.push(i + n); return o; };
export const adjacent = (n: number, a: number, b: number) => nb(n, a).includes(b);

export function generate(n: number, rng: Rng): NPuzzle {
  for (;;) {
    const owner = new Array(n * n).fill(-1), paths: number[][] = [];
    const free = (i: number) => owner[i] < 0;
    const freeDeg = (i: number) => nb(n, i).filter(free).length;
    let ok = true;
    while (owner.includes(-1)) {
      const empties = [...owner.keys()].filter(free);
      // Start where the space is tightest, so corners and pockets get used.
      const minDeg = Math.min(...empties.map(freeDeg));
      const starts = empties.filter(i => freeDeg(i) === minDeg);
      const id = paths.length, path = [starts[Math.floor(rng() * starts.length)]];
      owner[path[0]] = id;
      const want = 3 + Math.floor(rng() * (n * 1.4));
      while (path.length < want) {
        const cur = path[path.length - 1];
        // Never step next to an earlier square of the same path: that would allow a shortcut.
        const opts = shuffle(nb(n, cur).filter(j => free(j) && nb(n, j).every(k => k === cur || owner[k] !== id)), rng);
        if (!opts.length) break;
        opts.sort((a, b) => freeDeg(a) - freeDeg(b));
        const j = rng() < 0.7 ? opts[0] : opts[opts.length - 1];
        owner[j] = id; path.push(j);
      }
      if (path.length < 3) {
        // Too short: give the squares to a neighbouring path's end, if it can take them.
        let merged = false;
        for (const c of path) for (const k of nb(n, c)) {
          const o = owner[k]; if (o < 0 || o === id || merged) continue;
          const p = paths[o];
          if (path.length === 1 && (p[0] === k || p[p.length - 1] === k) && nb(n, c).every(x => x === k || owner[x] !== o)) {
            if (p[0] === k) p.unshift(c); else p.push(c);
            owner[c] = o; merged = true;
          }
        }
        if (!merged) { ok = false; break; }
        continue;
      }
      paths.push(path);
    }
    if (!ok || paths.length < n - 1 || paths.length > Math.ceil(n * 1.5)) continue;
    const ends = new Array(n * n).fill(0), solution = new Array(n * n).fill(0);
    paths.forEach((p, k) => { ends[p[0]] = k + 1; ends[p[p.length - 1]] = k + 1; p.forEach(i => { solution[i] = k; }); });
    return { n, ends, solution, paths };
  }
}

/** A drawn path per pair: a list of squares starting at one of its ends. */
export type Lines = number[][];
/** Which pairs are joined end to end along a proper path. */
export function connected(p: NPuzzle, lines: Lines): boolean[] {
  return lines.map((l, k) => {
    if (l.length < 2) return false;
    const a = l[0], b = l[l.length - 1];
    if (p.ends[a] !== k + 1 || p.ends[b] !== k + 1 || a === b) return false;
    for (let i = 1; i < l.length; i++) if (!adjacent(p.n, l[i - 1], l[i])) return false;
    return true;
  });
}
export function solved(p: NPuzzle, lines: Lines): boolean {
  const pairs = Math.max(...p.ends);
  if (lines.length < pairs || !connected(p, lines).slice(0, pairs).every(Boolean)) return false;
  const used = new Set<number>();
  for (const l of lines) for (const i of l) { if (used.has(i)) return false; used.add(i); }
  return used.size === p.n * p.n;
}
