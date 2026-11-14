/**
 * Word puzzle generators. Pure functions of a word list and a random source, so every new
 * game is a different puzzle and the same seed always gives the same one.
 */
type Rng = () => number;
export interface Placed { word: string; cells: number[]; clue?: string; dir?: 'a' | 'd'; num?: number }
export interface Built { grid: string[]; w: number; h: number; placed: Placed[] }

/** Letters of a word, counting Turkish İ or a Chinese character as one letter each. */
export const lettersOf = (s: string) => [...s];
function shuffled<T>(xs: T[], rng: Rng): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ───────────────────────────── Word search ─────────────────────────────

/**
 * Hides words in a square of letters along straight lines, then fills the rest with random
 * letters. Words may cross where they share a letter.
 */
export function buildSearch(words: string[], rng: Rng, opt: { size: number; count: number; diagonal?: boolean; backwards?: boolean; filler?: string }): Built {
  const n = opt.size, grid = Array<string>(n * n).fill(''), placed: Placed[] = [];
  // Across and down always; diagonals and reversed words when asked for.
  const forward = [[0, 1], [1, 0], ...(opt.diagonal ? [[1, 1], [-1, 1]] : [])];
  const usable = opt.backwards ? [...forward, ...forward.map(([r, c]) => [-r, -c])] : forward;
  for (const w of shuffled([...new Set(words)], rng)) {
    if (placed.length >= opt.count) break;
    const ls = lettersOf(w);
    if (ls.length < 2 || ls.length > n) continue;
    for (let attempt = 0; attempt < 150; attempt++) {
      const [dr, dc] = usable[Math.floor(rng() * usable.length)];
      const r0 = Math.floor(rng() * n), c0 = Math.floor(rng() * n), cells: number[] = [];
      let ok = true;
      for (let k = 0; k < ls.length; k++) {
        const r = r0 + dr * k, c = c0 + dc * k;
        if (r < 0 || c < 0 || r >= n || c >= n || (grid[r * n + c] && grid[r * n + c] !== ls[k])) { ok = false; break; }
        cells.push(r * n + c);
      }
      // Never let one hidden word sit entirely inside another's cells.
      if (ok && placed.some(p => cells.every(x => p.cells.includes(x)))) ok = false;
      if (!ok) continue;
      cells.forEach((x, k) => { grid[x] = ls[k]; });
      placed.push({ word: w, cells });
      break;
    }
  }
  const pool = lettersOf((opt.filler && opt.filler.replace(/\s/g, '')) || placed.map(p => p.word).join('') || 'ABC');
  for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = pool[Math.floor(rng() * pool.length)];
  return { grid, w: n, h: n, placed };
}

// ───────────────────────────── Crossword ─────────────────────────────

/**
 * A free-form crossword: words cross at shared letters, never touch side by side, and the
 * grid is cut to the words' bounding box. Each attempt places the word with the most
 * crossings; the best of several attempts is kept.
 */
export function buildCrossword(entries: { word: string; clue?: string }[], rng: Rng, opt: { size?: number; count: number }): Built {
  let best: Built | null = null, bestScore = -1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const b = crosswordOnce(entries, rng, opt.size ?? 15, opt.count);
    const score = b.placed.length * 10 - (b.w * b.h) / 20;
    if (score > bestScore) { best = b; bestScore = score; }
    if (b.placed.length >= opt.count) break;
  }
  return best!;
}

