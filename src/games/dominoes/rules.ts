/**
 * Dominoes, the draw game for two with a double-six set. Seven tiles each; match a tile to
 * either open end of the line. With nothing to play, draw from the boneyard until you can; with
 * the boneyard empty, pass. The first to play out scores the pips left in the other hand; if
 * the game blocks, the lighter hand scores the heavier hand’s pips. First to 100 wins.
 */
import type { Level } from '../../core/match';

export const TILES: [number, number][] = [];
for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) TILES.push([a, b]);
export const pips = (t: number) => TILES[t][0] + TILES[t][1];
export const isDouble = (t: number) => TILES[t][0] === TILES[t][1];
/** A placed tile: which tile, and the value showing on its left and right in the line. */
export interface Placed { t: number; l: number; r: number }
export interface DMove { t: number; side: 'L' | 'R' }
export interface DRound { hands: number[][]; bone: number[]; line: Placed[]; turn: 0 | 1; passes: number; lacks: number[][]; over: null | { winner: 0 | 1 | -1; points: number; blocked: boolean } }
export const TARGET = 100;

export function deal(rng: () => number, leader: 0 | 1 | null): DRound {
  const all = TILES.map((_, i) => i);
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  const hands = [all.slice(0, 7), all.slice(7, 14)], bone = all.slice(14);
  // The first round is led by whoever holds the highest double (or the heaviest tile).
  let turn: 0 | 1 = leader ?? 0;
  if (leader === null) {
    const key = (t: number) => (isDouble(t) ? 100 : 0) + pips(t);
    turn = Math.max(...hands[0].map(key)) >= Math.max(...hands[1].map(key)) ? 0 : 1;
  }
  return { hands, bone, line: [], turn, passes: 0, lacks: [[], []], over: null };
}
export const ends = (r: DRound): [number, number] | null => (r.line.length ? [r.line[0].l, r.line[r.line.length - 1].r] : null);
export function playable(r: DRound, p: 0 | 1): DMove[] {
  const e = ends(r), out: DMove[] = [];
  for (const t of r.hands[p]) {
    const [a, b] = TILES[t];
    if (!e) { out.push({ t, side: 'R' }); continue; }
    if (a === e[0] || b === e[0]) out.push({ t, side: 'L' });
    if ((a === e[1] || b === e[1]) && !(e[0] === e[1] && out.some(m => m.t === t))) out.push({ t, side: 'R' });
  }
  return out;
}
const handPips = (h: number[]) => h.reduce((s, t) => s + pips(t), 0);
function finish(r: DRound, winner: 0 | 1 | -1, blocked: boolean): DRound {
  const points = winner < 0 ? 0 : blocked ? handPips(r.hands[1 - winner]) : handPips(r.hands[1 - winner]);
  return { ...r, over: { winner, points, blocked } };
}
export function place(r0: DRound, m: DMove): DRound {
  const r: DRound = { ...r0, hands: r0.hands.map(h => h.slice()), line: r0.line.slice(), lacks: r0.lacks.map(l => l.slice()) };
  const p = r.turn, [a, b] = TILES[m.t], e = ends(r);
  r.hands[p] = r.hands[p].filter(t => t !== m.t);
  if (!e) r.line.push({ t: m.t, l: a, r: b });
  else if (m.side === 'L') r.line.unshift({ t: m.t, l: b === e[0] ? a : b, r: e[0] });
  else r.line.push({ t: m.t, l: e[1], r: a === e[1] ? b : a });
  r.passes = 0;
  if (!r.hands[p].length) return finish(r, p, false);
  r.turn = (1 - p) as 0 | 1;
  return r;
}
/** Nothing to play: draw one tile, or pass if the boneyard is empty. Notes which numbers the player lacks. */
export function drawOrPass(r0: DRound): DRound {
  const r: DRound = { ...r0, hands: r0.hands.map(h => h.slice()), bone: r0.bone.slice(), lacks: r0.lacks.map(l => l.slice()) };
  const p = r.turn, e = ends(r);
  if (e) for (const v of e) if (!r.lacks[p].includes(v)) r.lacks[p].push(v);
  if (r.bone.length) { r.hands[p].push(r.bone.pop()!); return r; }
  r.passes++;
  if (r.passes >= 2) {
    const a = handPips(r.hands[0]), b = handPips(r.hands[1]);
    return finish(r, a === b ? -1 : a < b ? 0 : 1, true);
  }
  r.turn = (1 - p) as 0 | 1;
  return r;
}

export const LEVELS: Level[] = [
  { name: 'Beginner', rating: 700 }, { name: 'Easy', rating: 900 }, { name: 'Intermediate', rating: 1150 }, { name: 'Advanced', rating: 1400 }, { name: 'Expert', rating: 1650 },
];
/** The computer's choice among its playable tiles. */
export function chooseMove(r: DRound, level: number, rng: () => number = Math.random): DMove {
  const p = r.turn, opts = playable(r, p), foe = (1 - p) as 0 | 1;
  if (level === 0) return opts[Math.floor(rng() * opts.length)];
  const seen = new Set<number>([...r.hands[p], ...r.line.map(x => x.t)]);
  const score = (m: DMove) => {
    let s = pips(m.t) * (level >= 3 ? 1.5 : 1) + (isDouble(m.t) ? 3 : 0);
    if (level >= 2) {
      const after = place({ ...r, over: null }, m), e = ends(after);
      if (e && !after.over) {
        const rest = r.hands[p].filter(t => t !== m.t);
        // Keep ends I can follow…
        s += rest.filter(t => TILES[t].some(v => v === e[0] || v === e[1])).length * 2;
        if (level >= 3) {
          // …and ends the other player has shown they lack.
          s += e.filter(v => r.lacks[foe].includes(v)).length * 6;
          if (level >= 4) {
            // Count how many unseen tiles could still answer each end.
            const live = TILES.map((_, i) => i).filter(t => !seen.has(t) || t === m.t ? !seen.has(t) : false);
            s -= live.filter(t => TILES[t].some(v => v === e[0] || v === e[1])).length * 0.8;
          }
        }
      }
      if (after.over) s += 1000;
    }
    return s + rng() * 0.5;
  };
  return opts.reduce((a, b) => (score(b) > score(a) ? b : a));
}
