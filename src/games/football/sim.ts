import { mulberry32 } from '../../core/rng';
import { teamOf, teamsOf, type LeagueId, type Player, type Role } from './data';

export type Formation = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2' | '3-4-3' | '4-5-1';
export type Style = 'defensive' | 'balanced' | 'attacking';
export interface Slot { role: Role; x: number; y: number }
const B4: Slot[] = [{ role: 'GK', x: 50, y: 92 }, { role: 'RB', x: 85, y: 72 }, { role: 'CB', x: 62, y: 77 }, { role: 'CB', x: 38, y: 77 }, { role: 'LB', x: 15, y: 72 }];
const B3: Slot[] = [{ role: 'GK', x: 50, y: 92 }, { role: 'CB', x: 72, y: 76 }, { role: 'CB', x: 50, y: 79 }, { role: 'CB', x: 28, y: 76 }];
export const FORMATIONS: Record<Formation, Slot[]> = {
  '4-3-3': [...B4, { role: 'CM', x: 70, y: 50 }, { role: 'DM', x: 50, y: 58 }, { role: 'CM', x: 30, y: 50 }, { role: 'RW', x: 82, y: 25 }, { role: 'ST', x: 50, y: 16 }, { role: 'LW', x: 18, y: 25 }],
  '4-4-2': [...B4, { role: 'RW', x: 85, y: 46 }, { role: 'CM', x: 62, y: 52 }, { role: 'CM', x: 38, y: 52 }, { role: 'LW', x: 15, y: 46 }, { role: 'ST', x: 62, y: 18 }, { role: 'ST', x: 38, y: 18 }],
  '4-2-3-1': [...B4, { role: 'DM', x: 62, y: 58 }, { role: 'DM', x: 38, y: 58 }, { role: 'RW', x: 82, y: 33 }, { role: 'AM', x: 50, y: 37 }, { role: 'LW', x: 18, y: 33 }, { role: 'ST', x: 50, y: 14 }],
  '3-5-2': [...B3, { role: 'RB', x: 88, y: 48 }, { role: 'CM', x: 66, y: 46 }, { role: 'DM', x: 50, y: 58 }, { role: 'CM', x: 34, y: 46 }, { role: 'LB', x: 12, y: 48 }, { role: 'ST', x: 62, y: 17 }, { role: 'ST', x: 38, y: 17 }],
  '5-3-2': [{ role: 'GK', x: 50, y: 92 }, { role: 'RB', x: 88, y: 66 }, { role: 'CB', x: 70, y: 76 }, { role: 'CB', x: 50, y: 79 }, { role: 'CB', x: 30, y: 76 }, { role: 'LB', x: 12, y: 66 }, { role: 'CM', x: 70, y: 46 }, { role: 'DM', x: 50, y: 54 }, { role: 'CM', x: 30, y: 46 }, { role: 'ST', x: 62, y: 18 }, { role: 'ST', x: 38, y: 18 }],
  '3-4-3': [...B3, { role: 'RB', x: 88, y: 50 }, { role: 'CM', x: 62, y: 53 }, { role: 'CM', x: 38, y: 53 }, { role: 'LB', x: 12, y: 50 }, { role: 'RW', x: 80, y: 24 }, { role: 'ST', x: 50, y: 16 }, { role: 'LW', x: 20, y: 24 }],
  '4-5-1': [...B4, { role: 'RW', x: 86, y: 40 }, { role: 'CM', x: 66, y: 47 }, { role: 'DM', x: 50, y: 58 }, { role: 'CM', x: 34, y: 47 }, { role: 'LW', x: 14, y: 40 }, { role: 'ST', x: 50, y: 16 }],
};
const NEAR: Record<Role, Partial<Record<Role, number>>> = {
  GK: {}, RB: { CB: 0.85, LB: 0.8, RW: 0.75, DM: 0.7 }, LB: { CB: 0.85, RB: 0.8, LW: 0.75, DM: 0.7 },
  CB: { RB: 0.82, LB: 0.82, DM: 0.85 }, DM: { CM: 0.92, CB: 0.82, AM: 0.72 }, CM: { DM: 0.92, AM: 0.9, RW: 0.75, LW: 0.75 },
  AM: { CM: 0.9, ST: 0.85, RW: 0.86, LW: 0.86 }, RW: { LW: 0.9, AM: 0.85, ST: 0.82, RB: 0.7 }, LW: { RW: 0.9, AM: 0.85, ST: 0.82, LB: 0.7 },
  ST: { AM: 0.85, RW: 0.82, LW: 0.82 },
};
/** How well a player of `has` fills a slot that wants `wants`. */
export function fit(has: Role, wants: Role): number {
  if (has === wants) return 1;
  if (has === 'GK' || wants === 'GK') return 0.3;
  return NEAR[has][wants] ?? 0.58;
}
export interface Rated { att: number; mid: number; def: number; overall: number; chem: number }
/** Line strengths of an XI placed in formation slots. */
export function rate(xi: (Player | null)[], slots: Slot[], style: Style = 'balanced'): Rated {
  const v = slots.map((s, k) => (xi[k] ? xi[k]!.rating * fit(xi[k]!.role, s.role) : 40));
  const avg = (roles: Role[], w?: (r: Role) => number) => {
    let tot = 0, n = 0;
    slots.forEach((s, k) => { if (roles.includes(s.role)) { const ww = w ? w(s.role) : 1; tot += v[k] * ww; n += ww; } });
    return n ? tot / n : 55;
  };
  // Players from the same club understand each other, whatever the season; teammates from the very same season a little more.
  const clubs = new Map<string, number>(), seasons = new Map<string, number>();
  for (const p of xi) if (p) { clubs.set(p.club, (clubs.get(p.club) ?? 0) + 1); const k = p.club + '@' + p.season; seasons.set(k, (seasons.get(k) ?? 0) + 1); }
  let pairs = 0, same = 0; clubs.forEach(n => { pairs += (n * (n - 1)) / 2; }); seasons.forEach(n => { same += (n * (n - 1)) / 2; });
  const chem = Math.min(4, pairs * 0.3 + same * 0.15);
  const att = avg(['ST', 'RW', 'LW', 'AM', 'CM'], r => (r === 'ST' ? 3 : r === 'CM' ? 0.6 : 2)) + chem;
  const mid = avg(['DM', 'CM', 'AM', 'RW', 'LW'], r => (r === 'CM' || r === 'DM' ? 2 : 1)) + chem;
  const def = avg(['GK', 'CB', 'RB', 'LB', 'DM'], r => (r === 'GK' ? 2.4 : r === 'CB' ? 2 : 1.2)) + chem;
  const overall = v.reduce((a, b) => a + b, 0) / v.length + chem;
  const sAtt = style === 'attacking' ? 2.5 : style === 'defensive' ? -3 : 0, sDef = style === 'attacking' ? -3 : style === 'defensive' ? 3 : 0;
  return { att: att + sAtt, mid, def: def + sDef, overall, chem };
}
/** A team's own best XI in 4-3-3, picked greedily slot by slot. Cached per club-season. */
const XI_CACHE = new Map<string, { xi: Player[]; rated: Rated }>();
export function teamXI(key: string): { xi: Player[]; rated: Rated } {
  const hit = XI_CACHE.get(key); if (hit) return hit;
  const team = teamOf(key)!, slots = FORMATIONS['4-3-3'], left = team.season.squad.slice(), xi: Player[] = [];
  for (const s of slots) {
    left.sort((a, b) => b.rating * fit(b.role, s.role) - a.rating * fit(a.role, s.role));
    xi.push(left.shift()!);
  }
  const out = { xi, rated: rate(xi, slots) }; XI_CACHE.set(key, out); return out;
}

