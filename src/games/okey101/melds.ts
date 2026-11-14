/**
 * 101 Okey sets. Uses the same 106 tiles, okey and false jokers as Okey.
 * Runs: 3+ consecutive tiles of one colour (1 may follow 13, counting 1 point).
 * Groups: 3–4 tiles of one number in different colours. Pairs: two identical tiles.
 * Wild okeys take the value of the tile they stand for.
 */
import { isWild, TILES, valueOf, type Okey } from '../okey/rules';

export type Kind = 'run' | 'group' | 'pair';
export interface Shape { kind: Kind; as: { c: number; n: number }[]; points: number }
/** Points a value contributes: a 1 played after 13 is stored as 14 but scores 1. */
const pts = (n: number) => (n === 14 ? 1 : n);

/** Checks a set of tiles; returns its kind, the value each tile plays as (in display order), and its points. */
export function analyze(ids: number[], ok: Okey, only?: Kind): Shape | null {
  const tiles = ids.map(i => TILES[i]);
  const wilds = tiles.filter(t => isWild(t, ok)).length;
  const plain = tiles.filter(t => !isWild(t, ok)).map(t => valueOf(t, ok));
  if (ids.length === 2 && (!only || only === 'pair')) {
    if (plain.length === 2 && plain[0].c === plain[1].c && plain[0].n === plain[1].n) return { kind: 'pair', as: [plain[0], plain[1]], points: 2 * plain[0].n };
    if (plain.length === 1) return { kind: 'pair', as: [plain[0], plain[0]], points: 2 * plain[0].n };
    if (plain.length === 0) return { kind: 'pair', as: [ok, ok], points: 2 * ok.n };
    return null;
  }
  if (ids.length < 3) return null;
  let best: Shape | null = null;
  // Group
  if ((!only || only === 'group') && ids.length <= 4 && plain.length > 0 && plain.every(v => v.n === plain[0].n) && new Set(plain.map(v => v.c)).size === plain.length) {
    const missing = [0, 1, 2, 3].filter(c => !plain.some(v => v.c === c));
    const as = [...plain, ...missing.slice(0, wilds).map(c => ({ c, n: plain[0].n }))].sort((a, b) => a.c - b.c);
    best = { kind: 'group', as, points: plain[0].n * ids.length };
  }
  // Run (try the 1 as low and as high)
  if ((!only || only === 'run') && plain.length > 0 && plain.every(v => v.c === plain[0].c) && ids.length <= 13) {
    const c = plain[0].c;
    for (const high of [false, true]) {
      const nums = plain.map(v => (high && v.n === 1 ? 14 : v.n)).sort((a, b) => a - b);
      if (new Set(nums).size !== nums.length) continue;
      if (nums.includes(14) && nums.includes(1)) continue;
      const lo = nums[0], hi = nums[nums.length - 1], gaps = hi - lo + 1 - nums.length;
      if (gaps > wilds) continue;
      let extra = wilds - gaps, top = hi, bottom = lo;
      const maxTop = high ? 14 : 13;
      while (extra > 0 && top < maxTop) { top++; extra--; }
      while (extra > 0 && bottom > 1) { bottom--; extra--; }
      if (extra > 0 || (bottom === 1 && top === 14)) continue;
      const as: { c: number; n: number }[] = [];
      for (let n = bottom; n <= top; n++) as.push({ c, n: n === 14 ? 1 : n });
      const points = Array.from({ length: top - bottom + 1 }, (_, k) => pts(bottom + k)).reduce((a, b) => a + b, 0);
      if (!best || points > best.points) best = { kind: 'run', as, points };
    }
  }
  return best;
}
/** Can this tile be added to an existing set on the table? Pairs cannot be extended. */
export function canAdd(meld: { kind: Kind; tiles: number[] }, tile: number, ok: Okey): boolean {
  if (meld.kind === 'pair') return false;
  return analyze([...meld.tiles, tile], ok, meld.kind) !== null;
}

/**
 * The most valuable set of disjoint melds in a hand (runs and groups), for opening or for
 * laying down. Decides the lowest remaining tile each time: leave it, group it, or run it.
 */
