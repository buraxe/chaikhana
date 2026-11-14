/**
 * Nonograms (picross). Each row and column clue lists the lengths of its filled runs in
 * order. Puzzles are generated at random and kept only if a line-by-line solver finishes
 * them, which proves the solution is unique and reachable by logic alone.
 */
export const clueOf = (line: number[]) => { const out: number[] = []; let run = 0; for (const v of line) { if (v === 1) run++; else if (run) { out.push(run); run = 0; } } if (run) out.push(run); return out; };
export interface Puzzle { w: number; h: number; solution: number[]; rows: number[][]; cols: number[][] }
const row = (g: number[], w: number, r: number) => g.slice(r * w, r * w + w);
const col = (g: number[], w: number, h: number, c: number) => Array.from({ length: h }, (_, r) => g[r * w + c]);

/**
 * Deduces what it can about one line. known: 1 filled, 0 empty, -1 unknown. Returns the
 * line with every cell that is the same in all arrangements fitting the clue, or null if
 * none fit.
 */
export function solveLine(clue: number[], known: number[]): number[] | null {
  const n = known.length;
  let allFill: boolean[] | null = null, allEmpty: boolean[] | null = null;
  const cur = new Array(n).fill(0);
  // Memo: can clues from index k be placed starting at position p?
  const memo = new Map<string, boolean>();
  const fits = (k: number, p: number): boolean => {
    const key = k + ':' + p;
    if (memo.has(key)) return memo.get(key)!;
    let ok = false;
    if (k === clue.length) { ok = true; for (let i = p; i < n; i++) if (known[i] === 1) { ok = false; break; } }
    else {
      const len = clue[k];
      for (let s = p; s + len <= n; s++) {
        let good = true;
        for (let i = p; i < s; i++) if (known[i] === 1) { good = false; break; }
        if (!good) break;
        for (let i = s; i < s + len; i++) if (known[i] === 0) { good = false; break; }
        if (good && s + len < n && known[s + len] === 1) good = false;
        if (good && fits(k + 1, s + len + 1)) { ok = true; break; }
      }
    }
    memo.set(key, ok);
    return ok;
  };
  if (!fits(0, 0)) return null;
  // Enumerate arrangements guided by `fits` (pruned, so only valid ones are walked).
  const walk = (k: number, p: number) => {
    if (k === clue.length) {
      if (!allFill) { allFill = cur.map(v => v === 1); allEmpty = cur.map(v => v === 0); }
      else for (let i = 0; i < n; i++) { if (cur[i] !== 1) allFill[i] = false; if (cur[i] !== 0) allEmpty![i] = false; }
      return;
    }
    const len = clue[k];
    for (let s = p; s + len <= n; s++) {
      let good = true;
      for (let i = p; i < s; i++) if (known[i] === 1) { good = false; break; }
      if (!good) break;
      for (let i = s; i < s + len; i++) if (known[i] === 0) { good = false; break; }
      if (good && s + len < n && known[s + len] === 1) good = false;
      if (!good || !fits(k + 1, s + len + 1)) continue;
      for (let i = s; i < s + len; i++) cur[i] = 1;
      walk(k + 1, s + len + 1);
      for (let i = s; i < s + len; i++) cur[i] = 0;
    }
  };
  walk(0, 0);
  return known.map((v, i) => (allFill![i] ? 1 : allEmpty![i] ? 0 : v));
}
/** Repeats line deductions until nothing changes. Returns the grid (−1 where unknown) or null on a contradiction. */
export function logicSolve(p: Pick<Puzzle, 'w' | 'h' | 'rows' | 'cols'>, start?: number[]): number[] | null {
  const { w, h } = p, g = start ? start.slice() : new Array(w * h).fill(-1);
  for (let changed = true; changed;) {
    changed = false;
    for (let r = 0; r < h; r++) {
      const res = solveLine(p.rows[r], row(g, w, r));
      if (!res) return null;
      res.forEach((v, c) => { if (g[r * w + c] !== v) { g[r * w + c] = v; changed = true; } });
    }
    for (let c = 0; c < w; c++) {
      const res = solveLine(p.cols[c], col(g, w, h, c));
      if (!res) return null;
      res.forEach((v, r) => { if (g[r * w + c] !== v) { g[r * w + c] = v; changed = true; } });
    }
  }
  return g;
}
export function generate(w: number, h: number, rng: () => number, density = 0.58): Puzzle {
  for (let tries = 0; ; tries++) {
    const solution = Array.from({ length: w * h }, () => (rng() < density ? 1 : 0));
    const p = { w, h, solution, rows: Array.from({ length: h }, (_, r) => clueOf(row(solution, w, r))), cols: Array.from({ length: w }, (_, c) => clueOf(col(solution, w, h, c))) };
    const solved = logicSolve(p);
    if (solved && solved.every(v => v !== -1)) return p;
    if (tries > 400) density = Math.min(0.7, density + 0.01);
  }
}
/** Solved when every row and column matches its clue (any such grid counts). */
export function matches(p: Puzzle, filled: number[]): boolean {
  for (let r = 0; r < p.h; r++) if (clueOf(row(filled, p.w, r)).join() !== p.rows[r].join()) return false;
  for (let c = 0; c < p.w; c++) if (clueOf(col(filled, p.w, p.h, c)).join() !== p.cols[c].join()) return false;
  return true;
}