export interface Goal { min: number; who: string; us: boolean; assist?: string; pen?: boolean }
/** Something worth showing in the match replay. */
export interface Moment { min: number; type: 'goal' | 'save' | 'miss' | 'post' | 'yellow'; us: boolean; who: string; assist?: string; pen?: boolean }
export interface Kick { us: boolean; who: string; scored: boolean }
export interface Match { opp: string; stage: number; gf: number; ga: number; et: boolean; pens?: [number, number]; goals: Goal[]; moments: Moment[]; shootout?: Kick[]; result: 'W' | 'D' | 'L' }
export interface Campaign { matches: Match[]; wins: number; draws: number; losses: number; gf: number; ga: number; champion: boolean; out: number; sevenZero: boolean; score: number }

function poisson(l: number, rng: () => number) { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= rng(); } while (p > L); return k - 1; }
const SHOOT: Record<Role, number> = { ST: 6, RW: 3.2, LW: 3.2, AM: 3, CM: 1.4, DM: 0.6, RB: 0.4, LB: 0.4, CB: 0.5, GK: 0 };
const MAKE: Record<Role, number> = { ST: 1.5, RW: 3, LW: 3, AM: 3.4, CM: 2.4, DM: 1, RB: 1.4, LB: 1.4, CB: 0.4, GK: 0.05 };
const FOUL: Record<Role, number> = { ST: 0.8, RW: 0.6, LW: 0.6, AM: 0.7, CM: 1.3, DM: 2.2, RB: 1.3, LB: 1.3, CB: 1.8, GK: 0.1 };
function weighted(xi: Player[], w: Record<Role, number>, rng: () => number, not?: Player, power = 3): Player {
  const ws = xi.map(p => (p === not ? 0 : w[p.role] * Math.pow(p.rating / 75, power))); let r = rng() * ws.reduce((a, b) => a + b, 0);
  for (let k = 0; k < xi.length; k++) { r -= ws[k]; if (r <= 0) return xi[k]; }
  return xi[0];
}
/** The opponents of a 7-match run: three group games, then the round of 16, quarter, semi and final, getting harder. Never the same club twice. */
export function drawPath(league: LeagueId, seed: number): string[] {
  const rng = mulberry32(seed), teams = teamsOf(league).map(k => ({ k, club: k.split('@')[0], s: teamXI(k).rated.overall })).sort((a, b) => b.s - a.s);
  const n = teams.length, used = new Set<string>(), pickFrom = (lo: number, hi: number) => {
    const pool = teams.slice(Math.floor(lo * n), Math.max(Math.floor(lo * n) + 1, Math.ceil(hi * n))).filter(c => !used.has(c.club));
    const src = pool.length ? pool : teams.filter(c => !used.has(c.club));
    const c = src[Math.floor(rng() * src.length)]; used.add(c.club); return c.k;
  };
  return [pickFrom(0.45, 1), pickFrom(0.45, 1), pickFrom(0.2, 0.7), pickFrom(0.3, 0.8), pickFrom(0.15, 0.6), pickFrom(0, 0.4), pickFrom(0, 0.15)];
}
export function simulate(xi: Player[], slots: Slot[], style: Style, path: string[], seed: number): Campaign {
  const rng = mulberry32(seed), me = rate(xi, slots, style), matches: Match[] = [];
  let out = -1;
  for (let k = 0; k < path.length; k++) {
    const them = teamXI(path[k]), knockout = k >= 3;
    const lUs = 1.8 * Math.exp(((me.att * 0.65 + me.mid * 0.35) - (them.rated.def * 0.65 + them.rated.mid * 0.35)) / 12) * (style === 'attacking' ? 1.12 : style === 'defensive' ? 0.88 : 1);
    const lThem = 1.0 * Math.exp(((them.rated.att * 0.65 + them.rated.mid * 0.35) - (me.def * 0.65 + me.mid * 0.35)) / 12) * (style === 'attacking' ? 1.15 : style === 'defensive' ? 0.82 : 1);
    const cap = (l: number) => Math.max(0.12, Math.min(5.5, l));
    let gf = poisson(cap(lUs), rng), ga = poisson(cap(lThem), rng), et = false, pens: [number, number] | undefined, shootout: Kick[] | undefined;
    const moments: Moment[] = [], booked = new Set<string>(), side = (us: boolean) => (us ? xi : them.xi);
    const used = new Set<number>(), minute = (lo: number, hi: number) => { let m = lo; for (let t = 0; t < 8; t++) { m = lo + Math.floor(rng() * (hi - lo)); if (!used.has(m)) break; } used.add(m); return m; };
    const addGoals = (n: number, us: boolean, lo: number, hi: number) => {
      for (let i = 0; i < n; i++) {
        const pen = rng() < 0.1, who = weighted(side(us), SHOOT, rng), assist = pen || rng() < 0.2 ? undefined : weighted(side(us), MAKE, rng, who, 2);
        moments.push({ min: minute(lo, hi), type: 'goal', us, who: who.name, assist: assist?.name, pen });
      }
    };
    // Near misses: chances that did not go in, so a 1-0 still has something to watch.
    const addChances = (us: boolean, l: number, lo: number, hi: number) => {
      const n = poisson(0.6 + cap(l) * 0.9 * (hi - lo) / 90, rng);
      for (let i = 0; i < n; i++) { const x = rng(); moments.push({ min: minute(lo, hi), type: x < 0.45 ? 'save' : x < 0.85 ? 'miss' : 'post', us, who: weighted(side(us), SHOOT, rng, undefined, 1).name }); }
    };
    const addCards = (lo: number, hi: number) => {
      const n = poisson(1.6 * (hi - lo) / 90, rng);
      for (let i = 0; i < n; i++) {
        const us = rng() < 0.5, who = weighted(side(us), FOUL, rng, undefined, 0).name;
        if (!booked.has(who)) { booked.add(who); moments.push({ min: minute(lo, hi), type: 'yellow', us, who }); }
      }
    };
    addGoals(gf, true, 1, 91); addGoals(ga, false, 1, 91); addChances(true, lUs, 1, 91); addChances(false, lThem, 1, 91); addCards(1, 91);
    if (knockout && gf === ga) {
      et = true; const e1 = poisson(cap(lUs) / 3, rng), e2 = poisson(cap(lThem) / 3, rng);
      addGoals(e1, true, 91, 121); addGoals(e2, false, 91, 121); addChances(true, lUs / 2, 91, 121); addChances(false, lThem / 2, 91, 121); addCards(91, 121);
      gf += e1; ga += e2;
      if (gf === ga) {
        const gkUs = xi.find((_, i) => slots[i].role === 'GK')?.rating ?? 60, gkThem = them.xi[0].rating;
        const pUs = 0.74 + (me.att - them.rated.att) / 400 - (gkThem - 75) / 300, pThem = 0.74 + (them.rated.att - me.att) / 400 - (gkUs - 75) / 300;
        // Takers in order of finishing; the rest of the XI after them.
        const order = (team: Player[]) => team.slice().filter(p => p.role !== 'GK').sort((a, b) => SHOOT[b.role] * b.rating - SHOOT[a.role] * a.rating);
        const oUs = order(xi), oThem = order(them.xi), kicks: Kick[] = [];
        let a = 0, b = 0, i = 0;
        for (; i < 5; i++) {
          const s1 = rng() < pUs; kicks.push({ us: true, who: oUs[i % oUs.length].name, scored: s1 }); if (s1) a++;
          if (a > b + (5 - i) || b > a + (5 - i - 1)) break;
          const s2 = rng() < pThem; kicks.push({ us: false, who: oThem[i % oThem.length].name, scored: s2 }); if (s2) b++;
          if (a > b + (4 - i) || b > a + (4 - i)) break;
        }
        if (a === b) for (i = 5; a === b; i++) {
          const s1 = rng() < pUs, s2 = rng() < pThem;
          kicks.push({ us: true, who: oUs[i % oUs.length].name, scored: s1 }, { us: false, who: oThem[i % oThem.length].name, scored: s2 });
          if (s1) a++; if (s2) b++;
        }
        pens = [a, b]; shootout = kicks;
      }
    }
    moments.sort((x, y) => x.min - y.min);
    const goals: Goal[] = moments.filter(m => m.type === 'goal').map(m => ({ min: m.min, who: m.who, us: m.us, assist: m.assist, pen: m.pen }));
    const result: Match['result'] = gf > ga ? 'W' : gf < ga ? 'L' : 'D';
    matches.push({ opp: path[k], stage: k, gf, ga, et, pens, goals, moments, shootout, result });
    // Knocked out: a loss, or a lost shoot-out.
    if (knockout && (gf < ga || (pens && pens[0] < pens[1]))) { out = k; break; }
    if (k === 2) {
      const pts = matches.reduce((a, m) => a + (m.result === 'W' ? 3 : m.result === 'D' ? 1 : 0), 0);
      if (pts < 4) { out = 2; break; }
    }
  }
  const wins = matches.filter(m => m.result === 'W').length, draws = matches.filter(m => m.result === 'D').length, losses = matches.filter(m => m.result === 'L').length;
  const gf = matches.reduce((a, m) => a + m.gf, 0), ga = matches.reduce((a, m) => a + m.ga, 0);
  const champion = out < 0 && matches.length === path.length;
  return { matches, wins, draws, losses, gf, ga, champion, out, sevenZero: wins === 7, score: wins * 3 + draws + (champion ? 5 : 0) + (gf - ga) * 0.1 };
}
