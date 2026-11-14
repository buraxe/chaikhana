/**
 * Slitherlink (数回): draw one closed loop along the grid lines. Each number tells how many of
 * the four sides of its square the loop uses. Generated with exactly one solution.
 *
 * Edges: horizontal edge (r, c) for r in 0…h, c in 0…w−1 has index r*w + c; vertical edge
 * (r, c) for r in 0…h−1, c in 0…w has index H + r*(w+1) + c, where H = (h+1)*w.
 */
import { shuffle, type Rng } from '../../core/rng';

export interface SPuzzle { w: number; h: number; clues: number[]; solution: number[] } // clue −1 = none; solution: 1 on loop
export const edgeCount = (w: number, h: number) => (h + 1) * w + h * (w + 1);
export const hEdge = (w: number, r: number, c: number) => r * w + c;
export const vEdge = (w: number, h: number, r: number, c: number) => (h + 1) * w + r * (w + 1) + c;
/** The four edges around square (r, c): top, bottom, left, right. */
export const cellEdges = (w: number, h: number, r: number, c: number) => [hEdge(w, r, c), hEdge(w, r + 1, c), vEdge(w, h, r, c), vEdge(w, h, r, c + 1)];
/** The edges meeting at dot (r, c). */
export function dotEdges(w: number, h: number, r: number, c: number): number[] {
  const out: number[] = [];
  if (c > 0) out.push(hEdge(w, r, c - 1));
  if (c < w) out.push(hEdge(w, r, c));
  if (r > 0) out.push(vEdge(w, h, r - 1, c));
  if (r < h) out.push(vEdge(w, h, r, c));
  return out;
}
/** The two dots an edge joins. */
export function edgeDots(w: number, h: number, e: number): [number, number] {
  const H = (h + 1) * w;
  if (e < H) { const r = Math.floor(e / w), c = e % w; return [r * (w + 1) + c, r * (w + 1) + c + 1]; }
  const k = e - H, r = Math.floor(k / (w + 1)), c = k % (w + 1);
  return [r * (w + 1) + c, (r + 1) * (w + 1) + c];
}

/** A loop: the boundary of a random connected, hole-free region of squares. */
function randomLoop(w: number, h: number, rng: Rng): number[] {
  for (;;) {
    const inside = new Array(w * h).fill(false), start = Math.floor(rng() * w * h);
    inside[start] = true;
    const target = Math.floor(w * h * (0.45 + rng() * 0.2));
    let size = 1;
    for (let guard = 0; size < target && guard < 5000; guard++) {
      const i = Math.floor(rng() * w * h);
      if (inside[i]) continue;
      const r = Math.floor(i / w), c = i % w;
      const nbIn = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && a < h && b >= 0 && b < w && inside[a * w + b]).length;
      if (!nbIn) continue;
      inside[i] = true;
      if (!simple(w, h, inside)) { inside[i] = false; continue; }
      size++;
    }
    const sol = new Array(edgeCount(w, h)).fill(0);
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      const me = inside[r * w + c], at = (a: number, b: number) => a >= 0 && a < h && b >= 0 && b < w && inside[a * w + b];
      const [t, bo, l, ri] = cellEdges(w, h, r, c);
      if (me !== at(r - 1, c)) sol[t] = 1; if (me !== at(r + 1, c)) sol[bo] = 1;
      if (me !== at(r, c - 1)) sol[l] = 1; if (me !== at(r, c + 1)) sol[ri] = 1;
    }
    if (isLoop(w, h, sol)) return sol;
  }
}
/** The region and its outside are both connected (outside counts the border), so its edge is one loop. */
function simple(w: number, h: number, inside: boolean[]): boolean {
  const flood = (want: boolean) => {
    const seen = new Set<number>(); const st: number[] = [];
    if (!want) { for (let i = 0; i < w * h; i++) { const r = Math.floor(i / w), c = i % w; if (!inside[i] && (r === 0 || c === 0 || r === h - 1 || c === w - 1)) { seen.add(i); st.push(i); } } }
    else { const i = inside.indexOf(true); seen.add(i); st.push(i); }
    while (st.length) { const i = st.pop()!, r = Math.floor(i / w), c = i % w;
      for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) { if (a < 0 || a >= h || b < 0 || b >= w) continue; const j = a * w + b; if (inside[j] !== want || seen.has(j)) continue; seen.add(j); st.push(j); } }
    return seen.size;
  };
  const nIn = inside.filter(Boolean).length;
  // Corner-touching squares would make the boundary cross itself at a dot.
  for (let r = 0; r < h - 1; r++) for (let c = 0; c < w - 1; c++) {
    const a = inside[r * w + c], b = inside[r * w + c + 1], d = inside[(r + 1) * w + c], e = inside[(r + 1) * w + c + 1];
    if ((a && e && !b && !d) || (b && d && !a && !e)) return false;
  }
  return flood(true) === nIn && flood(false) === w * h - nIn;
}
/** The chosen edges form exactly one closed loop. */
export function isLoop(w: number, h: number, on: number[]): boolean {
  const deg = new Array((w + 1) * (h + 1)).fill(0), adj: number[][] = Array.from({ length: (w + 1) * (h + 1) }, () => []);
  let first = -1, n = 0;
  on.forEach((v, e) => { if (v !== 1) return; const [a, b] = edgeDots(w, h, e); deg[a]++; deg[b]++; adj[a].push(b); adj[b].push(a); first = a; n++; });
  if (!n || deg.some(d => d !== 0 && d !== 2)) return false;
  const seen = new Set([first]), st = [first];
  while (st.length) { const x = st.pop()!; for (const y of adj[x]) if (!seen.has(y)) { seen.add(y); st.push(y); } }
  return seen.size === deg.filter(d => d).length;
}

