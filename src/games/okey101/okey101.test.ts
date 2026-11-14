import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { TILES, type Okey } from '../okey/rules';
import { addTo, aiTurn, checkOpening, deal, discard, discardPenalty, draw, lay, putBack, type Round } from './game';
import { analyze, canAdd, planMelds, planPairs } from './melds';

const OK: Okey = { c: 2, n: 9 }; // blue 9 is wild
const pool = new Set<number>();
const T = (c: number, n: number) => { const t = TILES.find(x => !x.fake && x.c === c && x.n === n && !pool.has(x.id))!; pool.add(t.id); return t.id; };
const reset = () => pool.clear();

describe('101 sets', () => {
  it('scores runs and groups at face value; 1 after 13 counts 1', () => {
    reset();
    expect(analyze([T(0, 10), T(0, 11), T(0, 12)], OK)).toMatchObject({ kind: 'run', points: 33 });
    expect(analyze([T(1, 7), T(2, 7), T(3, 7), T(0, 7)], OK)).toMatchObject({ kind: 'group', points: 28 });
    reset();
    expect(analyze([T(3, 12), T(3, 13), T(3, 1)], OK)).toMatchObject({ kind: 'run', points: 26 });
    reset();
    expect(analyze([T(3, 13), T(3, 1), T(3, 2)], OK)).toBeNull();
    reset();
    expect(analyze([T(1, 5), T(1, 5), T(2, 5)], OK)).toBeNull(); // same colour twice in a group
  });
  it('a wild okey takes the value it stands for', () => {
    reset();
    const wild = T(2, 9);
    expect(analyze([T(0, 4), wild, T(0, 6)], OK)).toMatchObject({ kind: 'run', points: 15 });
    reset();
    expect(analyze([T(1, 12), T(1, 13), T(2, 9)], OK)!.points).toBe(11 + 12 + 13); // the wild plays as 11, the higher-scoring reading
  });
  it('pairs are two identical tiles', () => {
    reset();
    expect(analyze([T(0, 8), T(0, 8)], OK)).toMatchObject({ kind: 'pair', points: 16 });
    reset();
    expect(analyze([T(0, 8), T(1, 8)], OK)).toBeNull();
  });
  it('adds a tile to the end of a run or to a group of three, not to a pair', () => {
    reset();
    expect(canAdd({ kind: 'run', tiles: [T(0, 3), T(0, 4), T(0, 5)] }, T(0, 6), OK)).toBe(true);
    expect(canAdd({ kind: 'run', tiles: [T(0, 7), T(0, 8), T(0, 9)] }, T(0, 11), OK)).toBe(false);
    reset();
    expect(canAdd({ kind: 'group', tiles: [T(0, 3), T(1, 3), T(2, 3)] }, T(3, 3), OK)).toBe(true);
    expect(canAdd({ kind: 'pair', tiles: [T(0, 2), T(0, 2)] }, T(0, 3), OK)).toBe(false);
  });
  it('finds the most valuable melds in a hand', () => {
    reset();
    const hand = [T(0, 11), T(0, 12), T(0, 13), T(1, 10), T(2, 10), T(3, 10), T(3, 1), T(3, 2), T(3, 3), T(1, 4), T(0, 4)];
    const p = planMelds(hand, OK);
    expect(p.points).toBe(36 + 30 + 6);
    for (const m of p.melds) expect(analyze(m, OK)).not.toBeNull();
  });
  it('counts pairs, using wild okeys on the highest singles', () => {
    reset();
    const hand = [T(0, 1), T(0, 1), T(1, 5), T(1, 5), T(3, 13), T(2, 9)];
    expect(planPairs(hand, OK)).toHaveLength(3);
  });
});

