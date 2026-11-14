import type { Level } from '../../core/match';
import { claimOptions, counts, discard, isHonour, KINDS, kindOf, resolve, seen, selfKong, selfOptions, shanten, winSelf, type Claim, type MJ } from './rules';

/** The five regulars at the mahjong table. */
export const LEVELS: Level[] = [
  { name: 'Beginner', rating: 750 }, { name: 'Easy', rating: 950 }, { name: 'Intermediate', rating: 1200 }, { name: 'Advanced', rating: 1450 }, { name: 'Expert', rating: 1700 },
];

/** Tiles still unseen by this seat that would bring the hand one step closer. */
function acceptance(c: number[], melds: number, vis: number[], base: number): number {
  let n = 0;
  for (let k = 0; k < KINDS; k++) {
    const left = 4 - vis[k];
    if (left <= 0) continue;
    c[k]++; if (shanten(c, melds) < base) n += left; c[k]--;
  }
  return n;
}

/** Someone looks dangerous: three exposed sets, or two late in the hand. */
const threat = (st: MJ, seat: number) => [0, 1, 2, 3].filter(s => s !== seat && (st.melds[s].length >= 3 || (st.melds[s].length >= 2 && st.wall.length < 40)));

/** How safe a tile is against the dangerous seats: 0 unknown … 3 already discarded by them. */
function safety(st: MJ, seat: number, k: number, vis: number[]): number {
  const foes = threat(st, seat);
  if (!foes.length) return 0;
  let s = 3;
  for (const f of foes) {
    const theirs = st.river[f].some(id => kindOf(id) === k);
    s = Math.min(s, theirs ? 3 : isHonour(k) && vis[k] >= 3 ? 2.5 : isHonour(k) && vis[k] === 2 ? 1.5 : 0);
  }
  return s;
}

/**
 * Hand value for the stronger regulars: keep pairs of dragons and of one's own winds (a pung
 * of them is a fan), and once one suit dominates, steer towards a flush.
 */
function value(st: MJ, seat: number, k: number, c: number[]): number {
  let v = 0;
  const lucky = k >= 31 || k === 27 + st.round || k === 27 + ((seat - st.dealer + 4) % 4);
  if (lucky && c[k] >= 2) v -= 120;
  const suit = [0, 1, 2].map(s => c.slice(s * 9, s * 9 + 9).reduce((a, b) => a + b, 0) + st.melds[seat].filter(m => m.kinds[0] < 27 && Math.floor(m.kinds[0] / 9) === s).length * 3);
  const honours = c.slice(27).reduce((a, b) => a + b, 0);
  const top = suit.indexOf(Math.max(...suit)), chowsOff = st.melds[seat].some(m => m.kinds[0] < 27 && Math.floor(m.kinds[0] / 9) !== top);
  if (!chowsOff && suit[top] + honours >= 10) v += k < 27 && Math.floor(k / 9) !== top ? 160 : k < 27 ? -60 : 0;
  return v;
}

export interface Pick { id: number; score: number }
/** Ranks the discards for the seat on turn; level 4 is the hint the player can ask for. */
export function rankDiscards(st: MJ, level: number, rng: () => number = Math.random): Pick[] {
  const seat = st.turn, hand = st.hands[seat], melds = st.melds[seat].length, vis = seen(st, seat);
  const c = counts(hand), c0 = c.slice(), done = new Set<number>(), out: Pick[] = [];
  for (const id of hand) {
    const k = kindOf(id);
    if (done.has(k)) continue; done.add(k);
    c[k]--;
    const s = shanten(c, melds);
    let score = -s * 1000;
    if (level >= 2) score += acceptance(c, melds, vis, s) * 6;
    else if (level === 1) score += isHonour(k) ? 40 : (k % 9 === 0 || k % 9 === 8) ? 20 : 0;
    if (level >= 3) {
      // Defend only when far from ready and someone looks close.
      const w = s >= 2 ? (level === 4 ? 250 : 150) : s === 1 && level === 4 ? 40 : 0;
      score += safety(st, seat, k, vis) * w;
      score += value(st, seat, k, c0);
    }
    if (level === 0) score += rng() * 1500;
    else score += rng() * (level === 1 ? 200 : 4);
    c[k]++;
    out.push({ id, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** A computer seat's whole turn once it holds 14: win, kong or discard. */
export function aiTurn(st: MJ, level: number, rng: () => number = Math.random): MJ {
  const o = selfOptions(st);
  if (o.win && (level > 0 || rng() < 0.9)) return winSelf(st);
  if (o.kongs.length && level >= 1) {
    const seat = st.turn, melds = st.melds[seat].length, c = counts(st.hands[seat]), base = shanten(c, melds);
    for (const kg of o.kongs) {
      const c2 = c.slice(); c2[kg.kind] -= kg.added ? 1 : 4;
      if (shanten(c2, melds + (kg.added ? 0 : 1)) <= base) return selfKong(st, kg.kind);
    }
  }
  return discard(st, rankDiscards(st, level, rng)[0].id);
}

/** What a computer seat does with someone else's discard. */
export function aiClaim(st: MJ, seat: number, level: number, rng: () => number = Math.random): Claim {
  const o = claimOptions(st, seat);
  if (o.win && (level > 0 || rng() < 0.85)) return { type: 'win' };
  if (!o.pung && !o.chows.length) return { type: 'pass' };
  const k = kindOf(st.last!.tile), melds = st.melds[seat].length, c = counts(st.hands[seat]), base = shanten(c, melds);
  /** Best shanten after claiming (removing `use` from hand, adding a set) and discarding once. */
  const after = (use: number[]) => {
    const c2 = c.slice(); use.forEach(x => c2[x]--);
    let best = 9;
    for (let x = 0; x < KINDS; x++) if (c2[x]) { c2[x]--; best = Math.min(best, shanten(c2, melds + 1)); c2[x]++; }
    return best;
  };
  const eager = level <= 1;
  if (o.kong && level >= 1) {
    const c2 = c.slice(); c2[k] -= 3;
    if (shanten(c2, melds + 1) <= base) return { type: 'kong' };
  }
  if (o.pung) { const a = after([k, k]); if (a < base || (eager && a <= base)) return { type: 'pung' }; }
  for (const ch of o.chows) {
    const a = after(ch.filter(x => x !== k));
    if (a < base) return { type: 'chow', kinds: ch };
  }
  return { type: 'pass' };
}

/** Plays out the claim round with every seat a computer (used by tests and by the table when no person can claim). */
export function aiResolve(st: MJ, levels: number[], human: Claim | null, humanSeat = 0, rng: () => number = Math.random): MJ {
  const claims: Claim[] = [0, 1, 2, 3].map(s => (s === humanSeat && human ? human : s === st.last!.seat ? { type: 'pass' } : aiClaim(st, s, levels[s], rng)));
  return resolve(st, claims);
}
