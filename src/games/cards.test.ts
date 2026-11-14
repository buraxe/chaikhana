import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { card } from './cards/deck';
import { legal, startTricks, type Rules } from './cards/trick';
import * as B from './batak/rules';
import * as Kg from './king/rules';
import * as P from './pisti/rules';
import { evaluate, categoryOf } from './poker/eval';
import { act, newTable, startHand, legalActions, type PState } from './poker/rules';
import { decide } from './poker/ai';

describe('trick rules', () => {
  it('must follow suit and beat the best card when possible', () => {
    const hands = [[card(0, 5)], [card(0, 3), card(0, 9), card(1, 12)], [card(2, 1)], [card(3, 1)]];
    const st = { ...startTricks(hands, 0) };
    const R: Rules = { trump: null, overtake: true, mustTrump: false, locked: null };
    const after = { ...st, table: [{ seat: 0, card: card(0, 5) }], turn: 1, hands: [[], hands[1], hands[2], hands[3]] };
    expect(legal(after, 1, R)).toEqual([card(0, 9)]);
  });
  it('a void player must trump, and over-trump', () => {
    const R: Rules = { trump: 1, overtake: true, mustTrump: true, locked: 1 };
    const st = { ...startTricks([[], [card(1, 2), card(1, 8), card(2, 4)], [], []], 0), turn: 1, table: [{ seat: 0, card: card(0, 5) }, { seat: 3, card: card(1, 5) }] };
    expect(legal(st, 1, R)).toEqual([card(1, 8)]);
  });
});
describe('batak', () => {
  it('computer-only hands finish with 13 tricks and sensible scores', () => {
    for (let k = 0; k < 40; k++) {
      const rng = mulberry32(k); let h = B.dealHand(k % 4, rng);
      for (let g = 0; g < 20 && h.phase === 'bid'; g++) h = B.bid(h, h.bidTurn, B.aiBid(h, h.bidTurn, 2, rng));
      expect(h.phase).toBe('trump');
      h = B.chooseTrump(h, h.high!.seat, B.bestTrump(h.st.hands[h.high!.seat]));
      for (let g = 0; g < 60 && h.phase === 'play'; g++) h = B.play(h, h.st.turn, B.aiPlay(h, h.st.turn, k % 5, rng));
      expect(h.phase).toBe('done');
      expect(h.st.tricks.reduce((a, b) => a + b, 0)).toBe(13);
      const sc = B.score(h); expect(sc.length).toBe(4);
    }
  });
});
describe('king', () => {
  it('a full game of computer players runs 20 hands with the right totals', () => {
    const rng = mulberry32(7); let g = Kg.newGame('full');
    while (!Kg.gameOver(g)) {
      let h = Kg.dealHand(g, rng);
      const ch = Kg.aiChoose(g, h, h.chooser, 2, rng); h = Kg.choose(h, g, h.chooser, ch.c, ch.trump);
      expect(h.phase).toBe('play');
      for (let k = 0; k < 60 && h.phase === 'play'; k++) h = Kg.play(h, h.st.turn, Kg.aiPlay(h, h.st.turn, 3, rng));
      expect(h.phase).toBe('done');
      const pts = Kg.points(h), sum = pts.reduce((a, b) => a + b, 0);
      const expected: Record<string, number> = { koz: 650, el: -650, kupa: -390, erkek: -480, kiz: -400, rifki: -320, son2: -360 };
      expect(sum).toBe(expected[h.contract!]);
      g = Kg.settle(g, h);
    }
    expect(g.history.length).toBe(20);
    for (const p of Kg.PENALTIES) expect(g.used[p] ?? 0).toBeLessThanOrEqual(2);
    expect(g.koz.every(x => x === 0) && g.ceza.every(x => x === 0)).toBe(true);
  });
  it('rıfkı: the king of hearts must go when you cannot follow', () => {
    const R = Kg.rules({ chooser: 0, phase: 'play', contract: 'rifki', trump: null, st: startTricks([[], [], [], []], 0) });
    const st = { ...startTricks([[], [card(1, 11), card(2, 3)], [], []], 0), turn: 1, table: [{ seat: 0, card: card(0, 4) }] };
    expect(legal(st, 1, R)).toEqual([card(1, 11)]);
  });
});
describe('pisti', () => {
  it('every card ends up taken and points add up', () => {
    for (let k = 0; k < 50; k++) {
      const rng = mulberry32(k); let s = P.deal(0, rng);
      for (let g = 0; g < 60 && !s.done; g++) s = P.play(s, s.turn, P.choose(s, s.turn, k % 5, rng));
      expect(s.done).toBe(true);
      expect(s.taken[0].length + s.taken[1].length + s.table.length).toBe(52);
      const sc = P.score(s); expect(sc.total[0] + sc.total[1]).toBeGreaterThanOrEqual(13);
    }
  });
  it('a lone card taken by its twin is a pişti', () => {
    const s: P.PDeal = { deck: [], hands: [[card(0, 4), card(1, 1)], [card(2, 7)]], table: [card(1, 4)], taken: [[], []], pisti: [0, 0], turn: 0, last: -1, done: false, log: [], seen: [] };
    expect(P.play(s, 0, card(0, 4)).pisti[0]).toBe(10);
  });
});
describe('poker', () => {
  it('ranks hands in the right order', () => {
    const h = (...cs: [number, number][]) => evaluate(cs.map(([s, r]) => card(s, r)));
    const royal = h([0, 12], [0, 11], [0, 10], [0, 9], [0, 8], [1, 0], [2, 1]);
    const quads = h([0, 3], [1, 3], [2, 3], [3, 3], [0, 8], [1, 0], [2, 1]);
    const full = h([0, 3], [1, 3], [2, 3], [3, 5], [0, 5], [1, 0], [2, 1]);
    const wheel = h([0, 12], [1, 0], [2, 1], [3, 2], [0, 3], [1, 9], [2, 10]);
    const pair = h([0, 12], [1, 12], [2, 1], [3, 2], [0, 7], [1, 9], [2, 10]);
    expect(categoryOf(royal)).toBe(8); expect(categoryOf(quads)).toBe(7); expect(categoryOf(full)).toBe(6);
    expect(categoryOf(wheel)).toBe(4); expect(categoryOf(pair)).toBe(1);
    expect(royal > quads && quads > full && full > wheel && wheel > pair).toBe(true);
  });
  it('bot tables play to a single winner and never lose chips', () => {
    for (let k = 0; k < 6; k++) {
      const rng = mulberry32(100 + k), n = 2 + (k % 5);
      let s: PState = newTable(Array.from({ length: n }, (_, i) => ({ name: 'P' + i, human: false, level: i % 5 })));
      let guard = 0;
      while (s.phase !== 'over' && guard++ < 400) {
        s = startHand(s, rng);
        let steps = 0;
        while (s.phase === 'betting' && steps++ < 400) {
          const a = decide(s, s.turn, s.seats[s.turn].level, rng);
          const next = act(s, s.turn, a);
          expect(next).not.toBe(s);
          s = next;
        }
        expect(s.phase).not.toBe('betting');
        const total = s.seats.reduce((a, x) => a + x.chips, 0);
        expect(total).toBe(1000 * n);
      }
      expect(s.phase).toBe('over');
      expect(s.seats.filter(x => x.chips > 0).length).toBe(1);
      void legalActions;
    }
  });
});