/** Counts loops matching the clues, up to limit. Edge states: 1 line, 0 cross, −1 unknown. */
export function countSolutions(w: number, h: number, clues: number[], limit = 2): number {
  const E = edgeCount(w, h), dots = (w + 1) * (h + 1);
  const dotE = Array.from({ length: dots }, (_, d) => dotEdges(w, h, Math.floor(d / (w + 1)), d % (w + 1)));
  const cellE = Array.from({ length: w * h }, (_, i) => cellEdges(w, h, Math.floor(i / w), i % w));
  const eCells: number[][] = Array.from({ length: E }, () => []);
  cellE.forEach((es, i) => es.forEach(e => eCells[e].push(i)));
  const eDots = Array.from({ length: E }, (_, e) => edgeDots(w, h, e));
  let found = 0;
  const propagate = (s: number[]): boolean => {
    const queue: number[] = [];
    const setE = (e: number, v: number) => { if (s[e] === v) return true; if (s[e] !== -1) return false; s[e] = v; queue.push(e); return true; };
    const checkCell = (i: number) => {
      if (clues[i] < 0) return true;
      const es = cellE[i]; let on = 0, unk = 0;
      for (const e of es) { if (s[e] === 1) on++; else if (s[e] === -1) unk++; }
      if (on > clues[i] || on + unk < clues[i]) return false;
      if (unk && on === clues[i]) { for (const e of es) if (s[e] === -1 && !setE(e, 0)) return false; }
      else if (unk && on + unk === clues[i]) { for (const e of es) if (s[e] === -1 && !setE(e, 1)) return false; }
      return true;
    };
    const checkDot = (d: number) => {
      const es = dotE[d]; let on = 0, unk = 0;
      for (const e of es) { if (s[e] === 1) on++; else if (s[e] === -1) unk++; }
      if (on > 2 || (on === 1 && unk === 0)) return false;
      if (on === 2 && unk) { for (const e of es) if (s[e] === -1 && !setE(e, 0)) return false; }
      else if (on === 1 && unk === 1) { for (const e of es) if (s[e] === -1 && !setE(e, 1)) return false; }
      else if (on === 0 && unk === 1) { for (const e of es) if (s[e] === -1 && !setE(e, 0)) return false; }
      return true;
    };
    for (let i = 0; i < w * h; i++) if (!checkCell(i)) return false;
    for (let d = 0; d < dots; d++) if (!checkDot(d)) return false;
    while (queue.length) {
      const e = queue.pop()!;
      for (const i of eCells[e]) if (!checkCell(i)) return false;
      for (const d of eDots[e]) if (!checkDot(d)) return false;
    }
    return true;
  };
  /** A closed loop formed early (with lines left elsewhere) is a dead end. */
  const prematureLoop = (s: number[]): boolean => {
    const adj = new Map<number, number[]>(); let total = 0;
    s.forEach((v, e) => { if (v !== 1) return; total++; const [a, b] = eDots[e]; (adj.get(a) ?? adj.set(a, []).get(a)!).push(b); (adj.get(b) ?? adj.set(b, []).get(b)!).push(a); });
    const seen = new Set<number>();
    for (const start of adj.keys()) {
      if (seen.has(start)) continue;
      const comp: number[] = [start]; seen.add(start); let closed = true;
      for (let k = 0; k < comp.length; k++) { const x = comp[k], nb = adj.get(x)!; if (nb.length !== 2) closed = false; for (const y of nb) if (!seen.has(y)) { seen.add(y); comp.push(y); } }
      // A closed loop (as many dots as edges) that is not every line drawn so far.
      if (closed && comp.length < total) return true;
    }
    return false;
  };
  const go = (s: number[]) => {
    if (found >= limit || !propagate(s)) return;
    if (prematureLoop(s)) return;
    const e = s.indexOf(-1);
    if (e < 0) { if (isLoop(w, h, s.map(v => (v === 1 ? 1 : 0)))) found++; return; }
    for (const v of [1, 0]) { const t = s.slice(); t[e] = v; go(t); }
  };
  go(new Array(E).fill(-1));
  return found;
}

export function generate(w: number, h: number, rng: Rng): SPuzzle {
  const sol = randomLoop(w, h, rng);
  const clues = Array.from({ length: w * h }, (_, i) => cellEdges(w, h, Math.floor(i / w), i % w).reduce((a, e) => a + sol[e], 0));
  for (const i of shuffle([...Array(w * h).keys()], rng)) {
    const v = clues[i]; clues[i] = -1;
    if (countSolutions(w, h, clues) !== 1) clues[i] = v;
  }
  return { w, h, clues, solution: sol };
}
/** Squares whose sides already break their number. */
export function badClues(p: SPuzzle, lines: number[]): Set<number> {
  const bad = new Set<number>();
  p.clues.forEach((c, i) => { if (c < 0) return; const on = cellEdges(p.w, p.h, Math.floor(i / p.w), i % p.w).filter(e => lines[e] === 1).length; if (on > c) bad.add(i); });
  return bad;
}
export const solved = (p: SPuzzle, lines: number[]) => {
  const on = lines.map(v => (v === 1 ? 1 : 0));
  return isLoop(p.w, p.h, on) && p.clues.every((c, i) => c < 0 || cellEdges(p.w, p.h, Math.floor(i / p.w), i % p.w).reduce((a, e) => a + on[e], 0) === c);
};
