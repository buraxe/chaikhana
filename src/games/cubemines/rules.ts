/**
 * Minesweeper on the surface of a cube. Each face is an n×n grid; two squares are neighbours
 * when they share a corner, so the grids join up across the edges and corners of the cube.
 */
export interface Cell { face: number; u: number; v: number; center: [number, number, number]; normal: [number, number, number] }
export interface CMState { n: number; mines: number; mine: boolean[]; open: boolean[]; flag: boolean[]; status: 'ready' | 'playing' | 'won' | 'lost'; boom: number }

const FACES: { axis: 0 | 1 | 2; side: 0 | 1 }[] = [{ axis: 0, side: 1 }, { axis: 0, side: 0 }, { axis: 1, side: 1 }, { axis: 1, side: 0 }, { axis: 2, side: 1 }, { axis: 2, side: 0 }];
const cache = new Map<number, { cells: Cell[]; nb: number[][] }>();
export function geometry(n: number) {
  const hit = cache.get(n); if (hit) return hit;
  const cells: Cell[] = [], corners: string[][] = [];
  FACES.forEach((f, face) => {
    const [b, c] = [0, 1, 2].filter(a => a !== f.axis) as [number, number];
    for (let v = 0; v < n; v++) for (let u = 0; u < n; u++) {
      const key = (du: number, dv: number) => { const p = [0, 0, 0]; p[f.axis] = f.side * n; p[b] = u + du; p[c] = v + dv; return p.join(','); };
      corners.push([key(0, 0), key(1, 0), key(0, 1), key(1, 1)]);
      const ctr: [number, number, number] = [0, 0, 0], nor: [number, number, number] = [0, 0, 0];
      ctr[f.axis] = f.side * n - n / 2; ctr[b] = u + 0.5 - n / 2; ctr[c] = v + 0.5 - n / 2; nor[f.axis] = f.side ? 1 : -1;
      cells.push({ face, u, v, center: ctr, normal: nor });
    }
  });
  const byCorner = new Map<string, number[]>();
  corners.forEach((cs, i) => cs.forEach(k => { const a = byCorner.get(k) ?? []; a.push(i); byCorner.set(k, a); }));
  const nb = corners.map((cs, i) => [...new Set(cs.flatMap(k => byCorner.get(k)!))].filter(j => j !== i));
  const g = { cells, nb }; cache.set(n, g); return g;
}
export const PRESETS = { small: { n: 4, mines: 12 }, medium: { n: 5, mines: 22 }, large: { n: 6, mines: 36 } };
export function newGame(n: number, mines: number): CMState {
  const k = 6 * n * n;
  return { n, mines, mine: new Array(k).fill(false), open: new Array(k).fill(false), flag: new Array(k).fill(false), status: 'ready', boom: -1 };
}
export const count = (st: CMState, i: number) => geometry(st.n).nb[i].filter(j => st.mine[j]).length;
function lay(st: CMState, safe: number, rng: () => number): boolean[] {
  const { nb } = geometry(st.n), k = st.mine.length, keep = new Set([safe, ...nb[safe]]);
  const pool = Array.from({ length: k }, (_, i) => i).filter(i => !keep.has(i));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const mine = new Array(k).fill(false); for (const i of pool.slice(0, st.mines)) mine[i] = true;
  return mine;
}
export function reveal(st: CMState, i: number, rng: () => number = Math.random): CMState {
  if (st.status === 'won' || st.status === 'lost' || st.open[i] || st.flag[i]) return st;
  const s: CMState = { ...st, mine: st.status === 'ready' ? lay(st, i, rng) : st.mine, open: st.open.slice(), status: 'playing' };
  if (s.mine[i]) { s.open[i] = true; s.status = 'lost'; s.boom = i; return s; }
  const { nb } = geometry(s.n), stack = [i];
  while (stack.length) {
    const c = stack.pop()!; if (s.open[c] || st.flag[c]) continue;
    s.open[c] = true;
    if (count(s, c) === 0) for (const j of nb[c]) if (!s.open[j] && !s.mine[j]) stack.push(j);
  }
  if (s.open.every((o, k) => o || s.mine[k])) s.status = 'won';
  return s;
}
export function toggleFlag(st: CMState, i: number): CMState {
  if (st.status !== 'playing' || st.open[i]) return st;
  const flag = st.flag.slice(); flag[i] = !flag[i]; return { ...st, flag };
}
/** Tapping an open number whose flags are all placed opens the rest of its neighbours. */
export function chord(st: CMState, i: number): CMState {
  if (st.status !== 'playing' || !st.open[i]) return st;
  const nb = geometry(st.n).nb[i];
  if (nb.filter(j => st.flag[j]).length !== count(st, i)) return st;
  let s = st;
  for (const j of nb) if (!s.open[j] && !s.flag[j]) s = reveal(s, j);
  return s;
}