describe('101 round', () => {
  const setup = (hand0: number[]): Round => {
    const r = deal(3, mulberry32(1));
    const all = new Set(hand0);
    const strip = (a: number[]) => a.filter(i => !all.has(i));
    return { ...r, okey: OK, turn: 0, phase: 'play', hands: [hand0, ...r.hands.slice(1).map(strip)], pile: strip(r.pile), discards: [[], [], [], []] };
  };
  it('deals 22 to the player right of the dealer and 21 to the others', () => {
    const r = deal(0, mulberry32(4));
    expect(r.hands.map(h => h.length)).toEqual([21, 22, 21, 21]);
    expect(r.pile.length).toBe(106 - 1 - 85);
  });
  it('an opening needs 101 points or five pairs', () => {
    reset();
    const low = [[T(0, 1), T(0, 2), T(0, 3)]];
    expect(checkOpening(low, OK).ok).toBe(false);
    reset();
    const high = [[T(0, 11), T(0, 12), T(0, 13)], [T(1, 13), T(2, 13), T(3, 13)], [T(1, 10), T(1, 11), T(1, 12)]];
    expect(checkOpening(high, OK)).toMatchObject({ ok: true, kind: 'points', points: 36 + 39 + 33 });
    reset();
    const pairs = [1, 2, 3, 4, 5].map(n => [T(0, n), T(0, n)]);
    expect(checkOpening(pairs, OK)).toMatchObject({ ok: true, kind: 'pairs' });
    expect(checkOpening(pairs.slice(0, 4), OK).ok).toBe(false);
  });
  it('after opening, tiles can be added to any set; a taken discard must be used', () => {
    reset();
    const sets = [[T(0, 11), T(0, 12), T(0, 13)], [T(1, 13), T(2, 13), T(3, 13)], [T(1, 10), T(1, 11), T(1, 12)]];
    const extra = [T(0, 10), T(3, 5), T(3, 6)];
    let r = setup([...sets.flat(), ...extra]);
    r = lay(r, sets);
    expect(r.opened[0]).toBe('points');
    const before = r.hands[0].length;
    r = addTo(r, r.melds[0].id, extra[0]);
    expect(r.hands[0].length).toBe(before - 1);
    // a discard that could be added costs 101
    const r2 = { ...r, hands: [[...r.hands[0], T(1, 9)], ...r.hands.slice(1)] };
    expect(discardPenalty(r2, r2.hands[0][r2.hands[0].length - 1])).toBe(101);
    // taking the left discard and not using it blocks discarding; it can be put back
    let r3: Round = { ...r, phase: 'draw', discards: [[], [], [], [T(3, 1)]] };
    r3 = draw(r3, 'discard');
    expect(discard(r3, r3.hands[0][0])).toBe(r3);
    expect(putBack(r3).phase).toBe('draw');
  });
  it('finishing scores −101 for the finisher and 202 for players who never opened', () => {
    reset();
    const sets = [[T(0, 11), T(0, 12), T(0, 13)], [T(1, 13), T(2, 13), T(3, 13)], [T(1, 10), T(1, 11), T(1, 12)]];
    const last = T(3, 5);
    let r = setup([...sets.flat(), last]);
    r = { ...r, opened: [null, 'points', null, null] , openedAtStartOfTurn: [false, true, false, false] };
    r = lay(r, sets);
    r = discard(r, last);
    expect(r.end?.finisher).toBe(0);
    expect(r.end?.scores[0]).toBe(-101);
    expect(r.end?.scores[2]).toBe(202);
  });
  it('computer players finish rounds with legal play', () => {
    for (let seed = 0; seed < 3; seed++) {
      const rng = mulberry32(seed);
      let r = deal(seed, rng), guard = 0;
      while (!r.end && guard++ < 300) {
        const steps = aiTurn(r, 3, rng);
        expect(steps.length).toBeGreaterThan(0);
        r = steps[steps.length - 1];
        for (const m of r.melds) expect(analyze(m.tiles, r.okey)).not.toBeNull();
      }
      expect(r.end).not.toBeNull();
    }
  });
});
