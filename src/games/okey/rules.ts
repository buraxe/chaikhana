/**
 * Okey. 106 tiles: four colours (red, yellow, blue, black) × 1–13 × 2, plus two false jokers.
 * The face-up indicator decides the okey: same colour, one higher (13 → 1). Both okey tiles
 * are wild; the false jokers stand only for the okey tile's own value.
 *
 * A winning hand is 14 tiles in sets — runs of 3+ consecutive tiles in one colour (1 may
 * follow 13, as in 12-13-1, but a run cannot continue past it) and groups of 3–4 tiles of
 * one number in different colours — or seven identical pairs.
 */
export interface Tile { id: number; c: number; n: number; fake: boolean }
export const COLOR_COUNT = 4;
export function allTiles(): Tile[] {
  const out: Tile[] = [];
  for (let c = 0; c < 4; c++) for (let n = 1; n <= 13; n++) for (let k = 0; k < 2; k++) out.push({ id: out.length, c, n, fake: false });
  out.push({ id: 104, c: -1, n: 0, fake: true }, { id: 105, c: -1, n: 0, fake: true });
  return out;
}
export const TILES = allTiles();
export const okeyOf = (indicator: Tile) => ({ c: indicator.c, n: (indicator.n % 13) + 1 });
export type Okey = { c: number; n: number };
export const isWild = (t: Tile, ok: Okey) => !t.fake && t.c === ok.c && t.n === ok.n;
/** The value a tile plays as: false jokers become the okey's value; wild tiles have none. */
export const valueOf = (t: Tile, ok: Okey) => (t.fake ? { c: ok.c, n: ok.n } : { c: t.c, n: t.n });

/** Counts per colour and number, plus the number of wild tiles. */
function tally(hand: Tile[], ok: Okey) {
  const cnt = [0, 1, 2, 3].map(() => new Array(15).fill(0));
  let jokers = 0;
  for (const t of hand) {
    if (isWild(t, ok)) { jokers++; continue; }
    const v = valueOf(t, ok);
    cnt[v.c][v.n]++;
  }
  return { cnt, jokers };
}
const keyOf = (cnt: number[][], j: number) => cnt.map(r => r.slice(1, 14).join('')).join('|') + ':' + j;

/**
 * Largest number of tiles that can be placed in valid sets (runs and groups), wild tiles
 * included. A winning hand places all 14. The search always decides the lowest remaining
 * tile first: leave it out, put it in a group, or put it in a run.
 */
export function bestCover(hand: Tile[], ok: Okey): number {
  const { cnt, jokers } = tally(hand, ok);
  const memo = new Map<string, number>();
  const rec = (j: number, formed: boolean): number => {
    const k = keyOf(cnt, j) + (formed ? 'f' : '');
    const m = memo.get(k);
    if (m !== undefined) return m;
    let c0 = -1, n0 = -1;
    outer: for (let c = 0; c < 4; c++) for (let n = 1; n <= 13; n++) if (cnt[c][n]) { c0 = c; n0 = n; break outer; }
    // No real tiles left: spare wild tiles can always join a set that already exists.
    if (c0 < 0) { const v = formed ? j : 0; memo.set(k, v); return v; }
    cnt[c0][n0]--;
    let best = rec(j, formed);
    // Groups: same number, different colours, 3 or 4 tiles.
    const others = [0, 1, 2, 3].filter(c => c !== c0);
    for (let mask = 0; mask < 8; mask++) {
      const use = others.filter((_, i) => (mask >> i) & 1);
      if (use.some(c => !cnt[c][n0])) continue;
      for (let jj = 0; jj <= Math.min(j, 3 - use.length); jj++) {
        const size = 1 + use.length + jj;
        if (size < 3) continue;
        use.forEach(c => cnt[c][n0]--);
        best = Math.max(best, size + rec(j - jj, true));
        use.forEach(c => cnt[c][n0]++);
      }
    }
    // Runs that contain this tile. Lower values of this colour are gone, so anything
    // before it must be wild. Value 14 is a 1 played after 13.
    const tryRun = (s: number, includeSelfAt: number) => {
      let usedJ = 0;
      const took: number[] = [];
      for (let v = s; v < includeSelfAt; v++) {
        const real = v === 14 ? 1 : v;
        if (cnt[c0][real] > 0) { cnt[c0][real]--; took.push(real); } else if (usedJ < j) usedJ++; else { usedJ = -1; break; }
      }
      if (usedJ >= 0) {
        let v = includeSelfAt;
        for (;;) {
          const len = v - s + 1;
          if (len >= 3) best = Math.max(best, len + rec(j - usedJ, true));
          const nv = v + 1;
          if (nv > 14 || (nv === 14 && s === 1)) break;
          const real = nv === 14 ? 1 : nv;
          if (cnt[c0][real] > 0) { cnt[c0][real]--; took.push(real); } else if (usedJ < j) usedJ++; else break;
          v = nv;
        }
      }
      took.forEach(v => cnt[c0][v]++);
    };
    for (let s = Math.max(1, n0 - j); s <= n0; s++) tryRun(s, n0);
    // A 1 can also close a run as the value after 13 (…12-13-1).
    if (n0 === 1) for (let s = 2; s <= 12; s++) {
      let usedJ = 0;
      const took: number[] = [];
      for (let v = s; v <= 13; v++) {
        if (cnt[c0][v] > 0) { cnt[c0][v]--; took.push(v); } else if (usedJ < j) usedJ++; else { usedJ = -1; break; }
      }
      if (usedJ >= 0) best = Math.max(best, 14 - s + 1 + rec(j - usedJ, true));
      took.forEach(v => cnt[c0][v]++);
    }
    cnt[c0][n0]++;
    memo.set(k, best);
    return best;
  };
  return Math.min(hand.length, rec(jokers, false));
}

/** Seven identical pairs (wild tiles pair with anything). */
export function isPairs(hand: Tile[], ok: Okey): boolean {
  if (hand.length !== 14) return false;
  const { cnt, jokers } = tally(hand, ok);
  let pairs = 0, singles = 0;
  for (const row of cnt) for (const v of row) { pairs += Math.floor(v / 2); singles += v % 2; }
  return singles <= jokers && pairs + Math.floor((jokers + singles) / 2) >= 7 && (jokers - singles) % 2 === 0;
}
export const isSetsWin = (hand: Tile[], ok: Okey) => hand.length === 14 && bestCover(hand, ok) === 14;
export const isWin = (hand: Tile[], ok: Okey) => isSetsWin(hand, ok) || isPairs(hand, ok);
