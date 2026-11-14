import { describe, expect, it } from 'vitest';
import { bestCover, isPairs, isSetsWin, isWin, okeyOf, TILES, type Okey, type Tile } from './rules';

// R=0 Y=1 B=2 K=3 (black). Build tiles by description; the second copy is used when repeated.
const used = new Set<number>();
const tile = (c: number, n: number): Tile => {
  const t = TILES.find(x => !x.fake && x.c === c && x.n === n && !used.has(x.id))!;
  used.add(t.id); return t;
};
const fake = (): Tile => { const t = TILES.find(x => x.fake && !used.has(x.id))!; used.add(t.id); return t; };
const hand = (spec: [number, number][], extra: Tile[] = []) => { used.clear(); return [...spec.map(([c, n]) => tile(c, n)), ...extra]; };
const OK: Okey = { c: 2, n: 9 }; // blue 9 is the okey in these tests

describe('okey rules', () => {
  it('has 106 tiles and the okey is one above the indicator, 13 wrapping to 1', () => {
    expect(TILES).toHaveLength(106);
    expect(okeyOf({ id: 0, c: 0, n: 10, fake: false })).toEqual({ c: 0, n: 11 });
    expect(okeyOf({ id: 0, c: 3, n: 13, fake: false })).toEqual({ c: 3, n: 1 });
  });
  it('accepts runs and groups that use all 14 tiles', () => {
    const h = hand([[0, 1], [0, 2], [0, 3], [0, 4], [1, 7], [2, 7], [3, 7], [3, 10], [3, 11], [3, 12], [3, 13], [0, 5], [1, 5], [3, 5]]);
    expect(isSetsWin(h, OK)).toBe(true);
  });
  it('allows 12-13-1 but not 13-1-2', () => {
    const base: [number, number][] = [[1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [2, 6], [3, 8], [0, 8], [1, 8], [0, 11], [3, 3]];
    expect(isSetsWin(hand([...base.slice(0, 9), [0, 12], [0, 13], [0, 1], [3, 1], [3, 2]] as [number, number][]), OK)).toBe(false);
    const good = hand([[1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [2, 6], [3, 8], [0, 8], [1, 8], [0, 12], [0, 13], [0, 1], [3, 4], [3, 5]]);
    // black 4-5 is a pair short of a run, so this is 12 of 14
    expect(bestCover(good, OK)).toBe(12);
    const win = hand([[1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [2, 6], [3, 8], [0, 8], [1, 8], [0, 11], [0, 12], [0, 13], [0, 1], [3, 2]]);
    expect(bestCover(win, OK)).toBe(13);
    const wrapBad = hand([[1, 2], [1, 3], [1, 4], [2, 4], [2, 5], [2, 6], [3, 8], [0, 8], [1, 8], [3, 10], [3, 11], [0, 13], [0, 1], [0, 2]]);
    expect(isSetsWin(wrapBad, OK)).toBe(false);
  });
  it('wild okey tiles fill gaps; false jokers count as the okey value only', () => {
    // blue 9 tiles are wild. Red 4-?-6 with a wild in the middle.
    const h = hand([[0, 4], [2, 9], [0, 6], [1, 1], [1, 2], [1, 3], [3, 7], [0, 7], [1, 7], [2, 7], [3, 11], [3, 12], [3, 13], [2, 9]]);
    expect(isSetsWin(h, OK)).toBe(true);
    // A false joker plays as blue 9 (the okey's value): blue 8-9-10-11-12 is a run.
    const base = hand([[2, 8], [2, 10], [2, 11], [2, 12], [1, 1], [1, 2], [1, 3], [3, 7], [0, 7], [1, 7], [3, 11], [3, 12], [3, 13]]);
    expect(isSetsWin([...base, TILES[104]], OK)).toBe(true);
    // The false joker is not wild: it cannot stand in for red 6.
    const notWild = hand([[0, 4], [0, 5], [2, 11], [2, 12], [1, 1], [1, 2], [1, 3], [3, 7], [0, 7], [1, 7], [3, 11], [3, 12], [3, 13]]);
    expect(isSetsWin([...notWild, TILES[104]], OK)).toBe(false);
  });
  it('a group needs different colours and at most four tiles', () => {
    const h = hand([[0, 5], [0, 5], [1, 5], [1, 1], [1, 2], [1, 3], [3, 7], [0, 7], [1, 7], [3, 11], [3, 12], [3, 13], [2, 1], [2, 2]]);
    expect(isSetsWin(h, OK)).toBe(false);
  });
  it('recognises seven pairs, with wild tiles pairing anything', () => {
    const p = hand([[0, 1], [0, 1], [1, 5], [1, 5], [2, 3], [2, 3], [3, 13], [3, 13], [0, 7], [0, 7], [1, 11], [1, 11], [3, 2], [3, 2]]);
    expect(isPairs(p, OK)).toBe(true);
    expect(isWin(p, OK)).toBe(true);
    const q = hand([[0, 1], [0, 1], [1, 5], [1, 5], [2, 3], [2, 3], [3, 13], [3, 13], [0, 7], [0, 7], [1, 11], [1, 11], [3, 2], [2, 9]]);
    expect(isPairs(q, OK)).toBe(true);
    const r = hand([[0, 1], [0, 1], [1, 5], [1, 5], [2, 3], [2, 3], [3, 13], [3, 13], [0, 7], [0, 7], [1, 11], [1, 11], [3, 2], [3, 4]]);
    expect(isPairs(r, OK)).toBe(false);
  });
});

import { aiTurn, deal, discard, draw, finish, finishValue, canShow, show } from './game';
import { mulberry32 } from '../../core/rng';

describe('okey deal', () => {
  it('deals 15 to the player right of the dealer and 14 to the others, 48 left to draw', () => {
    const d = deal(0, mulberry32(1));
    expect(d.hands.map(h => h.length)).toEqual([14, 15, 14, 14]);
    expect(d.pile).toHaveLength(48);
    expect(d.turn).toBe(1);
    expect(d.phase).toBe('discard');
    expect(TILES[d.indicator].fake).toBe(false);
    const all = [...d.hands.flat(), ...d.pile, d.indicator];
    expect(new Set(all).size).toBe(106);
  });
  it('discards pass to the right and the next seat may take them', () => {
    let d = deal(3, mulberry32(2));
    const s = d.turn, t = d.hands[s][0];
    d = discard(d, t);
    expect(d.turn).toBe((s + 1) % 4);
    d = draw(d, 'discard');
    expect(d.hands[(s + 1) % 4]).toContain(t);
    expect(d.phase).toBe('discard');
  });
  it('finishing needs a winning 14 after the discard; a wild discard doubles', () => {
    let d = deal(0, mulberry32(5));
    d = { ...d, okey: OK, turn: 0, phase: 'discard' };
    const winning = hand([[0, 1], [0, 2], [0, 3], [0, 4], [1, 7], [2, 7], [3, 7], [3, 10], [3, 11], [3, 12], [3, 13], [0, 5], [1, 5], [3, 5], [2, 9]]);
    d.hands = [winning.map(t => t.id), [], [], []];
    const wild = winning[14].id, plain = winning[0].id;
    expect(finishValue(d, plain)).toBe(2); // red 2-5 and a wild 5-group still win: a normal finish
    expect(finishValue(d, wild)).toBe(4);
    const f = finish(d, wild);
    expect(f.end && f.end.winner).toBe(0);
  });
  it('showing the indicator twin is allowed only before acting', () => {
    let d = deal(0, mulberry32(9));
    const twin = TILES.find(t => !t.fake && t.c === TILES[d.indicator].c && t.n === TILES[d.indicator].n && t.id !== d.indicator)!.id;
    d.hands = d.hands.map(h => h.filter(i => i !== twin)); d.pile = d.pile.filter(i => i !== twin);
    d.hands[d.turn].push(twin);
    expect(canShow(d, d.turn)).toBe(true);
    d = show(d, d.turn);
    expect(canShow(d, d.turn)).toBe(false);
  });
  it('computer players always play legal turns to the end of a deal', () => {
    for (let seed = 0; seed < 4; seed++) {
      const rng = mulberry32(seed);
      let d = deal(seed % 4, rng), turns = 0;
      while (!d.end && turns < 400) {
        d = aiTurn(d, turns % 5, rng).deal;
        turns++;
        if (!d.end) expect(d.hands.every(h => h.length === 14)).toBe(true);
      }
      expect(d.end).not.toBeNull();
    }
  });
});