function crosswordOnce(entries: { word: string; clue?: string }[], rng: Rng, n: number, count: number): Built {
  const cell = new Map<number, string>(), key = (r: number, c: number) => r * 1000 + c;
  const at = (r: number, c: number) => (r < 0 || c < 0 || r >= n || c >= n ? undefined : cell.get(key(r, c)));
  const out = (r: number, c: number) => r < 0 || c < 0 || r >= n || c >= n;
  const placed: { e: { word: string; clue?: string }; r: number; c: number; d: 'a' | 'd'; ls: string[] }[] = [];
  const pool = shuffled(entries.filter(e => lettersOf(e.word).length >= 3 && lettersOf(e.word).length <= n), rng);
  const used = new Set<string>();
  const first = pool.find(e => lettersOf(e.word).length >= 5) ?? pool[0];
  if (!first) return { grid: [], w: 0, h: 0, placed: [] };
  const fl = lettersOf(first.word), r0 = Math.floor(n / 2), c0 = Math.floor((n - fl.length) / 2);
  fl.forEach((ch, k) => cell.set(key(r0, c0 + k), ch));
  placed.push({ e: first, r: r0, c: c0, d: 'a', ls: fl });
  used.add(first.word);

  /** Crossings if the word fits here, or -1. */
  const fit = (ls: string[], r: number, c: number, d: 'a' | 'd'): number => {
    const dr = d === 'd' ? 1 : 0, dc = d === 'a' ? 1 : 0;
    if (out(r, c) || out(r + dr * (ls.length - 1), c + dc * (ls.length - 1))) return -1;
    if (at(r - dr, c - dc) !== undefined || at(r + dr * ls.length, c + dc * ls.length) !== undefined) return -1;
    let cross = 0;
    for (let k = 0; k < ls.length; k++) {
      const rr = r + dr * k, cc = c + dc * k, here = at(rr, cc);
      if (here !== undefined) { if (here !== ls[k]) return -1; cross++; continue; }
      // A new letter must not sit beside another word's letter.
      if (at(rr + dc, cc + dr) !== undefined || at(rr - dc, cc - dr) !== undefined) return -1;
    }
    return cross === ls.length ? -1 : cross;
  };

  for (let tries = 0; placed.length < count && tries < 60; tries++) {
    type Cand = { e: { word: string; clue?: string }; r: number; c: number; d: 'a' | 'd'; ls: string[]; s: number };
    let pick = null as Cand | null;
    for (const e of pool.slice(0, 400)) {
      if (used.has(e.word)) continue;
      const ls = lettersOf(e.word);
      for (const p of placed) for (let i = 0; i < p.ls.length; i++) for (let j = 0; j < ls.length; j++) {
        if (p.ls[i] !== ls[j]) continue;
        const d: 'a' | 'd' = p.d === 'a' ? 'd' : 'a';
        const pr = p.r + (p.d === 'd' ? i : 0), pc = p.c + (p.d === 'a' ? i : 0);
        const r = d === 'd' ? pr - j : pr, c = d === 'a' ? pc - j : pc;
        const cross = fit(ls, r, c, d);
        if (cross < 1) continue;
        const s = cross * 3 + ls.length * 0.2 + rng();
        if (!pick || s > pick.s) pick = { e, r, c, d, ls, s };
      }
      if (pick && pick.s > 7) break;
    }
    if (!pick) break;
    const chosen: Cand = pick;
    const dr = chosen.d === 'd' ? 1 : 0, dc = chosen.d === 'a' ? 1 : 0;
    chosen.ls.forEach((ch, k) => cell.set(key(chosen.r + dr * k, chosen.c + dc * k), ch));
    placed.push(chosen);
    used.add(chosen.e.word);
  }

  // Cut to the bounding box and number the starts in reading order.
  let minR = n, minC = n, maxR = 0, maxC = 0;
  for (const k of cell.keys()) { const r = Math.floor(k / 1000), c = k % 1000; minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c); }
  const w = maxC - minC + 1, h = maxR - minR + 1, grid = Array<string>(w * h).fill('');
  for (const [k, ch] of cell) grid[(Math.floor(k / 1000) - minR) * w + (k % 1000 - minC)] = ch;
  const starts = [...new Set(placed.map(p => (p.r - minR) * w + (p.c - minC)))].sort((a, b) => a - b);
  const result: Placed[] = placed.map(p => {
    const s = (p.r - minR) * w + (p.c - minC), cells = p.ls.map((_, k) => s + (p.d === 'a' ? k : k * w));
    return { word: p.e.word, cells, ...(p.e.clue ? { clue: p.e.clue } : {}), dir: p.d, num: starts.indexOf(s) + 1 };
  }).sort((a, b) => (a.dir === b.dir ? a.num! - b.num! : a.dir === 'a' ? -1 : 1));
  return { grid, w, h, placed: result };
}

// ───────────────────────────── Anagram ─────────────────────────────

/** The word's letters in a new order (never the word itself when that can be avoided). */
export function scramble(word: string, rng: Rng): string {
  const ls = lettersOf(word);
  if (new Set(ls).size < 2) return word;
  for (let k = 0; k < 20; k++) { const s = shuffled(ls, rng).join(''); if (s !== word) return s; }
  return ls.reverse().join('');
}
