import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { aiResolve, aiTurn, rankDiscards } from './ai';
import { claimOptions, counts, discard, fansFor, isComplete, newHand, resolve, shanten, waits, type MJ } from './rules';

/** "123m 456p 789s 11z" style: m/p/s suits, z honours 1–7 (E S W N, red green white). */
function kinds(spec: string): number[] {
  const out: number[] = [];
  for (const [, digits, suit] of spec.matchAll(/(\d+)([mpsz])/g)) for (const d of digits) out.push({ m: 0, p: 9, s: 18, z: 27 }[suit as 'm']! + Number(d) - 1);
  return out;
}
const ids = (spec: string) => { const used: Record<number, number> = {}; return kinds(spec).map(k => { const n = used[k] ?? 0; used[k] = n + 1; return k * 4 + n; }); };
const cnt = (spec: string) => counts(ids(spec));

describe('mahjong hands', () => {
  it('recognises four sets and a pair, and seven pairs', () => {
    expect(isComplete(cnt('123m456p789s111z22z'), 0)).toBe(true);
    expect(isComplete(cnt('11223344556677m'), 0)).toBe(true);
    expect(isComplete(cnt('1133557799m11p22s'), 0)).toBe(true); // seven pairs
    expect(isComplete(cnt('123m456p789s111z23z'), 0)).toBe(false);
    expect(isComplete(cnt('123m45p'), 3)).toBe(false);
    expect(isComplete(cnt('123m55p'), 3)).toBe(true);
  });
  it('counts shanten', () => {
    expect(shanten(cnt('123m456p789s111z2z'), 0)).toBe(0);
    expect(shanten(cnt('123m456p789s11z2z5z'), 0)).toBe(1);
    expect(shanten(cnt('19m19p19s1234567z'), 0)).toBeGreaterThanOrEqual(5);
  });
  it('finds every wait', () => {
    expect(waits(ids('123m456p789s11z45m'), 0)).toEqual(kinds('36m'));
    expect(waits(ids('1112345678999m'), 0)).toEqual(kinds('123456789m')); // the nine gates
  });
  it('scores flushes, all pungs and dragons', () => {
    const st = newHand(0, mulberry32(1));
    const f = (spec: string, self = false) => fansFor(st, 1, ids(spec), self).map(x => x.id);
    expect(f('123456789m11122m')).toContain('flush');
    expect(f('123m456m789m555z11m', true)).toEqual(expect.arrayContaining(['half', 'dragon', 'self', 'concealed']));
    expect(f('111m222p333s444p55s')).toContain('pungs');
    expect(f('11223344556677z')).toContain('pairs');
  });
  it('offers chow only to the next seat and pung to anyone', () => {
    let st = newHand(0, mulberry32(7));
    st = { ...st, hands: [ids('1m'), ids('23m456p789s11z'), ids('11m'), ids('99s')], phase: 'discard', turn: 0 };
    st = discard(st, st.hands[0][0]);
    expect(claimOptions(st, 1).chows).toEqual([kinds('123m')]);
    expect(claimOptions(st, 2).pung).toBe(true);
    expect(claimOptions(st, 2).chows).toEqual([]);
    const after = resolve(st, [{ type: 'pass' }, { type: 'chow', kinds: kinds('123m') }, { type: 'pung' }, { type: 'pass' }]);
    expect(after.turn).toBe(2); // pung beats chow
    expect(after.melds[2][0].type).toBe('pung');
  });
});

function playOut(seed: number, levels: number[]): MJ {
  const rng = mulberry32(seed);
  let st = newHand(seed % 4, rng);
  for (let guard = 0; guard < 400 && st.phase !== 'end'; guard++) {
    if (st.phase === 'discard') st = aiTurn(st, levels[st.turn], rng);
    else if (st.phase === 'claim') st = aiResolve(st, levels, null, 0, rng);
    // conservation: every tile is in the wall, a hand, a meld or a river
    const all = [...st.wall, ...st.hands.flat(), ...st.melds.flat().flatMap(m => m.tiles), ...st.river.flat().filter(id => !st.taken.includes(id))];
    if (st.phase !== 'end') expect(new Set(all).size).toBe(136);
  }
  return st;
}

describe('mahjong table', () => {
  it('deals 13 each and the dealer draws a 14th', () => {
    const st = newHand(2, mulberry32(3));
    expect(st.hands.map(h => h.length)).toEqual([13, 13, 14, 13]);
    expect(st.wall).toHaveLength(136 - 53);
  });
  it('plays whole hands between computer seats without losing a tile', () => {
    let wins = 0;
    for (let s = 1; s <= 40; s++) {
      const st = playOut(s, [2, 2, 2, 2]);
      expect(st.phase).toBe('end');
      if (st.end!.winner >= 0) {
        wins++;
        expect(st.end!.delta.reduce((a, b) => a + b, 0)).toBe(0);
        expect(st.end!.points).toBeGreaterThan(0);
      }
    }
    expect(wins).toBeGreaterThan(20);
  });
  it('stronger regulars win more often', () => {
    const score = [0, 0, 0, 0];
    for (let s = 1; s <= 120; s++) {
      const st = playOut(1000 + s, [0, 4, 0, 4]);
      st.end!.delta.forEach((d, k) => (score[k] += d));
    }
    expect(score[1] + score[3]).toBeGreaterThan(score[0] + score[2]);
  });
  it('ranks a discard for the hint', () => {
    const st = newHand(0, mulberry32(11));
    const r = rankDiscards(st, 4);
    expect(st.hands[0]).toContain(r[0].id);
  });
});
