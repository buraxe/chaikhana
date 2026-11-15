/**
 * Sliding tiles (the 8-, 15- and 24-puzzle): numbered tiles in an n×n frame with one gap.
 * Slide tiles into the gap until they read 1, 2, 3… with the gap last. Shuffles are random
 * permutations kept to the half that can be solved.
 */
export type Tiles = number[]; // 0 is the gap

export const goal = (n: number): Tiles => [...Array(n * n).keys()].map(i => (i + 1) % (n * n));
export const solved = (t: Tiles) => t.every((v, i) => v === (i + 1) % t.length);

/** Solvable iff (inversions + (odd n ? 0 : row of gap from the bottom, counted from 1)) is even. */
export function solvable(t: Tiles, n: number): boolean {
  const a = t.filter(v => v);
  let inv = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
  if (n % 2) return inv % 2 === 0;
  const rowFromBottom = n - Math.floor(t.indexOf(0) / n);
  return (inv + rowFromBottom) % 2 === 1;
}
export function shuffle(n: number, rnd: () => number = Math.random): Tiles {
  for (;;) {
    const t = goal(n);
    for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; }
    if (!solvable(t, n)) { const [a, b] = t[0] && t[1] ? [0, 1] : [t.length - 1, t.length - 2]; [t[a], t[b]] = [t[b], t[a]]; }
    if (!solved(t)) return t;
  }
}

/** Tapping tile i slides it and every tile between it and the gap, if they share a row or column. */
export function slide(t: Tiles, n: number, i: number): Tiles | null {
  const g = t.indexOf(0), gr = Math.floor(g / n), gc = g % n, r = Math.floor(i / n), c = i % n;
  if (i === g || (r !== gr && c !== gc)) return null;
  const step = r === gr ? (c < gc ? -1 : 1) : (r < gr ? -n : n);
  const out = t.slice();
  for (let k = g; k !== i; k += step) out[k] = out[k + step];
  out[i] = 0;
  return out;
}
/** Single-step moves of the gap's neighbours: the tiles that can slide. */
export function neighbours(t: Tiles, n: number): number[] {
  const g = t.indexOf(0), r = Math.floor(g / n), c = g % n, out: number[] = [];
  if (r > 0) out.push(g - n); if (r < n - 1) out.push(g + n); if (c > 0) out.push(g - 1); if (c < n - 1) out.push(g + 1);
  return out;
}

/** Manhattan distance plus linear conflicts: a lower bound on the moves left. */
export function heuristic(t: Tiles, n: number): number {
  let h = 0;
  for (let i = 0; i < t.length; i++) { const v = t[i]; if (!v) continue; const gi = v - 1; h += Math.abs(Math.floor(i / n) - Math.floor(gi / n)) + Math.abs((i % n) - (gi % n)); }
  for (let r = 0; r < n; r++) for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const x = t[r * n + a], y = t[r * n + b];
    if (x && y && Math.floor((x - 1) / n) === r && Math.floor((y - 1) / n) === r && x > y) h += 2;
  }
  for (let c = 0; c < n; c++) for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    const x = t[a * n + c], y = t[b * n + c];
    if (x && y && (x - 1) % n === c && (y - 1) % n === c && x > y) h += 2;
  }
  return h;
}

/**
 * The tile to slide next. On 3×3 this is an optimal path (A*); larger frames use a weighted
 * search that is quick and good, not shortest. Returns null if the step budget runs out.
 */
export function nextMove(t: Tiles, n: number, budget = 200_000): number | null {
  if (solved(t)) return null;
  const w = n === 3 ? 1 : n === 4 ? 1.6 : 2.4;
  const key = (s: Tiles) => s.join(',');
  type Node = { s: Tiles; g: number; f: number; first: number };
  // A small binary heap on f.
  const heap: Node[] = [];
  const push = (x: Node) => { heap.push(x); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p].f <= heap[i].f) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop()!; if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l].f < heap[m].f) m = l; if (r < heap.length && heap[r].f < heap[m].f) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  const best = new Map<string, number>([[key(t), 0]]);
  for (const i of neighbours(t, n)) { const s = slide(t, n, i)!; best.set(key(s), 1); push({ s, g: 1, f: 1 + w * heuristic(s, n), first: t[i] }); }
  let steps = 0;
  while (heap.length && steps++ < budget) {
    const cur = pop();
    if (solved(cur.s)) return t.indexOf(cur.first);
    for (const i of neighbours(cur.s, n)) {
      const s = slide(cur.s, n, i)!, k = key(s), g = cur.g + 1;
      if ((best.get(k) ?? Infinity) <= g) continue;
      best.set(k, g); push({ s, g, f: g + w * heuristic(s, n), first: cur.first });
    }
  }
  return null;
}