export function planMelds(hand: number[], ok: Okey): { melds: number[][]; points: number; tiles: number } {
  const byKey = new Map<string, number[]>(), wild: number[] = [];
  for (const id of hand) {
    const t = TILES[id];
    if (isWild(t, ok)) { wild.push(id); continue; }
    const v = valueOf(t, ok), k = `${v.c}:${v.n}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(id);
  }
  const take = (c: number, n: number) => byKey.get(`${c}:${n}`)?.pop();
  const give = (c: number, n: number, id: number) => byKey.get(`${c}:${n}`)!.push(id);
  const has = (c: number, n: number) => (byKey.get(`${c}:${n}`)?.length ?? 0) > 0;
  const memo = new Map<string, { melds: number[][]; points: number }>();
  const stateKey = () => [...byKey.entries()].filter(([, v]) => v.length).map(([k, v]) => k + 'x' + v.length).sort().join(',') + '|' + wild.length;
  const rec = (): { melds: number[][]; points: number } => {
    const sk = stateKey(), m = memo.get(sk);
    if (m) return m;
    let c0 = -1, n0 = -1;
    outer: for (let c = 0; c < 4; c++) for (let n = 1; n <= 13; n++) if (has(c, n)) { c0 = c; n0 = n; break outer; }
    if (c0 < 0) { const r = { melds: [], points: 0 }; memo.set(sk, r); return r; }
    const first = take(c0, n0)!;
    let best = rec();
    const consider = (ids: number[], points: number) => {
      const sub = rec();
      if (points + sub.points > best.points) best = { melds: [ids, ...sub.melds], points: points + sub.points };
    };
    // groups
    const others = [0, 1, 2, 3].filter(c => c !== c0);
    for (let mask = 0; mask < 8; mask++) {
      const use = others.filter((_, i) => (mask >> i) & 1);
      if (use.some(c => !has(c, n0))) continue;
      for (let jj = 0; jj <= Math.min(wild.length, 3 - use.length); jj++) {
        if (1 + use.length + jj < 3) continue;
        const ids = [first, ...use.map(c => take(c, n0)!)], js = wild.splice(wild.length - jj, jj);
        consider([...ids, ...js], n0 * ids.length + n0 * jj);
        wild.push(...js); use.forEach((c, i) => give(c, n0, ids[i + 1]));
      }
    }
    // runs starting at this tile (lower values of this colour are gone; leading wilds allowed)
    for (let lead = 0; lead <= Math.min(wild.length, n0 - 1); lead++) {
      const ids = [first], used: [number, number][] = [];
      let js = wild.splice(wild.length - lead, lead), points = 0;
      for (let k = 1; k <= lead; k++) points += n0 - k;
      points += n0;
      let n = n0;
      for (;;) {
        const len = n - n0 + 1 + lead;
        if (len >= 3) consider([...ids, ...js], points);
        const nn = n + 1;
        if (nn > 14 || (nn === 14 && n0 - lead <= 1)) break;
        const real = nn === 14 ? 1 : nn;
        if (has(c0, real)) { const id = take(c0, real)!; ids.push(id); used.push([c0, real]); }
        else if (wild.length) { js = [...js, wild.pop()!]; }
        else break;
        points += pts(nn); n = nn;
      }
      used.reverse().forEach(([c, r], i) => give(c, r, ids[ids.length - 1 - i]));
      wild.push(...js);
    }
    give(c0, n0, first);
    memo.set(sk, best);
    return best;
  };
  const r = rec();
  return { ...r, tiles: r.melds.reduce((a, x) => a + x.length, 0) };
}
/** Identical pairs available in a hand; wild okeys complete single tiles, highest first. */
export function planPairs(hand: number[], ok: Okey): number[][] {
  const groups = new Map<string, number[]>(), wild: number[] = [];
  for (const id of hand) {
    const t = TILES[id];
    if (isWild(t, ok)) { wild.push(id); continue; }
    const v = valueOf(t, ok), k = `${v.c}:${v.n}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(id);
  }
  const pairs: number[][] = [], singles: number[] = [];
  for (const ids of groups.values()) { while (ids.length >= 2) pairs.push(ids.splice(0, 2)); singles.push(...ids); }
  singles.sort((a, b) => valueOf(TILES[b], ok).n - valueOf(TILES[a], ok).n);
  while (wild.length && singles.length) pairs.push([singles.shift()!, wild.pop()!]);
  return pairs;
}
/** Penalty value of tiles left on a rack: face values, plus 101 for each okey kept. */
export function leftover(hand: number[], ok: Okey): { face: number; okeys: number } {
  let face = 0, okeys = 0;
  for (const id of hand) { const t = TILES[id]; if (isWild(t, ok)) okeys++; else face += valueOf(t, ok).n; }
  return { face, okeys };
}
